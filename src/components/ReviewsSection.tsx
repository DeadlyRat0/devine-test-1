import React, { useState } from 'react';
import { Star, CheckCircle, Quote, ThumbsUp, ShieldCheck, MessageSquarePlus, Filter, Sparkles, Play, Video, Image as ImageIcon, Camera } from 'lucide-react';
import { Review, Product } from '../types';
import { getStoredReviews, voteReviewHelpful } from '../utils/storage';
import { VideoReviewModal } from './VideoReviewModal';

interface ReviewsSectionProps {
  onOpenWriteReview?: (product?: Product) => void;
  allProducts?: Product[];
  onOpenProductDetail?: (product: Product) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  onOpenWriteReview,
  allProducts = [],
  onOpenProductDetail
}) => {
  const reviews: Review[] = getStoredReviews() || [];
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'video' | 'photo' | '5' | '4'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});
  const [activeVideoReview, setActiveVideoReview] = useState<Review | null>(null);

  const safeProducts = Array.isArray(allProducts) ? allProducts : [];
  const videoReviews = safeReviews.filter(r => r && (r.hasVideo || r.videoUrl));
  const totalReviews = safeReviews.length;
  const averageRating = totalReviews > 0
    ? Number((safeReviews.reduce((acc, r) => acc + (r?.rating || 5), 0) / totalReviews).toFixed(1))
    : 4.9;

  // Filter reviews
  let filtered = safeReviews.filter(r => {
    if (!r) return false;
    if (selectedFilter === 'video' && !r.hasVideo && !r.videoUrl) return false;
    if (selectedFilter === 'photo' && (!r.images || r.images.length === 0)) return false;
    if (selectedFilter === '5' && r.rating !== 5) return false;
    if (selectedFilter === '4' && r.rating !== 4) return false;

    if (selectedCategory !== 'all' && r.productId) {
      const prod = safeProducts.find(p => p.id === r.productId);
      if (prod && prod.category !== selectedCategory) return false;
    }
    return true;
  });

  // Sort reviews
  filtered.sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    return 0; // default newest
  });

  const handleVote = (reviewId: string) => {
    if (votedHelpful[reviewId]) return;
    voteReviewHelpful(reviewId);
    setVotedHelpful(prev => ({ ...prev, [reviewId]: true }));
  };

  const getProductForReview = (productId?: string) => {
    if (!productId) return null;
    return safeProducts.find(p => p.id === productId) || null;
  };

  return (
    <>
      <section id="reviews-section" className="border-b border-[#E8E2D9] bg-[#FDFBF7] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="text-left max-w-2xl space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#A89F91] block">
                Real Customer Experiences & Video Reels
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#2D332F] tracking-tight">
                Authentic Ayurveda, Real Results
              </h2>
              <p className="text-xs sm:text-sm text-[#6B736E]">
                Watch and read real testimonials from customers across India sharing their hair fall reduction and glass-skin glow journeys.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenWriteReview()}
                className="px-5 py-3 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Share Your Review / Video</span>
              </button>
            </div>
          </div>

          {/* Video Testimonials Spotlight Reels */}
          {videoReviews.length > 0 && (
            <div className="mb-14 text-left">
              <div className="flex items-center justify-between mb-4 border-b border-[#E8E2D9] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#2D332F]">
                      Customer Video Reels & Unboxing
                    </h3>
                    <span className="text-[10px] text-[#6B736E]">
                      Click any card to play application demonstration & reviews
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D5A34] bg-[#E1F1E4] px-2.5 py-1 rounded">
                  {videoReviews.length} Video Reviews
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {videoReviews.map((vRev) => {
                  const associatedProd = getProductForReview(vRev.productId);
                  return (
                    <div
                      key={vRev.id}
                      onClick={() => setActiveVideoReview(vRev)}
                      className="group relative bg-black aspect-3/4 overflow-hidden border border-[#E8E2D9] hover:border-[#4A5D4E] cursor-pointer shadow-xs transition-all flex flex-col justify-between p-3"
                    >
                      {/* Video Poster Thumbnail */}
                      <img
                        src={vRev.videoThumbnail || vRev.images?.[0] || associatedProd?.image}
                        alt={vRev.title || 'Video Review'}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

                      {/* Top Badges */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="bg-[#4A5D4E]/90 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Verified
                        </span>
                        {vRev.videoDuration && (
                          <span className="text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded font-mono">
                            {vRev.videoDuration}
                          </span>
                        )}
                      </div>

                      {/* Center Play Button */}
                      <div className="relative z-10 self-center my-auto">
                        <div className="w-11 h-11 rounded-full bg-white/90 group-hover:bg-[#4A5D4E] group-hover:text-white text-[#2D332F] flex items-center justify-center transition-all shadow-lg group-hover:scale-110">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Bottom Info */}
                      <div className="relative z-10 text-white text-left space-y-1">
                        <div className="flex items-center gap-1 text-[#E1F1E4]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-current" />
                          ))}
                        </div>
                        <h4 className="font-serif text-xs font-bold leading-snug line-clamp-2">
                          {vRev.title || `Review by ${vRev.author}`}
                        </h4>
                        <div className="text-[10px] text-[#A89F91] truncate">
                          {vRev.author} • {vRev.location}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rating Summary Bar & Filters */}
          <div className="bg-[#F8F6F2] p-5 sm:p-7 border border-[#E8E2D9] mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left Score Block */}
              <div className="md:col-span-4 flex items-center gap-5 border-b md:border-b-0 md:border-r border-[#E8E2D9] pb-4 md:pb-0 md:pr-6 text-left">
                <div className="font-serif text-5xl font-bold text-[#2D332F] tracking-tight">
                  {averageRating}
                </div>
                <div>
                  <div className="flex items-center text-[#4A5D4E] gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#2D332F] block">
                    Based on {totalReviews} Verified Indian Buyers
                  </span>
                  <span className="text-[10px] text-[#2D5A34] font-bold uppercase tracking-wider">
                    100% Recommendation Rate
                  </span>
                </div>
              </div>

              {/* Right Filter Chips */}
              <div className="md:col-span-8 flex flex-wrap items-center justify-between gap-3 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B736E] mr-1">Filter:</span>
                  
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xs border transition-all cursor-pointer ${
                      selectedFilter === 'all'
                        ? 'bg-[#4A5D4E] text-white border-[#4A5D4E]'
                        : 'bg-white text-[#6B736E] border-[#E8E2D9] hover:border-[#4A5D4E]'
                    }`}
                  >
                    All ({totalReviews})
                  </button>

                  <button
                    onClick={() => setSelectedFilter('video')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedFilter === 'video'
                        ? 'bg-[#4A5D4E] text-white border-[#4A5D4E]'
                        : 'bg-white text-[#6B736E] border-[#E8E2D9] hover:border-[#4A5D4E]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>With Videos ({videoReviews.length})</span>
                  </button>

                  <button
                    onClick={() => setSelectedFilter('photo')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedFilter === 'photo'
                        ? 'bg-[#4A5D4E] text-white border-[#4A5D4E]'
                        : 'bg-white text-[#6B736E] border-[#E8E2D9] hover:border-[#4A5D4E]'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>With Photos</span>
                  </button>

                  <button
                    onClick={() => setSelectedFilter('5')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xs border transition-all cursor-pointer ${
                      selectedFilter === '5'
                        ? 'bg-[#4A5D4E] text-white border-[#4A5D4E]'
                        : 'bg-white text-[#6B736E] border-[#E8E2D9] hover:border-[#4A5D4E]'
                    }`}
                  >
                    5 ★ Only
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#A89F91]">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="p-1.5 bg-white border border-[#E8E2D9] text-xs font-semibold text-[#2D332F] focus:outline-none focus:border-[#4A5D4E]"
                  >
                    <option value="newest">Most Recent</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="highest">Highest Rating</option>
                  </select>
                </div>

              </div>

            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filtered.map((rev) => {
              const product = getProductForReview(rev.productId);

              return (
                <div
                  key={rev.id}
                  className="bg-white border border-[#E8E2D9] hover:border-[#4A5D4E] p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xs transition-all"
                >
                  <div className="space-y-3.5">
                    
                    {/* Author header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${rev.avatarBg || 'bg-[#4A5D4E]'} text-white flex items-center justify-center font-bold text-xs`}>
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-xs text-[#2D332F] block font-semibold">{rev.author}</strong>
                          <span className="text-[10px] text-[#A89F91]">{rev.location}</span>
                        </div>
                      </div>

                      {rev.verified && (
                        <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-[#2D5A34] bg-[#E1F1E4] px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Stars & Product Tag */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F8F6F2] pb-2">
                      <div className="flex items-center text-[#4A5D4E]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'fill-[#4A5D4E] text-[#4A5D4E]'
                                : 'fill-transparent text-[#D5CDC0]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#A89F91]">{rev.date}</span>
                    </div>

                    {/* Review Title & Content */}
                    <div>
                      {rev.title && (
                        <h4 className="font-serif font-bold text-sm text-[#2D332F] leading-snug mb-1">
                          {rev.title}
                        </h4>
                      )}
                      <p className="text-xs text-[#6B736E] leading-relaxed italic font-serif">
                        "{rev.comment}"
                      </p>
                    </div>

                    {/* Video Card Attachment if review has a video */}
                    {(rev.hasVideo || rev.videoUrl) && (
                      <div
                        onClick={() => setActiveVideoReview(rev)}
                        className="relative bg-black h-28 overflow-hidden border border-[#3C4A3F] cursor-pointer group flex items-center justify-center"
                      >
                        <img
                          src={rev.videoThumbnail || rev.images?.[0] || product?.image}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 left-2 text-[9px] uppercase font-bold bg-black/80 text-white px-2 py-0.5 flex items-center gap-1">
                          <Video className="w-3 h-3 text-[#4A5D4E]" />
                          Watch Video Review
                        </span>
                      </div>
                    )}

                    {/* Customer Real Photos Attachment if available */}
                    {rev.images && rev.images.length > 0 && !rev.hasVideo && (
                      <div className="flex items-center gap-2 pt-1">
                        {rev.images.map((img, idx) => (
                          <div key={idx} className="w-14 h-14 border border-[#E8E2D9] overflow-hidden bg-[#F8F6F2]">
                            <img src={img} alt="Customer result" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Product Link & Helpful Action */}
                  <div className="pt-3 border-t border-[#F8F6F2] flex items-center justify-between gap-2 text-xs">
                    {product ? (
                      <button
                        onClick={() => onOpenProductDetail(product)}
                        className="text-[11px] font-semibold text-[#4A5D4E] hover:underline truncate max-w-[170px] text-left cursor-pointer"
                      >
                        {product.name}
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#A89F91] truncate max-w-[170px]">
                        {rev.productName}
                      </span>
                    )}

                    <button
                      onClick={() => handleVote(rev.id)}
                      disabled={votedHelpful[rev.id]}
                      className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 px-2 py-1 border transition-colors cursor-pointer ${
                        votedHelpful[rev.id]
                          ? 'bg-[#E1F1E4] text-[#2D5A34] border-[#2D5A34]/20'
                          : 'bg-white text-[#6B736E] border-[#E8E2D9] hover:border-[#4A5D4E]'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{rev.helpfulCount ? rev.helpfulCount + (votedHelpful[rev.id] ? 1 : 0) : (votedHelpful[rev.id] ? 1 : 0)}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Video Review Modal */}
      <VideoReviewModal
        review={activeVideoReview}
        product={activeVideoReview?.productId ? getProductForReview(activeVideoReview.productId) : null}
        onClose={() => setActiveVideoReview(null)}
        onViewProduct={(prod) => {
          setActiveVideoReview(null);
          onOpenProductDetail(prod);
        }}
      />
    </>
  );
};
