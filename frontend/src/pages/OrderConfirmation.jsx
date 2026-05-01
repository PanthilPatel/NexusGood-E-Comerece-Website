import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, Package, ArrowRight, Printer,
  MapPin, Truck, Clock, ShoppingBag, Banknote, CreditCard
} from 'lucide-react';
import api from '../services/api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { navigate('/orders'); return; }
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handlePrint = () => {
    if (!order) return;
    const isCOD = order.paymentMethod === 'COD';
    const subtotal = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
    const codCharge = order.codCharge || 0;
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const itemRows = order.items?.map(item => `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:13px;">
          ${item.product?.name || 'Product'}
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px;text-align:center;">
          ${item.quantity}
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px;text-align:right;">
          ₹${item.price?.toLocaleString('en-IN')}
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:13px;font-weight:700;text-align:right;">
          ₹${(item.price * item.quantity).toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice #${order._id?.slice(-8).toUpperCase()} — NexusGood</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Inter',Arial,sans-serif;background:#fff;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .page{max-width:794px;margin:0 auto;padding:48px 56px;min-height:1123px;display:flex;flex-direction:column;}

    /* ── HEADER ── */
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;}
    .logo{font-size:30px;font-weight:800;letter-spacing:-1px;color:#6366f1;}
    .logo span{color:#0f172a;}
    .logo-sub{font-size:11px;color:#94a3b8;margin-top:3px;letter-spacing:0.5px;}
    .invoice-meta{text-align:right;}
    .invoice-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;}
    .invoice-id{font-size:26px;font-weight:800;color:#0f172a;margin-top:4px;letter-spacing:-0.5px;}
    .invoice-date{font-size:12px;color:#64748b;margin-top:4px;}
    .status-badge{display:inline-block;margin-top:8px;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;}
    .badge-cod{background:#fef3c7;color:#d97706;border:1px solid #fde68a;}
    .badge-paid{background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;}

    /* ── DIVIDER ── */
    .divider{height:2px;background:linear-gradient(90deg,#6366f1,#a5b4fc,transparent);margin:0 0 36px;}

    /* ── INFO GRID ── */
    .info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:36px;}
    .info-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;}
    .info-box-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:10px;}
    .info-box p{font-size:12.5px;color:#334155;line-height:1.7;}
    .info-box p strong{color:#0f172a;font-weight:600;}

    /* ── TABLE ── */
    .table-wrap{margin-bottom:28px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;}
    table{width:100%;border-collapse:collapse;}
    thead tr{background:linear-gradient(135deg,#6366f1,#4f46e5);}
    th{padding:13px 16px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;}
    th:not(:first-child){text-align:right;}
    th:nth-child(2){text-align:center;}
    tbody tr:last-child td{border-bottom:none;}
    tbody tr:nth-child(even){background:#f8fafc;}

    /* ── TOTALS ── */
    .totals-wrap{display:flex;justify-content:flex-end;margin-bottom:36px;}
    .totals{width:280px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;}
    .totals-row{display:flex;justify-content:space-between;padding:10px 18px;font-size:13px;color:#475569;border-bottom:1px solid #e2e8f0;}
    .totals-row:last-child{border-bottom:none;}
    .totals-row.free{color:#16a34a;}
    .totals-row.cod-fee{color:#d97706;}
    .totals-row.discount{color:#16a34a;}
    .totals-total{display:flex;justify-content:space-between;padding:14px 18px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;font-size:15px;font-weight:800;}

    /* ── FOOTER ── */
    .footer{margin-top:auto;padding-top:28px;border-top:1px solid #e2e8f0;}
    .footer-inner{display:flex;justify-content:space-between;align-items:center;}
    .footer-brand{font-size:16px;font-weight:800;color:#6366f1;}
    .footer-brand span{color:#0f172a;}
    .footer-note{font-size:11px;color:#94a3b8;text-align:right;line-height:1.6;}
    .footer-note a{color:#6366f1;}
    .thank-you{text-align:center;margin-bottom:20px;padding:16px;background:linear-gradient(135deg,#eff6ff,#f0fdf4);border-radius:12px;border:1px solid #dbeafe;}
    .thank-you p{font-size:13px;color:#1e40af;font-weight:600;}
    .thank-you span{color:#15803d;}

    @media print{
      body{margin:0;}
      .page{padding:32px 40px;}
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div>
      <div class="logo">Nexus<span>Good</span></div>
      <div class="logo-sub">nexusgood.com &nbsp;|&nbsp; support@nexusgood.com</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">Tax Invoice</div>
      <div class="invoice-id">#${order._id?.slice(-8).toUpperCase()}</div>
      <div class="invoice-date">
        Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
      <span class="status-badge ${isCOD ? 'badge-cod' : 'badge-paid'}">
        ${isCOD ? '⏳ Pay on Delivery' : '✓ Paid Online'}
      </span>
    </div>
  </div>

  <div class="divider"></div>

  <!-- Info Grid -->
  <div class="info-grid">
    <div class="info-box">
      <div class="info-box-label">Bill To</div>
      <p><strong>${order.user?.name || ''}</strong></p>
      <p>${order.user?.email || ''}</p>
      <p style="margin-top:6px;">${order.shippingAddress?.address || ''}</p>
      <p>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.pincode || ''}</p>
      <p>📞 ${order.shippingAddress?.phone || ''}</p>
    </div>
    <div class="info-box">
      <div class="info-box-label">Ship To</div>
      <p><strong>${order.shippingAddress?.address || ''}</strong></p>
      <p>${order.shippingAddress?.city || ''}</p>
      <p>${order.shippingAddress?.pincode || ''}</p>
      <p style="margin-top:6px;">Est. Delivery: <strong>${estimatedDelivery}</strong></p>
    </div>
    <div class="info-box">
      <div class="info-box-label">Payment Info</div>
      <p>Method: <strong>${isCOD ? 'Cash on Delivery' : 'Online Payment'}</strong></p>
      <p>Status: <strong style="color:${isCOD ? '#d97706' : '#16a34a'}">${isCOD ? 'Pending (COD)' : 'Paid'}</strong></p>
      <p style="margin-top:6px;">Order Status: <strong style="text-transform:capitalize">${order.status}</strong></p>
      <p>Order Date: <strong>${new Date(order.createdAt).toLocaleDateString('en-IN')}</strong></p>
    </div>
  </div>

  <!-- Items Table -->
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th style="width:50%">Item Description</th>
          <th style="width:15%;text-align:center">Qty</th>
          <th style="width:17.5%;text-align:right">Unit Price</th>
          <th style="width:17.5%;text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
  </div>

  <!-- Totals -->
  <div class="totals-wrap">
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>₹${subtotal.toLocaleString('en-IN')}</span>
      </div>
      <div class="totals-row free">
        <span>Shipping</span>
        <span>FREE</span>
      </div>
      ${order.discount > 0 ? `
      <div class="totals-row discount">
        <span>Discount</span>
        <span>−₹${order.discount.toLocaleString('en-IN')}</span>
      </div>` : ''}
      ${codCharge > 0 ? `
      <div class="totals-row cod-fee">
        <span>COD Handling Fee</span>
        <span>+₹${codCharge}</span>
      </div>` : ''}
      <div class="totals-total">
        <span>${isCOD ? 'Amount Payable' : 'Total Paid'}</span>
        <span>₹${order.totalAmount?.toLocaleString('en-IN')}</span>
      </div>
    </div>
  </div>

  <!-- Thank you -->
  <div class="thank-you">
    <p>🎉 Thank you for shopping with <strong>NexusGood</strong>! <span>Your order is confirmed and being processed.</span></p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-inner">
      <div class="footer-brand">Nexus<span>Good</span></div>
      <div class="footer-note">
        This is a computer-generated invoice and does not require a signature.<br/>
        For support: <a>support@nexusgood.com</a> &nbsp;|&nbsp; nexusgood.com
      </div>
    </div>
  </div>

</div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=1000');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const isCOD = order.paymentMethod === 'COD';
  const subtotal = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const codCharge = order.codCharge || 0;
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#030712] pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">

        {/* ── Success Banner ── */}
        <div className="bg-[#0f172a] border border-white/[0.07] rounded-3xl p-8 text-center space-y-5">
          <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={42} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-outfit">Order Confirmed!</h1>
            <p className="text-slate-400 mt-1.5 text-sm">
              {isCOD
                ? 'Your order is placed. Pay cash when it arrives at your door.'
                : 'Payment successful. Your order is being processed.'}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            <div className="text-center">
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Order ID</p>
              <p className="font-mono font-bold text-white text-sm mt-1">#{order._id?.slice(-8).toUpperCase()}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Payment</p>
              <div className={`flex items-center gap-1.5 mt-1 font-bold text-sm ${isCOD ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isCOD ? <Banknote size={14} /> : <CreditCard size={14} />}
                {isCOD ? 'Cash on Delivery' : 'Paid Online'}
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Amount</p>
              <p className="font-bold text-white text-sm mt-1">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Est. Delivery</p>
              <div className="flex items-center gap-1.5 mt-1 font-bold text-sm text-white">
                <Truck size={14} className="text-indigo-400" />
                {estimatedDelivery}
              </div>
            </div>
          </div>
        </div>

        {/* ── Invoice Preview Card ── */}
        <div className="bg-[#0f172a] border border-white/[0.07] rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-indigo-400" />
              <h2 className="font-bold text-white text-sm">Invoice / Receipt</h2>
            </div>
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all">
              <Printer size={14} /> Print Invoice
            </button>
          </div>

          {/* Preview */}
          <div className="p-6 space-y-5">
            {/* Header row */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xl font-bold text-indigo-400">Nexus<span className="text-white">Good</span></p>
                <p className="text-xs text-slate-500 mt-0.5">nexusgood.com</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tax Invoice</p>
                <p className="text-lg font-bold text-white mt-0.5">#{order._id?.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <span className={`inline-block mt-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${isCOD ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {isCOD ? '⏳ Pay on Delivery' : '✓ Paid'}
                </span>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-indigo-500/50 via-indigo-500/20 to-transparent" />

            {/* Address grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Bill To',
                  lines: [
                    <span className="font-semibold text-white">{order.user?.name}</span>,
                    order.user?.email,
                    `${order.shippingAddress?.address}, ${order.shippingAddress?.city}`,
                    order.shippingAddress?.pincode,
                    `📞 ${order.shippingAddress?.phone}`,
                  ]
                },
                {
                  label: 'Ship To',
                  lines: [
                    order.shippingAddress?.address,
                    order.shippingAddress?.city,
                    order.shippingAddress?.pincode,
                    <span className="text-indigo-300">Est: {estimatedDelivery}</span>,
                  ]
                },
                {
                  label: 'Payment',
                  lines: [
                    <span>Method: <span className="text-white font-semibold">{isCOD ? 'COD' : 'Online'}</span></span>,
                    <span>Status: <span className={isCOD ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>{isCOD ? 'Pending' : 'Paid'}</span></span>,
                    <span>Order: <span className="text-white font-semibold capitalize">{order.status}</span></span>,
                  ]
                }
              ].map(({ label, lines }) => (
                <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                  <div className="space-y-0.5">
                    {lines.map((l, i) => (
                      <p key={i} className="text-xs text-slate-400">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Items table */}
            <div className="rounded-xl overflow-hidden border border-white/[0.06]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-indigo-600/20 text-left">
                    <th className="px-4 py-3 font-bold text-slate-300 uppercase tracking-wider">Item</th>
                    <th className="px-4 py-3 font-bold text-slate-300 uppercase tracking-wider text-center">Qty</th>
                    <th className="px-4 py-3 font-bold text-slate-300 uppercase tracking-wider text-right">Price</th>
                    <th className="px-4 py-3 font-bold text-slate-300 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 overflow-hidden flex-shrink-0">
                            {item.product?.images?.[0]?.url
                              ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-slate-600"><Package size={10} /></div>
                            }
                          </div>
                          <span className="font-medium text-white">{item.product?.name || 'Product'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-400">₹{item.price?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right font-bold text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400 py-1 border-b border-white/[0.05]">
                  <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.05]">
                  <span className="text-slate-400">Shipping</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between py-1 border-b border-white/[0.05]">
                    <span className="text-emerald-400">Discount</span>
                    <span className="text-emerald-400 font-semibold">−₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {codCharge > 0 && (
                  <div className="flex justify-between py-1 border-b border-white/[0.05]">
                    <span className="text-amber-400">COD Fee</span>
                    <span className="text-amber-400 font-semibold">+₹{codCharge}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white text-base pt-1 bg-indigo-600/10 px-3 py-2.5 rounded-xl border border-indigo-500/20">
                  <span>{isCOD ? 'Pay on Delivery' : 'Total Paid'}</span>
                  <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-1">
              <p className="text-xs text-slate-600">
                Thank you for shopping with <span className="text-indigo-400 font-semibold">NexusGood</span> · support@nexusgood.com
              </p>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/orders"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-white transition-all">
            <Clock size={16} /> Track My Orders
          </Link>
          <Link to="/products"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-600/20">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}
