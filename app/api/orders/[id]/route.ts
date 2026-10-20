import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/db';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return NextResponse.json(
      { success: false, error: 'Order not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, order });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  // Admin-only protection
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin login required' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await req.json();

  const updated = await updateOrder(id, body);

  if (!updated) {
    return NextResponse.json(
      { success: false, error: 'Order not found or update failed' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Order updated successfully',
    order: updated
  });
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  // Admin-only protection
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin login required' },
      { status: 401 }
    );
  }

  const { id } = await params;
  let deleteReason = 'Manual Admin Deletion';
  let deleteType = 'Permanent Removal';

  try {
    const body = await req.json();
    if (body.reason) deleteReason = body.reason;
    if (body.deleteType) deleteType = body.deleteType;
  } catch {
    // Body optional
  }

  const { deleteOrder } = await import('@/lib/db');
  const deleted = await deleteOrder(id);

  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'Order not found or could not be deleted' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Order ${id} deleted successfully (${deleteType})`,
    deleteType,
    deleteReason
  });
}

