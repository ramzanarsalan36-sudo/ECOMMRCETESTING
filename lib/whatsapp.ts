/**
 * WhatsApp Integration via Baileys Service
 * [WHATSAPP_INTEGRATION]
 * 
 * Configurable via .env.local:
 * - WHATSAPP_ENABLED=true/false
 * - WHATSAPP_BAILEYS_URL=http://localhost:8000
 * - WHATSAPP_BAILEYS_ENDPOINT=/send-message
 * 
 * To remove WhatsApp completely in the future:
 * Simply delete this file and remove references in /checkout and /api/orders.
 */

import { Order } from './db';

const BAILEYS_URL = process.env.WHATSAPP_BAILEYS_URL || 'http://localhost:8000';
const BAILEYS_ENDPOINT = process.env.WHATSAPP_BAILEYS_ENDPOINT || '/api/send-message';
const IS_ENABLED = process.env.WHATSAPP_ENABLED !== 'false';

/**
 * Clean phone number and ensure country code (Default +91 India)
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Send a WhatsApp text message through Baileys REST server
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!IS_ENABLED) {
    console.log('[WhatsApp Disabled] Message skipped for:', phone);
    return { success: true, error: 'WhatsApp is disabled via WHATSAPP_ENABLED' };
  }

  const cleanPhone = formatPhoneNumber(phone);
  const jid = `${cleanPhone}@s.whatsapp.net`;

  const targetUrl = BAILEYS_URL.endsWith('/')
    ? `${BAILEYS_URL.slice(0, -1)}${BAILEYS_ENDPOINT}`
    : `${BAILEYS_URL}${BAILEYS_ENDPOINT}`;

  // Broad payload compatible with multiple Baileys REST bridge implementations
  const payload = {
    phone: cleanPhone,
    number: cleanPhone,
    to: jid,
    receiver: jid,
    jid: jid,
    chatId: jid,
    message: message,
    text: message,
    body: message
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (process.env.WHATSAPP_BAILEYS_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.WHATSAPP_BAILEYS_API_KEY}`;
      headers['x-api-key'] = process.env.WHATSAPP_BAILEYS_API_KEY;
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[WhatsApp Baileys] HTTP ${res.status}:`, errText);
      return { success: false, error: `Baileys server returned ${res.status}: ${errText}` };
    }

    const data = await res.json().catch(() => ({}));
    console.log(`[WhatsApp Baileys] Sent message to ${cleanPhone}`);
    return { success: true, data };
  } catch (err: any) {
    console.warn(`[WhatsApp Baileys Error] Failed to connect to ${targetUrl}:`, err.message);
    return { success: false, error: err.message || 'Could not reach Baileys server' };
  }
}

/**
 * Send 4-digit Cash On Delivery Verification OTP
 */
export async function sendCodOtpWhatsApp(phone: string, otp: string) {
  const message = [
    `*HOPEKRAFT Toys - Order Verification*`,
    ``,
    `Your 4-digit verification code for Cash on Delivery (COD) is:`,
    `👉 *${otp}*`,
    ``,
    `Valid for 5 minutes. Please do not share this code with anyone.`,
    `Thank you for choosing HOPEKRAFT! 🌿`
  ].join('\n');

  return sendWhatsAppMessage(phone, message);
}

/**
 * Send automated order confirmation notification
 */
export async function sendOrderConfirmationWhatsApp(order: Order) {
  const itemsList = order.items
    .map((item) => `• ${item.name} (x${item.qty}) - ₹${(item.price * item.qty).toLocaleString('en-IN')}`)
    .join('\n');

  const paymentDesc = order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid Online';

  const message = [
    `*🎉 Order Confirmed! - HOPEKRAFT Toys*`,
    ``,
    `Hello *${order.customer.name}*,`,
    `We have received your order and are preparing it with love! 🪵✨`,
    ``,
    `🧾 *Order ID:* ${order.orderNumber}`,
    `💳 *Payment:* ${paymentDesc}`,
    `💰 *Total Amount:* ₹${order.total.toLocaleString('en-IN')}`,
    ``,
    `📦 *Items:*`,
    itemsList,
    ``,
    `📍 *Shipping To:*`,
    `${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}`,
    ``,
    `We will send you courier tracking details as soon as your package is dispatched!`,
    `Need help? Chat with us anytime. 😊`
  ].join('\n');

  return sendWhatsAppMessage(order.customer.phone, message);
}
