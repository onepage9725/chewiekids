const crypto = require('crypto');

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function getBaseUrl(req) {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function ensureString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.BILLPLZ_API_KEY;
  const collectionId = process.env.BILLPLZ_COLLECTION_ID;
  const apiBase = (process.env.BILLPLZ_API_BASE || 'https://www.billplz.com/api').replace(/\/$/, '');

  if (!apiKey || !collectionId) {
    json(res, 500, { error: 'Billplz environment variables are missing' });
    return;
  }

  try {
    const payload = await parseBody(req);
    const items = Array.isArray(payload.items) ? payload.items : [];
    const customer = payload.customer || {};
    const totalAmount = Number(payload.totalAmount || 0);

    if (!items.length || !Number.isFinite(totalAmount) || totalAmount <= 0) {
      json(res, 400, { error: 'Invalid order items or amount' });
      return;
    }

    const cents = Math.round(totalAmount * 100);
    const name = ensureString(customer.name);
    const email = ensureString(customer.email);
    const mobile = ensureString(customer.mobile);

    if (!name) {
      json(res, 400, { error: 'Customer name is required' });
      return;
    }

    if (!email && !mobile) {
      json(res, 400, { error: 'Email or mobile is required for Billplz bill creation' });
      return;
    }

    const baseUrl = getBaseUrl(req);
    const callbackUrl = `${baseUrl}/api/billplz/callback`;
    const redirectUrl = `${baseUrl}/payment-status.html`;
    const orderRef = `CK-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const body = new URLSearchParams();
    body.set('collection_id', collectionId);
    body.set('description', `Chewie Kids Order (${items.length} item${items.length > 1 ? 's' : ''})`);
    body.set('name', name);
    body.set('amount', String(cents));
    body.set('callback_url', callbackUrl);
    body.set('redirect_url', redirectUrl);
    body.set('reference_1_label', 'Order Ref');
    body.set('reference_1', orderRef);
    body.set('reference_2_label', 'Contact');
    body.set('reference_2', mobile || email);
    body.set('deliver', 'false');

    if (email) body.set('email', email);
    if (mobile) body.set('mobile', mobile);

    const auth = Buffer.from(`${apiKey}:`).toString('base64');
    const response = await fetch(`${apiBase}/v3/bills`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.url) {
      json(res, response.status || 502, {
        error: result?.error?.message?.[0] || 'Unable to create Billplz bill'
      });
      return;
    }

    json(res, 200, {
      billId: result.id,
      url: result.url,
      orderRef
    });
  } catch (error) {
    json(res, 500, {
      error: error instanceof Error ? error.message : 'Unexpected server error'
    });
  }
};
