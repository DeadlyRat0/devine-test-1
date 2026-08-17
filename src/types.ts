export interface CompetitorComparison {
  brandName: string;
  price: number;
  ingredientsType: string;
  packaging: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  category: 'haircare' | 'skincare' | 'combo';
  price: number;
  originalPrice: number;
  marketPrice: number; // Market average price for competitor comparison
  size: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  badge?: string;
  isFeatured?: boolean;
  isBestseller?: boolean;
  shortDescription: string;
  description: string;
  keyIngredients: string[];
  benefits: string[];
  howToUse: string;
  image: string;
  galleryImages?: string[];
  packagingType: string;
  netWeightOrVolume: string;
  competitors?: CompetitorComparison[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SavedAddress {
  id: string;
  title: string; // e.g. "Home", "Office"
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  avatarBg?: string;
  createdAt: string;
  savedAddresses: SavedAddress[];
}

export interface CustomerDetails {
  userId?: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  orderNotes?: string;
}

export type OrderStatus = 
  | 'new' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_VERIFIED'
  | 'ORDER_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'ORDER_CANCELLED';

export type PaymentMethod = 'upi' | 'cod' | 'card' | 'netbanking' | 'gateway';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'processing';
export type FraudStatus = 'CLEARED' | 'REVIEW_REQUIRED' | 'FLAGGED';

export interface PaymentVerificationDetails {
  transactionId: string;
  gatewayRef?: string;
  verifiedAt: string;
  signatureValid: boolean;
  verifiedAmount: number;
  currency: string;
  method?: string;
  idempotencyKey?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export interface Order {
  id: string;
  userId?: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  upiUtr?: string;
  status: OrderStatus;
  trackingNumber?: string;
  notes?: string;
  fraudStatus?: FraudStatus;
  fraudReason?: string;
  fraudScore?: number;
  paymentVerification?: PaymentVerificationDetails;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'AUTH' | 'PRICE' | 'STOCK' | 'ORDER' | 'PAYMENT' | 'SECURITY';
  details: string;
  ip?: string;
  adminId?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface FraudAlert {
  id: string;
  timestamp: string;
  orderId?: string;
  orderNumber?: string;
  ip: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'REVIEWED' | 'DISMISSED';
}

export interface AdminSession {
  token: string;
  username: string;
  expiresAt: number;
  createdAt: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  description: string;
}

export interface Review {
  id: string;
  productId?: string;
  author: string;
  authorEmail?: string;
  authorPhone?: string;
  location: string;
  rating: number;
  title?: string;
  date: string;
  productName: string;
  comment: string;
  verified: boolean;
  avatarBg: string;
  helpfulCount?: number;
  images?: string[];
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: string;
  hasVideo?: boolean;
}

