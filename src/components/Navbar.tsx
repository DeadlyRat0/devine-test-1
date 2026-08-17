import React, { useState } from 'react';
import { ShoppingBag, Search, Sparkles, Phone, Lock, Eye, Menu, X, CheckCircle2 } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/products';
import { generateGeneralWhatsAppLink } from '../utils/whatsapp';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenTrackOrder: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenTrackOrder,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Collection' },
    { id: 'haircare', label: 'Hair Care' },
    { id: 'skincare', label: 'Skin Care' },
    { id: 'combo', label: 'Curated Combos' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E2D9] transition-all">
      {/* Top Editorial Notification / Trust Bar */}
      <div className="bg-[#2D332F] text-[#E8E2D9] text-[11px] py-2 px-4 sm:px-8 border-b border-[#3C4A3F]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 uppercase tracking-[0.15em] font-semibold text-[#E1F1E4]">
              <Sparkles className="w-3 h-3 text-[#A89F91]" />
              100% Ayurvedic & Small-Batch Formulations
            </span>
            <span className="hidden sm:inline text-[#6B736E]">•</span>
            <span className="hidden sm:inline text-[#D5CDC0] font-light">
              Complimentary express shipping on orders over ₹{BUSINESS_CONFIG.freeShippingThreshold}
            </span>
          </div>

          <div className="flex items-center gap-5 text-[11px] uppercase tracking-wider font-semibold">
            <a
              href={generateGeneralWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#D5CDC0] hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-[#4A5D4E]" />
              <span>WhatsApp: +91 {BUSINESS_CONFIG.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo & Identity */}
          <div 
            onClick={() => { onSelectCategory('all'); onSearchChange(''); }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-[#4A5D4E] rounded-full flex items-center justify-center text-white font-serif italic text-xl shadow-xs group-hover:bg-[#3C4A3F] transition-colors">
              D
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl tracking-tight text-[#2D332F]">
                DIVINE <span className="italic font-normal text-[#4A5D4E]">Herbal Cosmetics</span>
              </span>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F91]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search collection, hair oil, eye roll-on..."
                className="w-full pl-10 pr-4 py-2 bg-[#F8F6F2] border border-[#E8E2D9] rounded text-xs text-[#2D332F] placeholder-[#A89F91] focus:outline-none focus:border-[#4A5D4E] focus:bg-white transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold text-[#A89F91] hover:text-[#2D332F]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Track Order Button */}
            <button
              onClick={onOpenTrackOrder}
              className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-[#6B736E] hover:text-[#4A5D4E] border-b border-transparent hover:border-[#4A5D4E] py-1 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Track Order</span>
            </button>

            {/* Bag Button */}
            <button
              id="header-cart-button"
              onClick={onOpenCart}
              className="relative p-2 text-[#2D332F] hover:text-[#4A5D4E] transition-colors cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#4A5D4E] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-[#2D332F] hover:text-[#4A5D4E]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89F91]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search collection..."
              className="w-full pl-10 pr-4 py-2 bg-[#F8F6F2] border border-[#E8E2D9] rounded text-xs text-[#2D332F] placeholder-[#A89F91] focus:outline-none focus:border-[#4A5D4E] focus:bg-white"
            />
          </div>
        </div>

        {/* Category Navigation Bar */}
        <nav className="flex items-center space-x-6 sm:space-x-8 mt-4 pt-3 border-t border-[#F3F0EC] overflow-x-auto no-scrollbar text-xs uppercase tracking-widest font-semibold">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`whitespace-nowrap pb-1 border-b transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#4A5D4E] border-[#4A5D4E] font-bold'
                    : 'text-[#6B736E] border-transparent hover:text-[#4A5D4E] hover:border-[#4A5D4E]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer menu if open */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FDFBF7] border-t border-[#E8E2D9] px-6 py-4 space-y-3 shadow-lg">
          <button
            onClick={() => { onOpenTrackOrder(); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-between py-2 text-xs uppercase tracking-wider font-semibold text-[#2D332F] border-b border-[#E8E2D9]"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#4A5D4E]" />
              Track Existing Order
            </span>
            <span className="text-[10px] text-[#A89F91]">Check Status →</span>
          </button>

          <div className="pt-2 text-[10px] uppercase tracking-wider font-bold text-[#A89F91] space-y-1">
            <p>Support: +91 {BUSINESS_CONFIG.phone}</p>
            <p>UPI: {BUSINESS_CONFIG.upiId}</p>
            <p>Email: {BUSINESS_CONFIG.email}</p>
          </div>
        </div>
      )}
    </header>
  );
};

