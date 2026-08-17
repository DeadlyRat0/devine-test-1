import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, ShieldCheck, Star, Sparkles, ExternalLink, ShoppingBag } from 'lucide-react';
import { Review, Product } from '../types';
import { formatPrice } from '../utils/whatsapp';

interface VideoReviewModalProps {
  review: Review | null;
  product?: Product | null;
  onClose: () => void;
  onViewProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const VideoReviewModal: React.FC<VideoReviewModalProps> = ({
  review,
  product,
  onClose,
  onViewProduct,
  onAddToCart
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (review && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  }, [review]);

  if (!review) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    if (total > 0) {
      setProgress((current / total) * 100);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#1A1F1C] text-white w-full max-w-2xl border border-[#3C4A3F] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Video Player Section */}
        <div className="relative md:w-7/12 bg-black flex items-center justify-center min-h-[300px] sm:min-h-[380px] overflow-hidden group">
          <video
            ref={videoRef}
            src={review.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
            poster={review.videoThumbnail || review.images?.[0]}
            playsInline
            loop
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
            className="w-full h-full object-cover max-h-[460px] cursor-pointer"
          />

          {/* Video Control Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {/* Play/Pause Button in Center (Visible on hover or pause) */}
          <button
            onClick={togglePlay}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#4A5D4E]/90 text-white flex items-center justify-center transition-all cursor-pointer z-10 ${
              isPlaying ? 'opacity-0 group-hover:opacity-90' : 'opacity-100'
            }`}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>

          {/* Bottom Video Progress & Audio Control */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 z-20">
            <div className="flex-1 bg-white/20 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-[#4A5D4E] h-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              onClick={toggleMute}
              className="p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="absolute top-3 left-3 bg-[#4A5D4E]/90 backdrop-blur-xs px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest text-white flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Verified Customer Reel
          </div>
        </div>

        {/* Right: Review Details & Product Context */}
        <div className="md:w-5/12 p-5 sm:p-6 bg-[#212723] flex flex-col justify-between space-y-4 text-left">
          
          <div className="space-y-3.5">
            {/* Author & Verification */}
            <div className="flex items-center justify-between border-b border-[#3C4A3F] pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full ${review.avatarBg || 'bg-[#4A5D4E]'} text-white flex items-center justify-center text-xs font-bold`}>
                  {review.author.charAt(0)}
                </div>
                <div>
                  <strong className="text-white block font-semibold text-xs">{review.author}</strong>
                  <span className="text-[#A89F91] text-[10px]">{review.location}</span>
                </div>
              </div>

              {review.verified && (
                <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold text-[#E1F1E4] bg-[#2D5A34] px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1 text-[#E1F1E4]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < review.rating
                      ? 'fill-[#4A5D4E] text-[#4A5D4E]'
                      : 'fill-transparent text-[#6B736E]'
                  }`}
                />
              ))}
              <span className="text-[11px] text-[#A89F91] ml-1">{review.date}</span>
            </div>

            {/* Review Title & Content */}
            <div>
              {review.title && (
                <h4 className="font-serif font-bold text-sm text-white leading-snug mb-1">
                  "{review.title}"
                </h4>
              )}
              <p className="text-xs text-[#D5CDC0] leading-relaxed italic font-serif max-h-40 overflow-y-auto pr-1">
                {review.comment}
              </p>
            </div>
          </div>

          {/* Product Attachment Card if available */}
          {product && (
            <div className="bg-[#1A1F1C] border border-[#3C4A3F] p-3 space-y-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-11 h-11 object-cover border border-[#3C4A3F] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h5 className="font-serif text-xs font-bold text-white truncate">{product.name}</h5>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-serif text-xs text-[#E1F1E4] font-bold">{formatPrice(product.price)}</span>
                    {product.marketPrice && (
                      <span className="text-[10px] text-[#A89F91] line-through">{formatPrice(product.marketPrice)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {onViewProduct && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewProduct(product);
                    }}
                    className="py-1.5 px-2 bg-[#2D332F] hover:bg-[#3C4A3F] text-white text-[10px] uppercase tracking-wider font-bold text-center border border-[#3C4A3F] transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                )}

                {onAddToCart && (
                  <button
                    onClick={() => {
                      onAddToCart(product);
                    }}
                    className="py-1.5 px-2 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white text-[10px] uppercase tracking-wider font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Add to Bag</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
