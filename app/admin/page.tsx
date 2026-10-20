'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Order, OrderStatus } from '@/lib/db';
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  RefreshCw,
  ExternalLink,
  Truck,
  Eye,
  X,
  Copy,
  Printer,
  CreditCard,
  Download,
  Phone,
  MapPin,
  MessageSquare,
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { printPackagingSlip } from '@/lib/packagingSlip';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal Drawer State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Order Deletion Modal State
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleteType, setDeleteType] = useState<string>('Customer Cancellation');
  const [deleteReasonNotes, setDeleteReasonNotes] = useState<string>('');
  const [deleteConfirmInput, setDeleteConfirmInput] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/admin/login';
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (selectedStatus !== 'ALL' && order.orderStatus.toUpperCase() !== selectedStatus) {
        return false;
      }
      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customer.name.toLowerCase().includes(q) ||
        order.customer.phone.includes(q) ||
        order.customer.city.toLowerCase().includes(q) ||
        (order.awbCode && order.awbCode.toLowerCase().includes(q))
      );
    });
  }, [orders, selectedStatus, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: orders.length,
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0
    };
    orders.forEach(o => {
      const st = o.orderStatus.toUpperCase();
      if (counts[st] !== undefined) {
        counts[st]++;
      }
    });
    return counts;
  }, [orders]);

  // Key Metrics
  const metrics = useMemo(() => {
    const totalRev = orders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
    const dispatchedOrders = orders.filter(o => o.orderStatus === 'Shipped' || o.orderStatus === 'Delivered').length;

    return { totalRev, totalOrders, pendingOrders, dispatchedOrders };
  }, [orders]);

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setFeedbackMsg(null);
  };

  const openDeleteModal = (order: Order) => {
    setOrderToDelete(order);
    setDeleteType('Customer Cancellation');
    setDeleteReasonNotes('');
    setDeleteConfirmInput('');
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete || deleteConfirmInput.trim().toUpperCase() !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deleteType,
          reason: deleteReasonNotes || deleteType
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
        if (selectedOrder && selectedOrder.id === orderToDelete.id) {
          setSelectedOrder(null);
        }
        setFeedbackMsg(`Order ${orderToDelete.orderNumber} deleted successfully (${deleteType})`);
        setTimeout(() => setFeedbackMsg(null), 4000);
        setOrderToDelete(null);
      } else {
        alert(`Failed to delete order: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert(`Error deleting order: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setStatusUpdateLoading(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setSelectedOrder(data.order);
        setOrders(prev => prev.map(o => (o.id === data.order.id ? data.order : o)));
        setFeedbackMsg(`Order status updated to ${newStatus}`);
      }
    } catch (err: any) {
      setFeedbackMsg(`Error updating status: ${err.message}`);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleShiprocketDispatch = async (orderId: string) => {
    setDispatchLoading(true);
    try {
      const res = await fetch('/api/shipping/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setSelectedOrder(data.order);
        setOrders(prev => prev.map(o => (o.id === data.order.id ? data.order : o)));
        setFeedbackMsg(`Dispatched via Shiprocket! AWB: ${data.order.awbCode} (${data.order.courierName})`);
      } else {
        setFeedbackMsg(`Dispatch failed: ${data.error || 'Check Shiprocket credentials'}`);
      }
    } catch (err: any) {
      setFeedbackMsg(`Dispatch error: ${err.message}`);
    } finally {
      setDispatchLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setFeedbackMsg('Copied to clipboard! 📋');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const exportOrdersToCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'City',
      'Pincode',
      'Items',
      'Total Amount',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Courier',
      'AWB Code'
    ];
    const rows = filteredOrders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toISOString(),
      `"${o.customer.name.replace(/"/g, '""')}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.city}"`,
      `"${o.customer.pincode}"`,
      `"${o.items.map(i => `${i.name} (x${i.qty})`).join('; ')}"`,
      o.total,
      o.paymentMethod,
      o.paymentStatus,
      o.orderStatus,
      o.courierName || '',
      o.awbCode || ''
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hopekraft_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppUrl = (phone: string, customerName: string, orderNumber: string, status: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      `Hello ${customerName}! Your HopeKraft order ${orderNumber} is currently ${status}. Let us know if you need any assistance!`
    );
    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* PAGE HEADER */}
      <div className="admin-page-header">
        <div className="admin-header-title-wrap">
          <h1 className="admin-page-title">Orders &amp; Dispatch Engine</h1>
          <span className="admin-live-badge">
            <span className="pulse-dot"></span>
            Live ({filteredOrders.length} showing)
          </span>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            onClick={exportOrdersToCSV}
            className="btn-header-action"
            title="Download CSV for Excel/Tally"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={loadOrders}
            className="btn-header-action"
            title="Refresh order database"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* COMPACT METRICS BAR (FITS IN WINDOW WITHOUT PUSHING CONTENT) */}
      <div className="admin-metrics-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: '#ECFDF5', color: '#059669' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="stat-value">₹{metrics.totalRev.toLocaleString('en-IN')}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <Package size={18} />
          </div>
          <div>
            <div className="stat-value">{metrics.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <Clock size={18} />
          </div>
          <div>
            <div className="stat-value">{metrics.pendingOrders}</div>
            <div className="stat-label">Pending Action</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
            <CheckCircle size={18} />
          </div>
          <div>
            <div className="stat-value">{metrics.dispatchedOrders}</div>
            <div className="stat-label">Shipped / Delivered</div>
          </div>
        </div>
      </div>

      {/* CONTROLS: SEARCH & STATUS TABS */}
      <div className="admin-controls-card">
        <div className="admin-search-wrapper">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search Order #, customer, phone, city, AWB..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search
            size={14}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8'
            }}
          />
        </div>

        <div className="admin-status-tabs">
          {(['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).map(st => (
            <button
              key={st}
              type="button"
              className={`admin-tab-btn ${selectedStatus === st ? 'active' : ''}`}
              onClick={() => setSelectedStatus(st)}
            >
              <span>{st}</span>
              <span className="tab-count-badge">{tabCounts[st] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DESKTOP ORDERS TABLE (FITS DESKTOP WINDOW & STRICT 1-LINE CLIENT LAYOUT) */}
      <div className="admin-table-container">
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th style={{ width: '9.5%' }}>Order ID</th>
              <th style={{ width: '8.5%' }}>Date</th>
              <th style={{ width: '28%' }}>Client Information</th>
              <th style={{ width: '13%' }}>Product / Items</th>
              <th style={{ width: '7.5%' }}>Amount</th>
              <th style={{ width: '9%' }}>Payment</th>
              <th style={{ width: '8.5%' }}>Status</th>
              <th style={{ width: '8%' }}>Tracking</th>
              <th style={{ width: '8%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => {
                const statusClass = order.orderStatus.toLowerCase();
                const paymentClass = order.paymentStatus.toLowerCase();
                const waUrl = getWhatsAppUrl(
                  order.customer.phone,
                  order.customer.name,
                  order.orderNumber,
                  order.orderStatus
                );

                return (
                  <tr key={order.id} className={`row-status-${statusClass}`}>
                    {/* Order ID */}
                    <td>
                      <strong
                        style={{
                          color: '#2563EB',
                          cursor: 'pointer',
                          fontFamily: 'ui-monospace, SFMono-Regular, monospace'
                        }}
                        onClick={() => openOrderModal(order)}
                        title="Click to view complete order"
                      >
                        {order.orderNumber}
                      </strong>
                    </td>

                    {/* Date */}
                    <td style={{ color: '#64748B', fontSize: '0.72rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* CLIENT CONTENT IN STRICTLY ONE LINE */}
                    <td>
                      <div
                        className="client-oneline"
                        title={`${order.customer.name} | ${order.customer.phone} | ${order.customer.city}, ${order.customer.state} (${order.customer.pincode})`}
                      >
                        <span className="client-avatar">{getInitials(order.customer.name)}</span>
                        <span className="client-name">{order.customer.name}</span>
                        <span className="client-dot">·</span>
                        <span className="client-phone">{order.customer.phone}</span>
                        <span className="client-dot">·</span>
                        <span className="client-city">
                          {order.customer.city}
                        </span>
                      </div>
                    </td>

                    {/* Items (1 line) */}
                    <td>
                      <div className="items-oneline" title={order.items.map(i => `${i.name} (x${i.qty})`).join(', ')}>
                        <span>
                          {order.items.length === 1
                            ? `${order.items[0].qty}x ${order.items[0].name.replace('HOPEKRAFT ', '').replace('Wooden ', '')}`
                            : `${order.items.reduce((s, i) => s + i.qty, 0)} items`}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td>
                      <strong style={{ color: '#0F172A', fontWeight: 800 }}>
                        ₹{order.total.toLocaleString('en-IN')}
                      </strong>
                    </td>

                    {/* Payment */}
                    <td>
                      <span className={`payment-pill ${paymentClass}`}>
                        {order.paymentStatus} · {order.paymentMethod.toUpperCase()}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td>
                      <span className={`status-pill ${statusClass}`}>
                        <span className="status-dot"></span>
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Logistics Courier */}
                    <td>
                      {order.awbCode ? (
                        <a
                          href={order.trackingUrl || `https://shiprocket.co/tracking/${order.awbCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="courier-badge"
                          title={`Track in Shiprocket: ${order.awbCode}`}
                        >
                          <Truck size={10} /> {order.awbCode.length > 9 ? `...${order.awbCode.slice(-7)}` : order.awbCode}
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="btn-shiprocket-action"
                          onClick={() => handleShiprocketDispatch(order.id)}
                          title="Generate Shiprocket AWB dispatch label"
                        >
                          <Truck size={10} /> Ship
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => openOrderModal(order)}
                          className="btn-action-view"
                          title="Inspect Order Details"
                          style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                        >
                          <Eye size={12} />
                        </button>

                        <button
                          type="button"
                          onClick={() => printPackagingSlip(order)}
                          className="btn-action-view"
                          title="Print Packaging Slip & Tax Invoice"
                          style={{ padding: '3px 6px', fontSize: '0.7rem', color: '#0077C8' }}
                        >
                          <Printer size={12} />
                        </button>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-action-wa"
                          title="Chat on WhatsApp"
                          style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                        >
                          <MessageSquare size={11} />
                        </a>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(order)}
                          className="btn-action-delete"
                          title="Delete Order"
                          style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                  No orders match the current filter or search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE RESPONSIVE CARDS VIEW (< 900px) */}
      <div className="admin-mobile-cards">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => {
            const statusClass = order.orderStatus.toLowerCase();
            const paymentClass = order.paymentStatus.toLowerCase();
            const waUrl = getWhatsAppUrl(
              order.customer.phone,
              order.customer.name,
              order.orderNumber,
              order.orderStatus
            );

            return (
              <div key={order.id} className={`mobile-order-card card-status-${statusClass}`}>
                {/* Mobile Card Header */}
                <div className="mobile-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong
                      style={{
                        color: '#2563EB',
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: '0.88rem'
                      }}
                      onClick={() => openOrderModal(order)}
                    >
                      {order.orderNumber}
                    </strong>
                    <span className={`status-pill ${statusClass}`}>
                      <span className="status-dot"></span>
                      {order.orderStatus}
                    </span>
                  </div>

                  <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>
                    ₹{order.total.toLocaleString('en-IN')}
                  </strong>
                </div>

                {/* Mobile Client Line (STRICTLY ONE LINE) */}
                <div className="mobile-client-line">
                  <span className="client-avatar" style={{ width: '20px', height: '20px', fontSize: '0.62rem' }}>
                    {getInitials(order.customer.name)}
                  </span>
                  <span style={{ fontWeight: 700 }}>{order.customer.name}</span>
                  <span style={{ color: '#CBD5E1' }}>·</span>
                  <span style={{ color: '#475569', fontSize: '0.75rem' }}>{order.customer.phone}</span>
                  <span style={{ color: '#CBD5E1' }}>·</span>
                  <span style={{ color: '#64748B', fontSize: '0.75rem' }}>{order.customer.city}</span>
                </div>

                {/* Mobile Card Details */}
                <div className="mobile-card-details">
                  <span>
                    📦 {order.items.reduce((s, i) => s + i.qty, 0)} item(s) · {order.items[0]?.name.slice(0, 20)}...
                  </span>
                  <span className={`payment-pill ${paymentClass}`}>
                    {order.paymentStatus} ({order.paymentMethod})
                  </span>
                </div>

                {/* Mobile Card Actions */}
                <div className="mobile-card-actions">
                  <button
                    type="button"
                    onClick={() => openOrderModal(order)}
                    className="btn-action-view"
                    style={{ flex: 1, justifyContent: 'center', padding: '6px' }}
                  >
                    <Eye size={13} /> Details
                  </button>

                  <button
                    type="button"
                    onClick={() => printPackagingSlip(order)}
                    className="btn-action-view"
                    style={{ flex: 1, justifyContent: 'center', padding: '6px', color: '#0077C8' }}
                    title="Print Packaging Slip"
                  >
                    <Printer size={13} /> Slip
                  </button>

                  {order.awbCode ? (
                    <a
                      href={order.trackingUrl || `https://shiprocket.co/tracking/${order.awbCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="courier-badge"
                      style={{ flex: 1, justifyContent: 'center', padding: '6px' }}
                    >
                      <Truck size={12} /> {order.awbCode}
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn-shiprocket-action"
                      style={{ flex: 1, justifyContent: 'center', padding: '6px' }}
                      onClick={() => handleShiprocketDispatch(order.id)}
                    >
                      <Truck size={12} /> Dispatch
                    </button>
                  )}

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-action-wa"
                    style={{ padding: '6px 12px' }}
                  >
                    <MessageSquare size={13} />
                  </a>

                  <button
                    type="button"
                    onClick={() => openDeleteModal(order)}
                    className="btn-action-delete"
                    style={{ padding: '6px 10px' }}
                    title="Delete Order"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', background: '#FFFFFF', borderRadius: '8px' }}>
            No orders match the selected filters.
          </div>
        )}
      </div>

      {/* ORDER DETAILS MODAL DRAWER */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="admin-modal-close"
              onClick={() => setSelectedOrder(null)}
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                Order {selectedOrder.orderNumber}
              </h2>
              <span className={`status-pill ${selectedOrder.orderStatus.toLowerCase()}`}>
                <span className="status-dot"></span>
                {selectedOrder.orderStatus}
              </span>
            </div>

            {feedbackMsg && (
              <div
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{feedbackMsg}</span>
              </div>
            )}

            {/* Quick Status Updater */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Status:</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as OrderStatus)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    outline: 'none',
                    background: '#FFFFFF'
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  type="button"
                  disabled={statusUpdateLoading}
                  onClick={handleUpdateStatus}
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {statusUpdateLoading ? 'Updating...' : 'Save'}
                </button>
              </div>

              {/* Shiprocket Dispatch button */}
              {!selectedOrder.awbCode && (
                <button
                  type="button"
                  disabled={dispatchLoading}
                  onClick={() => handleShiprocketDispatch(selectedOrder.id)}
                  className="btn-shiprocket-action"
                  style={{ padding: '6px 12px' }}
                >
                  <Truck size={13} /> {dispatchLoading ? 'Dispatching...' : 'Dispatch via Shiprocket 🚚'}
                </button>
              )}
            </div>

            {/* Customer & Address Details */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '12px',
                marginBottom: '16px'
              }}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}
                >
                  <strong style={{ fontSize: '0.84rem', color: '#0F172A' }}>Client Information</strong>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `${selectedOrder.customer.name}\n${selectedOrder.customer.phone}\n${selectedOrder.customer.address}, ${selectedOrder.customer.city} ${selectedOrder.customer.pincode}`
                      )
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600
                    }}
                  >
                    <Copy size={11} /> Copy Address
                  </button>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#334155', margin: '3px 0' }}>
                  <strong>Name:</strong> {selectedOrder.customer.name}
                </p>
                <p style={{ fontSize: '0.82rem', color: '#334155', margin: '3px 0' }}>
                  <strong>Phone:</strong> {selectedOrder.customer.phone}
                </p>
                {selectedOrder.customer.email && (
                  <p style={{ fontSize: '0.82rem', color: '#334155', margin: '3px 0' }}>
                    <strong>Email:</strong> {selectedOrder.customer.email}
                  </p>
                )}
                <p style={{ fontSize: '0.82rem', color: '#334155', marginTop: '6px' }}>
                  <strong>Shipping Address:</strong> {selectedOrder.customer.address},{' '}
                  {selectedOrder.customer.city}, {selectedOrder.customer.pincode},{' '}
                  {selectedOrder.customer.state}
                </p>

                {/* Direct WhatsApp button in modal */}
                <div style={{ marginTop: '10px' }}>
                  <a
                    href={getWhatsAppUrl(
                      selectedOrder.customer.phone,
                      selectedOrder.customer.name,
                      selectedOrder.orderNumber,
                      selectedOrder.orderStatus
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-action-wa"
                    style={{ width: '100%', justifyContent: 'center', padding: '6px' }}
                  >
                    <MessageSquare size={13} /> Chat on WhatsApp (+91 {selectedOrder.customer.phone})
                  </a>
                </div>
              </div>

              {/* Payment & Logistics Info */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              >
                <strong style={{ fontSize: '0.84rem', color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                  Payment &amp; Logistics
                </strong>
                <p style={{ fontSize: '0.82rem', color: '#334155', margin: '3px 0' }}>
                  <strong>Payment Mode:</strong> {selectedOrder.paymentMethod.toUpperCase()} (
                  <span className={`payment-pill ${selectedOrder.paymentStatus.toLowerCase()}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                  )
                </p>
                {selectedOrder.razorpayPaymentId && (
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '3px 0', fontFamily: 'monospace' }}>
                    <strong>Razorpay ID:</strong> {selectedOrder.razorpayPaymentId}
                  </p>
                )}
                {selectedOrder.courierName && (
                  <p style={{ fontSize: '0.82rem', color: '#334155', marginTop: '6px' }}>
                    <strong>Courier:</strong> {selectedOrder.courierName}
                  </p>
                )}
                {selectedOrder.awbCode && (
                  <p style={{ fontSize: '0.82rem', color: '#334155', margin: '3px 0' }}>
                    <strong>AWB Code:</strong> {selectedOrder.awbCode}
                  </p>
                )}
                {selectedOrder.trackingUrl && (
                  <a
                    href={selectedOrder.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.78rem',
                      color: '#4F46E5',
                      fontWeight: 700,
                      marginTop: '6px'
                    }}
                  >
                    Track in Shiprocket ↗
                  </a>
                )}
              </div>
            </div>

            {/* Ordered Items */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}
            >
              <strong style={{ fontSize: '0.84rem', color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                Order Items Summary
              </strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      borderBottom: '1px solid #F1F5F9',
                      paddingBottom: '8px'
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        minWidth: '36px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, fontSize: '0.82rem' }}>
                      <p style={{ fontWeight: 600, color: '#0F172A' }}>{item.name}</p>
                      <span style={{ color: '#64748B', fontSize: '0.74rem' }}>
                        Qty: {item.qty} × ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #E2E8F0',
                  paddingTop: '8px',
                  marginTop: '8px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#0F172A'
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: '#2563EB' }}>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
              <button
                type="button"
                onClick={() => {
                  const o = selectedOrder;
                  setSelectedOrder(null);
                  openDeleteModal(o);
                }}
                className="btn-action-delete"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                title="Delete this order record"
              >
                <Trash2 size={13} /> Delete Order Record
              </button>

              <button
                type="button"
                onClick={() => printPackagingSlip(selectedOrder)}
                className="btn-header-action"
                style={{ padding: '7px 14px', background: '#0077C8', color: '#FFFFFF', borderColor: '#0077C8', fontWeight: 700 }}
              >
                <Printer size={14} /> Print Packaging Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DANGER ORDER DELETION MODAL WITH DELETE TYPE & REASON */}
      {orderToDelete && (
        <div className="admin-modal-overlay" onClick={() => !deleteLoading && setOrderToDelete(null)}>
          <div className="admin-delete-modal-box" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="admin-modal-close"
              disabled={deleteLoading}
              onClick={() => setOrderToDelete(null)}
              aria-label="Cancel deletion"
            >
              <X size={16} />
            </button>

            {/* Header Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="delete-header-pill">
                <AlertTriangle size={13} /> Danger Action
              </span>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991B1B', margin: '6px 0 2px 0' }}>
              Delete Order {orderToDelete.orderNumber}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 12px 0' }}>
              Permanent deletion removes this order from the database and dispatch engine.
            </p>

            {/* Visual Warning Summary Box */}
            <div className="delete-summary-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{orderToDelete.customer.name}</strong>
                <span style={{ fontWeight: 800, color: '#DC2626', fontSize: '1rem' }}>
                  ₹{orderToDelete.total.toLocaleString('en-IN')}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0' }}>
                📱 {orderToDelete.customer.phone} · 📍 {orderToDelete.customer.city}, {orderToDelete.customer.pincode}
              </p>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '3px 0 0 0' }}>
                📦 {orderToDelete.items.reduce((s, i) => s + i.qty, 0)} item(s) · Current Status: <strong>{orderToDelete.orderStatus}</strong>
              </p>
            </div>

            {/* Delete Type Selection */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '5px' }}>
                Select Delete Type / Reason: <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={deleteType}
                onChange={e => setDeleteType(e.target.value)}
                className="delete-reason-select"
              >
                <option value="Customer Cancellation">🛑 Customer Cancelled (Changed mind / Requested refund)</option>
                <option value="Fake / Bot COD Order">🚫 Fake / Fraud COD (Unreachable phone / Suspicious bot)</option>
                <option value="Duplicate / Test Order">🔁 Duplicate / Test Order (Placed twice or dev testing)</option>
                <option value="Payment Failed / Expired">💳 Payment Failed / Abandoned (Incomplete checkout)</option>
                <option value="Out of Stock / Unfulfillable">📦 Out of Stock / Unfulfillable (Crafting delay)</option>
                <option value="Permanent Record Wipe">🗑️ Permanent Record Wipe (Hard removal from database)</option>
              </select>
            </div>

            {/* Additional Internal Notes */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '5px' }}>
                Additional Reason / Audit Notes (Optional):
              </label>
              <input
                type="text"
                value={deleteReasonNotes}
                onChange={e => setDeleteReasonNotes(e.target.value)}
                placeholder="e.g. Customer requested cancellation via WhatsApp call"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#FFFFFF'
                }}
              />
            </div>

            {/* Type to Confirm Safety Check */}
            <div style={{ marginBottom: '18px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                To confirm deletion, please type <strong style={{ color: '#DC2626' }}>DELETE</strong> in all caps:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={e => setDeleteConfirmInput(e.target.value)}
                  placeholder="Type DELETE"
                  className={`delete-input-confirm ${deleteConfirmInput.trim().toUpperCase() === 'DELETE' ? 'valid' : ''}`}
                />
                {deleteConfirmInput.trim().toUpperCase() === 'DELETE' && (
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', fontWeight: 700 }}>
                    <CheckCircle2 size={16} /> Verified
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setOrderToDelete(null)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteLoading || deleteConfirmInput.trim().toUpperCase() !== 'DELETE'}
                onClick={handleConfirmDelete}
                className="btn-confirm-delete-danger"
              >
                <Trash2 size={14} />
                {deleteLoading ? 'Deleting Order...' : 'Confirm & Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

