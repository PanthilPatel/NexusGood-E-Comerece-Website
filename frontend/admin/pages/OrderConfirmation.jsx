import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/helpers';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 skeleton rounded-full mx-auto mb-4" />
        <div className="h-6 skeleton w-48 mx-auto mb-2" />
        <div className="h-4 skeleton w-32 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Order Confirmed!</h1>
        <p className="text-dark-500">Thank you for shopping with ShopElite</p>
      </div>

      {order && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-100 dark:border-dark-700">
            <div>
              <p className="text-sm text-dark-500">Order ID</p>
              <p className="font-mono text-sm font-semibold text-dark-900 dark:text-white">#{order._id?.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-dark-500">Estimated Delivery</p>
              <p className="text-sm font-semibold text-dark-900 dark:text-white">
                {formatDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000))}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3 mb-6">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <img
                  src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/60'}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-900 dark:text-white truncate">
                    {item.product?.name || 'Product'}
                  </p>
                  <p className="text-xs text-dark-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-dark-50 dark:bg-dark-800/50 rounded-xl p-4 space-y-2 text-sm">
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-dark-900 dark:text-white">
              <span>Total Paid</span>
              <span className="text-lg">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Link to="/orders" className="btn-outline flex-1 !py-3">
              <Package className="w-4 h-4 mr-2" /> Track Order
            </Link>
            <Link to="/products" className="btn-primary flex-1 !py-3">
              Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
