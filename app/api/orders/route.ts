import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, createOrder } from '@/lib/db';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { verifyRazorpaySignature, fetchRazorpayOrder } from '@/lib/razorpay';
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

    // 1. Strict Server-Side Product & Price Verification (Inspect Element Tamper-Proof)
    let verifiedSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const prod = HOPEKRAFT_PRODUCTS[item.id];
      if (!prod) {
        return NextResponse.json(
          { success: false, error: `Invalid product ID '${item.id || 'unknown'}'. Product does not exist in catalog.` },
          { status: 400 }
        );
      }

      const qty = Math.max(1, parseInt(item.qty || item.quantity || 1, 10));
      const realPrice = prod.price; // Strict catalog price from server
      verifiedSubtotal += realPrice * qty;

      verifiedItems.push({
        id: prod.id,
        name: prod.name,
        price: realPrice,
        qty,
        image: prod.image
      });
    }

    const isOnlinePayment = paymentMethod === 'online' || paymentMethod === 'razorpay';
    const verifiedDiscount = isOnlinePayment ? 100 : 0;
    const verifiedShipping = 0;
    const verifiedTotal = Math.max(0, verifiedSubtotal - verifiedDiscount + verifiedShipping);

    // 2. Strict Payment Signature & Amount Verification for Online Payments
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

      // Check if Razorpay order amount matches server-calculated amount
      const rzpOrder = await fetchRazorpayOrder(razorpayOrderId);
      if (rzpOrder) {
        const expectedPaise = verifiedTotal * 100;
        if (rzpOrder.amount !== expectedPaise) {
          return NextResponse.json(
            {
              success: false,
              error: `Security Alert: Payment amount mismatch! Expected Rs.${verifiedTotal}, but Razorpay order was for Rs.${rzpOrder.amount / 100}.`
            },
            { status: 400 }
          );
        }
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
        pincode: customer.pincode?.trim() || '423203',
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
