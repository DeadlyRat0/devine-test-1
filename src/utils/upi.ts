import QRCode from 'qrcode';
import { BUSINESS_CONFIG } from '../data/products';

export interface UpiPaymentDetails {
  vpa: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
  orderNumber: string;
}

export function generateUpiUri(details: UpiPaymentDetails): string {
  const { vpa, payeeName, amount, transactionNote } = details;
  const encodedName = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(transactionNote);
  return `upi://pay?pa=${vpa}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}`;
}

export async function generateUpiQrCodeDataUrl(details: UpiPaymentDetails): Promise<string> {
  const upiUri = generateUpiUri(details);
  try {
    const dataUrl = await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#064e3b', // Deep botanical emerald
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate UPI QR code:', err);
    return '';
  }
}

export function getDivineUpiDetails(amount: number, orderNumber: string): UpiPaymentDetails {
  return {
    vpa: BUSINESS_CONFIG.upiId,
    payeeName: BUSINESS_CONFIG.name,
    amount: amount,
    transactionNote: `DIVINE Order #${orderNumber}`,
    orderNumber: orderNumber
  };
}
