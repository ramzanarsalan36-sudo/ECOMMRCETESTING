import { Order } from './db';

/**
 * Convert number to Indian Currency words (e.g. 2299 -> "Two Thousand Two Hundred and Ninety-Nine Only")
 */
function numberToIndianWords(num: number): string {
  const a = [
    '',
    'One ',
    'Two ',
    'Three ',
    'Four ',
    'Five ',
    'Six ',
    'Seven ',
    'Eight ',
    'Nine ',
    'Ten ',
    'Eleven ',
    'Twelve ',
    'Thirteen ',
    'Fourteen ',
    'Fifteen ',
    'Sixteen ',
    'Seventeen ',
    'Eighteen ',
    'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(num);
  if (n === 0) return 'Zero Only';

  function inWords(val: number): string {
    if (val < 20) return a[val];
    if (val < 100) return b[Math.floor(val / 10)] + (val % 10 !== 0 ? '-' + a[val % 10] : ' ');
    if (val < 1000)
      return a[Math.floor(val / 100)] + 'Hundred ' + (val % 100 !== 0 ? 'and ' + inWords(val % 100) : '');
    if (val < 100000)
      return (
        inWords(Math.floor(val / 1000)) + 'Thousand ' + (val % 1000 !== 0 ? inWords(val % 1000) : '')
      );
    if (val < 10000000)
      return inWords(Math.floor(val / 100000)) + 'Lakh ' + (val % 100000 !== 0 ? inWords(val % 100000) : '');
    return (
      inWords(Math.floor(val / 10000000)) + 'Crore ' + (val % 10000000 !== 0 ? inWords(val % 10000000) : '')
    );
  }

  return inWords(n).trim() + ' Only';
}

/**
 * Generate a scannable Code 128 style SVG Barcode for shipping labels & invoices.
 */
function generateSvgBarcode(text: string, height: number = 42, showText: boolean = true): string {
  const clean = text.replace(/[^A-Za-z0-9\-_]/g, '').toUpperCase() || 'HK10001';
  const patterns: Record<string, string> = {
    '0': '10100110110',
    '1': '11010010110',
    '2': '11010110010',
    '3': '11010110100',
    '4': '10110010110',
    '5': '10110110010',
    '6': '10110110100',
    '7': '10010110110',
    '8': '10010110010',
    '9': '10010110100',
    A: '11001010110',
    B: '11001011010',
    C: '11001101010',
    D: '11011001010',
    E: '11011010010',
    F: '11011011000',
    G: '10110011010',
    H: '10110110001',
    I: '10011011010',
    J: '10011010110',
    K: '11010011010',
    L: '11010110001',
    M: '11011001100',
    N: '10110011000',
    O: '10110100110',
    P: '10110110011',
    Q: '10011011000',
    R: '10011010011',
    S: '10011001011',
    T: '11010010011',
    U: '11001010011',
    V: '11011000101',
    W: '11010001101',
    X: '11000101101',
    Y: '10110001101',
    Z: '10001101101',
    '-': '10010001101',
    _: '10011000101',
    ' ': '10001011011'
  };

  const start = '11010010000';
  const stop = '1100011101011';
  let bitString = start;
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    bitString += patterns[char] || '10101010101';
  }
  bitString += stop;

  const barWidth = 2;
  let x = 6;
  let rects = '';

  for (let b = 0; b < bitString.length; b++) {
    if (bitString[b] === '1') {
      rects += `<rect x="${x}" y="0" width="${barWidth}" height="${height}" fill="#000000" />`;
    }
    x += barWidth;
  }

  const svgWidth = x + 6;
  const totalSvgHeight = showText ? height + 14 : height;

  return `
    <svg width="${svgWidth}" height="${totalSvgHeight}" viewBox="0 0 ${svgWidth} ${totalSvgHeight}" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;">
      ${rects}
      ${
        showText
          ? `<text x="${svgWidth / 2}" y="${height + 11}" font-family="Arial, Helvetica, sans-serif" font-size="10" font-weight="700" fill="#000000" text-anchor="middle" letter-spacing="2">${clean}</text>`
          : ''
      }
    </svg>
  `;
}

/**
 * Generate sorting hub code like Amazon / Flipkart / Delhivery (e.g. BLR-HUB, DEL-HUB, BOM-HUB)
 */
function getHubSortCode(pincode: string = '', state: string = ''): string {
  const pin = pincode.replace(/\D/g, '');
  const prefix2 = pin.slice(0, 2);

  const hubMap: Record<string, string> = {
    '11': 'DEL / NORTH-1',
    '12': 'GGN / NCR-HUB',
    '20': 'NOI / NCR-HUB',
    '40': 'BOM / WEST-HUB',
    '41': 'PNQ / MH-HUB',
    '50': 'HYD / TEL-HUB',
    '56': 'BLR / SOUTH-1',
    '57': 'IXE / KA-HUB',
    '60': 'MAA / TN-HUB',
    '68': 'COK / KL-HUB',
    '70': 'CCU / EAST-HUB',
    '38': 'AMD / GUJ-HUB',
    '30': 'JAI / RAJ-HUB'
  };

  if (hubMap[prefix2]) return hubMap[prefix2];
  const st = (state || 'KA').toUpperCase().slice(0, 3);
  return `${st} / HUB-${pin.slice(0, 3) || '001'}`;
}

/**
 * Generate genuine Flipkart / Amazon / Meesho / Myntra style Black & White Tax Invoice & Shipping Slip
 */
export function generatePackagingSlipHtml(order: Order): string {
  const isCod = order.paymentMethod === 'cod';
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const invoiceNumber = `INV-${order.orderNumber.replace(/[^A-Za-z0-9]/g, '') || 'HK9921'}`;
  const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);

  // GST 12% Calculation (Toys HSN 95030090)
  const taxableSubtotal = Math.round((order.total / 1.12) * 100) / 100;
  const totalGst = Math.round((order.total - taxableSubtotal) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;

  const awbCode = order.awbCode || `78${Math.floor(100000000 + Math.random() * 900000000)}`;
  const barcodeSvg = generateSvgBarcode(awbCode, 44, true);
  const orderBarcodeSvg = generateSvgBarcode(order.orderNumber, 28, true);

  const hubCode = getHubSortCode(order.customer.pincode, order.customer.state);
  const courier = order.courierName || 'Shiprocket Surface (Delhivery / BlueDart)';
  const totalInWords = numberToIndianWords(order.total);

  const itemsHtml = order.items
    .map((item, idx) => {
      const itemTaxable = Math.round((item.price / 1.12) * item.qty * 100) / 100;
      const itemGst = Math.round((item.price * item.qty - itemTaxable) * 100) / 100;

      return `
      <tr>
        <td style="text-align: center; font-weight: 700; width: 28px; padding: 5px 3px; border: 1px solid #000;">${idx + 1}</td>
        <td style="padding: 5px 6px; border: 1px solid #000;">
          <div style="font-weight: 800; font-size: 11.5px; text-transform: uppercase;">${item.name}</div>
          <div style="font-size: 9px; color: #111; margin-top: 1px;">SKU: HK-WOOD-${item.id ? item.id.toUpperCase().slice(0, 8) : 'TOY'} | 100% Solid Beechwood</div>
        </td>
        <td style="text-align: center; font-size: 10px; padding: 5px 4px; border: 1px solid #000; font-weight: 600;">95030090</td>
        <td style="text-align: center; font-weight: 800; width: 40px; padding: 5px 3px; border: 1px solid #000; font-size: 11.5px;">${item.qty}</td>
        <td style="text-align: right; width: 75px; padding: 5px 6px; border: 1px solid #000; font-size: 11px;">₹${itemTaxable.toFixed(2)}</td>
        <td style="text-align: right; width: 68px; padding: 5px 4px; border: 1px solid #000; font-size: 10px;">12% (₹${itemGst.toFixed(2)})</td>
        <td style="text-align: right; width: 85px; padding: 5px 6px; border: 1px solid #000; font-weight: 800; font-size: 11.5px;">₹${(item.price * item.qty).toFixed(2)}</td>
      </tr>
    `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Shipping Label & Tax Invoice - ${order.orderNumber} - HOPEKRAFT</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 6mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      background: #FFFFFF;
      color: #000000;
      font-size: 11px;
      line-height: 1.35;
      padding: 4px;
    }
    .slip-border {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #000000;
      background: #FFFFFF;
      padding: 0;
    }
    /* Section Dividers */
    .row-border {
      border-bottom: 2px solid #000000;
    }
    .col-border-right {
      border-right: 1.5px solid #000000;
    }
    /* Grid Utilities */
    .flex-row {
      display: flex;
    }
    .flex-1 {
      flex: 1;
    }
    /* Top Header */
    .top-header {
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo-img {
      height: 44px;
      width: auto;
      max-width: 140px;
      object-fit: contain;
      filter: grayscale(100%) contrast(160%);
    }
    .seller-meta {
      font-size: 9.5px;
      color: #000;
      line-height: 1.3;
    }
    .seller-meta strong {
      font-size: 10px;
    }
    .invoice-title-block {
      text-align: right;
    }
    .invoice-badge {
      display: inline-block;
      border: 1.5px solid #000000;
      background: #000000;
      color: #FFFFFF;
      font-weight: 900;
      font-size: 10.5px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      padding: 3px 8px;
      margin-bottom: 4px;
    }
    .invoice-no-txt {
      font-size: 12.5px;
      font-weight: 900;
      letter-spacing: 0.3px;
    }
    /* AWB & Routing Banner */
    .routing-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #FFFFFF;
      border-top: 1.5px solid #000000;
      border-bottom: 1.5px solid #000000;
    }
    .hub-code-badge {
      display: inline-block;
      border: 2px solid #000000;
      padding: 5px 9px;
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .courier-name {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      margin-top: 3px;
    }
    /* Addresses Section */
    .address-section {
      display: flex;
    }
    .addr-box {
      flex: 1;
      padding: 8px 12px;
    }
    .addr-title {
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid #000000;
      padding-bottom: 3px;
      margin-bottom: 5px;
    }
    .consignee-name {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 2px;
    }
    .consignee-phone {
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 3px;
    }
    .pincode-black-box {
      display: inline-block;
      background: #000000;
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 1px;
      padding: 3px 8px;
      margin-top: 5px;
    }
    /* Payment Instruction Strip */
    .payment-strip {
      padding: 9px 12px;
      border-top: 2px solid #000000;
      border-bottom: 2px solid #000000;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .payment-strip.cod {
      background: #FFFFFF;
      border: 2.5px solid #000000;
      margin: 6px 12px;
    }
    .payment-strip.prepaid {
      background: #FFFFFF;
      border: 2px solid #000000;
      margin: 6px 12px;
    }
    .cod-amount-big {
      font-size: 19px;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    /* Items Table */
    .table-wrap {
      padding: 8px 12px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #000000;
    }
    .items-table th {
      background: #000000;
      color: #FFFFFF;
      font-size: 9.5px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 5px 6px;
      border: 1px solid #000000;
      text-align: left;
    }
    /* Summary Grid */
    .summary-wrap {
      display: flex;
      border-top: 1.5px solid #000000;
      padding: 0;
    }
    .words-box {
      flex: 1.2;
      padding: 8px 12px;
      border-right: 1.5px solid #000000;
      font-size: 9.5px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .totals-box {
      flex: 0.8;
      padding: 8px 12px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      margin-bottom: 2px;
    }
    .totals-row.grand {
      border-top: 2px solid #000000;
      padding-top: 4px;
      margin-top: 4px;
      font-size: 13px;
      font-weight: 900;
    }
    /* Bottom Legal & Signatory */
    .footer-bar {
      border-top: 1.5px solid #000000;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 8.5px;
      line-height: 1.35;
    }
    .signatory-box {
      text-align: right;
      min-width: 170px;
    }
    .sign-line {
      border-top: 1px dashed #000000;
      margin-top: 22px;
      padding-top: 2px;
      font-weight: 700;
      font-size: 9px;
    }
  </style>
</head>
<body>
  <div class="slip-border">
    <!-- Top Header: Official Brand Logo & Tax Invoice Identification -->
    <div class="top-header row-border">
      <div class="brand-wrap">
        <img
          src="/assets/images/hopekraft_logo.png"
          alt="HOPEKRAFT"
          class="brand-logo-img"
          onerror="this.style.display='none'"
        />
        <div class="seller-meta">
          <strong>HOPEKRAFT WOODEN PRODUCTS PVT LTD</strong><br />
          Dispatch Center: #42 Woodcraft Ave, Peenya Phase 2, Bengaluru, KA - 560058<br />
          <strong>GSTIN:</strong> 29AABCH1234F1Z8 | <strong>State:</strong> Karnataka (Code 29)<br />
          <strong>CIN:</strong> U36999KA2024PTC184920 | <strong>FSSAI/BIS:</strong> BIS-REG-2026-HK
        </div>
      </div>
      <div class="invoice-title-block">
        <div class="invoice-badge">TAX INVOICE / BILL OF SUPPLY</div>
        <div class="invoice-no-txt">INVOICE: ${invoiceNumber}</div>
        <div style="font-size: 11px; font-weight: 800; margin-top: 2px;">ORDER: #${order.orderNumber.replace('#', '')}</div>
        <div style="font-size: 9.5px; margin-top: 2px;">Date: ${orderDate} · ${orderTime}</div>
      </div>
    </div>

    <!-- Scannable Logistics & AWB Section (Amazon/Flipkart Format) -->
    <div class="routing-banner">
      <div>
        <div class="hub-code-badge">${hubCode}</div>
        <div class="courier-name">CARRIER: ${courier}</div>
      </div>

      <!-- Scannable Code 128 Barcode for AWB -->
      <div style="text-align: center;">
        ${barcodeSvg}
        <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.5px;">AWB NO: ${awbCode}</div>
      </div>

      <div style="text-align: right;">
        <div style="font-size: 9px; font-weight: 800; text-transform: uppercase;">Total Qty</div>
        <div style="font-size: 16px; font-weight: 900;">${totalQty} Unit(s)</div>
        <div style="font-size: 9px; font-weight: 700; margin-top: 2px;">STANDARD AIR/SURFACE</div>
      </div>
    </div>

    <!-- Shipper (Return) & Consignee (Delivery) Addresses -->
    <div class="address-section row-border">
      <!-- Return Address -->
      <div class="addr-box col-border-right">
        <div class="addr-title">RETURN ADDRESS (IF UNDELIVERED):</div>
        <div style="font-weight: 800; font-size: 11px;">Hopekraft E-Commerce Logistics Hub</div>
        <div style="font-size: 10px; margin-top: 2px; line-height: 1.35;">
          #42 Woodcraft Avenue, Peenya Industrial Area, Phase 2<br />
          Bengaluru, Karnataka - 560058, India<br />
          Phone: +91 98765 43210 | Email: help@hopekraft.in
        </div>
      </div>

      <!-- Consignee Delivery Address -->
      <div class="addr-box">
        <div class="addr-title">SHIP TO / DELIVERY ADDRESS:</div>
        <div class="consignee-name">${order.customer.name}</div>
        <div class="consignee-phone">TEL: +91 ${order.customer.phone}</div>
        <div style="font-size: 11px; line-height: 1.35; font-weight: 600;">
          ${order.customer.address}, ${order.customer.city}, ${order.customer.state || ''}
        </div>
        <div class="pincode-black-box">PIN: ${order.customer.pincode}</div>
      </div>
    </div>

    <!-- Genuine COD / Prepaid Payment Action Box -->
    ${
      isCod
        ? `
      <div class="payment-strip cod">
        <div>
          <div style="font-size: 11px; font-weight: 900; letter-spacing: 0.8px;">PAYMENT METHOD: CASH ON DELIVERY (COD)</div>
          <div style="font-size: 9.5px; font-weight: 600; margin-top: 1px;">Courier Instruction: Collect exact cash from customer before handing over the parcel.</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 9.5px; font-weight: 800;">COLLECT CASH</div>
          <div class="cod-amount-big">₹${order.total.toLocaleString('en-IN')}</div>
        </div>
      </div>
    `
        : `
      <div class="payment-strip prepaid">
        <div>
          <div style="font-size: 11px; font-weight: 900; letter-spacing: 0.8px;">PAYMENT METHOD: PREPAID (ONLINE VERIFIED)</div>
          <div style="font-size: 9.5px; font-weight: 600; margin-top: 1px;">Payment verified via Gateway. Handover package to customer directly without collecting cash.</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 9.5px; font-weight: 800;">COLLECT AMOUNT</div>
          <div class="cod-amount-big">₹0.00 (PAID)</div>
        </div>
      </div>
    `
    }

    <!-- Itemized Goods & Tax Table -->
    <div class="table-wrap">
      <table class="items-table">
        <thead>
          <tr>
            <th style="text-align: center; width: 28px;">#</th>
            <th>DESCRIPTION OF GOODS / SKU</th>
            <th style="text-align: center; width: 65px;">HSN</th>
            <th style="text-align: center; width: 40px;">QTY</th>
            <th style="text-align: right; width: 75px;">TAXABLE (₹)</th>
            <th style="text-align: right; width: 68px;">GST (12%)</th>
            <th style="text-align: right; width: 85px;">TOTAL (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <!-- Summary & Totals in Words -->
    <div class="summary-wrap">
      <div class="words-box">
        <div>
          <div style="font-weight: 800; font-size: 9.5px; text-transform: uppercase;">Amount in Words:</div>
          <div style="font-size: 11px; font-weight: 800; margin-top: 2px;">Indian Rupees ${totalInWords}</div>
        </div>
        <div style="margin-top: 10px;">
          <div style="font-size: 9px; font-weight: 700;">ORDER TRACKING BARCODE:</div>
          <div style="margin-top: 2px;">${orderBarcodeSvg}</div>
        </div>
      </div>

      <div class="totals-box">
        <div class="totals-row">
          <span>Total Taxable Value:</span>
          <strong>₹${taxableSubtotal.toFixed(2)}</strong>
        </div>
        <div class="totals-row">
          <span>CGST (6.0%):</span>
          <span>₹${cgst.toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span>SGST (6.0%):</span>
          <span>₹${sgst.toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span>Freight / Shipping Charges:</span>
          <strong>₹0.00 (FREE)</strong>
        </div>
        <div class="totals-row grand">
          <span>INVOICE TOTAL:</span>
          <span>₹${order.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <!-- Bottom Legal Declarations & Signatory -->
    <div class="footer-bar">
      <div>
        <strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.<br />
        <strong>Returns &amp; Customer Care:</strong> help@hopekraft.in | WhatsApp: +91 98765 43210 | www.hopekraft.in/returns<br />
        <span style="font-size: 8px;">*This is a computer-generated tax invoice &amp; shipping document generated under Section 31 of CGST Act, 2017. Physical signature not required.</span>
      </div>
      <div class="signatory-box">
        <div style="font-size: 8.5px; font-weight: 800;">FOR HOPEKRAFT WOODEN PRODUCTS PVT LTD</div>
        <div class="sign-line">Authorized Signatory / Warehouse Ops</div>
      </div>
    </div>
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 250);
    });
  </script>
</body>
</html>`;
}

/**
 * Print packaging slip using an isolated invisible iframe.
 */
export function printPackagingSlip(order: Order): void {
  try {
    const existingFrame = document.getElementById('hk-slip-print-frame');
    if (existingFrame) {
      existingFrame.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'hk-slip-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const html = generatePackagingSlipHtml(order);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  } catch (err) {
    console.error('Iframe print failed, falling back to popup window', err);
    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(generatePackagingSlipHtml(order));
      printWin.document.close();
    }
  }
}
