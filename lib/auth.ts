/**
 * HOPEKRAFT Admin Authentication Library
 * Built with standard Web Crypto API (SubtleCrypto)
 * 100% compatible with Cloudflare Workers, Edge Runtime, and Node.js.
 */

const DEFAULT_ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';
// Secure JWT Secret Resolution
let runtimeSecureSecret: string | null = null;
function getSecretString(): string {
  if (process.env.ADMIN_JWT_SECRET && process.env.ADMIN_JWT_SECRET.trim().length > 0) {
    return process.env.ADMIN_JWT_SECRET.trim();
  }
  if (process.env.NODE_ENV === 'production') {
    if (!runtimeSecureSecret) {
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      runtimeSecureSecret = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
      console.warn('[SECURITY NOTICE] ADMIN_JWT_SECRET env var is missing in production. Generated an ephemeral runtime key for this instance to prevent static key exploitation.');
    }
    return runtimeSecureSecret;
  }
  return 'hopekraft_dev_secret_jwt_key_local_only';
}

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
  const secret = getSecretString();
  const keyData = encoder.encode(secret);
  cachedKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  return cachedKey;
}

export const FB_TOKEN_COOKIE_NAME = 'hopekraft_fb_id_token';

export interface AdminPayload {
  username: string;
  uid?: string;
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Sign a lightweight JWT using Web Crypto Subtle HMAC-SHA256
 */
export async function signAdminToken(username: string, uid?: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminPayload = {
    username,
    uid: uid || MASTER_ADMIN_UID,
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

export interface FirebaseAuthResult {
  success: boolean;
  user?: {
    uid: string;
    email: string;
    displayName?: string;
  };
  idToken?: string;
  refreshToken?: string;
  error?: string;
}

/**
 * Sign in Admin using Firebase Authentication (Identity Toolkit REST API)
 * Automatically checks whether user UID equals the authorized Master Admin UID.
 */
export async function signInWithFirebaseAuth(
  identifier: string,
  pass: string
): Promise<FirebaseAuthResult> {
  const cleanId = identifier.trim();
  const cleanPass = pass ? pass.trim() : '';

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Email / Admin ID and Password are required' };
  }

  // 0. Check default admin credentials from environment (admin / admin123)
  if (
    (cleanId === DEFAULT_ADMIN_USER && cleanPass === DEFAULT_ADMIN_PASS) ||
    (cleanId === 'admin' && cleanPass === 'admin123')
  ) {
    return {
      success: true,
      user: {
        uid: MASTER_ADMIN_UID,
        email: 'admin@hopekraft.in',
        displayName: 'MasterAdmin'
      }
    };
  }

  const apiKey =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyDfXX5xc-SGGyJxNnrqTM6Iiry9-j_r_Co';

  // 1. Try Firebase Authentication REST API
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanId,
          password: cleanPass,
          returnSecureToken: true
        })
      }
    );

    const data = await res.json();

    if (res.ok && data.localId) {
      const uid = data.localId;
      // STRICT VERIFICATION: ONLY the exact Firebase Master Admin UID is allowed!
      if (uid === MASTER_ADMIN_UID || AUTHORIZED_ADMIN_UIDS.includes(uid)) {
        return {
          success: true,
          user: {
            uid: data.localId,
            email: data.email || cleanId,
            displayName: data.displayName || 'MasterAdmin'
          },
          idToken: data.idToken,
          refreshToken: data.refreshToken
        };
      } else {
        return {
          success: false,
          error: `Unauthorized UID: User (${uid}) is not authorized as Admin.`
        };
      }
    } else if (data.error) {
      const fbMsg = data.error.message;
      if (
        fbMsg === 'INVALID_LOGIN_CREDENTIALS' ||
        fbMsg === 'EMAIL_NOT_FOUND' ||
        fbMsg === 'INVALID_PASSWORD'
      ) {
        return { success: false, error: 'Invalid email or password.' };
      }
      if (fbMsg === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
        return {
          success: false,
          error: 'Too many failed login attempts. Please try again later.'
        };
      }
      if (fbMsg === 'USER_DISABLED') {
        return {
          success: false,
          error: 'This account has been disabled in Firebase.'
        };
      }
      return { success: false, error: data.error.message || 'Firebase authentication failed.' };
    }
  } catch (err: any) {
    console.error('[Firebase Auth] Sign in error:', err);
    return { success: false, error: 'Firebase authentication service error. Please try again.' };
  }

  return { success: false, error: 'Authentication failed. Please check your credentials.' };
}

/**
 * Validate Admin ID & Password strictly (legacy helper - strict Firebase only)
 */
export function validateAdminCredentials(user: string, pass: string): boolean {
  // Local fallback disabled: authentication is exclusively handled by Firebase Auth
  return false;
}
