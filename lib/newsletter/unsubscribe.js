import crypto from 'crypto';

export function getUnsubscribeToken(email) {
  const secret = process.env.NEWSLETTER_UNSUB_SECRET;
  if (!secret) throw new Error('Missing NEWSLETTER_UNSUB_SECRET');

  return crypto
    .createHmac('sha256', secret)
    .update(String(email).trim().toLowerCase())
    .digest('hex');
}

export function verifyUnsubscribeToken(email, token) {
  if (!email || !token) return false;
  try {
    const expected = getUnsubscribeToken(email);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}
