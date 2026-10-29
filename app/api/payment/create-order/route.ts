import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import { HOPEKRAFT_PRODUCTS } from '@/lib/products';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, items, paymentMethod = 'online', receipt = `rcpt_${Date.now()}`, notes } = body;

    // Calculate server-side verified amount (Inspect Element tamper-proof)
    let serverSubtotal = 0;

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const prod = HOPEKRAFT_PRODUCTS[item.id];
        if (!prod) {
          return NextResponse.json(
            { success: false, error: `Invalid product ID '${item.id}'. Product not found in catalog.` },
            { status: 400 }
          );
        }
        const qty = Math.max(1, parseInt(item.qty || item.quantity || 1, 10));
        serverSubtotal += prod.price * qty;
      }
    } else if (productId) {
      const prod = HOPEKRAFT_PRODUCTS[productId];
      if (!prod) {
        return NextResponse.json(
          { success: false, error: `Invalid productId '${productId}'. Product not found in catalog.` },
          { status: 400 }
        );
      }
      serverSubtotal = prod.price;
    } else {
      serverSubtotal = HOPEKRAFT_PRODUCTS.easel.price;
    }

    // Apply verified business discounts
    const onlineDiscount = paymentMethod === 'online' ? 100 : 0;
    const verifiedAmount = Math.max(1, serverSubtotal - onlineDiscount);

    const order = await createRazorpayOrder({
      amount: verifiedAmount,
      receipt,
      notes: {
        ...notes,
        verifiedSubtotal: String(serverSubtotal),
        discountApplied: String(onlineDiscount)
      }
    });

    return NextResponse.json({
      success: true,
      order,
      verifiedAmount,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_hopekraft12345'
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error.message || 'Razorpay order creation failed' },
      { status: 500 }
    );
  }
}
