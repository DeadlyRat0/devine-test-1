import { Order, OrderStatus } from '../types';
import { BUSINESS_CONFIG } from '../data/products';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

export function generateWhatsAppOrderMessage(order: Order): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}* (${item.size})\n   Qty: ${item.quantity} × ${formatPrice(item.price)} = *${formatPrice(item.price * item.quantity)}*`
    )
    .join('\n\n');

  const discountLine = order.discount > 0 ? `• Discount Applied: -${formatPrice(order.discount)} (${order.couponCode || 'PROMO'})\n` : '';
  const shippingLine = order.shippingFee === 0 ? '• Shipping: *FREE Delivery* 🚚' : `• Shipping: ${formatPrice(order.shippingFee)}`;
  const utrLine = order.upiUtr ? `• *UPI Transaction/UTR No:* ${order.upiUtr}\n` : '';
  const notesLine = order.customer?.orderNotes ? `• *Customer Note:* ${order.customer.orderNotes}\n` : '';
  const landmarkLine = order.customer?.landmark ? `• *Landmark:* ${order.customer.landmark}\n` : '';

  const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const customerName = order.customer?.fullName || 'Valued Customer';
  const customerPhone = order.customer?.phone || '';
  const customerEmail = order.customer?.email || '';
  const customerAddress = order.customer
    ? `${order.customer.address}, ${order.customer.city}, ${order.customer.district || ''}, ${order.customer.state} - ${order.customer.pinCode}`
    : 'Address on file';

  return (
    `🌿 *NEW ORDER - DIVINE HERBAL COSMETICS* 🌿\n\n` +
    `*Order Number:* #${order.orderNumber}\n` +
    `*Order Date:* ${dateStr}\n\n` +
    `👤 *CUSTOMER DETAILS:*\n` +
    `• *Name:* ${customerName}\n` +
    `• *Phone / WhatsApp:* ${customerPhone}\n` +
    `• *Email:* ${customerEmail}\n` +
    `• *Delivery Address:* ${customerAddress}\n` +
    landmarkLine +
    notesLine +
    `\n📦 *ORDERED ITEMS:*\n` +
    itemsText +
    `\n\n` +
    `💰 *PAYMENT & BILLING:*\n` +
    `• Subtotal: ${formatPrice(order.subtotal)}\n` +
    discountLine +
    shippingLine + `\n` +
    `• *GRAND TOTAL:* *${formatPrice(order.total)}*\n` +
    `• *Payment Method:* ${(order.paymentMethod || 'UPI').toUpperCase()}\n` +
    `• *Payment Status:* ${(order.paymentStatus || 'VERIFIED').toUpperCase()}\n` +
    utrLine +
    `\n✅ *Order Status:* ${(order.status || 'CONFIRMED').toUpperCase()}\n\n` +
    `✨ *DIVINE Herbal Cosmetics* - 100% Ayurvedic Care`
  );
}

export function generateBusinessWhatsAppLink(order: Order): string {
  const message = generateWhatsAppOrderMessage(order);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${BUSINESS_CONFIG.whatsappInternational}?text=${encoded}`;
}

export function generateProductInquiryWhatsAppLink(productName: string): string {
  const text = `Hi DIVINE Herbal Cosmetics, I am interested in purchasing *${productName}*. Please share more details regarding availability and ordering.`;
  return `https://wa.me/${BUSINESS_CONFIG.whatsappInternational}?text=${encodeURIComponent(text)}`;
}

export function generateGeneralWhatsAppLink(): string {
  const text = `Hi DIVINE Herbal Cosmetics! I would like to know more about your Ayurvedic hair and skin care products.`;
  return `https://wa.me/${BUSINESS_CONFIG.whatsappInternational}?text=${encodeURIComponent(text)}`;
}

export function generateCustomerUpdateWhatsAppLink(order: Order, newStatus: OrderStatus): string {
  const customerPhone = order.customer?.phone || '';
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  
  let statusMessage = '';
  switch (newStatus) {
    case 'confirmed':
      statusMessage = 'has been *Confirmed* and is being packed with fresh handcrafted botanical batches! 🌿';
      break;
    case 'processing':
      statusMessage = 'is currently being *Prepared & Packed* with quality checks. 📦';
      break;
    case 'shipped':
      statusMessage = `has been *Shipped*! ${order.trackingNumber ? `Tracking No: *${order.trackingNumber}*` : ''} 🚚 It will reach you soon!`;
      break;
    case 'delivered':
      statusMessage = 'has been *Delivered*! We hope you love your 100% Ayurvedic self-care ritual. ✨';
      break;
    case 'cancelled':
      statusMessage = 'has been cancelled. Please contact us if this was unexpected.';
      break;
    default:
      statusMessage = `is currently *${newStatus}*.`;
  }

  const customerName = order.customer?.fullName || 'Valued Customer';
  const customerCity = order.customer?.city || '';
  const customerState = order.customer?.state || '';
  const locationStr = customerCity && customerState ? `${customerCity}, ${customerState}` : 'India';

  const text = 
    `Hello ${customerName}! 🌿\n\n` +
    `Update on your DIVINE Herbal Cosmetics Order *#${order.orderNumber}*:\n` +
    `Your order ${statusMessage}\n\n` +
    `Total Amount: *${formatPrice(order.total)}*\n` +
    `Delivery To: ${locationStr}\n\n` +
    `For any support, feel free to reply directly here or call us at +91 ${BUSINESS_CONFIG.phone}.\n` +
    `Thank you for trusting DIVINE Herbal Cosmetics! ✨`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}
