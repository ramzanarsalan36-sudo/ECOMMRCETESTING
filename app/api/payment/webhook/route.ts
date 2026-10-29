import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, updateOrder } from '@/lib/db';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

async function verifyWebhookSignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
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
    console.error('[RAZORPAY WEBHOOK] Verification error:', err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    const rawBody = await req.text();

    if (!rawBody) {
      return NextResponse.json({ success: false, error: 'Empty body' }, { status: 400 });
    }

    // Verify signature if secret is configured
    if (WEBHOOK_SECRET) {
      if (!signature) {
        return NextResponse.json({ success: false, error: 'Missing x-razorpay-signature header' }, { status: 400 });
      }

      const isValid = await verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET);
      if (!isValid) {
        console.error('[RAZORPAY WEBHOOK] Invalid webhook signature');
        return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
    const rzpPaymentId = paymentEntity?.id;

    if (rzpOrderId) {
      const allOrders = await getAllOrders();
      const matchedOrder = allOrders.find(
        o => o.razorpayOrderId === rzpOrderId || (paymentEntity?.notes?.receipt && o.orderNumber.includes(paymentEntity.notes.receipt))
      );

      if (matchedOrder) {
        if (event === 'order.paid' || event === 'payment.captured') {
          await updateOrder(matchedOrder.id, {
            paymentStatus: 'paid',
            orderStatus: matchedOrder.orderStatus === 'Pending' ? 'Confirmed' : matchedOrder.orderStatus,
            razorpayPaymentId: rzpPaymentId || matchedOrder.razorpayPaymentId
          });
          console.log(`[RAZORPAY WEBHOOK] Successfully updated order ${matchedOrder.id} to paid/confirmed`);
        } else if (event === 'payment.failed') {
          await updateOrder(matchedOrder.id, {
            paymentStatus: 'failed'
          });
          console.log(`[RAZORPAY WEBHOOK] Order ${matchedOrder.id} marked as payment failed`);
        }
      }
    }

    return NextResponse.json({ status: 'ok', eventReceived: event });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[RAZORPAY WEBHOOK] Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook internal error' },
      { status: 500 }
    );
  }
}

