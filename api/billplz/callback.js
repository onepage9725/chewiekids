const crypto = require('crypto');

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function parseForm(bodyText) {
  const params = new URLSearchParams(bodyText);
  const out = {};
  for (const [key, value] of params.entries()) {
    out[key] = value;
  }
  return out;
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

      const type = req.headers['content-type'] || '';
      try {
        if (type.includes('application/json')) {
          resolve(JSON.parse(body));
          return;
        }
        resolve(parseForm(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function computeBillplzSignature(payload, key) {
  const parts = Object.entries(payload)
    .filter(([entryKey]) => entryKey !== 'x_signature')
    .map(([entryKey, value]) => `${entryKey}${value == null ? '' : String(value)}`)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const source = parts.join('|');
  return crypto.createHmac('sha256', key).update(source).digest('hex');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  const signatureKey = process.env.BILLPLZ_X_SIGNATURE_KEY;
  if (!signatureKey) {
    json(res, 500, { error: 'Missing BILLPLZ_X_SIGNATURE_KEY' });
    return;
  }

  try {
    const payload = await parseBody(req);
    const incomingSignature = (payload.x_signature || '').toString();

    if (!incomingSignature) {
      json(res, 400, { error: 'Missing x_signature' });
      return;
    }

    const expectedSignature = computeBillplzSignature(payload, signatureKey);
    const valid =
      incomingSignature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(incomingSignature), Buffer.from(expectedSignature));

    if (!valid) {
      json(res, 400, { error: 'Invalid x_signature' });
      return;
    }

    // At this stage, callback authenticity is verified. Persist order status in DB if needed.
    json(res, 200, {
      ok: true,
      verified: true,
      billId: payload.id || null,
      paid: payload.paid || null,
      state: payload.state || null
    });
  } catch (error) {
    json(res, 500, { error: 'Failed to process callback' });
  }
};
