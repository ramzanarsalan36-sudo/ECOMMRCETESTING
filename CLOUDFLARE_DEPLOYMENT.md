# HOPEKRAFT E-Commerce — Cloudflare Deployment Guide

This Next.js application has been architected specifically for high-speed edge environments like **Cloudflare Pages / Workers**.

---

## ⚡ Edge Compatibility Highlights
1. **Zero Native Binary Addons**: Uses standard **Web Crypto API** (`crypto.subtle`) for HMAC-SHA256 signatures (Razorpay) and JWT signing (Admin Auth). No `bcrypt` or C++ build errors!
2. **Standard Web Fetch**: Uses the native Web Fetch API for Shiprocket and Razorpay calls.
3. **Optimized Assets**: Local image unoptimized flag is enabled to allow smooth zero-configuration deployment to Cloudflare Pages.

---

## 🚀 Option 1: Deploy with Git via Cloudflare Pages Dashboard (Recommended)

1. Push this repository to GitHub or GitLab:
   ```bash
   git add .
   git commit -m "feat: complete Next.js migration with Razorpay, Shiprocket & Admin Panel"
   git push origin main
   ```

2. Open the **[Cloudflare Dashboard](https://dash.cloudflare.com/)** → Go to **Compute (Workers & Pages)** → Click **Create Application** → Select the **Pages** tab → **Connect to Git**.

3. Select your repository (`ecommrcetesting2` or your fork).

4. Configure Build Settings:
   - **Framework Preset**: Next.js
   - **Build command**: `npx @cloudflare/next-on-pages@1` (or `npm run build`)
   - **Build output directory**: `.vercel/output/static` (for next-on-pages) or `.next`

5. Add Environment Variables under **Settings → Environment Variables**:
   | Variable | Example Value | Description |
   |---|---|---|
   | `ADMIN_USERNAME` | `admin` | Admin panel login ID |
   | `ADMIN_PASSWORD` | `YourStrongPassword2026!` | Admin panel secure password |
   | `ADMIN_JWT_SECRET` | `a_long_random_secret_string` | Secret key for signing admin tokens |
   | `RAZORPAY_KEY_ID` | `rzp_live_...` | Razorpay Key ID from dashboard |
   | `RAZORPAY_KEY_SECRET` | `...` | Razorpay Key Secret |
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID`| `rzp_live_...` | Public Key ID for browser modal |
   | `SHIPROCKET_EMAIL` | `shipping@hopekraft.in` | Shiprocket account email |
   | `SHIPROCKET_PASSWORD` | `...` | Shiprocket account password |
   | `SHIPROCKET_PICKUP_PINCODE` | `560038` | Default warehouse dispatch pincode |

6. Click **Save and Deploy**. Cloudflare will build and give you a `https://<project-name>.pages.dev` URL.

---

## 🛠️ Option 2: Deploy from Terminal via Wrangler CLI

If you have the Cloudflare Wrangler CLI installed:

```bash
# 1. Install next-on-pages tool
npm install --save-dev @cloudflare/next-on-pages

# 2. Build the project for Cloudflare Pages
npx @cloudflare/next-on-pages

# 3. Deploy to Cloudflare Pages
npx wrangler pages deploy .vercel/output/static --project-name=hopekraft-ecommerce
```

---

## 🔒 Accessing the Secure Admin Panel
Once deployed (or running locally):
- Navigate to: `/admin` or `/admin/login`
- Default development credentials:
  - **Username / ID:** `admin`
  - **Password:** `admin123`
- Inside the Admin Panel, you can:
  - View incoming orders in real-time
  - Filter orders by status (Pending, Confirmed, Shipped, Delivered)
  - Click **"Dispatch via Shiprocket 🚚"** to automatically generate AWB tracking numbers
  - Review Razorpay payment transaction IDs
  - Print packaging slips / invoices for warehouse dispatch
