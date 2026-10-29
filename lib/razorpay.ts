/**
 * HOPEKRAFT Razorpay Integration
 * Production-ready payment flow using Web Crypto HMAC-SHA256.
 * Zero native binary dependencies; 100% Cloudflare Workers & Node.js compatible.
 */

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

export interface CreateRazorpayOrderOptions {
  amount: number; // in INR rupees
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number; // in paise
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

/**
 * Creates an official Razorpay order via REST API
 */
export async function createRazorpayOrder(options: CreateRazorpayOrderOptions): Promise<RazorpayOrderResponse> {
  const amountInPaise = Math.round(options.amount * 100);
  const currency = options.currency || 'INR';

  // If live or valid test keys are provided
  const isRealKey = RAZORPAY_KEY_ID && !RAZORPAY_KEY_ID.includes('hopekraft12345') && RAZORPAY_KEY_SECRET;

  if (isRealKey) {
    try {
      const basicAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: options.receipt,
          notes: options.notes || {}
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.description || `Razorpay order creation failed: ${res.statusText}`);
      }

      return await res.json();
    } catch (err) {
      console.error('Error calling Razorpay API:', err);
      throw err;
    }
  }

  // Fallback / Sandbox Simulation Mode (works immediately out of the box)
  return {
    id: `order_${options.receipt}_rzp_${Math.random().toString(36).substring(2, 9)}`,
    entity: 'order',
    amount: amountInPaise,
    amount_paid: 0,
    amount_due: amountInPaise,
    currency,
    receipt: options.receipt,
    status: 'created',
    created_at: Math.floor(Date.now() / 1000)
  };
}

/**
 * Fetches Razorpay Order details from REST API to verify amount paid
 */
export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrderResponse | null> {
  const isRealKey = RAZORPAY_KEY_ID && !RAZORPAY_KEY_ID.includes('hopekraft12345') && RAZORPAY_KEY_SECRET;
  if (!isRealKey || !orderId) return null;

  try {
    const basicAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Error fetching Razorpay order:', err);
    return null;
  }
}

/**
 * Verifies Razorpay payment signature using Web Crypto HMAC-SHA256
 */
export async function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<boolean> {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  // In production, NEVER bypass signature verification under any circumstance
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    if (!RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET.includes('mock_secret')) {
      console.error('[SECURITY ERROR] RAZORPAY_KEY_SECRET is not configured or is a mock key in production!');
      return false;
    }
    if (razorpaySignature.startsWith('test_sim_')) {
      console.error('[SECURITY ALERT] test_sim_ signature attempted in production!');
      return false;
    }
  } else {
    // Only allow simulation in local development when real keys are not configured
    if ((!RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET.includes('mock_secret')) && razorpaySignature.startsWith('test_sim_')) {
      return true;
    }
  }

  try {
    const textToSign = `${razorpayOrderId}|${razorpayPaymentId}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(RAZORPAY_KEY_SECRET);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(textToSign)
    );

    // Convert to hex
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const generatedHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return generatedHex === razorpaySignature;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature using Web Crypto HMAC-SHA256
 */
export async function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!rawBody || !signature || !secret) return false;
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      encoder.encode(rawBody)
    );
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const generatedHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return generatedHex === signature;
  } catch (err) {
    console.error('Webhook signature verification error:', err);
    return false;
  }
}
