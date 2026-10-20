import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, createOrder, updateOrder } from '@/lib/db';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { createShiprocketShipment } from '@/lib/shiprocket';

export async function GET(req: NextRequest) {
  // Admin-only protection
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin login required' },
      { status: 401 }
    );
  }

  const orders = await getAllOrders();
  return NextResponse.json({ success: true, orders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer,
      items,
      subtotal,
      discount = 0,
      shipping = 0,
      total,
      paymentMethod = 'cod',
      paymentStatus = 'pending',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = body;

    // Validation
    if (!customer?.name || !customer?.phone || !customer?.address || !customer?.city) {
      return NextResponse.json(
        { success: false, error: 'Name, phone number, address, and city are required' },
        { status: 400 }
      );
    }

    if (!items || !items.length) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Determine initial order status
    const isPaid = paymentStatus === 'paid' || (paymentMethod === 'razorpay' && !!razorpayPaymentId);
    const initialOrderStatus = isPaid ? 'Confirmed' : 'Pending';

    // 1. Create order in Database
    const newOrder = await createOrder({
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || '',
        address: customer.address.trim(),
        city: customer.city.trim(),
        pincode: customer.pincode?.trim() || '560038',
        state: customer.state?.trim() || 'Karnataka'
      },
      items,
      subtotal: subtotal || total,
      discount,
      shipping,
      total,
      paymentMethod,
      paymentStatus: isPaid ? 'paid' : 'pending',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderStatus: initialOrderStatus,
      shippingStatus: 'unfulfilled'
    });

    // 2. Automated Shiprocket Order Manifesting
    try {
      const shipment = await createShiprocketShipment(newOrder);
      if (shipment.success) {
        await updateOrder(newOrder.id, {
          shippingStatus: 'manifested',
          shiprocketOrderId: shipment.shiprocketOrderId,
          shiprocketShipmentId: shipment.shiprocketShipmentId,
          awbCode: shipment.awbCode,
          courierName: shipment.courierName,
          trackingUrl: shipment.trackingUrl
        });
      }
    } catch (shipErr) {
      console.warn('Shiprocket background auto-dispatch notice:', shipErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}
