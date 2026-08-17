import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { generateGeneralWhatsAppLink } from '../utils/whatsapp';
import { BUSINESS_CONFIG } from '../data/products';

export const FloatingWhatsApp: React.FC = () => {
  return (
    <aside aria-label="Support and Quick Contact" className="fixed bottom-6 right-6 z-40">
      <a
        id="floating-whatsapp-btn"
        href={generateGeneralWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 px-4 py-3 bg-[#4A5D4E] hover:bg-[#3C4A3F] text-white rounded-full shadow-lg border border-[#E8E2D9]/30 transition-all duration-300 hover:scale-105 active:scale-95"
        title="Direct WhatsApp Support"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-xs uppercase tracking-wider font-bold hidden sm:inline">
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
};
