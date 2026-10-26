import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendCodOtpWhatsApp, formatPhoneNumber } from '@/lib/whatsapp';

const OTP_SECRET = process.env.ADMIN_JWT_SECRET || 'hopekraft_otp_secret_key_8844';
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const cleanPhone = formatPhoneNumber(phone);
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Must be at least 10 digits.' },
        { status: 400 }
      );
    }

    // Generate secure 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    // Create HMAC verification token (stateless, tamper-proof)
    const dataToSign = `${cleanPhone}:${otp}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', OTP_SECRET).update(dataToSign).digest('hex');
    const verificationToken = `${expiresAt}.${signature}`;

    // Dispatch WhatsApp message via Baileys service
    const waResult = await sendCodOtpWhatsApp(cleanPhone, otp);

    const isDevelopment = process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      success: true,
      message: waResult.success
        ? '4-digit verification code sent to your WhatsApp!'
        : 'Code generated. Please ensure your Baileys server is running at port 8000.',
      verificationToken,
      phone: cleanPhone,
      // For easy testing in development/educational environments:
      ...(isDevelopment ? { devCode: otp, waStatus: waResult } : {})
    });
  } catch (error: any) {
    console.error('Error generating OTP:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
