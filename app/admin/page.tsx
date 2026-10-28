'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Order, OrderStatus } from '@/lib/db';
import { HOPEKRAFT_PRODUCTS } from '@/lib/products';
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
  Calendar,
  Flame,
  Zap,
  ArrowRightLeft,
  FileSpreadsheet,
  RotateCcw,
  Check,
  PlusCircle
} from 'lucide-react';
import { printPackagingSlip } from '@/lib/packagingSlip';

function AdminOrdersPageContent() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'orders';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');

  // Date Filtering State
  const [datePreset, setDatePreset] = useState<string>('ALL');
  const [specificDate, setSpecificDate] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC'>('DATE_DESC');

  // In-Row Shiprocket Action Loader
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  // Modal 1: View Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Modal 2: Change Product & Custom Pricing Modal
  const [orderToChange, setOrderToChange] = useState<Order | null>(null);
  const [changeProductId, setChangeProductId] = useState<string>('easel');
  const [changeQty, setChangeQty] = useState<number>(1);
  const [changeUnitPrice, setChangeUnitPrice] = useState<number>(999);
  const [changeDeliveryFee, setChangeDeliveryFee] = useState<number>(0);
  const [changeDiscount, setChangeDiscount] = useState<number>(0);
  const [changeNotes, setChangeNotes] = useState<string>('');
  const [changeLoading, setChangeLoading] = useState<boolean>(false);

  // Modal 3: Order Deletion Modal
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleteType, setDeleteType] = useState<string>('Customer Cancellation');
  const [deleteReasonNotes, setDeleteReasonNotes] = useState<string>('');
  const [deleteConfirmInput, setDeleteConfirmInput] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // User Feedback Toast
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Fetch orders from API
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
        setOrders(data.orders || []);
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

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
  };

  // WhatsApp helper
  const handleWhatsAppCustomer = (order: Order) => {
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const itemsText = order.items.map(i => `${i.name} (Qty: ${i.qty})`).join(', ');
    const message = encodeURIComponent(
      `Hello ${order.customer.name},\n\nYour HOPEKRAFT order #${order.orderNumber} for:\n*${itemsText}*\nTotal: Rs. ${order.total} (${order.paymentMethod.toUpperCase()})\n\nStatus: ${order.orderStatus}\nDelivery Address: ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}\n${
        order.awbCode ? `Tracking AWB: ${order.awbCode} (${order.courierName})` : 'We are preparing your shipment.'
      }\n\nThank you for choosing HOPEKRAFT!`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
  };

  // 1-Click Shiprocket Assign
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

  // Mark Delivered (Settlement)
  const handleMarkDelivered = async (order: Order) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: 'Delivered',
          shippingStatus: 'delivered',
          paymentStatus: 'paid'
        })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders(prev => prev.map(o => (o.id === data.order.id ? data.order : o)));
        if (selectedOrder && selectedOrder.id === data.order.id) {
          setSelectedOrder(data.order);
        }
        setFeedbackMsg(`Order ${order.orderNumber} marked as Delivered & Settled!`);
        setTimeout(() => setFeedbackMsg(null), 3500);
      }
    } catch (err: any) {
      alert(`Settlement failed: ${err.message}`);
    }
  };

  // Cancel Order
  const handleCancelOrder = async (order: Order) => {
    if (!confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)) return;
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: 'Cancelled',
          shippingStatus: 'cancelled'
        })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders(prev => prev.map(o => (o.id === data.order.id ? data.order : o)));
        if (selectedOrder && selectedOrder.id === data.order.id) {
          setSelectedOrder(data.order);
        }
        setFeedbackMsg(`Order ${order.orderNumber} marked as Cancelled.`);
        setTimeout(() => setFeedbackMsg(null), 3500);
      }
    } catch (err: any) {
      alert(`Cancellation failed: ${err.message}`);
    }
  };

  // Open Change Product Modal
  const openChangeModal = (order: Order) => {
    setOrderToChange(order);
    const firstItem = order.items && order.items[0];
    const initialProdId = (firstItem && firstItem.id) || 'easel';
    setChangeProductId(initialProdId);
    setChangeQty(firstItem ? firstItem.qty : 1);
    setChangeUnitPrice(firstItem ? firstItem.price : 999);
    setChangeDeliveryFee(order.shipping || 0);
    setChangeDiscount(order.discount || 0);
    setChangeNotes(order.notes || '');
  };

  const handleProductSelectionChange = (prodId: string) => {
    setChangeProductId(prodId);
    const prod = HOPEKRAFT_PRODUCTS[prodId];
    if (prod) {
      setChangeUnitPrice(prod.price);
    }
  };

  const changeSubtotal = changeQty * changeUnitPrice;
  const changeFinalTotal = Math.max(0, changeSubtotal + changeDeliveryFee - changeDiscount);

  const handleSaveChangedOrder = async () => {
    if (!orderToChange) return;
    setChangeLoading(true);
    try {
      const selectedProd = HOPEKRAFT_PRODUCTS[changeProductId] || {
        id: changeProductId,
        name: 'Custom Product',
        image: '/assets/images/product_easel_hd.jpg'
      };

      const updatedItem = {
        id: selectedProd.id,
        name: selectedProd.name,
        price: changeUnitPrice,
        qty: changeQty,
        image: selectedProd.image
      };

      const patchPayload = {
        items: [updatedItem],
        subtotal: changeSubtotal,
        shipping: changeDeliveryFee,
        discount: changeDiscount,
        total: changeFinalTotal,
        notes: changeNotes
      };

      const res = await fetch(`/api/orders/${orderToChange.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchPayload)
      });

      const data = await res.json();
      if (res.ok && data.order) {
        setOrders(prev => prev.map(o => (o.id === data.order.id ? data.order : o)));
        if (selectedOrder && selectedOrder.id === data.order.id) {
          setSelectedOrder(data.order);
        }
        setFeedbackMsg(`Order ${data.order.orderNumber} successfully updated with new product & pricing!`);
        setTimeout(() => setFeedbackMsg(null), 4000);
        setOrderToChange(null);
      } else {
        alert(`Update failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      alert(`Error updating order: ${err.message}`);
    } finally {
      setChangeLoading(false);
    }
  };

  // Open Delete Modal
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
        setFeedbackMsg(`Order ${orderToDelete.orderNumber} permanently deleted.`);
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

  // Fast Test Order Creation
  const handleCreateTestOrder = async () => {
    try {
      const randomPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: 'Arsalan Ramzan',
            phone: randomPhone,
            email: 'arsalan@example.com',
            address: 'Main Market Road, Near City Center',
            city: 'Malegaon',
            state: 'Maharashtra',
            pincode: '423203'
          },
          items: [{ id: 'easel', qty: 1 }],
          paymentMethod: 'cod'
        })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders(prev => [data.order, ...prev]);
        setFeedbackMsg(`New Test Order #${data.order.orderNumber} created in Firebase!`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err: any) {
      alert(`Failed to create test order: ${err.message}`);
    }
  };

  // Clear Database
  const handleClearAllOrders = async () => {
    if (!confirm('CAUTION: Are you sure you want to permanently clear ALL orders from Firebase Realtime Database?')) return;
    try {
      const res = await fetch('/api/orders', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders([]);
        setSelectedOrder(null);
        setOrderToChange(null);
        setFeedbackMsg('All orders cleared! Database is completely empty.');
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        alert('Could not clear orders: ' + (data.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Error clearing orders: ' + err.message);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No orders to export!');
      return;
    }
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'Address',
      'City',
      'Pincode',
      'Items',
      'Total Amount',
      'Payment Method',
      'Order Status',
      'Courier',
      'AWB Code'
    ];
    const rows = filteredOrders.map(o => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleString('en-IN')}"`,
      `"${o.customer.name.replace(/"/g, '""')}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.address.replace(/"/g, '""')}"`,
      `"${o.customer.city}"`,
      `"${o.customer.pincode}"`,
      `"${o.items.map(i => `${i.name} (x${i.qty})`).join('; ')}"`,
      o.total,
      `"${o.paymentMethod}"`,
      `"${o.orderStatus}"`,
      `"${o.courierName || ''}"`,
      `"${o.awbCode || ''}"`
    ]);
    const csvString = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HOPEKRAFT_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Excel
  const handleExportExcel = () => {
    if (orders.length === 0) {
      alert('No orders to export!');
      return;
    }
    const headers = ['Order Number', 'Date', 'Customer', 'Phone', 'City', 'Total', 'Payment', 'Status', 'Courier', 'AWB'];
    const rows = filteredOrders.map(o => `
      <tr>
        <td>${o.orderNumber}</td>
        <td>${new Date(o.createdAt).toLocaleString('en-IN')}</td>
        <td>${o.customer.name}</td>
        <td>${o.customer.phone}</td>
        <td>${o.customer.city}</td>
        <td>${o.total}</td>
        <td>${o.paymentMethod.toUpperCase()}</td>
        <td>${o.orderStatus}</td>
        <td>${o.courierName || 'Unfulfilled'}</td>
        <td>${o.awbCode || ''}</td>
      </tr>
    `).join('');

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"/></head>
        <body>
          <table border="1">
            <thead><tr style="background:#15803D;color:#FFF;">${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HOPEKRAFT_Orders_Report_${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const dayBeforeStart = todayStart - 86400000 * 2;
    const sevenDaysStart = now.getTime() - 7 * 86400000;
    const thirtyDaysStart = now.getTime() - 30 * 86400000;
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return orders.filter(order => {
      const orderTime = new Date(order.createdAt).getTime();

      if (selectedStatus !== 'ALL' && order.orderStatus.toUpperCase() !== selectedStatus.toUpperCase()) {
        return false;
      }

      if (selectedPaymentMethod !== 'ALL') {
        const pm = order.paymentMethod.toLowerCase();
        if (selectedPaymentMethod === 'COD' && pm !== 'cod') return false;
        if (selectedPaymentMethod === 'ONLINE' && pm !== 'razorpay' && pm !== 'online' && pm !== 'card') return false;
        if (selectedPaymentMethod === 'UPI' && pm !== 'upi') return false;
      }

      if (specificDate) {
        const orderDateStr = new Date(order.createdAt).toISOString().slice(0, 10);
        if (orderDateStr !== specificDate) return false;
      } else if (dateFrom || dateTo) {
        const fromTime = dateFrom ? new Date(dateFrom).getTime() : 0;
        const toTime = dateTo ? new Date(dateTo + 'T23:59:59.999Z').getTime() : Infinity;
        if (orderTime < fromTime || orderTime > toTime) return false;
      } else {
        if (datePreset === 'TODAY' && orderTime < todayStart) return false;
        if (datePreset === 'YESTERDAY' && (orderTime < yesterdayStart || orderTime >= todayStart)) return false;
        if (datePreset === 'DAY_BEFORE' && (orderTime < dayBeforeStart || orderTime >= yesterdayStart)) return false;
        if (datePreset === 'LAST_7_DAYS' && orderTime < sevenDaysStart) return false;
        if (datePreset === 'THIS_MONTH' && orderTime < thisMonthStart) return false;
        if (datePreset === 'LAST_30_DAYS' && orderTime < thirtyDaysStart) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = (order.id && order.id.toLowerCase().includes(q)) || (order.orderNumber && order.orderNumber.toLowerCase().includes(q));
        const matchesName = order.customer?.name && order.customer.name.toLowerCase().includes(q);
        const matchesPhone = order.customer?.phone && order.customer.phone.includes(q);
        const matchesCity = order.customer?.city && order.customer.city.toLowerCase().includes(q);
        const matchesAwb = order.awbCode && order.awbCode.toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesPhone && !matchesCity && !matchesAwb) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'DATE_DESC') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [orders, selectedStatus, selectedPaymentMethod, datePreset, specificDate, dateFrom, dateTo, searchQuery, sortBy]);

  // Metrics
  const metrics = useMemo(() => {
    const list = filteredOrders;
    const totalBooked = list.length;
    const totalUnits = list.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + (i.qty || 1), 0) || 1), 0);
    const grossBooked = list.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + (o.total || 0), 0);
    const aov = totalBooked > 0 ? Math.round(grossBooked / totalBooked) : 0;

    const deliveredOrders = list.filter(o => o.orderStatus === 'Delivered');
    const deliveredTotal = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const onlineOrders = list.filter(o => o.paymentMethod === 'razorpay' || (o.paymentMethod as string) === 'online' || o.paymentMethod === 'card' || o.paymentMethod === 'upi');
    const onlineTotal = onlineOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const codOrders = list.filter(o => o.paymentMethod === 'cod');
    const codTotal = codOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const inTransitCount = list.filter(o => o.shippingStatus === 'in_transit' || o.shippingStatus === 'picked_up' || o.shippingStatus === 'manifested').length;
    const cancelledCount = list.filter(o => o.orderStatus === 'Cancelled').length;

    return {
      totalBooked,
      totalUnits,
      grossBooked,
      aov,
      deliveredTotal,
      deliveredCount: deliveredOrders.length,
      onlineTotal,
      onlineCount: onlineOrders.length,
      codTotal,
      codCount: codOrders.length,
      inTransitCount,
      cancelledCount
    };
  }, [filteredOrders]);

  const handleResetFilters = () => {
    setDatePreset('ALL');
    setSpecificDate('');
    setDateFrom('');
    setDateTo('');
    setSelectedStatus('ALL');
    setSelectedPaymentMethod('ALL');
    setSearchQuery('');
  };

  return (
    <>
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 10000, background: '#059669', color: '#FFF', padding: '10px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="admin-page-header">
        <div className="admin-header-title-wrap">
          <h1 className="admin-page-title">
            Orders & Realtime Analytics
          </h1>
          <span className="admin-live-badge">
            <span className="pulse-dot"></span>
            Live ({filteredOrders.length} showing)
          </span>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="admin-header-actions">
          <button type="button" onClick={handleExportExcel} className="btn-export-excel" title="Download Excel Worksheet">
            <FileSpreadsheet size={13} />
            <span>Export Excel</span>
          </button>

          <button type="button" onClick={handleExportCSV} className="btn-export-csv" title="Download CSV">
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button type="button" onClick={() => window.print()} className="btn-export-pdf" title="Print/PDF report">
            <Printer size={13} />
            <span>Export PDF</span>
          </button>

          <button type="button" onClick={handleCreateTestOrder} className="btn-header-action" style={{ background: '#FAF5FF', borderColor: '#D8B4FE', color: '#7E22CE' }} title="Generate 1 Live Test Order in Firebase">
            <PlusCircle size={13} />
            <span>+ Test Order</span>
          </button>

          {orders.length > 0 && (
            <button type="button" onClick={handleClearAllOrders} className="btn-header-action" style={{ background: '#FFF1F2', borderColor: '#FECDD3', color: '#E11D48' }} title="Clear All Orders from Database">
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
          )}

          <button type="button" onClick={loadOrders} className="btn-header-action" title="Refresh from Database">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. DATE PRESET & CUSTOM RANGE TOOLBAR */}
      <div className="admin-date-toolbar">
        <div className="date-preset-group">
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', marginRight: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} /> Date:
          </span>

          {[
            { id: 'ALL', label: 'All Time' },
            { id: 'TODAY', label: 'Today' },
            { id: 'YESTERDAY', label: 'Yesterday' },
            { id: 'DAY_BEFORE', label: 'Day Before Yesterday' },
            { id: 'LAST_7_DAYS', label: 'Last 7 Days' },
            { id: 'THIS_MONTH', label: 'This Month' },
            { id: 'LAST_30_DAYS', label: 'Last 30 Days' }
          ].map(p => {
            const isActive = datePreset === p.id && !specificDate && !dateFrom && !dateTo;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setDatePreset(p.id);
                  setSpecificDate('');
                  setDateFrom('');
                  setDateTo('');
                }}
                className={`btn-date-preset ${isActive ? 'active' : ''}`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <div className="date-custom-pickers">
          <div className="date-picker-box">
            <span>Specific:</span>
            <input
              type="date"
              value={specificDate}
              onChange={e => {
                setSpecificDate(e.target.value);
                setDatePreset('');
                setDateFrom('');
                setDateTo('');
              }}
            />
          </div>

          <div className="date-picker-box">
            <span>From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => {
                setDateFrom(e.target.value);
                setSpecificDate('');
                setDatePreset('');
              }}
            />
            <span>To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => {
                setDateTo(e.target.value);
                setSpecificDate('');
                setDatePreset('');
              }}
            />
          </div>

          {(specificDate || dateFrom || dateTo || datePreset !== 'ALL') && (
            <button type="button" onClick={handleResetFilters} className="btn-date-reset" title="Reset date filters">
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. 6 REALTIME ANALYTICS METRIC CARDS */}
      <div className="admin-metrics-grid-6">
        {/* Card 1: Total Booked */}
        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
            <Package size={18} />
          </div>
          <div>
            <div className="stat-label">Total Booked</div>
            <div className="stat-value">{metrics.totalBooked}</div>
            <div className="stat-subtext">{metrics.totalUnits} unit{metrics.totalUnits !== 1 ? 's' : ''} sold</div>
          </div>
        </div>

        {/* Card 2: Gross Booked */}
        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="stat-label">Gross Booked</div>
            <div className="stat-value" style={{ color: '#2563EB' }}>₹{metrics.grossBooked.toLocaleString('en-IN')}</div>
            <div className="stat-subtext">AOV: ₹{metrics.aov.toLocaleString('en-IN')} / order</div>
          </div>
        </div>

        {/* Card 3: Delivered Total [REALIZED] */}
        <div className="admin-stat-card stat-card-realized">
          <div className="stat-icon-wrap" style={{ background: '#DCFCE7', color: '#059669' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="stat-label" style={{ color: '#065F46' }}>Delivered Total</span>
              <span className="stat-realized-badge">REALIZED</span>
            </div>
            <div className="stat-value" style={{ color: '#059669' }}>₹{metrics.deliveredTotal.toLocaleString('en-IN')}</div>
            <div className="stat-subtext" style={{ color: '#047857' }}>{metrics.deliveredCount} Orders Delivered</div>
          </div>
        </div>

        {/* Card 4: Paid Online */}
        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: '#FFFBEB', color: '#D97706' }}>
            <Zap size={18} />
          </div>
          <div>
            <div className="stat-label">Paid Online</div>
            <div className="stat-value">₹{metrics.onlineTotal.toLocaleString('en-IN')}</div>
            <div className="stat-subtext">{metrics.onlineCount} Orders</div>
          </div>
        </div>

        {/* Card 5: COD Expected */}
        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: '#FFF7ED', color: '#EA580C' }}>
            <Flame size={18} />
          </div>
          <div>
            <div className="stat-label">COD Expected</div>
            <div className="stat-value" style={{ color: '#EA580C' }}>₹{metrics.codTotal.toLocaleString('en-IN')}</div>
            <div className="stat-subtext">{metrics.codCount} Orders</div>
          </div>
        </div>

        {/* Card 6: Fulfillment */}
        <div className="admin-stat-card">
          <div className="stat-icon-wrap" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <Truck size={18} />
          </div>
          <div>
            <div className="stat-label">Fulfillment</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: '#EEF2FF', color: '#4338CA' }}>
                {metrics.inTransitCount} In-Transit
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: '#FEE2E2', color: '#991B1B' }}>
                {metrics.cancelledCount} Cancelled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SEARCH & STATUS FILTER CONTROLS */}
      <div className="admin-controls-card">
        <div className="admin-search-wrapper">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by Order ID, Name, Phone, City, AWB..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.74rem', fontWeight: 700, color: '#334155', background: '#FFF' }}
          >
            <option value="ALL">All Order Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={selectedPaymentMethod}
            onChange={e => setSelectedPaymentMethod(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.74rem', fontWeight: 700, color: '#334155', background: '#FFF' }}
          >
            <option value="ALL">All Payment Methods</option>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="ONLINE">Paid Online (Razorpay)</option>
            <option value="UPI">UPI Payment</option>
          </select>

          {(searchQuery || selectedStatus !== 'ALL' || selectedPaymentMethod !== 'ALL') && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{ background: '#FFF1F2', border: '1px solid #FECDD3', color: '#E11D48', padding: '5px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* 5. ORDERS DATA TABLE */}
      <div className="admin-table-container">
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th style={{ width: '13%' }}>ORDER & DATE</th>
              <th style={{ width: '23%' }}>CLIENT INFORMATION</th>
              <th style={{ width: '17%' }}>PRODUCT / ITEMS</th>
              <th style={{ width: '9%' }}>AMOUNT</th>
              <th style={{ width: '10%' }}>PAYMENT</th>
              <th style={{ width: '11%' }}>SHIPPING / AWB</th>
              <th style={{ width: '9%', textAlign: 'center' }}>SETTLEMENT</th>
              <th style={{ width: '18%', textAlign: 'right', paddingRight: '14px' }}>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748B' }}>
                  <Package size={36} style={{ margin: '0 auto 10px auto', color: '#94A3B8' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                    No Orders Found
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>
                    {orders.length === 0
                      ? 'Database is currently empty (0 orders). Use "+ Test Order" above to generate a sample order!'
                      : 'No orders match your current search or date filter criteria.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const initialChar = (order.customer.name && order.customer.name.trim().charAt(0).toUpperCase()) || 'C';
                const isCOD = order.paymentMethod === 'cod';
                const isPaid = order.paymentStatus === 'paid';
                const firstItem = order.items && order.items[0];
                const totalUnits = order.items?.reduce((s, i) => s + (i.qty || 1), 0) || 1;

                return (
                  <tr
                    key={order.id}
                    className={`row-status-${order.orderStatus.toLowerCase()}`}
                  >
                    {/* Order & Date */}
                    <td>
                      <div
                        onClick={() => openOrderModal(order)}
                        style={{ fontWeight: 800, color: '#2563EB', cursor: 'pointer' }}
                      >
                        {order.orderNumber}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '1px' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}, {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </td>

                    {/* Client Information */}
                    <td>
                      <div className="client-oneline">
                        <span className="client-avatar">{initialChar}</span>
                        <span className="client-name" title={order.customer.name}>{order.customer.name}</span>
                        <span className="client-dot">•</span>
                        <a href={`tel:${order.customer.phone}`} className="client-phone" style={{ textDecoration: 'none' }}>
                          {order.customer.phone}
                        </a>
                        <span className="client-dot">•</span>
                        <span className="client-city" title={`${order.customer.city} (${order.customer.pincode})`}>
                          {order.customer.city}
                        </span>
                      </div>
                    </td>

                    {/* Product / Items */}
                    <td>
                      <div className="items-oneline">
                        <span title={firstItem ? firstItem.name : ''}>
                          {totalUnits > 1 ? `${totalUnits}x items` : `1x ${firstItem ? firstItem.name : 'Item'}`}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td>
                      <strong style={{ color: '#0F172A', fontSize: '0.8rem' }}>
                        ₹{order.total.toLocaleString('en-IN')}
                      </strong>
                    </td>

                    {/* Payment */}
                    <td>
                      <span className={`payment-pill ${isPaid ? 'paid' : 'pending'}`}>
                        {isCOD ? 'COD' : isPaid ? `PAID - ${order.paymentMethod.toUpperCase()}` : `PENDING`}
                      </span>
                    </td>

                    {/* Shipping / AWB */}
                    <td>
                      {order.awbCode ? (
                        <a
                          href={order.trackingUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="courier-badge"
                          title={`Track on ${order.courierName}`}
                        >
                          <Truck size={11} />
                          <span>{order.courierName || 'Shiprocket'}: {order.awbCode}</span>
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: '#D97706', fontWeight: 700 }}>
                          ● Processing Dispatch
                        </span>
                      )}
                    </td>

                    {/* Settlement */}
                    <td style={{ textAlign: 'center' }}>
                      {order.orderStatus === 'Delivered' ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', background: '#DCFCE7', padding: '3px 8px', borderRadius: '4px' }}>
                          ✓ Settled
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMarkDelivered(order)}
                          className="btn-row-settle"
                          title="Mark order as Delivered & Settled"
                        >
                          <Check size={11} style={{ color: '#059669' }} />
                          <span>Mark Delivered</span>
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="td-actions">
                      <div className="actions-btn-group">
                        {/* WhatsApp Customer */}
                        <button
                          type="button"
                          onClick={() => handleWhatsAppCustomer(order)}
                          className="btn-row-action whatsapp"
                          title="WhatsApp Customer"
                        >
                          <MessageSquare size={12} />
                          <span>WhatsApp</span>
                        </button>

                        {/* Shiprocket Dispatch */}
                        <button
                          type="button"
                          onClick={() => handleAssignToShiprocket(order.id)}
                          disabled={assigningOrderId === order.id || !!order.awbCode}
                          className="btn-row-action shiprocket"
                          title={order.awbCode ? 'Pushed to Shiprocket' : 'Push to Shiprocket'}
                        >
                          <Truck size={12} />
                          <span>Shiprocket</span>
                        </button>

                        {/* Change Product / Custom Pricing */}
                        <button
                          type="button"
                          onClick={() => openChangeModal(order)}
                          className="btn-row-action change"
                          title="Change Product & Custom Pricing"
                        >
                          <ArrowRightLeft size={12} />
                          <span>Change</span>
                        </button>

                        {/* View Order Modal */}
                        <button
                          type="button"
                          onClick={() => openOrderModal(order)}
                          className="btn-row-action view"
                          title="View order details"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>

                        {/* Cancel Order */}
                        {order.orderStatus !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order)}
                            className="btn-row-action cancel"
                            title="Cancel order"
                          >
                            Cancel
                          </button>
                        )}

                        {/* Delete Order */}
                        <button
                          type="button"
                          onClick={() => openDeleteModal(order)}
                          className="btn-row-action delete"
                          title="Delete Order"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW ORDER DETAILS (Image 4)                                     */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="pro-modal-overlay">
          <div className="pro-modal-box">
            {/* Header */}
            <div className="pro-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="pro-modal-title">Order {selectedOrder.orderNumber}</h3>
                <span className={`status-pill ${selectedOrder.orderStatus.toLowerCase()}`}>
                  <span className="status-dot"></span>
                  {selectedOrder.orderStatus}
                </span>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="pro-modal-close-btn">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="pro-modal-body">
              {/* 2-Column Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', fontSize: '0.76rem' }}>
                  <div style={{ fontWeight: 800, color: '#1E40AF', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    👤 Customer Info
                  </div>
                  <div><strong>Name:</strong> {selectedOrder.customer.name}</div>
                  <div style={{ marginTop: '2px' }}>
                    <strong>Phone:</strong> <a href={`tel:${selectedOrder.customer.phone}`} style={{ color: '#2563EB', textDecoration: 'none' }}>{selectedOrder.customer.phone}</a>
                  </div>
                  <div style={{ marginTop: '2px' }}><strong>Email:</strong> {selectedOrder.customer.email || 'N/A'}</div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', fontSize: '0.76rem' }}>
                  <div style={{ fontWeight: 800, color: '#4338CA', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📍 Shipping Address
                  </div>
                  <div>{selectedOrder.customer.address}</div>
                  <div style={{ fontWeight: 700, color: '#0F172A', marginTop: '3px' }}>
                    {selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.pincode}
                  </div>
                </div>
              </div>

              {/* Purchased Items Box */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', background: '#FFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Purchased Items
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const ord = selectedOrder;
                      setSelectedOrder(null);
                      openChangeModal(ord);
                    }}
                    style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4338CA', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ArrowRightLeft size={11} />
                    <span>Change / Swap Product</span>
                  </button>
                </div>

                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: idx > 0 ? '1px solid #F1F5F9' : 'none', fontSize: '0.76rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.name}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>SKU: HK-{item.id.toUpperCase()} • Qty: {item.qty}</div>
                    </div>
                    <strong style={{ color: '#0F172A' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}.00</strong>
                  </div>
                ))}
              </div>

              {/* Order Breakdown Box */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Items Subtotal:</span>
                  <strong>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</strong>
                </div>
                {selectedOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803D' }}>
                    <span>Discount:</span>
                    <strong>-₹{selectedOrder.discount.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Delivery:</span>
                  <strong>{selectedOrder.shipping > 0 ? `₹${selectedOrder.shipping}` : 'FREE'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '6px', marginTop: '2px', fontSize: '0.88rem' }}>
                  <strong style={{ color: '#0F172A' }}>Total Payable:</strong>
                  <strong style={{ color: '#2563EB', fontSize: '0.95rem' }}>₹{selectedOrder.total.toLocaleString('en-IN')}.00</strong>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '3px' }}>
                  Payment Method: <strong>{selectedOrder.paymentMethod.toUpperCase()}</strong> • Status: <strong>{selectedOrder.paymentStatus.toUpperCase()}</strong>
                </div>
              </div>

              {/* Shipment Box */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', fontSize: '0.74rem' }}>
                <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={13} style={{ color: '#2563EB' }} /> Shipment & Delivery Settlement
                </div>
                <div style={{ color: '#475569' }}>Status: <strong>{selectedOrder.shippingStatus}</strong></div>
                <div style={{ color: '#475569', marginTop: '2px' }}>Courier: <strong>{selectedOrder.courierName || 'Not yet dispatched'}</strong></div>
                <div style={{ color: '#475569', marginTop: '2px' }}>AWB: <strong style={{ fontFamily: 'monospace' }}>{selectedOrder.awbCode || 'Pending'}</strong></div>
                {selectedOrder.trackingUrl && (
                  <div style={{ marginTop: '4px' }}>
                    <a href={selectedOrder.trackingUrl} target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                      Open Tracking Link ↗
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="pro-modal-footer">
              <button type="button" onClick={() => setSelectedOrder(null)} className="btn-header-action">
                Close
              </button>

              <button type="button" onClick={() => handleWhatsAppCustomer(selectedOrder)} className="btn-row-action whatsapp">
                <MessageSquare size={12} />
                <span>WhatsApp Customer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const ord = selectedOrder;
                  setSelectedOrder(null);
                  openChangeModal(ord);
                }}
                className="btn-row-action change"
              >
                <ArrowRightLeft size={12} />
                <span>Change Product</span>
              </button>

              {!selectedOrder.awbCode && (
                <button
                  type="button"
                  onClick={() => handleAssignToShiprocket(selectedOrder.id)}
                  className="btn-assign-shiprocket"
                >
                  <Truck size={12} />
                  <span>Move to Shiprocket</span>
                </button>
              )}

              {selectedOrder.orderStatus !== 'Delivered' && (
                <button
                  type="button"
                  onClick={() => handleMarkDelivered(selectedOrder)}
                  className="btn-row-settle"
                >
                  <Check size={12} style={{ color: '#059669' }} />
                  <span>Mark as Delivered</span>
                </button>
              )}

              {selectedOrder.orderStatus !== 'Cancelled' && (
                <button
                  type="button"
                  onClick={() => handleCancelOrder(selectedOrder)}
                  className="btn-row-action cancel"
                >
                  Cancel Order
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const ord = selectedOrder;
                  setSelectedOrder(null);
                  openDeleteModal(ord);
                }}
                className="btn-row-action delete"
              >
                Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CHANGE PRODUCT & CUSTOM PRICING (Image 5)                        */}
      {/* ========================================================================= */}
      {orderToChange && (
        <div className="pro-modal-overlay">
          <div className="pro-modal-box">
            <div className="pro-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#EEF2FF', color: '#4338CA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRightLeft size={14} />
                </div>
                <div>
                  <h3 className="pro-modal-title">Change Product & Custom Pricing</h3>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Order {orderToChange.orderNumber} • Customer: {orderToChange.customer.name}</div>
                </div>
              </div>
              <button type="button" onClick={() => setOrderToChange(null)} className="pro-modal-close-btn">
                ✕
              </button>
            </div>

            <div className="pro-modal-body">
              {/* Snapshot */}
              <div className="change-snapshot-card">
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    CURRENT ORDER SNAPSHOT
                  </div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', marginTop: '2px' }}>
                    {orderToChange.items && orderToChange.items[0]?.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    SKU: HK-{(orderToChange.items[0]?.id || 'ITEM').toUpperCase()} • Qty: {orderToChange.items[0]?.qty || 1} unit
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 700 }}>Current Total:</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#2563EB' }}>
                    ₹{orderToChange.total.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Product Select Dropdown */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155' }}>
                    🛍️ Select Product / Quantity Pack:
                  </label>
                  <span style={{ fontSize: '0.68rem', color: '#2563EB', fontWeight: 700 }}>
                    Auto-loads catalog price
                  </span>
                </div>
                <select
                  value={changeProductId}
                  onChange={e => handleProductSelectionChange(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.76rem', fontWeight: 700, color: '#0F172A', background: '#FFF' }}
                >
                  {Object.values(HOPEKRAFT_PRODUCTS).map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} [₹{prod.price}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Editable Pricing & Shipping (4 inputs) */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', background: '#FFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A' }}>🔢 Editable Pricing & Shipping</span>
                  <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Edit any field to customize</span>
                </div>

                <div className="pricing-inputs-grid">
                  <div className="pricing-input-cell">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={changeQty}
                      onChange={e => setChangeQty(Math.max(1, parseInt(e.target.value || '1', 10)))}
                    />
                  </div>

                  <div className="pricing-input-cell">
                    <label>Unit Price (₹):</label>
                    <input
                      type="number"
                      min="0"
                      value={changeUnitPrice}
                      onChange={e => setChangeUnitPrice(Math.max(0, parseInt(e.target.value || '0', 10)))}
                    />
                  </div>

                  <div className="pricing-input-cell">
                    <label>Delivery Fee (₹):</label>
                    <input
                      type="number"
                      min="0"
                      value={changeDeliveryFee}
                      onChange={e => setChangeDeliveryFee(Math.max(0, parseInt(e.target.value || '0', 10)))}
                    />
                  </div>

                  <div className="pricing-input-cell">
                    <label>Discount (-₹):</label>
                    <input
                      type="number"
                      min="0"
                      value={changeDiscount}
                      onChange={e => setChangeDiscount(Math.max(0, parseInt(e.target.value || '0', 10)))}
                      style={{ color: '#15803D' }}
                    />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="change-summary-banner">
                  <div style={{ color: '#475569' }}>
                    Subtotal: <strong>₹{changeSubtotal}</strong> • Delivery: <strong>{changeDeliveryFee > 0 ? `₹${changeDeliveryFee}` : 'FREE'}</strong><br />
                    Discount: <strong style={{ color: '#15803D' }}>-₹{changeDiscount}</strong> • COD Fee: <strong>₹0</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>Final Order Amount:</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563EB' }}>
                      ₹{changeFinalTotal}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  Reason / Notes:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer requested upgrade via phone"
                  value={changeNotes}
                  onChange={e => setChangeNotes(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.75rem', background: '#F8FAFC' }}
                />
              </div>

              {/* Shiprocket Sync Advisory */}
              <div className="change-advisory-note">
                <strong>📦 Shiprocket Live Sync:</strong> Updating will ensure the new product, custom price, and delivery fee are stored in Firebase Database for pickup and label generation.
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pro-modal-footer">
              <button type="button" onClick={() => setOrderToChange(null)} className="btn-header-action">
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveChangedOrder}
                disabled={changeLoading}
                className="btn-header-action"
                style={{ background: '#2563EB', borderColor: '#2563EB', color: '#FFF', fontWeight: 800 }}
              >
                {changeLoading ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                <span>Apply & Update Order (Recalculate)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PERMANENT DELETE MODAL                                           */}
      {/* ========================================================================= */}
      {orderToDelete && (
        <div className="pro-modal-overlay">
          <div className="pro-modal-box" style={{ maxWidth: '420px' }}>
            <div className="pro-modal-header" style={{ background: '#FFF1F2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} style={{ color: '#E11D48' }} />
                <h3 className="pro-modal-title" style={{ color: '#9F1239' }}>Delete Order {orderToDelete.orderNumber}?</h3>
              </div>
              <button type="button" onClick={() => setOrderToDelete(null)} className="pro-modal-close-btn">
                ✕
              </button>
            </div>

            <div className="pro-modal-body" style={{ fontSize: '0.76rem' }}>
              <p style={{ color: '#64748B' }}>
                This action is permanent and will remove the order completely from Firebase Realtime Database.
              </p>

              <div>
                <label style={{ display: 'block', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  Reason:
                </label>
                <select
                  value={deleteType}
                  onChange={e => setDeleteType(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  <option value="Customer Cancellation">Customer Cancellation</option>
                  <option value="Fake / RTO Order">Fake / RTO Order</option>
                  <option value="Test / Duplicate Order">Test / Duplicate Order</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  Type <span style={{ color: '#E11D48', fontFamily: 'monospace' }}>DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmInput}
                  onChange={e => setDeleteConfirmInput(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #FDA4AF', textAlign: 'center', fontWeight: 800, color: '#E11D48', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="pro-modal-footer">
              <button type="button" onClick={() => setOrderToDelete(null)} className="btn-header-action">
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmInput.trim().toUpperCase() !== 'DELETE' || deleteLoading}
                style={{ background: '#E11D48', border: 'none', color: '#FFF', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', opacity: deleteConfirmInput.trim().toUpperCase() !== 'DELETE' ? 0.4 : 1 }}
              >
                {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
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
        <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
          <RefreshCw size={18} className="animate-spin" />
          <span style={{ marginLeft: '8px', fontWeight: 600 }}>Loading Orders Dashboard...</span>
        </div>
      }
    >
      <AdminOrdersPageContent />
    </Suspense>
  );
}
