'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  CheckCircle2,
  ArrowUpDown,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { printPackagingSlip } from '@/lib/packagingSlip';

function AdminOrdersPageContent() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'orders';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Date Filtering & Sorting State (Today, Yesterday, Last 7 Days, All)
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK'>('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC'>('DATE_DESC');

  // In-Row Shiprocket Direct Assign Loading Tracker
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  // More Actions Dropdown State
  const [activeDropdownOrderId, setActiveDropdownOrderId] = useState<string | null>(null);

  // Modal Drawer State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
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

    const closeDropdown = () => setActiveDropdownOrderId(null);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  const handleQuickStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders(prev => prev.map(o => (o.id === data.order.id ? data.order : o)));
        if (selectedOrder && selectedOrder.id === data.order.id) {
          setSelectedOrder(data.order);
        }
        setFeedbackMsg(`Order #${data.order.orderNumber} status changed to ${status}`);
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err: any) {
      alert(`Failed to change status: ${err.message}`);
    }
  };

  // 1-Click In-Row Assign to Shiprocket
  const handleAssignToShiprocket = async (orderId: string) => {
    setAssigningOrderId(orderId);
    try {
      const res = await fetch('/api/shipping/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders(prev => prev.map(o => (o.id === data.order.id ? data.order : o)));
        if (selectedOrder && selectedOrder.id === data.order.id) {
          setSelectedOrder(data.order);
        }
        setFeedbackMsg(`Order ${data.order.orderNumber} assigned to Shiprocket! AWB: ${data.order.awbCode} (${data.order.courierName})`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        alert(`Shiprocket assign failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setAssigningOrderId(null);
    }
  };

  // Dynamic Date Counts
  const dateCounts = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysStart = now.getTime() - 7 * 86400000;

    let today = 0;
    let yesterday = 0;
    let week = 0;

    orders.forEach(o => {
      const t = new Date(o.createdAt).getTime();
      if (t >= todayStart) today++;
      if (t >= yesterdayStart && t < todayStart) yesterday++;
      if (t >= sevenDaysStart) week++;
    });

    return {
      ALL: orders.length,
      TODAY: today,
      YESTERDAY: yesterday,
      WEEK: week
    };
  }, [orders]);

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

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysStart = now.getTime() - 7 * 86400000;

    const list = orders.filter(order => {
      // If Shiprocket tab is selected from sidebar, show shipped / pending shiprocket orders
      if (currentView === 'shiprocket') {
        if (order.orderStatus === 'Cancelled') return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && order.orderStatus.toUpperCase() !== selectedStatus) {
        return false;
      }

      // Date filter (Today, Yesterday, Last 7 Days)
      const t = new Date(order.createdAt).getTime();
      if (dateFilter === 'TODAY' && t < todayStart) return false;
      if (dateFilter === 'YESTERDAY' && (t < yesterdayStart || t >= todayStart)) return false;
      if (dateFilter === 'WEEK' && t < sevenDaysStart) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customer.name.toLowerCase().includes(q) ||
        order.customer.phone.includes(q) ||
        order.customer.city.toLowerCase().includes(q) ||
        (order.awbCode && order.awbCode.toLowerCase().includes(q)) ||
        (order.courierName && order.courierName.toLowerCase().includes(q))
      );
    });

    // Sort order
    return [...list].sort((a, b) => {
      if (sortBy === 'DATE_DESC') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [orders, selectedStatus, dateFilter, sortBy, searchQuery, currentView]);

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
          <h1 className="admin-page-title">
            {currentView === 'shiprocket' ? 'Shiprocket Orders' : 'Orders & Dispatch Engine'}
          </h1>
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

      {/* KEY METRICS BAR */}
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
            <div className="stat-label">Pending Orders</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <Truck size={18} />
          </div>
          <div>
            <div className="stat-value">{metrics.dispatchedOrders}</div>
            <div className="stat-label">Shipped via Shiprocket</div>
          </div>
        </div>
      </div>

      {/* SEARCH & STATUS TABS */}
      <div className="admin-controls-card">
        <div className="admin-search-wrapper">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search Order #, customer, phone, city, AWB, courier..."
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

      {/* DATE FILTERING & SORTING BAR (Today, Yesterday, Last 7 Days, All + Sort) */}
      <div className="admin-date-filter-bar">
        <div className="date-pills-wrap">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
            <Calendar size={13} /> Date:
          </span>

          <button
            type="button"
            className={`date-pill-btn ${dateFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setDateFilter('ALL')}
          >
            All Dates
            <span className="date-pill-count">{dateCounts.ALL}</span>
          </button>

          <button
            type="button"
            className={`date-pill-btn ${dateFilter === 'TODAY' ? 'active' : ''}`}
            onClick={() => setDateFilter('TODAY')}
          >
            ⚡ Today
            <span className="date-pill-count">{dateCounts.TODAY}</span>
          </button>

          <button
            type="button"
            className={`date-pill-btn ${dateFilter === 'YESTERDAY' ? 'active' : ''}`}
            onClick={() => setDateFilter('YESTERDAY')}
          >
            ⏳ Yesterday
            <span className="date-pill-count">{dateCounts.YESTERDAY}</span>
          </button>

          <button
            type="button"
            className={`date-pill-btn ${dateFilter === 'WEEK' ? 'active' : ''}`}
            onClick={() => setDateFilter('WEEK')}
          >
            Last 7 Days
            <span className="date-pill-count">{dateCounts.WEEK}</span>
          </button>
        </div>

        {/* Sort Selector */}
        <div className="admin-sort-wrap">
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpDown size={12} /> Sort:
          </label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="admin-sort-select"
          >
            <option value="DATE_DESC">Newest First</option>
            <option value="DATE_ASC">Oldest First</option>
          </select>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {feedbackMsg && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: 600,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* DESKTOP ORDERS TABLE */}
      <div className="admin-table-container">
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th style={{ width: '13%' }}>ORDER &amp; DATE</th>
              <th style={{ width: '25%' }}>CLIENT INFORMATION</th>
              <th style={{ width: '13%' }}>PRODUCT / ITEMS</th>
              <th style={{ width: '8%' }}>AMOUNT</th>
              <th style={{ width: '9%' }}>PAYMENT</th>
              <th style={{ width: '9%' }}>STATUS</th>
              <th style={{ width: '12%' }}>SHIPROCKET COURIER</th>
              <th style={{ width: '11%', textAlign: 'right' }}>ACTIONS</th>
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
                const isAssigningThis = assigningOrderId === order.id;

                return (
                  <tr key={order.id} className={`row-status-${statusClass}`}>
                    {/* COMBINED ORDER ID & DATE (2-LINE DOUBLE ROW FIT) */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <strong
                          style={{
                            color: '#2563EB',
                            cursor: 'pointer',
                            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                            fontSize: '0.82rem',
                            fontWeight: 800
                          }}
                          onClick={() => openOrderModal(order)}
                          title="Click to view complete order"
                        >
                          {order.orderNumber}
                        </strong>
                        <span style={{ color: '#64748B', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
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
                        <span className="client-city">{order.customer.city}</span>
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

                    {/* MOVE TO SHIPROCKET / AWB TRACKING */}
                    <td>
                      {order.awbCode ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <a
                            href={order.trackingUrl || `https://shiprocket.co/tracking/${order.awbCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="courier-badge"
                            title={`Track in Shiprocket: ${order.awbCode}`}
                          >
                            <Truck size={10} /> {order.courierName || 'Shiprocket'}: ...{order.awbCode.slice(-7)}
                          </a>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-assign-shiprocket"
                          disabled={isAssigningThis}
                          onClick={() => handleAssignToShiprocket(order.id)}
                          title="Move to Shiprocket immediately"
                        >
                          <Truck size={11} className={isAssigningThis ? 'animate-spin' : ''} />
                          {isAssigningThis ? 'Moving...' : 'Move to Shiprocket'}
                        </button>
                      )}
                    </td>

                    {/* ACTIONS (NEVER CUT OFF + MORE DROPDOWN) */}
                    <td style={{ textAlign: 'right', overflow: 'visible', position: 'relative' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => openOrderModal(order)}
                          className="btn-action-view"
                          title="Inspect Order Details"
                        >
                          <Eye size={12} />
                        </button>

                        <button
                          type="button"
                          onClick={() => printPackagingSlip(order)}
                          className="btn-action-view"
                          title="Print Packaging Slip & Tax Invoice"
                          style={{ color: '#0077C8' }}
                        >
                          <Printer size={12} />
                        </button>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-action-wa"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare size={12} />
                        </a>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(order)}
                          className="btn-action-delete"
                          title="Delete Order"
                        >
                          <Trash2 size={12} />
                        </button>

                        {/* MORE OPTIONS & STATUS CHANGER */}
                        <div style={{ position: 'relative' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownOrderId(prev => prev === order.id ? null : order.id);
                            }}
                            className="btn-action-more"
                            title="More Actions & Change Status"
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          {activeDropdownOrderId === order.id && (
                            <div
                              className="admin-actions-dropdown-menu"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="admin-dropdown-item"
                                onClick={() => {
                                  setActiveDropdownOrderId(null);
                                  openOrderModal(order);
                                }}
                              >
                                <Eye size={13} color="#2563EB" />
                                <span>View Full Details</span>
                              </button>

                              {!order.awbCode && (
                                <button
                                  type="button"
                                  className="admin-dropdown-item"
                                  onClick={() => {
                                    setActiveDropdownOrderId(null);
                                    handleAssignToShiprocket(order.id);
                                  }}
                                >
                                  <Truck size={13} color="#4F46E5" />
                                  <span>Move to Shiprocket</span>
                                </button>
                              )}

                              <div style={{ borderTop: '1px solid #F1F5F9', margin: '3px 0' }} />

                              <div style={{ padding: '3px 10px 1px', fontSize: '0.64rem', color: '#94A3B8', fontWeight: 800 }}>
                                CHANGE STATUS
                              </div>

                              {(['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  className="admin-dropdown-item"
                                  style={{
                                    paddingLeft: '16px',
                                    fontWeight: order.orderStatus === st ? 800 : 500,
                                    color: order.orderStatus === st ? '#2563EB' : '#475569'
                                  }}
                                  onClick={() => {
                                    setActiveDropdownOrderId(null);
                                    handleQuickStatusChange(order.id, st);
                                  }}
                                >
                                  <span>{order.orderStatus === st ? '✓ ' : '• '}{st}</span>
                                </button>
                              ))}

                              <div style={{ borderTop: '1px solid #F1F5F9', margin: '3px 0' }} />

                              <button
                                type="button"
                                className="admin-dropdown-item"
                                onClick={() => {
                                  setActiveDropdownOrderId(null);
                                  printPackagingSlip(order);
                                }}
                              >
                                <Printer size={13} color="#0077C8" />
                                <span>Print Packaging Slip</span>
                              </button>

                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-dropdown-item"
                                onClick={() => setActiveDropdownOrderId(null)}
                              >
                                <MessageSquare size={13} color="#15803D" />
                                <span>WhatsApp Customer</span>
                              </a>

                              <button
                                type="button"
                                className="admin-dropdown-item danger"
                                onClick={() => {
                                  setActiveDropdownOrderId(null);
                                  openDeleteModal(order);
                                }}
                              >
                                <Trash2 size={13} />
                                <span>Delete Order Record</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                  No orders match the current filter or search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE RESPONSIVE CARDS VIEW */}
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
            const isAssigningThis = assigningOrderId === order.id;

            return (
              <div key={order.id} className={`mobile-order-card card-status-${statusClass}`}>
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

                <div className="mobile-card-details">
                  <span>
                    📦 {order.items.reduce((s, i) => s + i.qty, 0)} item(s) · {order.items[0]?.name.slice(0, 20)}...
                  </span>
                  <span className={`payment-pill ${paymentClass}`}>
                    {order.paymentStatus} ({order.paymentMethod})
                  </span>
                </div>

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
                      className="btn-assign-shiprocket"
                      style={{ flex: 1, justifyContent: 'center', padding: '6px' }}
                      disabled={isAssigningThis}
                      onClick={() => handleAssignToShiprocket(order.id)}
                    >
                      <Truck size={12} className={isAssigningThis ? 'animate-spin' : ''} />
                      {isAssigningThis ? 'Assigning...' : 'Assign to Shiprocket'}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                Order {selectedOrder.orderNumber}
              </h2>
              <span className={`status-pill ${selectedOrder.orderStatus.toLowerCase()}`}>
                <span className="status-dot"></span>
                {selectedOrder.orderStatus}
              </span>
            </div>

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

              {!selectedOrder.awbCode && (
                <button
                  type="button"
                  disabled={assigningOrderId === selectedOrder.id}
                  onClick={() => handleAssignToShiprocket(selectedOrder.id)}
                  className="btn-assign-shiprocket"
                  style={{ padding: '6px 12px' }}
                >
                  <Truck size={13} className={assigningOrderId === selectedOrder.id ? 'animate-spin' : ''} />
                  {assigningOrderId === selectedOrder.id ? 'Assigning...' : 'Assign to Shiprocket'}
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

      {/* DANGER ORDER DELETION MODAL */}
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

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#991B1B', marginBottom: '5px' }}>
                Type &quot;DELETE&quot; to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={e => setDeleteConfirmInput(e.target.value)}
                placeholder="DELETE"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #FCA5A5',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#991B1B',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#FEF2F2',
                  textTransform: 'uppercase'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setOrderToDelete(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  color: '#475569',
                  fontSize: '0.8rem',
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
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: deleteConfirmInput.trim().toUpperCase() === 'DELETE' ? '#DC2626' : '#FCA5A5',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: deleteConfirmInput.trim().toUpperCase() === 'DELETE' ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Trash2 size={13} />
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #4F46E5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      }
    >
      <AdminOrdersPageContent />
    </Suspense>
  );
}
