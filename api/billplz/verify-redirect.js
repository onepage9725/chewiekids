const crypto = require('crypto');

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function computeRedirectSignature(payload, key) {
  const parts = Object.entries(payload)
    .filter(([entryKey]) => entryKey !== 'billplz[x_signature]')
    .map(([entryKey, value]) => {
      const normalizedKey = entryKey.replace(/\[|\]/g, '');
      return `${normalizedKey}${value == null ? '' : String(value)}`;
    })
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  const source = parts.join('|');
  return crypto.createHmac('sha256', key).update(source).digest('hex');
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  const signatureKey = process.env.BILLPLZ_X_SIGNATURE_KEY;
  if (!signatureKey) {
    json(res, 500, { error: 'Missing BILLPLZ_X_SIGNATURE_KEY' });
    return;
  }

  const payload = req.query || {};
  const incomingSignature = (payload['billplz[x_signature]'] || '').toString();

  if (!incomingSignature) {
    json(res, 400, { error: 'Missing billplz[x_signature]' });
    return;
  }

  const expectedSignature = computeRedirectSignature(payload, signatureKey);
  const valid =
    incomingSignature.length === expectedSignature.length &&
    crypto.timingSafeEqual(Buffer.from(incomingSignature), Buffer.from(expectedSignature));

  json(res, 200, {
    valid,
    billId: payload['billplz[id]'] || null,
    paid: payload['billplz[paid]'] || null,
    paidAt: payload['billplz[paid_at]'] || null,
    transactionStatus: payload['billplz[transaction_status]'] || null
  });
};
