import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { formatPhoneNumber } from '@/lib/whatsapp';

const OTP_SECRET = process.env.ADMIN_JWT_SECRET || 'hopekraft_otp_secret_key_8844';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, verificationToken } = await req.json();

    if (!phone || !otp || !verificationToken) {
      return NextResponse.json(
        { success: false, error: 'Phone number, 4-digit code, and token are required' },
        { status: 400 }
      );
    }

    const cleanPhone = formatPhoneNumber(phone);
    const cleanOtp = String(otp).trim();

    if (cleanOtp.length !== 4 || !/^\d{4}$/.test(cleanOtp)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 4-digit numeric code' },
        { status: 400 }
      );
    }

    const [expiresAtStr, signature] = String(verificationToken).split('.');
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || !signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token format' },
        { status: 400 }
      );
    }

    if (Date.now() > expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify HMAC
    const expectedData = `${cleanPhone}:${cleanOtp}:${expiresAt}`;
    const expectedSignature = crypto.createHmac('sha256', OTP_SECRET).update(expectedData).digest('hex');

    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return NextResponse.json(
        { success: false, error: 'Incorrect 4-digit OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    // Generate a verified COD token valid for 15 minutes to attach to order creation
    const codVerifiedAt = Date.now();
    const codData = `COD_VERIFIED:${cleanPhone}:${codVerifiedAt}`;
    const codProof = crypto.createHmac('sha256', OTP_SECRET).update(codData).digest('hex');
    const codToken = `${codVerifiedAt}.${codProof}`;

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Cash on Delivery verified successfully via WhatsApp!',
      codToken
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
