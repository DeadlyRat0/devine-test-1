import { Product, Order, OrderStatus, UserProfile, SavedAddress, Review } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { CUSTOMER_REVIEWS } from '../data/reviews';

const PRODUCTS_STORAGE_KEY = 'divine_herbal_products_v3';
const ORDERS_STORAGE_KEY = 'divine_herbal_orders_v2';
const USERS_STORAGE_KEY = 'divine_herbal_users_v1';
const AUTH_USER_KEY = 'divine_herbal_auth_user_v1';
const REVIEWS_STORAGE_KEY = 'divine_herbal_reviews_v1';

// Initial sample users with saved addresses for realistic experience
const SAMPLE_INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-pooja-1',
    fullName: 'Pooja Sharma',
    email: 'pooja.s@gmail.com',
    phone: '9829012345',
    password: 'password123',
    avatarBg: 'bg-[#4A5D4E]',
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    savedAddresses: [
      {
        id: 'addr-1',
        title: 'Home (Jaipur)',
        fullName: 'Pooja Sharma',
        phone: '9829012345',
        email: 'pooja.s@gmail.com',
        address: 'Plot 42, Green Avenue, Vaishali Nagar',
        landmark: 'Near Gandhi Park',
        city: 'Jaipur',
        district: 'Jaipur',
        state: 'Rajasthan',
        pinCode: '302021',
        isDefault: true
      },
      {
        id: 'addr-2',
        title: 'Office (Workplace)',
        fullName: 'Pooja Sharma',
        phone: '9829012345',
        email: 'pooja.s@gmail.com',
        address: 'Tower B, 4th Floor, IT City, Sitapura Industrial Area',
        landmark: 'Opposite Metro Station Gate 2',
        city: 'Jaipur',
        district: 'Jaipur',
        state: 'Rajasthan',
        pinCode: '302022',
        isDefault: false
      }
    ]
  },
  {
    id: 'user-rahul-2',
    fullName: 'Rahul Verma',
    email: 'rahul.v@gmail.com',
    phone: '9811223344',
    password: 'password123',
    avatarBg: 'bg-[#3C4A3F]',
    createdAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
    savedAddresses: [
      {
        id: 'addr-3',
        title: 'Residence',
        fullName: 'Rahul Verma',
        phone: '9811223344',
        email: 'rahul.v@gmail.com',
        address: 'Flat 304, Palm Heights, Sector 62',
        city: 'Noida',
        district: 'Gautam Buddha Nagar',
        state: 'Uttar Pradesh',
        pinCode: '201301',
        isDefault: true
      }
    ]
  }
];

// Initial sample orders
const SAMPLE_INITIAL_ORDERS: Order[] = [
  {
    id: 'div-ord-1001',
    userId: 'user-pooja-1',
    orderNumber: 'DIV-849201',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer: {
      userId: 'user-pooja-1',
      fullName: 'Pooja Sharma',
      phone: '9829012345',
      email: 'pooja.s@gmail.com',
      address: 'Plot 42, Green Avenue, Vaishali Nagar',
      landmark: 'Near Gandhi Park',
      city: 'Jaipur',
      district: 'Jaipur',
      state: 'Rajasthan',
      pinCode: '302021',
      orderNotes: 'Please ring the bell twice on delivery'
    },
    items: [
      {
        productId: 'div-hair-oil-100',
        name: 'DIVINE 100% Natural Ayurvedic Hair Oil',
        price: 450,
        quantity: 2,
        size: '100 ml',
        image: INITIAL_PRODUCTS[0].image
      },
      {
        productId: 'div-eye-roll-10',
        name: 'DIVINE Under Eye Roll On',
        price: 199,
        quantity: 1,
        size: '10 ml',
        image: INITIAL_PRODUCTS[1].image
      }
    ],
    subtotal: 1099,
    discount: 50,
    couponCode: 'HERBAL50',
    shippingFee: 0,
    total: 1049,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    upiUtr: 'AXL98421092837',
    status: 'confirmed',
    trackingNumber: 'DTDC98234812IN'
  },
  {
    id: 'div-ord-1002',
    userId: 'user-rahul-2',
    orderNumber: 'DIV-849195',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    customer: {
      userId: 'user-rahul-2',
      fullName: 'Rahul Verma',
      phone: '9811223344',
      email: 'rahul.v@gmail.com',
      address: 'Flat 304, Palm Heights, Sector 62',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      state: 'Uttar Pradesh',
      pinCode: '201301'
    },
    items: [
      {
        productId: 'div-combo-hair-care',
        name: 'DIVINE Complete Ayurvedic Hair Care Combo',
        price: 649,
        quantity: 1,
        size: '3-Piece Kit',
        image: INITIAL_PRODUCTS[6].image
      }
    ],
    subtotal: 649,
    discount: 0,
    shippingFee: 0,
    total: 649,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    upiUtr: 'AXL55621008892',
    status: 'shipped',
    trackingNumber: 'BLUEDART4482910IN'
  }
];

// ================= USER AUTH & PROFILE MANAGEMENT =================

export function getStoredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_USERS));
      return SAMPLE_INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SAMPLE_INITIAL_USERS;
  } catch (e) {
    console.error('Error loading users:', e);
    return SAMPLE_INITIAL_USERS;
  }
}

export function saveStoredUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users:', e);
  }
}

export function getAuthUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading auth user:', e);
    return null;
  }
}

export function setAuthUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (e) {
    console.error('Error setting auth user:', e);
  }
}

export function registerUser(data: {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  address?: Partial<SavedAddress>;
}): { success: boolean; user?: UserProfile; message?: string } {
  const users = getStoredUsers();
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPhone = data.phone.trim().replace(/[^0-9]/g, '');

  // Check existing
  const existing = users.find(
    u => u.email.toLowerCase() === cleanEmail || u.phone.replace(/[^0-9]/g, '') === cleanPhone
  );

  if (existing) {
    return { success: false, message: 'An account with this email or mobile number already exists.' };
  }

  const newId = `user-${Date.now()}`;
  const initialAddress: SavedAddress[] = data.address?.address ? [
    {
      id: `addr-${Date.now()}`,
      title: data.address.title || 'Home',
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      address: data.address.address,
      landmark: data.address.landmark || '',
      city: data.address.city || '',
      district: data.address.district || data.address.city || '',
      state: data.address.state || 'Rajasthan',
      pinCode: data.address.pinCode || '',
      isDefault: true
    }
  ] : [];

  const newUser: UserProfile = {
    id: newId,
    fullName: data.fullName.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: data.password || 'password123',
    avatarBg: 'bg-[#4A5D4E]',
    createdAt: new Date().toISOString(),
    savedAddresses: initialAddress
  };

  const updatedUsers = [...users, newUser];
  saveStoredUsers(updatedUsers);
  setAuthUser(newUser);

  return { success: true, user: newUser };
}

export function loginUser(identifier: string, password?: string): { success: boolean; user?: UserProfile; message?: string } {
  const users = getStoredUsers();
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = identifier.trim().replace(/[^0-9]/g, '');

  const user = users.find(
    u => u.email.toLowerCase() === clean || (cleanPhone.length >= 10 && u.phone.includes(cleanPhone))
  );

  if (!user) {
    return { success: false, message: 'No account found with this email or mobile number.' };
  }

  // If password provided and user has password, check match
  if (password && user.password && user.password !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  setAuthUser(user);
  return { success: true, user };
}

export function logoutUser(): void {
  setAuthUser(null);
}

export function updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return null;

  const updatedUser = {
    ...users[index],
    ...updates
  };

  users[index] = updatedUser;
  saveStoredUsers(users);

  const currentUser = getAuthUser();
  if (currentUser && currentUser.id === userId) {
    setAuthUser(updatedUser);
  }

  return updatedUser;
}

export function addSavedAddress(userId: string, address: Omit<SavedAddress, 'id'>): SavedAddress[] {
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return [];

  const newAddress: SavedAddress = {
    ...address,
    id: `addr-${Date.now()}`,
    isDefault: address.isDefault ?? (user.savedAddresses.length === 0)
  };

  let updatedAddresses = [...user.savedAddresses];
  if (newAddress.isDefault) {
    updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
  }
  updatedAddresses.push(newAddress);

  user.savedAddresses = updatedAddresses;
  saveStoredUsers(users);

  const currentUser = getAuthUser();
  if (currentUser && currentUser.id === userId) {
    setAuthUser(user);
  }

  return updatedAddresses;
}

export function updateSavedAddress(userId: string, addressId: string, updates: Partial<SavedAddress>): SavedAddress[] {
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return [];

  let updatedAddresses = user.savedAddresses.map(a => {
    if (a.id === addressId) {
      return { ...a, ...updates };
    }
    if (updates.isDefault) {
      return { ...a, isDefault: false };
    }
    return a;
  });

  user.savedAddresses = updatedAddresses;
  saveStoredUsers(users);

  const currentUser = getAuthUser();
  if (currentUser && currentUser.id === userId) {
    setAuthUser(user);
  }

  return updatedAddresses;
}

export function deleteSavedAddress(userId: string, addressId: string): SavedAddress[] {
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return [];

  const updatedAddresses = user.savedAddresses.filter(a => a.id !== addressId);
  // Ensure at least one is default if list not empty
  if (updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
    updatedAddresses[0].isDefault = true;
  }

  user.savedAddresses = updatedAddresses;
  saveStoredUsers(users);

  const currentUser = getAuthUser();
  if (currentUser && currentUser.id === userId) {
    setAuthUser(user);
  }

  return updatedAddresses;
}

export function setDefaultSavedAddress(userId: string, addressId: string): SavedAddress[] {
  return updateSavedAddress(userId, addressId, { isDefault: true });
}

// ================= PRODUCT REVIEWS SYSTEM =================

export function getStoredReviews(): Review[] {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(CUSTOMER_REVIEWS));
      return CUSTOMER_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge initial video review items if not present
      const existingIds = new Set(parsed.map(r => r.id));
      const missingInitial = CUSTOMER_REVIEWS.filter(r => !existingIds.has(r.id));
      if (missingInitial.length > 0) {
        const merged = [...missingInitial, ...parsed];
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return CUSTOMER_REVIEWS;
  } catch (e) {
    console.error('Error loading reviews:', e);
    return CUSTOMER_REVIEWS;
  }
}

export function saveStoredReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error('Error saving reviews:', e);
  }
}

export function getReviewsForProduct(productId: string): Review[] {
  const reviews = getStoredReviews();
  return reviews.filter(r => r.productId === productId || !r.productId);
}

export function addProductReview(review: Omit<Review, 'id' | 'date'> & { date?: string }): { success: boolean; review: Review } {
  const reviews = getStoredReviews();
  const newReview: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    date: review.date || 'Just now',
    helpfulCount: 0
  };

  const updated = [newReview, ...reviews];
  saveStoredReviews(updated);

  // Recalculate average rating & review count for product
  recalculateProductRatings();

  return { success: true, review: newReview };
}

export function voteReviewHelpful(reviewId: string): Review[] {
  const reviews = getStoredReviews();
  const updated = reviews.map(r => {
    if (r.id === reviewId) {
      return { ...r, helpfulCount: (r.helpfulCount || 0) + 1 };
    }
    return r;
  });
  saveStoredReviews(updated);
  return updated;
}

export function isUserVerifiedBuyer(productId: string, emailOrPhone?: string): boolean {
  if (!emailOrPhone) return false;
  const clean = emailOrPhone.trim().toLowerCase();
  const cleanPhone = emailOrPhone.replace(/[^0-9]/g, '');
  const orders = getStoredOrders();

  return orders.some(ord => {
    const matchesEmail = ord.customer.email && ord.customer.email.toLowerCase() === clean;
    const matchesPhone = ord.customer.phone && ord.customer.phone.replace(/[^0-9]/g, '').includes(cleanPhone);
    const hasProduct = ord.items.some(it => it.productId === productId);
    return (matchesEmail || matchesPhone) && hasProduct;
  });
}

export function recalculateProductRatings(): void {
  const products = getStoredProducts() || [];
  const reviews = getStoredReviews() || [];

  const safeProducts = Array.isArray(products) ? products : [];
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const updated = safeProducts.map(prod => {
    if (!prod) return prod;
    const prodReviews = safeReviews.filter(r => r && r.productId === prod.id);
    if (prodReviews.length > 0) {
      const avg = Number((prodReviews.reduce((sum, r) => sum + (r?.rating || 5), 0) / prodReviews.length).toFixed(1));
      return {
        ...prod,
        rating: avg,
        reviewCount: prodReviews.length
      };
    }
    return prod;
  });

  saveStoredProducts(updated);
}

// ================= PRODUCT & INVENTORY MANAGEMENT =================

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure missing metadata from INITIAL_PRODUCTS (like marketPrice, galleryImages, competitors) is merged
      const enriched = parsed.map(p => {
        const init = INITIAL_PRODUCTS.find(i => i.id === p.id);
        return {
          ...p,
          marketPrice: p.marketPrice || init?.marketPrice || Math.round(p.price * 2.2),
          galleryImages: p.galleryImages || init?.galleryImages || [p.image],
          competitors: p.competitors || init?.competitors || []
        };
      });
      return enriched;
    }
    return INITIAL_PRODUCTS;
  } catch (e) {
    console.error('Error loading products from localStorage:', e);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products to localStorage:', e);
  }
}

export function resetStoredProductsToDefault(): Product[] {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  } catch (e) {
    return INITIAL_PRODUCTS;
  }
}

// ================= ORDERS MANAGEMENT =================

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_ORDERS));
      return SAMPLE_INITIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return SAMPLE_INITIAL_ORDERS;
  } catch (e) {
    console.error('Error loading orders from localStorage:', e);
    return SAMPLE_INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders to localStorage:', e);
  }
}

export function addOrder(order: Order): void {
  const currentOrders = getStoredOrders();
  const updated = [order, ...currentOrders];
  saveStoredOrders(updated);

  // Decrement stock for purchased products
  const products = getStoredProducts();
  let modified = false;

  order.items.forEach(item => {
    const pIndex = products.findIndex(p => p.id === item.productId);
    if (pIndex !== -1) {
      const currentStock = products[pIndex].stockCount;
      const newStock = Math.max(0, currentStock - item.quantity);
      products[pIndex].stockCount = newStock;
      if (newStock === 0) {
        products[pIndex].inStock = false;
      }
      modified = true;
    }
  });

  if (modified) {
    saveStoredProducts(products);
  }
}

export function updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string): Order[] {
  const orders = getStoredOrders();
  const updated = orders.map(ord => {
    if (ord.id === orderId || ord.orderNumber === orderId) {
      return {
        ...ord,
        status,
        ...(trackingNumber ? { trackingNumber } : {})
      };
    }
    return ord;
  });
  saveStoredOrders(updated);
  return updated;
}

export function getUserOrders(userId?: string, email?: string, phone?: string): Order[] {
  const orders = getStoredOrders();
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPhone = phone?.trim().replace(/[^0-9]/g, '');

  return orders.filter(ord => {
    if (userId && ord.userId === userId) return true;
    if (userId && ord.customer.userId === userId) return true;
    if (cleanEmail && ord.customer.email && ord.customer.email.toLowerCase() === cleanEmail) return true;
    if (cleanPhone && cleanPhone.length >= 10 && ord.customer.phone.replace(/[^0-9]/g, '').includes(cleanPhone)) return true;
    return false;
  });
}

export function findOrderByNumberOrPhone(query: string): Order | undefined {
  const clean = query.trim().toLowerCase().replace('#', '');
  const orders = getStoredOrders();
  return orders.find(ord => 
    ord.orderNumber.toLowerCase() === clean ||
    ord.id.toLowerCase() === clean ||
    ord.customer.phone.replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, ''))
  );
}

