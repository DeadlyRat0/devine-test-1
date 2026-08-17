import React from 'react';
import { Sparkles, ShieldCheck, Leaf, Truck, Award, ArrowRight } from 'lucide-react';
import { HERO_BANNER_IMAGE, BUSINESS_CONFIG } from '../data/products';

interface HeroBannerProps {
  onShopBestsellers: () => void;
  onExploreCombos: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onShopBestsellers,
  onExploreCombos
}) => {
  return (
    <section className="border-b border-[#E8E2D9] bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Editorial Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89F91] mb-2.5 block font-bold">
                The Signature Botanical Series
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#2D332F] tracking-tight">
                Ancient Ayurvedic Wisdom. <br />
                <span className="italic font-normal text-[#4A5D4E]">Pure Botanical Alchemy.</span>
              </h1>
            </div>

            <p className="text-[#6B736E] max-w-xl text-sm sm:text-base leading-relaxed">
              Meticulously handcrafted in micro-batches with wild Bhringraj, cold-pressed Jojoba, Fuller's Earth clay, and cooling metallic eye roll-ons. Restoring scalp vitality and radiant skin clarity without synthetic shortcuts.
            </p>

            {/* Price & Guarantee Micro Stats */}
            <div className="flex flex-wrap items-center gap-8 py-2 border-y border-[#F3F0EC]">
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-[#A89F91] mb-0.5 font-bold">
                  Price Range
                </span>
                <span className="text-xl sm:text-2xl font-serif tracking-tight text-[#2D332F]">
                  ₹149 — ₹699
                </span>
              </div>
              <div className="h-8 w-px bg-[#E8E2D9]" />
              <div>
                <span className="block text-[10px] uppercase tracking-widest text-[#A89F91] mb-0.5 font-bold">
                  Purity Standard
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-[#E1F1E4] text-[#2D5A34] rounded">
                  100% Herbal & Paraben-Free
                </span>
              </div>
              <div className="h-8 w-px bg-[#E8E2D9] hidden sm:block" />
              <div className="hidden sm:block">
                <span className="block text-[10px] uppercase tracking-widest text-[#A89F91] mb-0.5 font-bold">
                  Dispatch
                </span>
                <span className="text-xs font-medium text-[#2D332F] italic">
                  Ships in 24-48 Hours
                </span>
              </div>
            </div>

            {/* Editorial Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onShopBestsellers}
                className="px-8 py-4 bg-[#4A5D4E] text-white text-xs uppercase tracking-widest font-bold hover:bg-[#3C4A3F] transition-all cursor-pointer shadow-xs active:scale-98"
              >
                Shop Collection
              </button>
              <button
                onClick={onExploreCombos}
                className="px-8 py-4 border border-[#4A5D4E] text-[#4A5D4E] text-xs uppercase tracking-widest font-bold hover:bg-[#F8F6F2] transition-all cursor-pointer active:scale-98"
              >
                Explore Curated Sets
              </button>
            </div>

            {/* Bottom Editorial Footnotes */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-left">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A89F91]">Herbal Origin</span>
                <span className="text-xs italic text-[#2D332F] mt-0.5">Rajasthan, India</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A89F91]">Ordering</span>
                <span className="text-xs italic text-[#2D332F] mt-0.5">Direct UPI & WhatsApp</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A89F91]">Free Delivery</span>
                <span className="text-xs italic text-[#2D332F] mt-0.5">&gt; ₹{BUSINESS_CONFIG.freeShippingThreshold} Across India</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Feature */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-[#F8F6F2] p-4 sm:p-5 border border-[#E8E2D9] shadow-xs">
              <div className="relative overflow-hidden aspect-4/3 sm:aspect-square bg-[#E8E2D9] group">
                <img
                  src={HERO_BANNER_IMAGE}
                  alt="DIVINE Herbal Cosmetics Collection"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 bg-[#2D332F]/90 backdrop-blur-xs text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1">
                  Handmade • Small Batch
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#A89F91] font-bold block">
                    Curated Collection
                  </span>
                  <p className="font-serif text-base font-bold text-[#2D332F]">
                    Hair Root Therapy & Glass Skin Regimes
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-[#E1F1E4] text-[#2D5A34] rounded">
                    In Stock
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

