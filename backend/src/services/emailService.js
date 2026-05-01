const { Resend } = require('resend');

// Only initialize Resend if API key is present to prevent crash
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.FROM_EMAIL || 'NexusGood <noreply@nexusgood.com>';

// ── HTML template helper ──────────────────────────────────────────────────────
const wrap = (title, body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f8fafc; margin:0; padding:0; }
    .container { max-width:600px; margin:32px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#6366f1,#4f46e5); padding:32px; text-align:center; }
    .header h1 { color:#fff; margin:0; font-size:24px; font-weight:800; letter-spacing:-0.5px; }
    .header p { color:rgba(255,255,255,0.8); margin:6px 0 0; font-size:13px; }
    .body { padding:32px; }
    .body h2 { color:#1e293b; font-size:20px; margin:0 0 16px; }
    .body p { color:#475569; font-size:14px; line-height:1.7; margin:0 0 12px; }
    .info-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin:20px 0; }
    .info-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f1f5f9; font-size:13px; }
    .info-row:last-child { border-bottom:none; }
    .info-row .label { color:#64748b; }
    .info-row .value { color:#1e293b; font-weight:600; }
    .btn { display:inline-block; background:#6366f1; color:#fff; padding:12px 28px; border-radius:10px; text-decoration:none; font-weight:700; font-size:14px; margin:16px 0; }
    .footer { background:#f8fafc; padding:20px 32px; text-align:center; border-top:1px solid #e2e8f0; }
    .footer p { color:#94a3b8; font-size:12px; margin:0; }
    table { width:100%; border-collapse:collapse; margin:16px 0; }
    th { background:#f1f5f9; padding:10px 14px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; }
    td { padding:12px 14px; font-size:13px; color:#334155; border-bottom:1px solid #f8fafc; }
    .total-row td { font-weight:700; color:#1e293b; font-size:14px; border-top:2px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NexusGood</h1>
      <p>${title}</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} NexusGood · support@nexusgood.com</p>
      <p style="margin-top:4px;">This is an automated email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;

// ── Send order confirmation ───────────────────────────────────────────────────
const sendOrderConfirmation = async (user, order) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const isCOD = order.paymentMethod === 'COD';
    const itemRows = order.items?.map(item => `
      <tr>
        <td>${item.product?.name || 'Product'}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">₹${item.price?.toLocaleString('en-IN')}</td>
        <td style="text-align:right">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>`).join('') || '';

    const body = `
      <h2>Order Confirmed! 🎉</h2>
      <p>Hi <strong>${user.name}</strong>, your order has been placed successfully.</p>
      <div class="info-box">
        <div class="info-row"><span class="label">Order ID</span><span class="value">#${order._id?.toString().slice(-8).toUpperCase()}</span></div>
        <div class="info-row"><span class="label">Payment</span><span class="value">${isCOD ? 'Cash on Delivery' : 'Paid Online'}</span></div>
        <div class="info-row"><span class="label">Status</span><span class="value">${order.status}</span></div>
        <div class="info-row"><span class="label">Delivering to</span><span class="value">${order.shippingAddress?.address}, ${order.shippingAddress?.city}</span></div>
      </div>
      <table>
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>
          ${itemRows}
          <tr class="total-row"><td colspan="3">Total</td><td style="text-align:right">₹${order.totalAmount?.toLocaleString('en-IN')}</td></tr>
        </tbody>
      </table>
      ${isCOD ? '<p style="color:#d97706;font-weight:600;">💰 Please keep ₹' + order.totalAmount?.toLocaleString('en-IN') + ' ready at the time of delivery.</p>' : ''}
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders" class="btn">Track Your Order</a>`;

    await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `Order Confirmed — #${order._id?.toString().slice(-8).toUpperCase()} | NexusGood`,
      html: wrap('Order Confirmation', body),
    });
  } catch (err) {
    console.error('Email error (orderConfirmation):', err.message);
  }
};

// ── Send shipping update ──────────────────────────────────────────────────────
const sendShippingUpdate = async (user, order) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const statusMessages = {
      processing: { emoji: '📦', title: 'Order is Being Processed', msg: 'Your order is being prepared for shipment.' },
      shipped:    { emoji: '🚚', title: 'Your Order is On the Way!', msg: 'Your order has been shipped and is on its way to you.' },
      delivered:  { emoji: '✅', title: 'Order Delivered!', msg: 'Your order has been delivered. We hope you love it!' },
      cancelled:  { emoji: '❌', title: 'Order Cancelled', msg: 'Your order has been cancelled. If you paid online, a refund will be processed within 5-7 business days.' },
    };
    const info = statusMessages[order.status] || { emoji: '📋', title: 'Order Update', msg: `Your order status is now: ${order.status}` };

    const body = `
      <h2>${info.emoji} ${info.title}</h2>
      <p>Hi <strong>${user.name}</strong>, ${info.msg}</p>
      <div class="info-box">
        <div class="info-row"><span class="label">Order ID</span><span class="value">#${order._id?.toString().slice(-8).toUpperCase()}</span></div>
        <div class="info-row"><span class="label">New Status</span><span class="value" style="text-transform:capitalize">${order.status}</span></div>
        <div class="info-row"><span class="label">Total</span><span class="value">₹${order.totalAmount?.toLocaleString('en-IN')}</span></div>
      </div>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders" class="btn">View Order</a>`;

    await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `${info.emoji} Order ${order.status} — #${order._id?.toString().slice(-8).toUpperCase()} | NexusGood`,
      html: wrap('Order Status Update', body),
    });
  } catch (err) {
    console.error('Email error (shippingUpdate):', err.message);
  }
};

// ── Send abandoned cart recovery ─────────────────────────────────────────────
const sendAbandonedCartEmail = async (user, cartItems) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const itemList = cartItems.map(item => `
      <tr>
        <td>${item.product?.name || 'Product'}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">₹${item.product?.price?.toLocaleString('en-IN') || '—'}</td>
      </tr>`).join('');

    const body = `
      <h2>You left something behind! 🛒</h2>
      <p>Hi <strong>${user.name}</strong>, you have items waiting in your cart. Complete your purchase before they sell out!</p>
      <table>
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th></tr></thead>
        <tbody>${itemList}</tbody>
      </table>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/cart" class="btn">Complete Your Purchase</a>
      <p style="font-size:12px;color:#94a3b8;margin-top:16px;">Items in your cart are not reserved and may sell out.</p>`;

    await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: '🛒 You left items in your cart — NexusGood',
      html: wrap('Complete Your Purchase', body),
    });
  } catch (err) {
    console.error('Email error (abandonedCart):', err.message);
  }
};

// ── Send return status update ─────────────────────────────────────────────────
const sendReturnUpdate = async (user, returnRequest, order) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const msgs = {
      approved: { emoji: '✅', title: 'Return Approved', msg: `Your return request has been approved. A refund of ₹${returnRequest.refundAmount?.toLocaleString('en-IN')} will be processed within 5-7 business days.` },
      rejected: { emoji: '❌', title: 'Return Rejected', msg: `Your return request has been rejected. ${returnRequest.adminNote ? 'Reason: ' + returnRequest.adminNote : ''}` },
      refunded: { emoji: '💰', title: 'Refund Processed', msg: `Your refund of ₹${returnRequest.refundAmount?.toLocaleString('en-IN')} has been processed successfully.` },
    };
    const info = msgs[returnRequest.status] || { emoji: '📋', title: 'Return Update', msg: `Your return status is: ${returnRequest.status}` };

    const body = `
      <h2>${info.emoji} ${info.title}</h2>
      <p>Hi <strong>${user.name}</strong>, ${info.msg}</p>
      <div class="info-box">
        <div class="info-row"><span class="label">Order ID</span><span class="value">#${order._id?.toString().slice(-8).toUpperCase()}</span></div>
        <div class="info-row"><span class="label">Return Status</span><span class="value" style="text-transform:capitalize">${returnRequest.status}</span></div>
      </div>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/orders" class="btn">View Orders</a>`;

    await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `${info.emoji} Return ${returnRequest.status} — NexusGood`,
      html: wrap('Return Status Update', body),
    });
  } catch (err) {
    console.error('Email error (returnUpdate):', err.message);
  }
};

// ── Send Wallet update ───────────────────────────────────────────────────────
const sendWalletUpdate = async (user, amount, type, description) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const isCredit = type === 'credit';
    const body = `
      <h2>${isCredit ? '💰 Credits Added!' : '📤 Payment Processed'}</h2>
      <p>Hi <strong>${user.name}</strong>, your NexusGood Digital Vault has been updated.</p>
      <div class="info-box">
        <div class="info-row"><span class="label">Amount</span><span class="value" style="color:${isCredit ? '#10b981' : '#ef4444'}">${isCredit ? '+' : '-'} ₹${amount.toLocaleString('en-IN')}</span></div>
        <div class="info-row"><span class="label">Transaction</span><span class="value">${description}</span></div>
        <div class="info-row"><span class="label">Date</span><span class="value">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></div>
      </div>
      <p>Log in to your profile to see your updated balance and transaction history.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" class="btn">View Digital Vault</a>`;

    await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `${isCredit ? '💰' : '💳'} Wallet Update — NexusGood`,
      html: wrap('Digital Vault Update', body),
    });
  } catch (err) {
    console.error('Email error (walletUpdate):', err.message);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendShippingUpdate,
  sendAbandonedCartEmail,
  sendReturnUpdate,
  sendWalletUpdate,
};
