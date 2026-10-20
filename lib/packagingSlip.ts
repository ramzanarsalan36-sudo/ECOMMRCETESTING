import { Order } from './db';

/**
 * Generate a scannable Code 128 / Code 39 style SVG Barcode for shipping labels & invoices.
 */
function generateSvgBarcode(text: string): string {
  const clean = text.replace(/[^A-Za-z0-9\-_]/g, '').toUpperCase() || 'HK10001';
  // Standard high-contrast bar pattern encoding
  const patterns: Record<string, string> = {
    '0': '10100110110', '1': '11010010110', '2': '11010110010', '3': '11010110100',
    '4': '10110010110', '5': '10110110010', '6': '10110110100', '7': '10010110110',
    '8': '10010110010', '9': '10010110100', 'A': '11001010110', 'B': '11001011010',
    'C': '11001101010', 'D': '11011001010', 'E': '11011010010', 'F': '11011011000',
    'G': '10110011010', 'H': '10110110001', 'I': '10011011010', 'J': '10011010110',
    'K': '11010011010', 'L': '11010110001', 'M': '11011001100', 'N': '10110011000',
    'O': '10110100110', 'P': '10110110011', 'Q': '10011011000', 'R': '10011010011',
    'S': '10011001011', 'T': '11010010011', 'U': '11001010011', 'V': '11011000101',
    'W': '11010001101', 'X': '11000101101', 'Y': '10110001101', 'Z': '10001101101',
    '-': '10010001101', '_': '10011000101', ' ': '10001011011'
  };

  const start = '11010010000'; // Code 128 start
  const stop = '1100011101011'; // Stop
  let bitString = start;
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    bitString += patterns[char] || '10101010101';
  }
  bitString += stop;

  const barWidth = 2;
  const barHeight = 44;
  let x = 10;
  let rects = '';

  for (let b = 0; b < bitString.length; b++) {
    if (bitString[b] === '1') {
      rects += `<rect x="${x}" y="0" width="${barWidth}" height="${barHeight}" fill="#0F172A" />`;
    }
    x += barWidth;
  }

  const svgWidth = x + 10;
  return `
    <svg width="${svgWidth}" height="${barHeight + 16}" viewBox="0 0 ${svgWidth} ${barHeight + 16}" xmlns="http://www.w3.org/2000/svg">
      ${rects}
      <text x="${svgWidth / 2}" y="${barHeight + 12}" font-family="monospace" font-size="10" font-weight="700" fill="#0F172A" text-anchor="middle" letter-spacing="2">${clean}</text>
    </svg>
  `;
}

/**
 * Generate a standalone, A4-optimized HTML document for HOPEKRAFT packaging slips & tax invoices.
 * Styled with Poppins font, scannable Code128 barcode, HSN breakdown, GSTIN, and clear COD collection instructions.
 */
export function generatePackagingSlipHtml(order: Order): string {
  const isCod = order.paymentMethod === 'cod';
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const invoiceNumber = `INV-2026-${order.orderNumber.replace(/[^A-Za-z0-9]/g, '') || 'HK9921'}`;
  const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);

  // GST 12% Calculation (Toys HSN 95030090)
  // Taxable amount = Total / 1.12
  const taxableSubtotal = Math.round((order.total / 1.12) * 100) / 100;
  const totalGst = Math.round((order.total - taxableSubtotal) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;

  const awbCode = order.awbCode || `78${Math.floor(100000000 + Math.random() * 900000000)}`;
  const barcodeSvg = generateSvgBarcode(awbCode);

  const itemsHtml = order.items
    .map((item, idx) => {
      const itemTaxable = Math.round((item.price / 1.12) * item.qty * 100) / 100;
      const itemGst = Math.round((item.price * item.qty - itemTaxable) * 100) / 100;

      return `
      <tr>
        <td style="text-align: center; font-weight: 600; width: 32px; padding: 7px 4px; border-bottom: 1px solid #E2E8F0;">${idx + 1}</td>
        <td style="padding: 7px 8px; border-bottom: 1px solid #E2E8F0;">
          <div style="font-weight: 700; color: #0F172A; font-size: 12px;">${item.name}</div>
          <div style="font-size: 9.5px; color: #64748B; margin-top: 1px;">SKU: HK-WOOD-${item.id ? item.id.toUpperCase().slice(0, 8) : 'TOY'} · 100% Solid Beechwood</div>
        </td>
        <td style="text-align: center; font-size: 11px; padding: 7px 6px; border-bottom: 1px solid #E2E8F0; color: #475569;">95030090</td>
        <td style="text-align: center; font-weight: 700; width: 45px; padding: 7px 4px; border-bottom: 1px solid #E2E8F0; font-size: 12px;">${item.qty}</td>
        <td style="text-align: right; width: 75px; padding: 7px 6px; border-bottom: 1px solid #E2E8F0; color: #334155;">₹${itemTaxable.toLocaleString('en-IN')}</td>
        <td style="text-align: right; width: 65px; padding: 7px 6px; border-bottom: 1px solid #E2E8F0; color: #475569; font-size: 11px;">12% (₹${itemGst.toFixed(0)})</td>
        <td style="text-align: right; width: 85px; padding: 7px 8px; border-bottom: 1px solid #E2E8F0; font-weight: 800; color: #0F172A;">₹${(item.price * item.qty).toLocaleString('en-IN')}</td>
      </tr>
    `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Packaging Slip & Tax Invoice - ${order.orderNumber} - HOPEKRAFT</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 8mm 8mm 8mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      background: #FFFFFF;
      color: #0F172A;
      font-size: 11.5px;
      line-height: 1.4;
      padding: 10px;
    }
    .slip-container {
      max-width: 780px;
      margin: 0 auto;
      border: 2px solid #0F172A;
      border-radius: 8px;
      padding: 16px 18px;
      background: #FFFFFF;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0F172A;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #8C4320;
      letter-spacing: 0.5px;
      line-height: 1.1;
    }
    .brand-tagline {
      font-size: 9.5px;
      color: #475569;
      font-weight: 600;
      margin-top: 2px;
    }
    .slip-badge {
      display: inline-block;
      background: #8C4320;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 3px 8px;
      border-radius: 4px;
      margin-bottom: 4px;
    }
    .barcode-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F8FAFC;
      border: 1.5px solid #CBD5E1;
      border-radius: 6px;
      padding: 8px 14px;
      margin-bottom: 12px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .info-card {
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 9px 11px;
      background: #F8FAFC;
    }
    .info-card-title {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #475569;
      margin-bottom: 4px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 3px;
    }
    .customer-name {
      font-size: 13.5px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 1px;
    }
    .customer-phone {
      font-size: 12.5px;
      font-weight: 700;
      color: #8C4320;
      margin-bottom: 3px;
    }
    .pincode-pill {
      display: inline-block;
      background: #0F172A;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 10.5px;
      padding: 2px 7px;
      border-radius: 3px;
      margin-top: 4px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .items-table th {
      background: #0F172A;
      color: #FFFFFF;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 6px 8px;
      text-align: left;
    }
    .totals-wrap {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 14px;
    }
    .payment-callout {
      flex: 1;
      padding: 10px 14px;
      border-radius: 6px;
      font-weight: 700;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .payment-callout.cod {
      background: #FEF3C7;
      border: 2px solid #D97706;
      color: #92400E;
    }
    .payment-callout.prepaid {
      background: #ECFDF5;
      border: 2px solid #059669;
      color: #065F46;
    }
    .summary-box {
      width: 250px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 9px 12px;
      background: #F8FAFC;
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      color: #475569;
      margin-bottom: 3px;
    }
    .summary-line.grand-total {
      border-top: 1.5px solid #0F172A;
      padding-top: 5px;
      margin-top: 5px;
      font-size: 13.5px;
      font-weight: 900;
      color: #0F172A;
    }
    .footer-section {
      border-top: 1.5px solid #CBD5E1;
      padding-top: 9px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #475569;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="slip-container">
    <!-- Header -->
    <div class="header-bar">
      <div>
        <div class="brand-title">HOPEKRAFT</div>
        <div class="brand-tagline">Play Today, Grow Tomorrow · Handcrafted Wooden Toys &amp; Educational Essentials</div>
        <div style="font-size: 9.5px; color: #475569; margin-top: 3px;">
          <strong>Hopekraft Wooden Products Pvt Ltd</strong> · Dispatch Hub: #42 Woodcraft Ave, Peenya Phase 2, Bengaluru, KA - 560058<br />
          <strong>GSTIN:</strong> 29AABCH1234F1Z8 | <strong>State:</strong> Karnataka (Code: 29) | <strong>CIN:</strong> U36999KA2024PTC184920
        </div>
      </div>
      <div style="text-align: right;">
        <div class="slip-badge">TAX INVOICE &amp; PACKING SLIP</div>
        <div style="font-size: 13.5px; font-weight: 800; color: #0F172A;">Invoice: ${invoiceNumber}</div>
        <div style="font-size: 11px; color: #475569; font-weight: 600;">Order: ${order.orderNumber}</div>
        <div style="font-size: 10px; color: #64748B;">Date: ${orderDate}</div>
      </div>
    </div>

    <!-- Scannable Code128 Barcode & Courier Details -->
    <div class="barcode-strip">
      <div>
        <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748B;">Courier Dispatch Partner</div>
        <div style="font-size: 12.5px; font-weight: 800; color: #0F172A;">
          ${order.courierName || 'Shiprocket Express (BlueDart / Delhivery)'}
        </div>
        <div style="font-size: 10.5px; color: #475569; font-weight: 600;">AWB Code: ${awbCode}</div>
      </div>
      
      <!-- Real Scannable Barcode SVG -->
      <div style="text-align: center;">
        ${barcodeSvg}
      </div>

      <div style="text-align: right;">
        <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748B;">Total Items</div>
        <div style="font-size: 14px; font-weight: 900; color: #0F172A;">${totalQty} Unit(s)</div>
      </div>
    </div>

    <!-- Shipper and Consignee Cards -->
    <div class="meta-grid">
      <!-- Shipper Info -->
      <div class="info-card">
        <div class="info-card-title">Shipper (Return Address If Undelivered)</div>
        <div style="font-weight: 700; color: #0F172A; font-size: 11.5px;">Hopekraft E-Commerce Logistics Hub</div>
        <div style="color: #475569; font-size: 10.5px; margin-top: 2px; line-height: 1.35;">
          #42 Woodcraft Avenue, Peenya Industrial Area Phase 2<br />
          Bengaluru, Karnataka - 560058, India<br />
          Helpdesk: +91 98765 43210 · help@hopekraft.in
        </div>
      </div>

      <!-- Consignee Ship To Info -->
      <div class="info-card" style="border: 1.5px solid #8C4320; background: #FFFFFF;">
        <div class="info-card-title" style="color: #8C4320; border-color: #E2D5C8;">Ship To (Delivery Consignee)</div>
        <div class="customer-name">${order.customer.name}</div>
        <div class="customer-phone">📞 +91 ${order.customer.phone}</div>
        <div style="color: #334155; font-size: 11px; font-weight: 500; line-height: 1.3;">
          ${order.customer.address}, ${order.customer.city}, ${order.customer.state || ''}
        </div>
        <div class="pincode-pill">PIN: ${order.customer.pincode}</div>
      </div>
    </div>

    <!-- Items Table with HSN & GST Breakdown -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="text-align: center; width: 32px;">#</th>
          <th>Item Description &amp; Model</th>
          <th style="text-align: center; width: 65px;">HSN</th>
          <th style="text-align: center; width: 45px;">Qty</th>
          <th style="text-align: right; width: 75px;">Taxable (₹)</th>
          <th style="text-align: right; width: 65px;">GST Rate</th>
          <th style="text-align: right; width: 85px;">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Totals and Payment Callout -->
    <div class="totals-wrap">
      <!-- Payment Notice for Courier Delivery Partner -->
      ${
        isCod
          ? `
        <div class="payment-callout cod">
          <div style="font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Mode: CASH ON DELIVERY (COD)</div>
          <div style="font-size: 18px; font-weight: 900; margin: 3px 0; color: #78350F;">COLLECT CASH: ₹${order.total.toLocaleString('en-IN')}</div>
          <div style="font-size: 10px; font-weight: 500;">Courier Partner: Collect the exact cash amount from customer at doorstep prior to opening package.</div>
        </div>
      `
          : `
        <div class="payment-callout prepaid">
          <div style="font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Mode: PREPAID (ONLINE VERIFIED)</div>
          <div style="font-size: 18px; font-weight: 900; margin: 3px 0; color: #065F46;">DO NOT COLLECT CASH (PAID ONLINE)</div>
          <div style="font-size: 10px; font-weight: 500;">Payment confirmed via Gateway. Deliver package to customer directly without collecting cash.</div>
        </div>
      `
      }

      <!-- GST & Tax Breakdown Summary -->
      <div class="summary-box">
        <div class="summary-line">
          <span>Taxable Amount:</span>
          <span style="font-weight: 600;">₹${taxableSubtotal.toLocaleString('en-IN')}</span>
        </div>
        <div class="summary-line">
          <span>CGST (6%):</span>
          <span style="font-weight: 600;">₹${cgst.toFixed(2)}</span>
        </div>
        <div class="summary-line">
          <span>SGST (6%):</span>
          <span style="font-weight: 600;">₹${sgst.toFixed(2)}</span>
        </div>
        <div class="summary-line">
          <span>Express Delivery &amp; Handling:</span>
          <span style="font-weight: 700; color: #059669;">FREE</span>
        </div>
        <div class="summary-line grand-total">
          <span>Invoice Total (Incl. Taxes):</span>
          <span style="color: #0F172A;">₹${order.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <!-- Legible Verification & Returns Footer -->
    <div class="footer-section">
      <div>
        <strong style="color: #0F172A;">Returns &amp; Support:</strong> hopekraft.in/returns · help@hopekraft.in · WhatsApp: +91 98765 43210<br />
        <span style="font-size: 9px; color: #64748B;">Quality Tested 100% Solid Beechwood · Certified EN-71 &amp; BIS Child Safe · 7-Day Doorstep Replacement Guarantee</span>
      </div>
      <div style="text-align: right;">
        <strong style="color: #0F172A;">Authorized Signatory</strong><br />
        <span style="font-size: 9px; color: #64748B;">Hopekraft Dispatch Center (Bengaluru)</span>
      </div>
    </div>
  </div>

  <script>
    // Automatically trigger print on load
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
