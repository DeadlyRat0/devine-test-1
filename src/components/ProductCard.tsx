import React, { useState } from 'react';
import { Star, ShoppingBag, Zap, Check, Eye, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  onViewDetails
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock || product.stockCount === 0) return;
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock || product.stockCount === 0) return;
    onBuyNow(product, quantity);
  };

  const increment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity < Math.min(10, product.stockCount)) {
      setQuantity(q => q + 1);
    }
  };

  const decrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const isOutOfStock = !product.inStock || product.stockCount <= 0;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product)}
      className="group relative flex flex-col bg-white border border-[#E8E2D9] hover:border-[#4A5D4E] transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Product Media Asset */}
      <div className="relative aspect-square w-full bg-[#F8F6F2] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
        />

        {/* Top Editorial Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 items-start">
          {product.badge && (
            <span className="px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] font-bold bg-[#4A5D4E] text-white shadow-xs">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#FDFBF7] text-[#2D332F] border border-[#E8E2D9] shadow-xs">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Volume / Size Indicator */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#FDFBF7]/90 text-[#6B736E] border border-[#E8E2D9]">
            {product.size}
          </span>
        </div>

        {/* Hover Quick Preview */}
        <div className="absolute inset-0 bg-[#2D332F]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3 pointer-events-none">
          <span className="w-full py-2 bg-[#FDFBF7]/95 text-[#2D332F] text-[10px] uppercase tracking-widest font-bold text-center border border-[#E8E2D9] shadow-xs">
            View Botanical Details
          </span>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
        <div className="space-y-1.5">
          {/* Rating */}
          <div className="flex items-center justify-between text-xs text-[#A89F91]">
            <div className="flex items-center gap-1">
              <div className="flex items-center text-[#4A5D4E]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating)
                        ? 'fill-[#4A5D4E] text-[#4A5D4E]'
                        : 'fill-transparent text-[#D5CDC0]'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-[#2D332F] text-[11px] ml-1">{product.rating}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[#A89F91]">({product.reviewCount} Reviews)</span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-lg leading-snug text-[#2D332F] group-hover:text-[#4A5D4E] transition-colors">
            {product.name}
          </h3>

          {/* Subtitle */}
          <p className="text-xs text-[#6B736E] line-clamp-2 leading-relaxed">
            {product.subtitle}
          </p>
        </div>

        {/* Pricing & Market Comparison & Stock Status */}
        <div className="pt-3 border-t border-[#F3F0EC] space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-serif tracking-tight text-[#2D332F]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-[#A89F91] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            {isOutOfStock ? (
              <span className="text-[10px] uppercase font-bold text-rose-700">
                Sold Out
              </span>
            ) : product.stockCount <= 5 ? (
              <span className="text-[10px] font-semibold text-[#78350F] bg-[#FEF3C7] px-2 py-0.5 rounded">
                Only {product.stockCount} left
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#E1F1E4] text-[#2D5A34] rounded">
                {product.stockCount} in stock
              </span>
            )}
          </div>

          {/* Market Price Comparison Tag */}
          {product.marketPrice && product.marketPrice > product.price && (
            <div className="bg-[#F8F6F2] px-2 py-1 border border-[#E8E2D9] flex items-center justify-between text-[10px]">
              <span className="text-[#6B736E]">
                Market Avg: <span className="line-through text-[#A89F91]">{formatPrice(product.marketPrice)}</span>
              </span>
              <span className="font-bold text-[#2D5A34]">
                Save {Math.round(((product.marketPrice - product.price) / product.marketPrice) * 100)}% Direct
              </span>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
            {!isOutOfStock && (
              <div className="flex items-center justify-between bg-[#F8F6F2] p-1.5 border border-[#E8E2D9]">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#A89F91] px-1">
                  Qty
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={decrement}
                    disabled={quantity <= 1}
                    className="w-6 h-6 bg-white text-[#2D332F] font-bold text-xs flex items-center justify-center border border-[#E8E2D9] hover:bg-[#FDFBF7] disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-serif font-bold text-[#2D332F] w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={increment}
                    disabled={quantity >= product.stockCount}
                    className="w-6 h-6 bg-white text-[#2D332F] font-bold text-xs flex items-center justify-center border border-[#E8E2D9] hover:bg-[#FDFBF7] disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`py-3 px-2 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  addedAnimation
                    ? 'bg-[#3C4A3F] text-white'
                    : isOutOfStock
                    ? 'bg-[#F3F0EC] text-[#A89F91] cursor-not-allowed'
                    : 'bg-[#4A5D4E] text-white hover:bg-[#3C4A3F]'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Added
                  </>
                ) : (
                  'Add to Cart'
                )}
              </button>

              <button
                type="button"
                onClick={handleBuy}
                disabled={isOutOfStock}
                className={`py-3 px-2 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-[#F3F0EC] text-[#A89F91] cursor-not-allowed'
                    : 'border border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#F3F0EC]'
                }`}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

