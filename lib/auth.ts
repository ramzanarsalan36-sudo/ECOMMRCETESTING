/**
 * HOPEKRAFT Admin Authentication Library
 * Built with standard Web Crypto API (SubtleCrypto)
 * 100% compatible with Cloudflare Workers, Edge Runtime, and Node.js.
 */

const DEFAULT_ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'hopekraft_super_secure_jwt_secret_key_change_in_production_8943275923';

export const ADMIN_COOKIE_NAME = 'hopekraft_admin_token';

// Base64Url helpers
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// SubtleCrypto HMAC Key Cache
let cachedKey: CryptoKey | null = null;
async function getCryptoKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET);
  cachedKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  return cachedKey;
}

export interface AdminPayload {
  username: string;
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Sign a lightweight JWT using Web Crypto Subtle HMAC-SHA256
 */
export async function signAdminToken(username: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminPayload = {
    username,
    role: 'admin',
    iat: now,
    exp: now + 60 * 60 * 24 * 7 // 7 days expiration
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(dataToSign)
  );

  let binary = '';
  const bytes = new Uint8Array(signatureBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const encodedSignature = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verify a JWT token
 */
export async function verifyAdminToken(token: string | undefined | null): Promise<AdminPayload | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToVerify = `${encodedHeader}.${encodedPayload}`;

  try {
    const key = await getCryptoKey();
    let base64 = encodedSignature.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const sigBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      sigBytes[i] = binary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(dataToVerify)
    );

    if (!isValid) return null;

    const payload: AdminPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    console.error('Failed to verify admin token:', err);
    return null;
  }
}

/**
 * Authorized Master Admin Firebase UIDs
 */
export const MASTER_ADMIN_UID = 'kcca315tMqYP22OeU8VBECh4VRq2';
export const AUTHORIZED_ADMIN_UIDS = ['kcca315tMqYP22OeU8VBECh4VRq2'];

/**
 * Validate Admin ID & Password strictly
 */
export function validateAdminCredentials(user: string, pass: string): boolean {
  const cleanUser = user.trim();
  const cleanPass = pass ? pass.trim() : '';

  if (!cleanUser || !cleanPass) {
    return false;
  }

  const expectedUser = (process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USER).toLowerCase();
  const expectedPass = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASS;

  const userLower = cleanUser.toLowerCase();
  const userPrefix = userLower.split('@')[0];

  const allowedUsernames = [
    expectedUser,
    'admin',
    'admin@gmail.com',
    'hopekraft',
    'hopekraft@gmail.com',
    'kcca315tmqyp22oeu8vbech4vrq2'
  ];

  // 1. Standard configured admin credentials (allows admin, admin@gmail.com, hopekraft@gmail.com, etc.)
  if (
    (allowedUsernames.includes(userLower) || allowedUsernames.includes(userPrefix) || userLower.includes('admin')) &&
    cleanPass === expectedPass
  ) {
    return true;
  }

  // 2. Or login using Master UID as username with valid admin password
  if (
    (cleanUser === MASTER_ADMIN_UID ||
      AUTHORIZED_ADMIN_UIDS.includes(cleanUser) ||
      userLower === MASTER_ADMIN_UID.toLowerCase()) &&
    cleanPass === expectedPass
  ) {
    return true;
  }

  return false;
}
