import { createHmac } from 'node:crypto';

export function fingerprint(ip, secret = process.env.FINGERPRINT_SECRET) {
  if (!secret) throw new Error('FINGERPRINT_SECRET is not set');
  return createHmac('sha256', secret).update(String(ip || 'unknown')).digest('hex');
}
