import React, { useState } from 'react';
import { X, Star, ShoppingBag, Zap, Check, Phone, Sparkles, Leaf, Droplets, Scale, Play, Video, ShieldCheck } from 'lucide-react';
import { Product, UserProfile, Review } from '../types';
import { formatPrice, generateProductInquiryWhatsAppLink } from '../utils/whatsapp';
import { BUSINESS_CONFIG } from '../data/products';
import { getStoredReviews } from '../utils/storage';
import { VideoReviewModal } from './VideoReviewModal';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  currentUser?: UserProfile | null;
  onOpenWriteReview?: (product?: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  currentUser,
  onOpenWriteReview
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comparison' | 'ingredients' | 'howToUse' | 'videos'>('details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeVideoReview, setActiveVideoReview] = useState<Review | null>(null);

  if (!product) return null;

  const allReviews = getStoredReviews();
  const productReviews = allReviews.filter(r => r.productId === product.id || !r.productId);
  const productVideoReviews = productReviews.filter(r => r.hasVideo || r.videoUrl);

  const galleryList = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [product.image];

  const currentMainImage = galleryList[selectedImageIndex] || product.image;

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const marketSavingsPercent = product.marketPrice && product.marketPrice > product.price
    ? Math.round(((product.marketPrice - product.price) / product.marketPrice) * 100)
    : 0;

  const isOutOfStock = !product.inStock || product.stockCount <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuy = () => {
    if (isOutOfStock) return;
    onBuyNow(product, quantity);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fade-in">
        <div 
          className="relative bg-[#FDFBF7] w-full max-w-4xl border border-[#E8E2D9] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 bg-white text-[#2D332F] border border-[#E8E2D9] hover:bg-[#F8F6F2] flex items-center justify-center transition-all cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
              
              {/* Left: Product Media Gallery */}
              <div className="md:col-span-5 space-y-3">
                {/* Main Selected Image */}
                <div className="relative aspect-square w-full bg-[#F8F6F2] border border-[#E8E2D9] overflow-hidden">
                  <img
                    src={currentMainImage}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] font-bold bg-[#4A5D4E] text-white shadow-xs">
                      {product.badge}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#FDFBF7] text-[#2D332F] border border-[#E8E2D9] shadow-xs">
                      Save {discountPercent}% vs MRP
                    </span>
                  )}
                </div>

                {/* Gallery Thumbnail Selector */}
                {galleryList.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {galleryList.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-14 h-14 shrink-0 border-2 overflow-hidden bg-white transition-all cursor-pointer ${
                          selectedImageIndex === idx
                            ? 'border-[#4A5D4E] opacity-100 ring-1 ring-[#4A5D4E]'
                            : 'border-[#E8E2D9] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} angle ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Packaging & Origin Tag */}
                <div className="bg-[#F8F6F2] p-3 border border-[#E8E2D9] flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#4A5D4E] shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold uppercase text-[9px] tracking-wider text-[#A89F91] block">Packaging & Size</span>
                      <span className="text-[#2D332F] font-medium text-xs">{product.packagingType} ({product.netWeightOrVolume})</span>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-[#E1F1E4] text-[#2D5A34] px-2 py-0.5 rounded">
                    Small Batch
                  </span>
                </div>
              </div>

              {/* Right: Product Summary & Purchasing */}
              <div className="md:col-span-7 space-y-4 text-left">
                
                {/* Category & Rating */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#4A5D4E] bg-[#E1F1E4] px-2.5 py-0.5 rounded">
                    {product.category === 'haircare' ? 'Ayurvedic Hair Care' : product.category === 'skincare' ? 'Botanical Skin Care' : 'Herbal Curated Set'}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-[#A89F91]">
                    <div className="flex items-center text-[#4A5D4E]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(product.rating)
                              ? 'fill-[#4A5D4E] text-[#4A5D4E]'
                              : 'fill-transparent text-[#D5CDC0]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-[#2D332F] text-xs">{product.rating}</span>
                    <span className="text-[11px]">({product.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif text-[#2D332F] leading-tight">
                    {product.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6B736E] mt-1 leading-relaxed">
                    {product.subtitle}
                  </p>
                </div>

                {/* Price & Competitor Comparison Callout */}
                <div className="bg-[#F8F6F2] p-4 border border-[#E8E2D9] space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-serif tracking-tight text-[#2D332F]">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-[#A89F91] line-through">
                            MRP {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B736E] mt-0.5">
                        Inclusive of all taxes • <strong>Complimentary shipping</strong> over ₹{BUSINESS_CONFIG.freeShippingThreshold}
                      </p>
                    </div>

                    <div className="text-right">
                      {isOutOfStock ? (
                        <span className="text-xs font-bold uppercase text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                          Sold Out
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-[#E1F1E4] text-[#2D5A34] rounded">
                          In Stock ({product.stockCount})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Market Comparison Card */}
                  {product.marketPrice && (
                    <div className="pt-2 border-t border-[#E8E2D9] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#6B736E]">
                        <Scale className="w-3.5 h-3.5 text-[#4A5D4E]" />
                        <span>Commercial Brands Average:</span>
                        <strong className="line-through text-[#A89F91]">{formatPrice(product.marketPrice)}</strong>
                      </div>
                      <span className="font-bold text-[#2D5A34] bg-[#E1F1E4] px-2 py-0.5 rounded text-[11px]">
                        Save {marketSavingsPercent}% Direct Handcrafted
                      </span>
                    </div>
                  )}
                </div>

                {/* Video Review Preview Banner if available */}
                {productVideoReviews.length > 0 && (
                  <div className="bg-[#2D332F] text-white p-2.5 border border-[#3C4A3F] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 rounded-full bg-[#4A5D4E] flex items-center justify-center">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </div>
                      <span className="font-medium text-[11px]">
                        {productVideoReviews.length} Verified Customer Video Reviews Available
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveVideoReview(productVideoReviews[0])}
                      className="text-[10px] uppercase tracking-wider font-bold text-[#E1F1E4] hover:underline cursor-pointer"
                    >
                      Watch Routine Video →
                    </button>
                  </div>
                )}

                {/* Quantity Selector & Purchase CTAs */}
                <div className="space-y-3 pt-1">
                  {!isOutOfStock && (
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-[#A89F91]">Quantity:</span>
                      <div className="flex items-center gap-3 bg-white p-1 border border-[#E8E2D9]">
                        <button
                          type="button"
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          disabled={quantity <= 1}
                          className="w-7 h-7 bg-[#F8F6F2] text-[#2D332F] font-bold text-xs flex items-center justify-center hover:bg-[#E8E2D9] disabled:opacity-30 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-serif font-bold text-xs text-[#2D332F] w-6 text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(q => Math.min(product.stockCount, q + 1))}
                          disabled={quantity >= product.stockCount}
                          className="w-7 h-7 bg-[#F8F6F2] text-[#2D332F] font-bold text-xs flex items-center justify-center hover:bg-[#E8E2D9] disabled:opacity-30 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-[#6B736E]">
                        Subtotal: <strong className="font-serif text-[#2D332F]">{formatPrice(product.price * quantity)}</strong>
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={isOutOfStock}
                      className={`py-3.5 px-4 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                        addedAnimation
                          ? 'bg-[#3C4A3F] text-white'
                          : isOutOfStock
                          ? 'bg-[#F3F0EC] text-[#A89F91] cursor-not-allowed'
                          : 'bg-[#4A5D4E] text-white hover:bg-[#3C4A3F]'
                      }`}
                    >
                      {addedAnimation ? (
                        <>
                          <Check className="w-4 h-4" />
                          Added to Bag!
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleBuy}
                      disabled={isOutOfStock}
                      className={`py-3.5 px-4 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isOutOfStock
                          ? 'bg-[#F3F0EC] text-[#A89F91] cursor-not-allowed'
                          : 'border border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#F8F6F2]'
                      }`}
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      Buy Now (Instant UPI)
                    </button>
                  </div>

                  {/* Direct WhatsApp Product Inquiry */}
                  <a
                    href={generateProductInquiryWhatsAppLink(product.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-[#F8F6F2] text-[#2D332F] text-xs font-semibold border border-[#E8E2D9] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Have questions? Chat on WhatsApp (+91 {BUSINESS_CONFIG.phone})</span>
                  </a>
                </div>

              </div>
            </div>

            {/* Tabbed In-Depth Information */}
            <div className="border-t border-[#E8E2D9] pt-6">
              <div className="flex border-b border-[#E8E2D9] space-x-4 sm:space-x-8 mb-5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 whitespace-nowrap text-xs uppercase tracking-widest font-bold transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'details'
                      ? 'border-[#4A5D4E] text-[#4A5D4E]'
                      : 'border-transparent text-[#6B736E] hover:text-[#2D332F]'
                  }`}
                >
                  Benefits & Formula
                </button>
                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`pb-2 whitespace-nowrap text-xs uppercase tracking-widest font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'comparison'
                      ? 'border-[#4A5D4E] text-[#4A5D4E]'
                      : 'border-transparent text-[#6B736E] hover:text-[#2D332F]'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Price vs Other Brands</span>
                </button>
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`pb-2 whitespace-nowrap text-xs uppercase tracking-widest font-bold transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'ingredients'
                      ? 'border-[#4A5D4E] text-[#4A5D4E]'
                      : 'border-transparent text-[#6B736E] hover:text-[#2D332F]'
                  }`}
                >
                  Key Herbs
                </button>
                <button
                  onClick={() => setActiveTab('howToUse')}
                  className={`pb-2 whitespace-nowrap text-xs uppercase tracking-widest font-bold transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'howToUse'
                      ? 'border-[#4A5D4E] text-[#4A5D4E]'
                      : 'border-transparent text-[#6B736E] hover:text-[#2D332F]'
                  }`}
                >
                  Application Ritual
                </button>
                {productVideoReviews.length > 0 && (
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`pb-2 whitespace-nowrap text-xs uppercase tracking-widest font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'videos'
                        ? 'border-[#4A5D4E] text-[#4A5D4E]'
                        : 'border-transparent text-[#6B736E] hover:text-[#2D332F]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Customer Videos ({productVideoReviews.length})</span>
                  </button>
                )}
              </div>

              {/* Tab Content: Benefits */}
              {activeTab === 'details' && (
                <div className="space-y-4 text-left">
                  <p className="text-xs sm:text-sm text-[#6B736E] leading-relaxed">
                    {product.description}
                  </p>

                  <div>
                    <h4 className="font-serif text-base text-[#2D332F] mb-3 font-bold">
                      Proven Therapeutic Benefits:
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#2D332F]">
                      {(product.benefits || []).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white p-3 border border-[#E8E2D9]">
                          <Check className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab Content: Price & Quality Comparison */}
              {activeTab === 'comparison' && (
                <div className="space-y-5 text-left">
                  <div className="bg-[#F8F6F2] p-4 border border-[#E8E2D9]">
                    <h4 className="font-serif text-base font-bold text-[#2D332F] mb-1">
                      Direct Artisan Value vs Commercial Market Alternatives
                    </h4>
                    <p className="text-xs text-[#6B736E]">
                      Commercial brands inflate prices with massive middleman margins, celebrity endorsements, and synthetic fillers. DIVINE is formulated in small handcrafted batches directly in Rajasthan and delivered fresh to your doorstep.
                    </p>
                  </div>

                  {/* Competitor Breakdown Table */}
                  <div className="overflow-x-auto border border-[#E8E2D9]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#2D332F] text-white">
                        <tr>
                          <th className="p-3 font-serif">Brand / Market Category</th>
                          <th className="p-3 font-serif">Typical Price</th>
                          <th className="p-3 font-serif">Formulation Purity</th>
                          <th className="p-3 font-serif">Application & Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E2D9] bg-white">
                        {product.competitors && product.competitors.length > 0 ? (
                          product.competitors.map((comp, idx) => {
                            const isDivine = comp.brandName.includes('DIVINE');
                            return (
                              <tr key={idx} className={isDivine ? 'bg-[#E1F1E4]/50 font-semibold' : ''}>
                                <td className="p-3 text-[#2D332F]">
                                  {comp.brandName}
                                  {isDivine && <span className="ml-1 text-[9px] uppercase bg-[#2D5A34] text-white px-1.5 py-0.5 rounded font-bold">Best Value</span>}
                                </td>
                                <td className={`p-3 font-serif ${isDivine ? 'text-[#2D5A34] text-sm font-bold' : 'text-[#6B736E]'}`}>
                                  {formatPrice(comp.price)}
                                </td>
                                <td className="p-3 text-[#6B736E]">{comp.ingredientsType}</td>
                                <td className="p-3 text-[#6B736E]">{comp.packaging}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <>
                            <tr>
                              <td className="p-3 text-[#2D332F]">Luxury Commercial Brands</td>
                              <td className="p-3 font-serif text-[#6B736E]">{formatPrice(product.marketPrice || product.price * 2)}</td>
                              <td className="p-3 text-[#6B736E]">Contains liquid paraffin, parabens & synthetic fragrances</td>
                              <td className="p-3 text-[#6B736E]">Standard packaging with high retail markup</td>
                            </tr>
                            <tr className="bg-[#E1F1E4]/50 font-semibold">
                              <td className="p-3 text-[#2D332F]">
                                DIVINE Handcrafted Direct
                                <span className="ml-1 text-[9px] uppercase bg-[#2D5A34] text-white px-1.5 py-0.5 rounded font-bold">100% Purity</span>
                              </td>
                              <td className="p-3 font-serif text-[#2D5A34] text-sm font-bold">{formatPrice(product.price)}</td>
                              <td className="p-3 text-[#2D332F]">100% Whole Herb Slow Decoction & Cold Pressed Botanicals</td>
                              <td className="p-3 text-[#2D332F]">{product.packagingType} designed for direct target delivery</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center pt-2">
                    <div className="p-3 bg-white border border-[#E8E2D9]">
                      <span className="text-[10px] uppercase font-bold text-[#A89F91] block">Your Direct Savings</span>
                      <span className="font-serif text-xl font-bold text-[#2D5A34]">
                        {marketSavingsPercent}% Less Than Retail
                      </span>
                    </div>
                    <div className="p-3 bg-white border border-[#E8E2D9]">
                      <span className="text-[10px] uppercase font-bold text-[#A89F91] block">Chemical Dilution</span>
                      <span className="font-serif text-xl font-bold text-[#2D332F]">
                        0% Mineral Oil
                      </span>
                    </div>
                    <div className="p-3 bg-white border border-[#E8E2D9]">
                      <span className="text-[10px] uppercase font-bold text-[#A89F91] block">Batch Freshness</span>
                      <span className="font-serif text-xl font-bold text-[#4A5D4E]">
                        Fresh Micro-Batches
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content: Key Herbs */}
              {activeTab === 'ingredients' && (
                <div className="space-y-3 text-left">
                  <p className="text-xs text-[#6B736E]">
                    Handcrafted using organic, whole-plant extracts and cold-pressed botanical essences:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(product.keyIngredients || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3 bg-white border border-[#E8E2D9]">
                        <Sparkles className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                        <span className="text-xs text-[#2D332F] font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content: How to Use */}
              {activeTab === 'howToUse' && (
                <div className="p-4 bg-white border border-[#E8E2D9] text-left space-y-2">
                  <div className="flex items-center gap-2 text-[#2D332F] font-serif font-bold text-sm">
                    <Droplets className="w-4 h-4 text-[#4A5D4E]" />
                    <span>Recommended Daily Ritual:</span>
                  </div>
                  <p className="text-xs text-[#6B736E] leading-relaxed">
                    {product.howToUse}
                  </p>
                </div>
              )}

              {/* Tab Content: Customer Video Reviews */}
              {activeTab === 'videos' && (
                <div className="space-y-4 text-left">
                  <p className="text-xs text-[#6B736E]">
                    Watch real customers share their application ritual, texture review, and hair/skin results:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {productVideoReviews.map(vRev => (
                      <div
                        key={vRev.id}
                        onClick={() => setActiveVideoReview(vRev)}
                        className="bg-white border border-[#E8E2D9] hover:border-[#4A5D4E] transition-all p-3 flex gap-3 cursor-pointer group"
                      >
                        <div className="relative w-20 h-24 bg-black shrink-0 overflow-hidden">
                          <img
                            src={vRev.videoThumbnail || product.image}
                            alt={vRev.title || 'Video Review'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-7 h-7 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center shadow-md">
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            </div>
                          </div>
                          {vRev.videoDuration && (
                            <span className="absolute bottom-1 right-1 text-[8px] bg-black/80 text-white px-1 font-mono">
                              {vRev.videoDuration}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center gap-1 text-[#4A5D4E] mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 fill-current" />
                              ))}
                            </div>
                            <h5 className="font-serif text-xs font-bold text-[#2D332F] line-clamp-2">
                              {vRev.title || `Video Review by ${vRev.author}`}
                            </h5>
                          </div>
                          <div className="text-[10px] text-[#A89F91]">
                            <span>{vRev.author}</span> • <span>{vRev.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trust Guarantees */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E8E2D9] text-center">
              <div className="p-2.5 bg-[#F8F6F2] border border-[#E8E2D9] text-[10px] uppercase tracking-wider font-bold text-[#6B736E]">
                100% Herbal
              </div>
              <div className="p-2.5 bg-[#F8F6F2] border border-[#E8E2D9] text-[10px] uppercase tracking-wider font-bold text-[#6B736E]">
                Paraben Free
              </div>
              <div className="p-2.5 bg-[#F8F6F2] border border-[#E8E2D9] text-[10px] uppercase tracking-wider font-bold text-[#6B736E]">
                Instant UPI
              </div>
              <div className="p-2.5 bg-[#F8F6F2] border border-[#E8E2D9] text-[10px] uppercase tracking-wider font-bold text-[#6B736E]">
                24h Dispatch
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Video Review Modal Overlay */}
      <VideoReviewModal
        review={activeVideoReview}
        product={product}
        onClose={() => setActiveVideoReview(null)}
        onAddToCart={(prod) => {
          setActiveVideoReview(null);
          onAddToCart(prod, 1);
        }}
      />
    </>
  );
};
