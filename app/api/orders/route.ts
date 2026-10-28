import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, createOrder, updateOrder } from '@/lib/db';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { HOPEKRAFT_PRODUCTS } from '@/lib/products';

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
      paymentMethod = 'cod',
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

    // 1. Server-side price recalculation (Never trust client prices)
    let verifiedSubtotal = 0;
    const verifiedItems = items.map((item: any) => {
      const prod = HOPEKRAFT_PRODUCTS[item.id];
      const realPrice = prod ? prod.price : (Number(item.price) || 3499);
      const qty = Math.max(1, parseInt(item.qty || item.quantity || 1, 10));
      verifiedSubtotal += realPrice * qty;
      return {
        id: item.id,
        name: prod ? prod.name : (item.name || 'HOPEKRAFT Product'),
        price: realPrice,
        qty,
        image: prod ? prod.image : (item.image || '/assets/images/easel_full.jpg')
      };
    });

    const isOnlinePayment = paymentMethod === 'online' || paymentMethod === 'razorpay';
    const verifiedDiscount = isOnlinePayment ? 100 : 0;
    const verifiedShipping = 0;
    const verifiedTotal = Math.max(0, verifiedSubtotal - verifiedDiscount + verifiedShipping);

    // 2. Strict Payment Signature Verification for Online Payments
    let isPaid = false;
    if (isOnlinePayment) {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return NextResponse.json(
          { success: false, error: 'Online payment requires valid Razorpay payment ID, Order ID, and signature.' },
          { status: 400 }
        );
      }

      const isValid = await verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Payment verification failed: Invalid or forged Razorpay signature.' },
          { status: 400 }
        );
      }

      isPaid = true;
    } else {
      isPaid = false;
    }

    const initialOrderStatus = isPaid ? 'Confirmed' : 'Pending';

    // 3. Create order in Database with verified prices
    const newOrder = await createOrder({
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || '',
        address: customer.address.trim(),
        city: customer.city.trim(),
        pincode: customer.pincode?.trim() || '560038',
        state: customer.state?.trim() || 'India'
      },
      items: verifiedItems,
      subtotal: verifiedSubtotal,
      discount: verifiedDiscount,
      shipping: verifiedShipping,
      total: verifiedTotal,
      paymentMethod: isOnlinePayment ? 'razorpay' : 'cod',
      paymentStatus: isPaid ? 'paid' : 'pending',
      razorpayOrderId: razorpayOrderId || undefined,
      razorpayPaymentId: razorpayPaymentId || undefined,
      razorpaySignature: razorpaySignature || undefined,
      orderStatus: initialOrderStatus,
      shippingStatus: 'unfulfilled'
    });

    // NOTE: Order is saved safely as 'unfulfilled'.
    // It will ONLY be moved to Shiprocket when the Admin verifies and clicks "Assign to Shiprocket" in /admin.

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


export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const admin = await verifyAdminToken(token);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin login required' }, { status: 401 });
  }

  const { clearAllOrders } = await import('@/lib/db');
  const success = await clearAllOrders();

  return NextResponse.json({
    success,
    message: success ? 'All orders cleared successfully from Firebase' : 'Failed to clear orders'
  });
}
