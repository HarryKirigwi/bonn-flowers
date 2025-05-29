'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Responsive modal: update OrderDetailsModal
function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-2xl p-2 sm:p-8 relative border-2 border-emerald-200 mx-2"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-emerald-700 hover:text-pink-600 text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 mb-4">Order #{order.orderNumber || order.id}</h2>
        <div className="mb-4 text-gray-700 text-sm sm:text-base">
          <div><span className="font-semibold">Status:</span> {order.status}</div>
          <div><span className="font-semibold">Placed:</span> {formatDate(order.createdAt)}</div>
          <div><span className="font-semibold">Total:</span> KES {order.total.toLocaleString()}</div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold text-emerald-700 mb-2">Shipping Address</h3>
          <div className="text-gray-700 text-xs sm:text-sm">
            {order.shippingAddress?.name}<br />
            {order.shippingAddress?.address}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.county}<br />
            {order.shippingAddress?.postalCode && <>Postal Code: {order.shippingAddress.postalCode}<br /></>}
            {order.shippingAddress?.phone && <>Phone: {order.shippingAddress.phone}<br /></>}
            {order.shippingAddress?.email && <>Email: {order.shippingAddress.email}<br /></>}
            {order.shippingAddress?.specialInstructions && <><span className="font-semibold">Instructions:</span> {order.shippingAddress.specialInstructions}<br /></>}
            {order.shippingAddress?.preferredDeliveryTime && <><span className="font-semibold">Preferred Time:</span> {order.shippingAddress.preferredDeliveryTime}<br /></>}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-emerald-700 mb-2">Items</h3>
          <div className="divide-y divide-gray-200">
            {order.orderItems.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 py-3">
                <img
                  src={item.product?.imageUrl || item.product?.image || '/images/products/placeholder.png'}
                  alt={item.product?.name}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm sm:text-base">{item.product?.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</div>
                </div>
                <div className="text-pink-700 font-bold text-sm sm:text-base">KES {(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary px-6 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrdersPage() {
  const { fetchUserOrders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null); // Reset error before fetching
    fetchUserOrders()
      .then(res => {
        console.log('fetchUserOrders response:', res);
        if (mounted) {
          if (Array.isArray(res)) {
            setOrders(res);
          } else if (res && res.success) {
            setOrders(res.orders || []);
          } else {
            setError(res?.error || 'Failed to fetch orders');
          }
        }
      })
      .catch(err => {
        console.log('fetchUserOrders error:', err);
        if (mounted) {
          setError('Failed to fetch orders');
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [fetchUserOrders]);

  // Responsive order card for mobile
  const OrderCard = ({ order, onDetails }) => (
    <div className="bg-white/80 rounded-2xl shadow p-4 mb-4 flex flex-col gap-2 sm:hidden">
      <div className="flex justify-between items-center">
        <div className="font-mono font-bold text-emerald-800">#{order.orderNumber || order.id}</div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Delivered' ? 'bg-emerald-500/80 text-white' : 'bg-yellow-400/80 text-emerald-900'}`}>{order.status}</span>
      </div>
      <div className="text-gray-700 text-sm">{formatDate(order.createdAt)}</div>
      <div className="text-pink-700 font-bold">KES {order.total.toLocaleString()}</div>
      <button
        onClick={() => onDetails(order)}
        className="btn-primary w-full mt-2 py-2 text-sm"
      >
        More Details
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 py-8 sm:py-16 px-2 sm:px-4">
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-2 sm:p-8 border border-white/20 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-100 mb-6 sm:mb-8 text-center">My Orders</h1>
        {isLoading ? (
          <div className="text-center text-emerald-200 py-12">Loading orders...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-emerald-200 py-12">You have no orders yet.</div>
        ) : (
          <>
            {/* Mobile: Card layout */}
            <div className="sm:hidden">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} onDetails={setSelectedOrder} />
              ))}
            </div>
            {/* Desktop: Table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full bg-white/80 rounded-2xl overflow-hidden text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <th className="py-3 px-2 sm:px-4 text-left">Order #</th>
                    <th className="py-3 px-2 sm:px-4 text-left">Date</th>
                    <th className="py-3 px-2 sm:px-4 text-left">Status</th>
                    <th className="py-3 px-2 sm:px-4 text-left">Total</th>
                    <th className="py-3 px-2 sm:px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-emerald-100/20 hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3 px-2 sm:px-4 font-mono font-bold text-emerald-800">{order.orderNumber || order.id}</td>
                      <td className="py-3 px-2 sm:px-4 text-gray-700">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-2 sm:px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Delivered' ? 'bg-emerald-500/80 text-white' : 'bg-yellow-400/80 text-emerald-900'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-pink-700 font-bold">KES {order.total.toLocaleString()}</td>
                      <td className="py-3 px-2 sm:px-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="btn-primary px-4 py-2 rounded-full text-xs"
                        >
                          More Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}