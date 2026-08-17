import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { AdminModal } from './components/AdminModal';
import { ReviewsSection } from './components/ReviewsSection';
import { WriteReviewModal } from './components/WriteReviewModal';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

import { Product, CartItem, Order, UserProfile, Coupon } from './types';
import { getStoredProducts, getAuthUser, addOrder } from './utils/storage';
import { fetchCatalogProducts } from './services/api';
import { BUSINESS_CONFIG } from './data/products';
import { Sparkles, SlidersHorizontal, ArrowRight, ShieldCheck, Leaf, Truck } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getAuthUser());
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('divine_cart_items');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      const initialProds = getStoredProducts();
      return parsed
        .filter(item => item && item.product)
        .map(item => {
          const fresh = initialProds.find(p => p.id === item.product.id);
          return fresh ? { ...item, product: fresh } : item;
        });
    } catch {
      return [];
    }
  });

  // Fetch live products from server API on mount
  useEffect(() => {
    fetchCatalogProducts().then(serverProds => {
      if (serverProds && serverProds.length > 0) {
        setProducts(serverProds);
      }
    });
  }, []);

  // Filters and search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackInitialQuery, setTrackInitialQuery] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [writeReviewProduct, setWriteReviewProduct] = useState<Product | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('divine_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stockCount, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(false);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(item.product.stockCount, newQuantity) }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderCompleted = (order: Order) => {
    addOrder(order);
    setPlacedOrder(order);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);
    // Reload products to reflect any stock changes
    setProducts(getStoredProducts());
  };

  const handleTrackFromSuccess = (orderNumber: string) => {
    setIsOrderSuccessOpen(false);
    setTrackInitialQuery(orderNumber);
    setIsTrackOrderOpen(true);
  };

  // Filtered products
  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.keyIngredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const totalCartCount = (cartItems || []).reduce((acc, item) => acc + (item?.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D332F] font-sans flex flex-col selection:bg-[#4A5D4E] selection:text-white">
      {/* Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTrackOrder={() => {
          setTrackInitialQuery('');
          setIsTrackOrderOpen(true);
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Editorial Hero Banner */}
        {selectedCategory === 'all' && !searchQuery && (
          <HeroBanner
            onShopBestsellers={() => {
              const el = document.getElementById('products-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            onExploreCombos={() => {
              setSelectedCategory('combo');
              const el = document.getElementById('products-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* Products Showcase Section */}
        <section id="products-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
          
          {/* Header of Section */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#E8E2D9] mb-8 text-left">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#A89F91] block mb-1">
                {selectedCategory === 'all' ? 'Pure Ayurvedic Formulations' : `${selectedCategory.toUpperCase()} COLLECTION`}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#2D332F]">
                {selectedCategory === 'all'
                  ? 'Botanical Hair & Skin Catalog'
                  : selectedCategory === 'haircare'
                  ? 'Hair Root Therapy & Shampoos'
                  : selectedCategory === 'skincare'
                  ? 'Clarifying Clays & Glow Serums'
                  : 'Curated 3-Piece Treatment Sets'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#A89F91]">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'Formulation' : 'Formulations'}
              </span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs uppercase tracking-wider font-bold text-[#4A5D4E] hover:underline"
                >
                  View All
                </button>
              )}
            </div>
          </div>

          {/* Empty search state */}
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center bg-[#F8F6F2] border border-[#E8E2D9] space-y-3">
              <Sparkles className="w-8 h-8 text-[#A89F91] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#2D332F]">No matching botanical formulations found</h3>
              <p className="text-xs text-[#6B736E]">
                Try adjusting your search terms or view our complete handcrafted catalog.
              </p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="px-6 py-2.5 bg-[#4A5D4E] text-white text-xs uppercase tracking-wider font-bold hover:bg-[#3C4A3F] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        </section>

        {/* Customer Testimonials & Purity Badges */}
        <ReviewsSection
          allProducts={products}
          onOpenProductDetail={setSelectedProduct}
          onOpenWriteReview={(product) => {
            setWriteReviewProduct(product || products[0] || null);
            setIsWriteReviewOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenTrackOrder={() => {
          setTrackInitialQuery('');
          setIsTrackOrderOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />

      {/* Modals & Overlays */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => {
          setIsWriteReviewOpen(false);
          setWriteReviewProduct(null);
        }}
        product={writeReviewProduct || products[0] || null}
        currentUser={currentUser}
        onReviewSubmitted={() => {
          // Re-trigger re-renders
          setProducts(getStoredProducts());
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={setAppliedCoupon}
        onExploreProducts={() => {
          setIsCartOpen(false);
          document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        appliedCoupon={null}
        onOrderSuccess={handleOrderCompleted}
      />

      <OrderSuccessModal
        order={placedOrder}
        onClose={() => setIsOrderSuccessOpen(false)}
        onTrackOrder={handleTrackFromSuccess}
        onContinueShopping={() => setIsOrderSuccessOpen(false)}
      />

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        initialQuery={trackInitialQuery}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onProductsUpdated={setProducts}
      />
    </div>
  );
}

