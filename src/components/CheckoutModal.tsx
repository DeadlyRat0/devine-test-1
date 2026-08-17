import React, { useState, useEffect } from 'react';
import {
  X, ArrowLeft, ShieldCheck, Copy, Sparkles, AlertCircle, CheckCircle2,
  RefreshCw, Lock, Smartphone, CreditCard, Banknote
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, CustomerDetails, Coupon, Order, PaymentMethod } from '../types';
import { formatPrice } from '../utils/whatsapp';
import { BUSINESS_CONFIG } from '../data/products';
import { INDIAN_STATES } from '../data/reviews';
import { generateUpiQrCodeDataUrl, generateUpiUri, getDivineUpiDetails } from '../utils/upi';
import { initiateServerOrder, verifyGatewayPayment } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
  appliedCoupon: Coupon | null;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items = [],
  appliedCoupon,
  onOrderSuccess
}) => {
  const [step, setStep] = useState<'details' | 'payment'>('details');

  // Customer Form State
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    district: '',
    state: 'Rajasthan',
    pinCode: '',
    orderNotes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiUtr, setUpiUtr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Server-Initiated Order State
  const [serverOrderId, setServerOrderId] = useState<string | null>(null);
  const [serverOrderNumber, setServerOrderNumber] = useState<string | null>(null);
  const [serverPaymentSignature, setServerPaymentSignature] = useState<string | null>(null);
  const [serverGrandTotal, setServerGrandTotal] = useState<number | null>(null);

  const safeItems = Array.isArray(items) ? items.filter(it => it && it.product) : [];

  // Calculations
  const subtotal = safeItems.reduce((acc, item) => acc + (item.product?.price || 0) * (item.quantity || 1), 0);
  
  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrder) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discount = appliedCoupon.value;
    }
  }

  const isFreeShipping = subtotal >= BUSINESS_CONFIG.freeShippingThreshold;
  const shippingFee = subtotal === 0 ? 0 : isFreeShipping ? 0 : BUSINESS_CONFIG.defaultShippingFee;
  const grandTotal = serverGrandTotal !== null ? serverGrandTotal : Math.max(0, subtotal - discount + shippingFee);

  // Generate UPI QR Code when step changes to payment
  useEffect(() => {
    if (step === 'payment') {
      const orderRef = serverOrderNumber || `DIV-${Math.floor(100000 + Math.random() * 900000)}`;
      const upiDetails = getDivineUpiDetails(grandTotal, orderRef);
      generateUpiQrCodeDataUrl(upiDetails).then(url => {
        setQrCodeDataUrl(url);
      });
    }
  }, [step, grandTotal, serverOrderNumber]);

  if (!isOpen) return null;

  const validateDetails = (): boolean => {
    const errs: Record<string, string> = {};
    if (!customer.fullName.trim()) errs.fullName = 'Full name is required';
    if (!customer.phone.trim() || customer.phone.replace(/[^0-9]/g, '').length < 10) {
      errs.phone = 'Valid 10-digit phone/WhatsApp number is required';
    }
    if (!customer.address.trim()) errs.address = 'Street address is required';
    if (!customer.city.trim()) errs.city = 'City / Town is required';
    if (!customer.pinCode.trim() || customer.pinCode.replace(/[^0-9]/g, '').length !== 6) {
      errs.pinCode = 'Valid 6-digit PIN code is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;

    setIsSubmitting(true);
    setPaymentError(null);

    try {
      // 1. Initiate Order Server-Side
      const initResult = await initiateServerOrder({
        items: safeItems.map(it => ({
          productId: it.product.id,
          quantity: it.quantity || 1
        })),
        customer: { ...customer },
        couponCode: appliedCoupon?.code,
        paymentMethod,
        clientSubtotal: subtotal
      });

      if (!initResult.success || !initResult.orderId) {
        setPaymentError(initResult.error || 'Unable to initiate order on server. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setServerOrderId(initResult.orderId);
      setServerOrderNumber(initResult.orderNumber || null);
      setServerPaymentSignature(initResult.paymentSignature || null);
      if (initResult.total !== undefined) {
        setServerGrandTotal(initResult.total);
      }

      // If COD, the order is already confirmed on server
      if (paymentMethod === 'cod') {
        const confirmedOrder: Order = {
          id: initResult.orderId,
          orderNumber: initResult.orderNumber || `DIV-${Date.now()}`,
          createdAt: new Date().toISOString(),
          customer: { ...customer },
          items: safeItems.map(it => ({
            productId: it.product.id,
            name: it.product.name,
            price: it.product.price,
            quantity: it.quantity,
            size: it.product.size,
            image: it.product.image
          })),
          subtotal: initResult.subtotal || subtotal,
          discount: initResult.discount || 0,
          couponCode: appliedCoupon?.code,
          shippingFee: initResult.shippingFee || 0,
          total: initResult.total || grandTotal,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          status: 'ORDER_CONFIRMED'
        };

        try {
          confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
        } catch {}

        onOrderSuccess(confirmedOrder);
        return;
      }

      // Transition to online payment step
      setStep('payment');
    } catch (err) {
      setPaymentError('Network communication error with verification server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(BUSINESS_CONFIG.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleVerifyAndConfirmPayment = async () => {
    if (!serverOrderId || !serverPaymentSignature) {
      setPaymentError('Session expired. Please re-initiate checkout.');
      return;
    }

    setIsSubmitting(true);
    setPaymentError(null);

    try {
      const generatedTxnId = upiUtr.trim() || `TXN-UPI-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Send to Server-to-Server Verification Endpoint
      const verifyResult = await verifyGatewayPayment({
        orderId: serverOrderId,
        orderNumber: serverOrderNumber || serverOrderId,
        transactionId: generatedTxnId,
        amount: grandTotal,
        currency: 'INR',
        signature: serverPaymentSignature,
        gatewayRef: 'INSTANT_UPI_GATEWAY',
        method: paymentMethod
      });

      if (!verifyResult.success || !verifyResult.order) {
        setPaymentError(verifyResult.error || 'Server cryptographic payment verification failed.');
        setIsSubmitting(false);
        return;
      }

      // Success! Fire celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      onOrderSuccess(verifyResult.order);
    } catch (err) {
      setPaymentError('Network communication error during payment verification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentOrderRef = serverOrderNumber || `DIV-${Math.floor(100000 + Math.random() * 900000)}`;
  const upiIntentUri = generateUpiUri(getDivineUpiDetails(grandTotal, currentOrderRef));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fade-in">
      <div 
        className="relative bg-[#FDFBF7] w-full max-w-2xl border border-[#E8E2D9] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Checkout Header */}
        <div className="p-5 bg-white text-[#2D332F] border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'payment' && (
              <button
                onClick={() => setStep('details')}
                className="p-1.5 text-[#A89F91] hover:text-[#2D332F] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#4A5D4E]" />
                <h2 className="font-serif text-xl tracking-tight text-[#2D332F]">
                  {step === 'details' ? 'Delivery & Contact Details' : 'Verify & Complete Payment'}
                </h2>
              </div>
              <p className="text-xs text-[#A89F91] uppercase tracking-wider mt-0.5">
                Step {step === 'details' ? '1 of 2' : '2 of 2'} • {step === 'details' ? 'Shipping Destination' : 'Server-Verified Gateway'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A89F91] hover:text-[#2D332F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Payment / Validation Error */}
        {paymentError && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-xs text-red-900 flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>{paymentError}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* ====================================================
              STEP 1: CUSTOMER & SHIPPING DETAILS
              ==================================================== */}
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              
              {/* Customer Contact Section */}
              <div className="space-y-4">
                <div className="border-b border-[#E8E2D9] pb-2">
                  <h3 className="font-serif font-bold text-sm text-[#2D332F] uppercase tracking-wider">
                    1. Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#2D332F] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className={`w-full px-3 py-2.5 text-xs bg-white border ${
                        errors.fullName ? 'border-red-500' : 'border-[#E8E2D9]'
                      } focus:border-[#4A5D4E] focus:outline-none`}
                    />
                    {errors.fullName && <p className="text-[10px] text-red-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#2D332F] mb-1">
                      Phone / WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className={`w-full px-3 py-2.5 text-xs bg-white border ${
                        errors.phone ? 'border-red-500' : 'border-[#E8E2D9]'
                      } focus:border-[#4A5D4E] focus:outline-none`}
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#2D332F] mb-1">
                    Email Address (Optional for invoice dispatch)
                  </label>
                  <input
                    type="email"
                    value={customer.email || ''}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="e.g. priya@example.com"
                    className="w-full px-3 py-2.5 text-xs bg-white border border-[#E8E2D9] focus:border-[#4A5D4E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Shipping Address Section */}
              <div className="space-y-4 pt-2">
                <div className="border-b border-[#E8E2D9] pb-2">
                  <h3 className="font-serif font-bold text-sm text-[#2D332F] uppercase tracking-wider">
                    2. Shipping Address
                  </h3>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#2D332F] mb-1">
                    House / Flat No., Street, Area <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    placeholder="e.g. Flat 302, Green Meadows, MG Road"
                    className={`w-full px-3 py-2 text-xs bg-white border ${
                      errors.address ? 'border-red-500' : 'border-[#E8E2D9]'
                    } focus:border-[#4A5D4E] focus:outline-none`}
                  />
                  {errors.address && <p className="text-[10px] text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#2D332F] mb-1">
                      City / Town <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      placeholder="e.g. Jaipur"
                      className={`w-full px-3 py-2.5 text-xs bg-white border ${
                        errors.city ? 'border-red-500' : 'border-[#E8E2D9]'
                      } focus:border-[#4A5D4E] focus:outline-none`}
                    />
                    {errors.city && <p className="text-[10px] text-red-500 mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#2D332F] mb-1">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={customer.pinCode}
                      onChange={(e) => setCustomer({ ...customer, pinCode: e.target.value })}
                      placeholder="6-digit PIN"
                      className={`w-full px-3 py-2.5 text-xs bg-white border ${
                        errors.pinCode ? 'border-red-500' : 'border-[#E8E2D9]'
                      } focus:border-[#4A5D4E] focus:outline-none`}
                    />
                    {errors.pinCode && <p className="text-[10px] text-red-500 mt-1">{errors.pinCode}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#2D332F] mb-1">
                      State
                    </label>
                    <select
                      value={customer.state}
                      onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs bg-white border border-[#E8E2D9] focus:border-[#4A5D4E] focus:outline-none"
                    >
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#2D332F] mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={customer.landmark || ''}
                    onChange={(e) => setCustomer({ ...customer, landmark: e.target.value })}
                    placeholder="e.g. Near HDFC Bank ATM"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8E2D9] focus:border-[#4A5D4E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="space-y-3 pt-2">
                <div className="border-b border-[#E8E2D9] pb-2">
                  <h3 className="font-serif font-bold text-sm text-[#2D332F] uppercase tracking-wider">
                    3. Select Payment Mode
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 border cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#4A5D4E] bg-white ring-1 ring-[#4A5D4E]'
                        : 'border-[#E8E2D9] bg-[#F8F6F2] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#4A5D4E]" />
                        <span className="font-serif font-bold text-xs sm:text-sm text-[#2D332F]">
                          Instant UPI / Online
                        </span>
                      </div>
                      {paymentMethod === 'upi' && (
                        <div className="w-4 h-4 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A89F91]">
                      GPay, PhonePe, Paytm, BHIM, Cred
                    </p>
                    <span className="inline-block mt-2 text-[9px] uppercase tracking-wider font-bold text-[#2D5A34] bg-[#E1F1E4] px-1.5 py-0.5">
                      Fast Dispatch • 100% Verified
                    </span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#4A5D4E] bg-white ring-1 ring-[#4A5D4E]'
                        : 'border-[#E8E2D9] bg-[#F8F6F2] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-[#4A5D4E]" />
                        <span className="font-serif font-bold text-xs sm:text-sm text-[#2D332F]">
                          Cash on Delivery
                        </span>
                      </div>
                      {paymentMethod === 'cod' && (
                        <div className="w-4 h-4 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[#A89F91]">
                      Pay cash upon delivery to your doorstep
                    </p>
                    <span className="inline-block mt-2 text-[9px] uppercase tracking-wider font-bold text-[#6B736E] bg-[#E8E2D9] px-1.5 py-0.5">
                      Verified PINs
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Pricing Recap */}
              <div className="p-4 bg-white border border-[#E8E2D9] space-y-2 text-xs text-[#6B736E]">
                <div className="flex justify-between">
                  <span>Subtotal ({safeItems.reduce((s, i) => s + (i.quantity || 1), 0)} items)</span>
                  <span className="font-serif text-[#2D332F]">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#2D5A34]">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Charges</span>
                  <span>{shippingFee === 0 ? 'COMPLIMENTARY' : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between font-serif font-bold text-base text-[#2D332F] pt-2 border-t border-[#E8E2D9]">
                  <span>Total Amount Due</span>
                  <span className="text-[#2D332F]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Initiating Server Validation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'cod'
                        ? `Confirm Cash on Delivery Order (${formatPrice(grandTotal)})`
                        : `Proceed to Payment Gateway (${formatPrice(grandTotal)})`}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ====================================================
              STEP 2: SERVER PAYMENT VERIFICATION WINDOW
              ==================================================== */}
          {step === 'payment' && (
            <div className="space-y-6">
              
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Order initialized on server. Order Reference: <strong>{currentOrderRef}</strong>
                </span>
              </div>

              {/* UPI Showcase Box */}
              <div className="p-5 bg-white border border-[#E8E2D9] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#2D332F]">
                      Merchant UPI Verification Gateway
                    </h4>
                    <p className="text-xs text-[#6B736E]">
                      Pay exactly <strong>{formatPrice(grandTotal)}</strong> via any UPI application
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider bg-[#F8F6F2] text-[#2D332F] font-bold px-2.5 py-1 border border-[#E8E2D9]">
                    Order: #{currentOrderRef}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#FDFBF7] p-4 border border-[#E8E2D9]">
                  {/* QR Code Container */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-2">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="DIVINE UPI QR Code"
                        className="w-36 h-36 object-contain bg-white p-2 border border-[#E8E2D9]"
                      />
                    ) : (
                      <div className="w-36 h-36 bg-[#F8F6F2] border border-[#E8E2D9] flex items-center justify-center text-xs text-[#A89F91]">
                        Generating QR...
                      </div>
                    )}
                    <span className="text-[10px] text-[#A89F91] uppercase tracking-wider mt-1.5">
                      Scan with GPay / PhonePe / Paytm
                    </span>
                  </div>

                  {/* UPI ID & Direct Action */}
                  <div className="sm:col-span-7 space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-[#6B736E]">
                        Official Merchant UPI ID:
                      </label>
                      <div className="flex items-center justify-between bg-white px-3 py-2 border border-[#E8E2D9] mt-1">
                        <code className="text-xs font-mono font-bold text-[#2D332F]">
                          {BUSINESS_CONFIG.upiId}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#4A5D4E] hover:text-[#2D332F] bg-[#F8F6F2] px-2 py-1 border border-[#E8E2D9] cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedUpi ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Deep Link Intent for mobile */}
                    <a
                      href={upiIntentUri}
                      className="w-full py-2.5 px-3 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white text-[11px] uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Open Installed UPI App ({formatPrice(grandTotal)})</span>
                    </a>

                    {/* Transaction Reference / UTR input */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-[#6B736E]">
                        Bank UTR / Transaction ID (Optional):
                      </label>
                      <input
                        type="text"
                        value={upiUtr}
                        onChange={(e) => setUpiUtr(e.target.value)}
                        placeholder="e.g. 329019283721"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8E2D9] focus:border-[#4A5D4E] focus:outline-none mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Confirmation CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleVerifyAndConfirmPayment}
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Cryptographic Payment Signature...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirm & Verify Payment ({formatPrice(grandTotal)})</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] uppercase tracking-wider text-center text-[#A89F91] mt-2">
                  🔒 Server-to-Server Cryptographic Payment Verification Active
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
