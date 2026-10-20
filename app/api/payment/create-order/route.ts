import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, receipt = `rcpt_${Date.now()}`, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const order = await createRazorpayOrder({
      amount,
      receipt,
      notes
    });

    return NextResponse.json({
      success: true,
      order,
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
