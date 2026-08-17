import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Sparkles, Truck } from 'lucide-react';
import { CartItem, Coupon } from '../types';
import { formatPrice } from '../utils/whatsapp';
import { BUSINESS_CONFIG } from '../data/products';
import { AVAILABLE_COUPONS } from '../data/reviews';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
  onProceedToCheckout: () => void;
  onExploreProducts: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  appliedCoupon,
  onApplyCoupon,
  onProceedToCheckout,
  onExploreProducts
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const safeItems = Array.isArray(items) ? items.filter(it => it && it.product) : [];
  const subtotal = safeItems.reduce((acc, item) => acc + (item.product?.price || 0) * (item.quantity || 1), 0);

  // Calculate coupon discount
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
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  const amountNeededForFreeShipping = Math.max(0, BUSINESS_CONFIG.freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / BUSINESS_CONFIG.freeShippingThreshold) * 100));

  const handleApplyCouponCode = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError('');
    if (!code) return;

    const matched = AVAILABLE_COUPONS.find(c => c.code.toUpperCase() === code);
    if (!matched) {
      setCouponError('Invalid coupon code. Try DIVINE10 or HERBAL50');
      return;
    }

    if (subtotal < matched.minOrder) {
      setCouponError(`Add items worth ${formatPrice(matched.minOrder - subtotal)} more to use this code`);
      return;
    }

    onApplyCoupon(matched);
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[#FDFBF7] h-full border-l border-[#E8E2D9] shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E8E2D9] flex items-center justify-between bg-white text-[#2D332F]">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-5 h-5 text-[#4A5D4E]" />
            <h2 className="font-serif text-xl tracking-tight">Shopping Bag</h2>
            <span className="bg-[#E1F1E4] text-[#2D5A34] text-[10px] uppercase tracking-wider px-2 py-0.5 font-bold rounded">
              {safeItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} Items
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A89F91] hover:text-[#2D332F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {subtotal > 0 && (
          <div className="bg-[#F8F6F2] px-5 py-3 border-b border-[#E8E2D9]">
            <div className="flex items-center justify-between text-xs text-[#2D332F] mb-1.5">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Truck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                {isFreeShipping ? (
                  <strong className="text-[#2D5A34]">Complimentary Shipping Unlocked!</strong>
                ) : (
                  <span>
                    Add <strong>{formatPrice(amountNeededForFreeShipping)}</strong> more for <strong>Free Shipping</strong>
                  </span>
                )}
              </span>
              <span className="font-serif font-bold text-xs text-[#4A5D4E]">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-[#E8E2D9] h-1 rounded-full overflow-hidden">
              <div
                className="bg-[#4A5D4E] h-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F8F6F2] border border-[#E8E2D9] flex items-center justify-center text-[#A89F91]">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-[#2D332F]">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-[#6B736E] mt-1 max-w-xs leading-relaxed">
                  Explore our small-batch Ayurvedic formulations for hair health and luminous botanical skin.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onExploreProducts();
                }}
                className="px-6 py-3 bg-[#4A5D4E] text-white text-xs uppercase tracking-widest font-bold hover:bg-[#3C4A3F] transition-colors cursor-pointer"
              >
                Shop Collection
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3.5 p-3.5 bg-white border border-[#E8E2D9] text-left"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover bg-[#F8F6F2] shrink-0 border border-[#E8E2D9]"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-xs sm:text-sm text-[#2D332F] truncate font-bold">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-[#A89F91]">
                    {item.product.size} • {formatPrice(item.product.price)}
                  </p>

                  <div className="flex items-center justify-between mt-2.5">
                    {/* Quantity controls */}
                    <div className="flex items-center bg-[#F8F6F2] border border-[#E8E2D9]">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 text-[#2D332F] font-bold text-xs hover:bg-[#E8E2D9] cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-serif font-bold text-xs text-[#2D332F] w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, Math.min(item.product.stockCount, item.quantity + 1))}
                        disabled={item.quantity >= item.product.stockCount}
                        className="w-6 h-6 text-[#2D332F] font-bold text-xs hover:bg-[#E8E2D9] disabled:opacity-30 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-serif font-bold text-sm text-[#2D332F]">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-[#A89F91] hover:text-rose-700 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Billing & Checkout Action */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#E8E2D9] bg-white space-y-3.5 text-left">
            
            {/* Coupon Code Section */}
            <div className="space-y-1.5">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 bg-[#E1F1E4] border border-[#2D5A34]/20 text-xs">
                  <div className="flex items-center gap-2 text-[#2D5A34]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <div>
                      <span className="font-bold">'{appliedCoupon.code}'</span> applied
                    </div>
                  </div>
                  <button
                    onClick={() => onApplyCoupon(null)}
                    className="text-[10px] uppercase tracking-wider font-bold text-rose-700 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A89F91]" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
                        placeholder="Coupon (e.g. DIVINE10)"
                        className="w-full pl-9 pr-3 py-2 bg-[#F8F6F2] border border-[#E8E2D9] text-xs uppercase font-medium focus:border-[#4A5D4E] focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleApplyCouponCode()}
                      className="px-4 py-2 bg-[#2D332F] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-black transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[10px] text-rose-600 mt-1">{couponError}</p>
                  )}
                  
                  {/* Quick available coupon chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {AVAILABLE_COUPONS.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => handleApplyCouponCode(c.code)}
                        className="text-[9px] uppercase tracking-wider bg-[#F8F6F2] hover:bg-[#E8E2D9] text-[#2D332F] font-bold px-2 py-0.5 border border-[#E8E2D9] transition-colors cursor-pointer"
                      >
                        🏷️ {c.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-[#6B736E] pt-2 border-t border-[#F3F0EC]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-serif text-[#2D332F] font-bold">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#2D5A34]">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-[#2D5A34]">COMPLIMENTARY</span>
                ) : (
                  <span className="text-[#2D332F] font-bold">{formatPrice(shippingFee)}</span>
                )}
              </div>

              <div className="flex justify-between text-base font-serif font-bold text-[#2D332F] pt-2 border-t border-[#E8E2D9]">
                <span>Total Due</span>
                <span className="text-xl text-[#2D332F]">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              id="cart-proceed-checkout-btn"
              onClick={onProceedToCheckout}
              className="w-full py-4 px-4 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

