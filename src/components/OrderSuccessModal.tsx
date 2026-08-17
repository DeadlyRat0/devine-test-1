import React from 'react';
import { CheckCircle2, Phone, Printer, ArrowRight, ShieldCheck, MapPin, Package } from 'lucide-react';
import { Order } from '../types';
import { formatPrice, generateBusinessWhatsAppLink } from '../utils/whatsapp';
import { BUSINESS_CONFIG } from '../data/products';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
  onContinueShopping: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
  onContinueShopping
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const whatsappUrl = generateBusinessWhatsAppLink(order);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fade-in">
      <div 
        className="relative bg-[#FDFBF7] w-full max-w-2xl border border-[#E8E2D9] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#2D332F] text-[#FDFBF7] p-6 text-center relative border-b border-[#3C4A3F]">
          <div className="w-14 h-14 bg-[#4A5D4E] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
          </div>

          <span className="inline-block px-3 py-0.5 bg-[#4A5D4E]/40 text-[#E1F1E4] text-[10px] uppercase tracking-widest font-bold border border-[#4A5D4E]/60 mb-2">
            Order Confirmed
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl text-white">
            Thank you, {order.customer?.fullName || 'Valued Customer'}
          </h2>
          <p className="text-xs text-[#D5CDC0] mt-1 max-w-md mx-auto">
            Your handcrafted Ayurvedic parcel is confirmed and being prepared fresh.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-[#1F2421] px-4 py-1.5 border border-[#3C4A3F] text-xs font-mono text-[#E8E2D9]">
            <span className="text-[#A89F91]">Order ID:</span>
            <strong className="text-white font-bold text-sm tracking-wider">#{order.orderNumber}</strong>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 text-left">
          
          {/* Action: WhatsApp Notification Dispatch */}
          <div className="p-4 bg-[#F8F6F2] border border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4A5D4E] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#2D332F]">
                <p className="font-bold text-xs uppercase tracking-wider text-[#2D332F]">Direct WhatsApp Dispatch</p>
                <p className="text-[#6B736E] text-[11px]">Send your order summary to DIVINE WhatsApp (+91 {BUSINESS_CONFIG.phone})</p>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white text-[11px] uppercase tracking-wider font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <span>Open in WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Delivery & Payment Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Delivery Card */}
            <div className="p-4 bg-[#F8F6F2] border border-[#E8E2D9] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#2D332F] text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#4A5D4E]" />
                <span>Shipping Address</span>
              </div>
              <p className="font-semibold text-[#2D332F]">{order.customer?.fullName || 'Valued Customer'}</p>
              <p className="text-[#6B736E] leading-relaxed">
                {order.customer ? `${order.customer.address}, ${order.customer.city}, ${order.customer.district || ''}, ${order.customer.state} - ${order.customer.pinCode}` : 'Standard Shipping'}
              </p>
              {order.customer?.landmark && (
                <p className="text-[#A89F91] italic">Landmark: {order.customer.landmark}</p>
              )}
              {order.customer?.phone && (
                <p className="text-[#2D332F] font-medium pt-1">📞 {order.customer.phone}</p>
              )}
            </div>

            {/* Payment & Status Card */}
            <div className="p-4 bg-[#F8F6F2] border border-[#E8E2D9] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#2D332F] text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" />
                <span>Payment & Status</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E2D9]">
                <span className="text-[#6B736E]">Payment Method:</span>
                <span className="font-bold uppercase text-[#2D332F]">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8E2D9]">
                <span className="text-[#6B736E]">Payment Status:</span>
                <span className="font-bold uppercase text-[#2D5A34] bg-[#E1F1E4] px-2 py-0.5 rounded">
                  {order.paymentStatus}
                </span>
              </div>
              {order.upiUtr && (
                <div className="flex justify-between py-1 border-b border-[#E8E2D9]">
                  <span className="text-[#6B736E]">UPI Ref:</span>
                  <span className="font-mono text-[#2D332F]">{order.upiUtr}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-[#6B736E]">Order Status:</span>
                <span className="font-bold text-[#4A5D4E] uppercase">{order.status}</span>
              </div>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-[#2D332F] text-xs uppercase tracking-wider">
              <Package className="w-4 h-4 text-[#4A5D4E]" />
              <span>Items in this Order ({order.items.length})</span>
            </div>

            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-[#E8E2D9] text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover bg-[#F8F6F2] shrink-0 border border-[#E8E2D9]"
                    />
                    <div>
                      <p className="font-serif font-bold text-[#2D332F] text-xs sm:text-sm">{item.name}</p>
                      <p className="text-[#A89F91] text-[11px]">{item.size} • Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-[#2D332F] text-xs sm:text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="p-4 bg-[#F8F6F2] border border-[#E8E2D9] space-y-2 text-xs text-[#6B736E]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#2D332F]">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#2D5A34] font-medium">
                <span>Coupon Discount ({order.couponCode || 'PROMO'})</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-serif font-bold text-base text-[#2D332F] pt-2 border-t border-[#E8E2D9]">
              <span>Total Paid / Payable</span>
              <span className="text-[#2D332F]">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => onTrackOrder(order.orderNumber)}
              className="py-3 px-4 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Track Live Status</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-3 px-4 bg-white hover:bg-[#F8F6F2] text-[#2D332F] text-xs uppercase tracking-wider font-bold border border-[#E8E2D9] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#6B736E]" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onContinueShopping();
              }}
              className="py-3 px-4 bg-[#2D332F] hover:bg-[#1F2421] text-white text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue Shopping</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
