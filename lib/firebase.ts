/**
 * HOPEKRAFT - Firebase Realtime Database Configuration & Adapter
 * Project ID: hopekraft-21db3
 * Database URL: https://hopekraft-21db3-default-rtdb.firebaseio.com
 *
 * Edge & Serverless ready! Works seamlessly on Node.js, Next.js App Router,
 * and Cloudflare Workers with zero heavy client SDK overhead.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDfXX5xc-SGGyJxNnrqTM6Iiry9-j_r_Co',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'hopekraft-21db3.firebaseapp.com',
  databaseURL:
    process.env.FIREBASE_DATABASE_URL ||
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    'https://hopekraft-21db3-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'hopekraft-21db3',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'hopekraft-21db3.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '111190105391',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:111190105391:web:810f50f0e5d1cbbb60d5da',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-T5V81HTFSG'
};

export const FIREBASE_DB_URL = firebaseConfig.databaseURL.replace(/\/$/, '');

let globalRuntimeAuthToken: string | null = null;

export function setRuntimeAuthToken(token: string | null) {
  globalRuntimeAuthToken = token;
}

export function getRuntimeAuthToken(): string | null {
  return globalRuntimeAuthToken;
}

export async function resolveAuthToken(explicitToken?: string): Promise<string | undefined> {
  if (explicitToken) return explicitToken;

  const secret = process.env.FIREBASE_DATABASE_SECRET;
  if (secret && !secret.includes('YOUR_FIREBASE') && secret.trim().length > 0) {
    return secret.trim();
  }

  if (globalRuntimeAuthToken) {
    return globalRuntimeAuthToken;
  }

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const fbToken = cookieStore.get('hopekraft_fb_id_token')?.value;
    if (fbToken) return fbToken;
  } catch {
    // Outside of Next.js request scope
  }

  return undefined;
}

export async function getFirebaseUrl(path: string, tokenOverride?: string): Promise<string> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const token = await resolveAuthToken(tokenOverride);
  const authQuery = token ? `?auth=${encodeURIComponent(token)}` : '';
  return `${FIREBASE_DB_URL}${cleanPath}.json${authQuery}`;
}

/**
 * Perform a GET request to Firebase Realtime Database
 */
export async function firebaseGet<T>(path: string, tokenOverride?: string): Promise<T | null> {
  try {
    const url = await getFirebaseUrl(path, tokenOverride);
    const res = await fetch(url, {
      cache: 'no-store'
    });
    if (!res.ok) {
      console.warn(`[Firebase RTDB] GET ${path} status: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[Firebase RTDB] GET error for ${path}:`, err);
    return null;
  }
}

/**
 * Perform a PUT (create/replace) request to Firebase Realtime Database
 */
export async function firebasePut<T>(path: string, data: T, tokenOverride?: string): Promise<T | null> {
  try {
    const url = await getFirebaseUrl(path, tokenOverride);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      cache: 'no-store'
    });
    if (!res.ok) {
      console.warn(`[Firebase RTDB] PUT ${path} status: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[Firebase RTDB] PUT error for ${path}:`, err);
    return null;
  }
}

/**
 * Perform a PATCH (partial update) request to Firebase Realtime Database
 */
export async function firebasePatch<T>(path: string, patch: Partial<T>, tokenOverride?: string): Promise<T | null> {
  try {
    const url = await getFirebaseUrl(path, tokenOverride);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
      cache: 'no-store'
    });
    if (!res.ok) {
      console.warn(`[Firebase RTDB] PATCH ${path} status: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[Firebase RTDB] PATCH error for ${path}:`, err);
    return null;
  }
}

/**
 * Perform a DELETE request to Firebase Realtime Database
 */
export async function firebaseDelete(path: string, tokenOverride?: string): Promise<boolean> {
  try {
    const url = await getFirebaseUrl(path, tokenOverride);
    const res = await fetch(url, {
      method: 'DELETE',
      cache: 'no-store'
    });
    return res.ok;
  } catch (err) {
    console.error(`[Firebase RTDB] DELETE error for ${path}:`, err);
    return false;
  }
}
