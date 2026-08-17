import React, { useState, useEffect } from 'react';
import { X, Search, Truck, AlertCircle, MapPin, Phone, RefreshCw } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { findOrderByNumberOrPhone } from '../utils/storage';
import { trackOrderServer } from '../services/api';
import { formatPrice } from '../utils/whatsapp';
import { BUSINESS_CONFIG } from '../data/products';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [order, setOrder] = useState<any | null>(null);
  const [searched, setSearched] = useState(Boolean(initialQuery));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery && isOpen) {
      searchOrder(initialQuery);
    }
  }, [initialQuery, isOpen]);

  const searchOrder = async (searchQuery: string) => {
    const clean = searchQuery.trim();
    if (!clean) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Try server-side lookup
      const serverOrder = await trackOrderServer(clean);
      setOrder(serverOrder);
      setSearched(true);
    } catch {
      // 2. Fallback to local storage lookup
      const localOrder = findOrderByNumberOrPhone(clean);
      if (localOrder) {
        setOrder({
          orderNumber: localOrder.orderNumber,
          createdAt: localOrder.createdAt,
          status: localOrder.status,
          paymentStatus: localOrder.paymentStatus,
          paymentMethod: localOrder.paymentMethod,
          trackingNumber: localOrder.trackingNumber,
          customer: localOrder.customer || {
            fullName: 'Customer',
            address: '',
            city: '',
            state: '',
            pinCode: '',
            phone: ''
          },
          customerName: localOrder.customer?.fullName || 'Customer',
          city: localOrder.customer?.city || '',
          state: localOrder.customer?.state || '',
          total: localOrder.total,
          items: localOrder.items
        });
      } else {
        setOrder(null);
        setErrorMsg('No order found matching the provided details. Please check your order ID or mobile number.');
      }
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrder(query);
  };

  if (!isOpen) return null;

  const getStepStatus = (currentStatus: string, stepIndex: number) => {
    const statusMap: Record<string, number> = {
      new: 0,
      PENDING_PAYMENT: 0,
      confirmed: 1,
      ORDER_CONFIRMED: 1,
      PAYMENT_VERIFIED: 1,
      processing: 2,
      PROCESSING: 2,
      shipped: 3,
      SHIPPED: 3,
      delivered: 4,
      DELIVERED: 4,
      cancelled: -1,
      ORDER_CANCELLED: -1,
      PAYMENT_FAILED: -1
    };

    const currentRank = statusMap[currentStatus] ?? 1;
    if (currentStatus === 'cancelled' || currentStatus === 'ORDER_CANCELLED' || currentStatus === 'PAYMENT_FAILED') {
      return 'cancelled';
    }
    if (currentRank >= stepIndex) return 'completed';
    return 'pending';
  };

  const steps = [
    { title: 'Order Placed', desc: 'Order received & payment confirmed' },
    { title: 'Confirmed & Queued', desc: 'Fresh botanical batch allocated' },
    { title: 'Packed & Dispatched', desc: 'Quality checked and sealed in eco-pack' },
    { title: 'Shipped via Courier', desc: 'In transit with delivery partner' },
    { title: 'Delivered', desc: 'Safely handed over to you' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fade-in">
      <div 
        className="relative bg-[#FDFBF7] w-full max-w-2xl border border-[#E8E2D9] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#2D332F] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-[#A89F91]" />
            <h2 className="font-serif text-lg font-bold tracking-tight">Track Order Status</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#A89F91] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 text-left">
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#6B736E]">
              Order Number (e.g. DIV-849201) or Mobile Number:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F91]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="DIV-849201 or 9887777137"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F2] border border-[#E8E2D9] text-xs text-[#2D332F] placeholder-[#A89F91] focus:outline-none focus:border-[#4A5D4E] focus:bg-white uppercase font-sans"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Track
              </button>
            </div>
          </form>

          {/* Search Result */}
          {searched && !order && (
            <div className="p-6 bg-[#F8F6F2] border border-[#E8E2D9] text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-[#A89F91] mx-auto" />
              <h3 className="font-serif font-bold text-sm text-[#2D332F]">No Order Found</h3>
              <p className="text-xs text-[#6B736E] max-w-sm mx-auto">
                We couldn't find an active order matching "{query}". Please verify your Order ID or 10-digit mobile number, or chat with our WhatsApp team.
              </p>
            </div>
          )}

          {order && (
            <div className="space-y-6">
              {/* Order Status Badge & Meta */}
              <div className="p-4 bg-[#F8F6F2] border border-[#E8E2D9] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base font-bold text-[#2D332F]">
                      #{order.orderNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                      order.status === 'delivered' ? 'bg-[#E1F1E4] text-[#2D5A34]' :
                      order.status === 'shipped' ? 'bg-[#E1F1E4] text-[#2D5A34]' :
                      order.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                      'bg-[#FEF3C7] text-[#78350F]'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B736E] mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.items.length} items • {formatPrice(order.total)}
                  </p>
                </div>

                {order.trackingNumber && (
                  <div className="text-xs bg-white px-3 py-1.5 border border-[#E8E2D9] text-[#2D332F]">
                    <span className="text-[#A89F91]">Tracking AWB: </span>
                    <strong className="font-mono text-[#4A5D4E]">{order.trackingNumber}</strong>
                  </div>
                )}
              </div>

              {/* Progress Timeline */}
              {order.status !== 'cancelled' && (
                <div className="p-4 bg-white border border-[#E8E2D9] space-y-4">
                  <h4 className="font-serif font-bold text-sm text-[#2D332F]">
                    Shipment Timeline:
                  </h4>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E2D9]">
                    {steps.map((step, idx) => {
                      const state = getStepStatus(order.status, idx);
                      const isCompleted = state === 'completed';

                      return (
                        <div key={idx} className="relative flex items-start gap-3">
                          <div
                            className={`absolute -left-6 top-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold ${
                              isCompleted
                                ? 'bg-[#4A5D4E] text-white'
                                : 'bg-[#E8E2D9] text-[#A89F91]'
                            }`}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </div>

                          <div className="text-xs">
                            <p className={`font-bold ${isCompleted ? 'text-[#2D332F]' : 'text-[#A89F91]'}`}>
                              {step.title}
                            </p>
                            <p className="text-[#6B736E] text-[11px] mt-0.5">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items & Delivery summary */}
              <div className="p-4 bg-[#F8F6F2] border border-[#E8E2D9] space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#2D332F]">
                  <MapPin className="w-4 h-4 text-[#4A5D4E]" />
                  <span>Delivery Destination</span>
                </div>
                <p className="text-[#6B736E] leading-relaxed">
                  <strong className="text-[#2D332F]">
                    {order.customer?.fullName || order.customerName || 'Valued Customer'}
                  </strong>
                  {order.customer?.address ? ` • ${order.customer.address}, ` : ' • '}
                  {order.customer?.city || order.city || ''}, {order.customer?.state || order.state || ''}
                  {order.customer?.pinCode ? ` - ${order.customer.pinCode}` : ''}
                  {order.customer?.phone ? ` (📞 ${order.customer.phone})` : ''}
                </p>

                <div className="pt-2 border-t border-[#E8E2D9] space-y-1.5">
                  <div className="font-semibold text-[#2D332F]">Ordered Products:</div>
                  {order.items?.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-[#6B736E]">
                      <span>{it.name} ({it.size || 'Standard'}) × {it.quantity}</span>
                      <span className="font-semibold text-[#2D332F]">{it.price ? formatPrice(it.price * it.quantity) : ''}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp Support Button */}
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.whatsappInternational}?text=${encodeURIComponent(
                  `Hi DIVINE Herbal Cosmetics, I am inquiring about my Order #${order.orderNumber} placed for ${order.customer?.fullName || order.customerName || 'Customer'}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Chat on WhatsApp regarding Order</span>
              </a>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
