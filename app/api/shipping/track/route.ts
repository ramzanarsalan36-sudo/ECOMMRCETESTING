import { NextRequest, NextResponse } from 'next/server';
import { trackShiprocketOrder } from '@/lib/shiprocket';
import { getOrderById } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const awb = searchParams.get('awb');
  const orderId = searchParams.get('orderId');

  let awbToTrack = awb;

  if (!awbToTrack && orderId) {
    const order = await getOrderById(orderId);
    if (order && order.awbCode) {
      awbToTrack = order.awbCode;
    }
  }

  if (!awbToTrack) {
    return NextResponse.json(
      { success: false, error: 'awb or orderId is required' },
      { status: 400 }
    );
  }

  try {
    const tracking = await trackShiprocketOrder(awbToTrack);
    return NextResponse.json({
      success: true,
      awb: awbToTrack,
      tracking
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error.message || 'Tracking lookup failed' },
      { status: 500 }
    );
  }
}
