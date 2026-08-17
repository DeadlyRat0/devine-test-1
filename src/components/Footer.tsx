import React from 'react';
import { Phone, Mail, Instagram, MapPin, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { BUSINESS_CONFIG } from '../data/products';
import { generateGeneralWhatsAppLink } from '../utils/whatsapp';

interface FooterProps {
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTrackOrder, onOpenAdmin }) => {
  return (
    <footer className="bg-[#2D332F] text-[#E8E2D9] border-t border-[#3C4A3F] text-left">
      {/* Top Value Propositions */}
      <div className="border-b border-[#3C4A3F] py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#A89F91] shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-white block font-serif text-sm">Ayurvedic Formulations</strong>
              <span className="text-[#D5CDC0] text-[11px]">Ancient herbs prepared in traditional decoctions</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#A89F91] shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-white block font-serif text-sm">Complimentary Delivery</strong>
              <span className="text-[#D5CDC0] text-[11px]">Free express shipping on all orders over ₹{BUSINESS_CONFIG.freeShippingThreshold}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#A89F91] shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-white block font-serif text-sm">Direct UPI & COD</strong>
              <span className="text-[#D5CDC0] text-[11px]">Instant automated QR payment or cash on delivery</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-[#A89F91] shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-white block font-serif text-sm">WhatsApp Concierge</strong>
              <span className="text-[#D5CDC0] text-[11px]">Personal assistance & consultation on +91 {BUSINESS_CONFIG.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#4A5D4E] rounded-full flex items-center justify-center text-white font-serif italic text-xl">
                D
              </div>
              <span className="font-serif text-2xl tracking-tight text-white">
                DIVINE <span className="italic font-normal text-[#A89F91]">Herbal Cosmetics</span>
              </span>
            </div>

            <p className="text-xs text-[#D5CDC0] leading-relaxed max-w-sm">
              Handcrafted in Rajasthan, India. Devoted to chemical-free, nutrient-dense Ayurvedic hair root therapy and botanical facial radiance.
            </p>

            <div className="pt-2 text-xs space-y-1.5 text-[#D5CDC0]">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#A89F91]" />
                <span>{BUSINESS_CONFIG.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#A89F91]" />
                <span>{BUSINESS_CONFIG.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#A89F91]" />
                <span>WhatsApp / Phone: +91 {BUSINESS_CONFIG.phone}</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-white">
              Customer Services
            </h4>
            <ul className="space-y-2 text-xs text-[#D5CDC0]">
              <li>
                <button
                  onClick={onOpenTrackOrder}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Track Order Status
                </button>
              </li>
              <li>
                <a
                  href={generateGeneralWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Ordering & Inquiries
                </a>
              </li>
              <li>
                <a
                  href={BUSINESS_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Follow {BUSINESS_CONFIG.instagramHandle}</span>
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-[#A89F91] hover:text-white transition-colors cursor-pointer"
                >
                  Store Owner Login
                </button>
              </li>
            </ul>
          </div>

          {/* Botanical Promise */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-white">
              The Divine Standard
            </h4>
            <p className="text-xs text-[#D5CDC0] leading-relaxed">
              Every bottle and jar is packed fresh to preserve living botanical antioxidants. Strictly free of parabens, mineral oils, silicones, and artificial foaming salts.
            </p>
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-widest text-[#A89F91] font-bold block mb-1">
                Direct UPI ID
              </span>
              <span className="font-mono text-xs bg-[#1F2421] px-3 py-1.5 border border-[#3C4A3F] text-[#E8E2D9] inline-block">
                {BUSINESS_CONFIG.upiId}
              </span>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-10 mt-10 border-t border-[#3C4A3F] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A89F91]">
          <p>© {new Date().getFullYear()} {BUSINESS_CONFIG.name}. All Rights Reserved.</p>
          <div className="flex items-center space-x-6">
            <span>Handcrafted in India</span>
            <span>•</span>
            <span>100% Ayurvedic</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
