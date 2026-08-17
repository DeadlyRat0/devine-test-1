import React, { useState } from 'react';
import { X, Star, CheckCircle, Sparkles, ShieldCheck, Video, Camera, Link as LinkIcon } from 'lucide-react';
import { Product, UserProfile } from '../types';
import { addProductReview, isUserVerifiedBuyer } from '../utils/storage';
import { INDIAN_STATES } from '../data/reviews';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  currentUser: UserProfile | null;
  onReviewSubmitted: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  product,
  currentUser,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.fullName || '');
  const [city, setCity] = useState(currentUser?.savedAddresses?.[0]?.city || '');
  const [state, setState] = useState(currentUser?.savedAddresses?.[0]?.state || 'Rajasthan');
  const [videoUrl, setVideoUrl] = useState('');
  const [hasVideoAttached, setHasVideoAttached] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync user details if changed
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.fullName) setAuthorName(currentUser.fullName);
      if (currentUser.savedAddresses && currentUser.savedAddresses.length > 0) {
        setCity(currentUser.savedAddresses[0].city);
        setState(currentUser.savedAddresses[0].state);
      }
    }
  }, [currentUser]);

  if (!isOpen || !product) return null;

  const isVerified = currentUser ? isUserVerifiedBuyer(product.id, currentUser.email) || isUserVerifiedBuyer(product.id, currentUser.phone) : false;

  const ratingDescriptions: Record<number, string> = {
    5: 'Exceptional (5/5) — Highly recommended',
    4: 'Very Good (4/5) — Satisfied with results',
    3: 'Average (3/5) — Expected more benefits',
    2: 'Below Average (2/5) — Minor issues',
    1: 'Poor (1/5) — Not satisfied'
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!authorName.trim()) errs.authorName = 'Your name is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!title.trim()) errs.title = 'Review headline is required';
    if (!comment.trim() || comment.trim().length < 15) {
      errs.comment = 'Please write at least 15 characters describing your experience';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const locationStr = `${city.trim()}, ${state}`;

    addProductReview({
      productId: product.id,
      productName: product.name,
      author: authorName.trim(),
      authorEmail: currentUser?.email,
      authorPhone: currentUser?.phone,
      location: locationStr,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      verified: isVerified || Boolean(currentUser),
      avatarBg: currentUser?.avatarBg || 'bg-[#4A5D4E]',
      hasVideo: hasVideoAttached || Boolean(videoUrl.trim()),
      videoUrl: videoUrl.trim() || (hasVideoAttached ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' : undefined),
      videoDuration: hasVideoAttached || Boolean(videoUrl.trim()) ? '0:45' : undefined,
      videoThumbnail: hasVideoAttached || Boolean(videoUrl.trim()) ? product.image : undefined,
      images: [product.image]
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onReviewSubmitted();
      onClose();
      // Reset
      setTitle('');
      setComment('');
      setVideoUrl('');
      setHasVideoAttached(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fade-in">
      <div 
        className="relative bg-[#FDFBF7] w-full max-w-lg border border-[#E8E2D9] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#4A5D4E] rounded-full flex items-center justify-center text-white font-serif italic text-base">
              ★
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#2D332F]">Write a Product Review</h2>
              <p className="text-[11px] text-[#A89F91] truncate max-w-xs">{product.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A89F91] hover:text-[#2D332F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 text-left">
          {isSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-[#E1F1E4] text-[#2D5A34] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h3 className="font-serif text-2xl text-[#2D332F]">Thank You for Your Feedback!</h3>
              <p className="text-xs text-[#6B736E] max-w-sm mx-auto leading-relaxed">
                Your authentic review for <strong>{product.name}</strong> has been published and helps other herbal beauty enthusiasts make informed choices.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Product Brief Banner */}
              <div className="flex items-center gap-3 p-3 bg-white border border-[#E8E2D9]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-cover border border-[#E8E2D9] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif text-xs font-bold text-[#2D332F] truncate">{product.name}</h4>
                  <p className="text-[10px] text-[#A89F91] uppercase tracking-wider">{product.netWeightOrVolume} • {product.packagingType}</p>
                </div>
                {isVerified && (
                  <span className="flex items-center gap-1 text-[9px] uppercase font-bold text-[#2D5A34] bg-[#E1F1E4] px-2 py-0.5 rounded shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#6B736E] mb-1.5">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-[#4A5D4E] hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || rating)
                              ? 'fill-[#4A5D4E] text-[#4A5D4E]'
                              : 'fill-transparent text-[#D5CDC0]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-[#6B736E] font-medium ml-2">
                    {ratingDescriptions[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Headline / Title */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#6B736E] mb-1">
                  Review Headline *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Reduced hair fall in 2 weeks! / Cooling eye roller works wonders"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-2.5 bg-white border text-xs text-[#2D332F] focus:outline-none focus:border-[#4A5D4E] ${
                    errors.title ? 'border-rose-400' : 'border-[#E8E2D9]'
                  }`}
                />
                {errors.title && <span className="text-[10px] text-rose-600 mt-0.5 block">{errors.title}</span>}
              </div>

              {/* Comments */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#6B736E] mb-1">
                  Detailed Experience & Results *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the texture, herbal aroma, how you applied it, and how your skin or hair responded over time..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={`w-full p-2.5 bg-white border text-xs text-[#2D332F] focus:outline-none focus:border-[#4A5D4E] ${
                    errors.comment ? 'border-rose-400' : 'border-[#E8E2D9]'
                  }`}
                />
                {errors.comment && <span className="text-[10px] text-rose-600 mt-0.5 block">{errors.comment}</span>}
              </div>

              {/* Video or Photo Attachment Options */}
              <div className="p-3 bg-[#F8F6F2] border border-[#E8E2D9] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D332F]">
                    <Video className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Attach Video Review / Customer Reel</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasVideoAttached(!hasVideoAttached)}
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 border cursor-pointer ${
                      hasVideoAttached ? 'bg-[#4A5D4E] text-white border-[#4A5D4E]' : 'bg-white text-[#6B736E] border-[#E8E2D9]'
                    }`}
                  >
                    {hasVideoAttached ? 'Video Added ✓' : '+ Add Video'}
                  </button>
                </div>

                {hasVideoAttached && (
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[9px] uppercase tracking-wider font-bold text-[#6B736E]">
                      Video URL / Demo Clip Link (Optional)
                    </label>
                    <div className="flex items-center bg-white border border-[#E8E2D9]">
                      <span className="px-2 text-[#A89F91]">
                        <LinkIcon className="w-3 h-3" />
                      </span>
                      <input
                        type="url"
                        placeholder="https://... or sample video clip"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full p-1.5 text-xs text-[#2D332F] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Author & Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#6B736E] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pooja Sharma"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className={`w-full p-2.5 bg-white border text-xs text-[#2D332F] focus:outline-none focus:border-[#4A5D4E] ${
                      errors.authorName ? 'border-rose-400' : 'border-[#E8E2D9]'
                    }`}
                  />
                  {errors.authorName && <span className="text-[10px] text-rose-600 mt-0.5 block">{errors.authorName}</span>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#6B736E] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jaipur / Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`w-full p-2.5 bg-white border text-xs text-[#2D332F] focus:outline-none focus:border-[#4A5D4E] ${
                      errors.city ? 'border-rose-400' : 'border-[#E8E2D9]'
                    }`}
                  />
                  {errors.city && <span className="text-[10px] text-rose-600 mt-0.5 block">{errors.city}</span>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-[#6B736E] mb-1">
                  State / UT
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E8E2D9] text-xs text-[#2D332F] focus:outline-none focus:border-[#4A5D4E]"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Submit Verified Review
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
