import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, verified: false, error: 'Missing signature verification parameters' },
        { status: 400 }
      );
    }

    const isValid = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, verified: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Payment signature verified successfully'
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, verified: false, error: error.message || 'Signature verification error' },
      { status: 500 }
    );
  }
}
