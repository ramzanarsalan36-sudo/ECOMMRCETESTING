/**
 * HOPEKRAFT E-Commerce Orders Database
 * Resilient, Edge & Node.js compatible Firebase Realtime Database & memory-backed order store.
 * Cloudflare Workers ready!
 */

import { firebaseGet, firebasePut, firebasePatch, firebaseDelete } from './firebase';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ShippingStatus = 'unfulfilled' | 'manifested' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: 'cod' | 'upi' | 'card' | 'razorpay';
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  orderStatus: OrderStatus;
  shippingStatus: ShippingStatus;
  shiprocketOrderId?: string | number;
  shiprocketShipmentId?: string | number;
  awbCode?: string;
  courierName?: string;
  trackingUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Global in-memory cache
// Using globalThis ensures orders persist across hot-reloads during Next.js dev
const globalForOrders = globalThis as unknown as {
  hopekraft_orders?: Order[];
};

if (!globalForOrders.hopekraft_orders) {
  globalForOrders.hopekraft_orders = [];
}

/**
 * Fetch all orders from Firebase Realtime Database.
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const remoteData = await firebaseGet<Record<string, Order>>('orders');

    if (remoteData && typeof remoteData === 'object' && Object.keys(remoteData).length > 0) {
      const ordersList: Order[] = Object.values(remoteData).map((o: any) => ({
        id: o.id || o.orderNumber?.replace('#', '') || 'HK-UNKNOWN',
        orderNumber: o.orderNumber || (o.id ? `#${o.id}` : '#HK-UNKNOWN'),
        customer: {
          name: o.customer?.name || 'Customer',
          phone: o.customer?.phone || '',
          email: o.customer?.email || '',
          address: o.customer?.address || '',
          city: o.customer?.city || '',
          pincode: o.customer?.pincode || '',
          state: o.customer?.state || 'India'
        },
        items: Array.isArray(o.items)
          ? o.items.map((i: any) => ({
              id: i.id || 'item',
              name: i.name || 'HOPEKRAFT Product',
              price: Number(i.price) || 0,
              qty: Math.max(1, Number(i.qty || i.quantity || 1)),
              image: i.image || '/assets/images/easel_full.jpg'
            }))
          : [],
        subtotal: Number(o.subtotal) || Number(o.total) || 0,
        discount: Number(o.discount) || 0,
        shipping: Number(o.shipping) || 0,
        total: Number(o.total) || 0,
        paymentMethod: o.paymentMethod || 'cod',
        paymentStatus: o.paymentStatus || 'pending',
        razorpayOrderId: o.razorpayOrderId,
        razorpayPaymentId: o.razorpayPaymentId,
        razorpaySignature: o.razorpaySignature,
        orderStatus: o.orderStatus || 'Pending',
        shippingStatus: o.shippingStatus || 'unfulfilled',
        shiprocketOrderId: o.shiprocketOrderId,
        shiprocketShipmentId: o.shiprocketShipmentId,
        awbCode: o.awbCode,
        courierName: o.courierName,
        trackingUrl: o.trackingUrl,
        notes: o.notes,
        createdAt: o.createdAt || new Date().toISOString(),
        updatedAt: o.updatedAt || o.createdAt || new Date().toISOString()
      }));

      globalForOrders.hopekraft_orders = ordersList;
      return [...ordersList].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Remote is empty
    globalForOrders.hopekraft_orders = [];
    return [];
  } catch (err) {
    console.warn('[DB] Firebase sync fallback to local cache:', err);
  }

  const orders = globalForOrders.hopekraft_orders || [];
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Fetch a single order by ID or orderNumber from Firebase Realtime Database
 */
export async function getOrderById(id: string): Promise<Order | null> {
  const cleanId = id.replace('#', '').toUpperCase();

  try {
    const remote = await firebaseGet<Order>(`orders/${cleanId}`);
    if (remote && remote.id) {
      return remote;
    }
  } catch (err) {
    console.warn('[DB] Firebase getOrderById error, trying local cache:', err);
  }

  const orders = globalForOrders.hopekraft_orders || [];
  const found = orders.find(
    o => o.id.toUpperCase() === cleanId || o.orderNumber.toUpperCase() === `#${cleanId}`
  );
  return found || null;
}

/**
 * Create a new order in Firebase Realtime Database
 */
export async function createOrder(
  data: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const orderId = `HK-${randomNum}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...data,
    id: orderId,
    orderNumber: `#${orderId}`,
    createdAt: now,
    updatedAt: now
  };

  // 1. Update in-memory cache instantly
  if (!globalForOrders.hopekraft_orders) {
    globalForOrders.hopekraft_orders = [];
  }
  globalForOrders.hopekraft_orders.unshift(newOrder);

  // 2. Persist to Firebase Realtime Database
  try {
    await firebasePut(`orders/${newOrder.id}`, newOrder);
  } catch (err) {
    console.error('[DB] Failed to save order to Firebase RTDB:', err);
  }

  return newOrder;
}

/**
 * Update an existing order in Firebase Realtime Database
 */
export async function updateOrder(id: string, patch: Partial<Order>): Promise<Order | null> {
  const cleanId = id.replace('#', '').toUpperCase();
  const orders = globalForOrders.hopekraft_orders || [];
  const index = orders.findIndex(
    o => o.id.toUpperCase() === cleanId || o.orderNumber.toUpperCase() === `#${cleanId}`
  );

  const existing = index !== -1 ? orders[index] : await getOrderById(cleanId);
  if (!existing) return null;

  const updated: Order = {
    ...existing,
    ...patch,
    id: existing.id,
    orderNumber: existing.orderNumber,
    updatedAt: new Date().toISOString()
  };

  if (index !== -1) {
    orders[index] = updated;
  } else {
    orders.unshift(updated);
  }

  // Persist patch to Firebase Realtime Database
  try {
    await firebasePatch(`orders/${existing.id}`, updated);
  } catch (err) {
    console.error('[DB] Failed to patch order in Firebase RTDB:', err);
  }

  return updated;
}

/**
 * Delete an order from Firebase Realtime Database
 */
export async function deleteOrder(id: string): Promise<boolean> {
  const cleanId = id.replace('#', '').toUpperCase();

  // 1. Delete from in-memory cache
  if (globalForOrders.hopekraft_orders) {
    globalForOrders.hopekraft_orders = globalForOrders.hopekraft_orders.filter(
      o => o.id.toUpperCase() !== cleanId && o.orderNumber.toUpperCase() !== `#${cleanId}`
    );
  }

  // 2. Delete from Firebase Realtime Database
  try {
    await firebaseDelete(`orders/${cleanId}`);
    return true;
  } catch (err) {
    console.error('[DB] Failed to delete order in Firebase RTDB:', err);
    return false;
  }
}

/**
 * Clear all orders from Firebase Realtime Database and in-memory cache
 */
export async function clearAllOrders(): Promise<boolean> {
  globalForOrders.hopekraft_orders = [];
  try {
    await firebaseDelete('orders');
    return true;
  } catch (err) {
    console.error('[DB] Failed to clear all orders in Firebase RTDB:', err);
    return false;
  }
}
