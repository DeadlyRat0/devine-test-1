import { Review, Coupon } from '../types';

const hairOilImg = '/assets/images/divine_hair_oil_1786783803941.jpg';
const eyeRollImg = '/assets/images/divine_eye_roll_1786783817295.jpg';
const faceSerumImg = '/assets/images/divine_face_serum_1786783835861.jpg';
const clayMaskImg = '/assets/images/divine_clay_mask_1786783855178.jpg';
const hairMaskImg = '/assets/images/divine_hair_mask_1786783870479.jpg';
const shampooImg = '/assets/images/divine_shampoo_1786783907227.jpg';
const comboKitImg = '/assets/images/divine_combo_kit_1786783925652.jpg';

export const CUSTOMER_REVIEWS: Review[] = [
  {
    id: 'rev-vid-1',
    productId: 'div-hair-oil-100',
    productName: 'DIVINE 100% Natural Ayurvedic Hair Oil',
    author: 'Pooja Sharma',
    authorEmail: 'pooja.s@gmail.com',
    location: 'Jaipur, Rajasthan',
    rating: 5,
    title: 'VIDEO REVIEW: Built-in root comb applicator is a game changer!',
    date: '2 days ago',
    comment: 'The built-in root comb applicator is an absolute game-changer! No greasy hands or spillage. I was losing so much hair after seasonal changes, and within 3 weeks of using this oil twice a week, hair fall has reduced by at least 80%. Truly handcrafted quality and smells of fresh Bhringraj and cold-pressed Sesame.',
    verified: true,
    avatarBg: 'bg-[#4A5D4E]',
    helpfulCount: 42,
    hasVideo: true,
    videoDuration: '0:48',
    videoThumbnail: hairOilImg,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    images: [
      hairOilImg,
      comboKitImg
    ]
  },
  {
    id: 'rev-vid-2',
    productId: 'div-eye-roll-10',
    productName: 'DIVINE Under Eye Roll On',
    author: 'Ananya Mehra',
    authorEmail: 'ananya.m@gmail.com',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    title: 'VIDEO REVIEW: Ice cold metal roller instantly relieves tired screen eyes!',
    date: '5 days ago',
    comment: 'The metallic roller ball feels like an ice cube massage on the eyes in the morning. My stubborn dark circles from late night laptop work have visibly lightened up over 15 days. Smells calming with cucumber and Arabica green coffee.',
    verified: true,
    avatarBg: 'bg-[#3C4A3F]',
    helpfulCount: 38,
    hasVideo: true,
    videoDuration: '0:35',
    videoThumbnail: eyeRollImg,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    images: [
      eyeRollImg
    ]
  },
  {
    id: 'rev-vid-3',
    productId: 'div-face-serum-30',
    productName: 'DIVINE Botanical Face Serum',
    author: 'Kavita Sundaram',
    authorEmail: 'kavita.sundar@gmail.com',
    location: 'Chennai, Tamil Nadu',
    rating: 5,
    title: 'VIDEO DEMO: Glass skin glow without heaviness or clogged pores',
    date: '1 week ago',
    comment: 'Gives that true dewy glass skin glow without feeling heavy or sticky under Chennai humidity. The radish root and jojoba blend absorbs so quickly. Love the subtle botanical aroma!',
    verified: true,
    avatarBg: 'bg-[#2D5A34]',
    helpfulCount: 29,
    hasVideo: true,
    videoDuration: '0:42',
    videoThumbnail: faceSerumImg,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    images: [
      faceSerumImg,
      clayMaskImg
    ]
  },
  {
    id: 'rev-vid-4',
    productId: 'div-combo-hair-care',
    productName: 'DIVINE Complete Ayurvedic Hair Care Combo',
    author: 'Rahul Verma',
    authorEmail: 'rahul.v@gmail.com',
    location: 'Delhi NCR',
    rating: 5,
    title: 'VIDEO UNBOXING: Complete 3-step ritual saved my scalp & hair density',
    date: '1 week ago',
    comment: 'Ordered the complete combo kit. Payment via UPI QR was instantaneous, got immediate WhatsApp confirmation, and the parcel arrived in 3 days. The hair mask cleared my persistent winter dandruff completely.',
    verified: true,
    avatarBg: 'bg-[#4A5D4E]',
    helpfulCount: 31,
    hasVideo: true,
    videoDuration: '1:12',
    videoThumbnail: comboKitImg,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    images: [
      comboKitImg,
      hairOilImg,
      shampooImg
    ]
  },
  {
    id: 'rev-5',
    productId: 'div-clay-mask-65',
    productName: "DIVINE Fuller's Earth & Kaolin Clay Face Mask",
    author: 'Sunita Patel',
    authorEmail: 'sunita.p@gmail.com',
    location: 'Ahmedabad, Gujarat',
    rating: 5,
    title: 'Unclogs pores without leaving skin dry or stretched',
    date: '2 weeks ago',
    comment: 'Best Multani Mitti and Kaolin blend on the market! Mixed it with pure rose water and my face felt so clean and luminous immediately. Zero tightness or dryness.',
    verified: true,
    avatarBg: 'bg-[#3C4A3F]',
    helpfulCount: 19,
    images: [
      clayMaskImg
    ]
  },
  {
    id: 'rev-6',
    productId: 'div-hair-mask-50',
    productName: 'DIVINE Jujube Leaf, Bhringraj & Lilac Hair Mask',
    author: 'Meenakshi Iyer',
    authorEmail: 'meenakshi.iyer@outlook.com',
    location: 'Pune, Maharashtra',
    rating: 5,
    title: 'Silky smooth frizz control in just 1 wash',
    date: '3 weeks ago',
    comment: 'I use this once every Sunday as a deep conditioning ritual. My curly, frizzy hair became noticeably softer and manageable without using chemical silicone serums.',
    verified: true,
    avatarBg: 'bg-[#4A5D4E]',
    helpfulCount: 16,
    images: [
      hairMaskImg
    ]
  },
  {
    id: 'rev-7',
    productId: 'div-shampoo-200',
    productName: 'DIVINE Herbal Sulphate-Free Shampoo',
    author: 'Vikramaditya Rathore',
    authorEmail: 'vikram.rathore@gmail.com',
    location: 'Jodhpur, Rajasthan',
    rating: 5,
    title: 'Gentle foam with authentic Reetha & Shikakai',
    date: '1 month ago',
    comment: 'Unlike commercial SLS shampoos that strip your natural scalp sebum, this cleanses gently with genuine Reetha and Shikakai lather. Mild natural herbal fragrance.',
    verified: true,
    avatarBg: 'bg-[#2D332F]',
    helpfulCount: 14,
    images: [
      shampooImg
    ]
  }
];

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'DIVINE10',
    discountType: 'percentage',
    value: 10,
    minOrder: 399,
    description: '10% OFF on orders above ₹399'
  },
  {
    code: 'HERBAL50',
    discountType: 'fixed',
    value: 50,
    minOrder: 499,
    description: 'Flat ₹50 OFF on orders above ₹499'
  },
  {
    code: 'FIRSTDIVINE',
    discountType: 'percentage',
    value: 15,
    minOrder: 599,
    description: '15% Welcome Discount on orders above ₹599'
  }
];

export const COUPONS = AVAILABLE_COUPONS;

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
  'Chandigarh',
  'Jammu & Kashmir',
  'Ladakh'
];
