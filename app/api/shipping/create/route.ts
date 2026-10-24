import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/db';
import { createShiprocketShipment } from '@/lib/shiprocket';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  // Admin-only protection
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin login required' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { orderId, courierPreference, weight, length, breadth, height, pickupPincode } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Call Shiprocket Logistics with options
    const result = await createShiprocketShipment(order, {
      courierPreference,
      weight: weight ? Number(weight) : undefined,
      length: length ? Number(length) : undefined,
      breadth: breadth ? Number(breadth) : undefined,
      height: height ? Number(height) : undefined,
      pickupPincode
    });

    if (result.success) {
      const updated = await updateOrder(order.id, {
        orderStatus: 'Shipped',
        shippingStatus: 'manifested',
        shiprocketOrderId: result.shiprocketOrderId,
        shiprocketShipmentId: result.shiprocketShipmentId,
        awbCode: result.awbCode,
        courierName: result.courierName,
        trackingUrl: result.trackingUrl
      });

      return NextResponse.json({
        success: true,
        message: 'Order successfully dispatched via Shiprocket',
        shipment: result,
        order: updated
      });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create Shiprocket shipment' },
      { status: 500 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error.message || 'Shipping dispatch failed' },
      { status: 500 }
    );
  }
}
