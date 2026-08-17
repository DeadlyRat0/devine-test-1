import { Product } from '../types';

const hairOilImg = '/assets/images/divine_hair_oil_1786783803941.jpg';
const eyeRollImg = '/assets/images/divine_eye_roll_1786783817295.jpg';
const faceSerumImg = '/assets/images/divine_face_serum_1786783835861.jpg';
const clayMaskImg = '/assets/images/divine_clay_mask_1786783855178.jpg';
const hairMaskImg = '/assets/images/divine_hair_mask_1786783870479.jpg';
const shampooImg = '/assets/images/divine_shampoo_1786783907227.jpg';
const comboKitImg = '/assets/images/divine_combo_kit_1786783925652.jpg';
const heroBannerImg = '/assets/images/divine_hero_banner_1786783889022.jpg';

export const HERO_BANNER_IMAGE = heroBannerImg;

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'div-hair-oil-100',
    name: 'DIVINE 100% Natural Ayurvedic Hair Oil',
    slug: 'divine-ayurvedic-hair-oil',
    subtitle: 'Handcrafted Root-Feeder Oil with Root Comb Applicator',
    category: 'haircare',
    price: 450,
    originalPrice: 550,
    marketPrice: 799, // Market Ayurvedic Brands average price
    size: '100 ml',
    netWeightOrVolume: '100ml Bottle with Comb Cap',
    packagingType: 'Comb Applicator Bottle',
    rating: 4.9,
    reviewCount: 148,
    inStock: true,
    stockCount: 45,
    badge: 'Bestseller 🔥',
    isFeatured: true,
    isBestseller: true,
    shortDescription: 'Controls severe hair fall, stimulates new follicles, and eliminates dandruff with pure Ayurvedic herbs.',
    description: 'DIVINE 100% Natural Ayurvedic Hair Oil is meticulously handcrafted using ancient Ayurvedic decoction methods. Enriched with Bhringraj, Brahmi, Amla, Hibiscus, and cold-pressed pure oils. Equipped with an innovative comb applicator cap that delivers nutrition directly to the hair roots without mess.',
    keyIngredients: [
      'Bhringraj (Eclipta Alba) - Hair growth booster',
      'Brahmi - Scalp cooling & stress relief',
      'Fresh Amla - Rich in Vitamin C & prevents premature greying',
      'Hibiscus Petals - Deep conditioning & shine',
      'Methi (Fenugreek) - Controls stubborn dandruff',
      'Pure Cold-Pressed Virgin Coconut & Sesame Base'
    ],
    benefits: [
      'Significantly reduces hair fall in just 14 to 21 days',
      'Nourishes dormant hair roots to stimulate new hair regrowth',
      'Comb cap allows direct scalp delivery and improves blood circulation',
      'Prevents itchy scalp and controls dry & sticky dandruff',
      '100% Chemical-Free, Mineral Oil-Free, and Paraben-Free'
    ],
    howToUse: 'Attach the comb applicator cap. Glide the teeth through your dry hair to dispense oil directly to the scalp. Gently massage with your fingertips in circular motion for 5-10 minutes. Leave it on overnight or at least 2 hours before washing with DIVINE Herbal Shampoo.',
    image: hairOilImg,
    galleryImages: [
      hairOilImg,
      heroBannerImg,
      comboKitImg
    ],
    competitors: [
      {
        brandName: 'Commercial Ayurvedic Luxury Brands',
        price: 795,
        ingredientsType: 'Often contains Light Liquid Paraffin (LLP) & Synthetic Fragrance',
        packaging: 'Standard glass/plastic bottle with no applicator (spills easily)'
      },
      {
        brandName: 'Online D2C Commercial Brands',
        price: 599,
        ingredientsType: 'Diluted herbal extracts in synthetic carrier oils',
        packaging: 'Dropper or flip cap (inefficient root reach)'
      },
      {
        brandName: 'DIVINE Handcrafted Direct',
        price: 450,
        ingredientsType: '100% Pure Slow-Cooked Decoction, Cold-Pressed Base & Zero Mineral Oil',
        packaging: 'Innovative Root Comb Applicator for zero mess & deep root penetration'
      }
    ]
  },
  {
    id: 'div-eye-roll-10',
    name: 'DIVINE Under Eye Roll On',
    slug: 'divine-under-eye-roll-on',
    subtitle: 'Cooling Metal Roller Ball for Dark Circles & Puffiness',
    category: 'skincare',
    price: 199,
    originalPrice: 280,
    marketPrice: 499,
    size: '10 ml',
    netWeightOrVolume: '10ml Roller Pen',
    packagingType: 'Cooling Metal Roller Ball Bottle',
    rating: 4.8,
    reviewCount: 94,
    inStock: true,
    stockCount: 32,
    badge: 'Dark Circle Eraser ✨',
    isFeatured: true,
    isBestseller: true,
    shortDescription: 'Instant cooling roller ball that visibly lightens stubborn dark circles, reduces eye bags, and smooths fine lines.',
    description: 'Tired, puffy eyes and dark circles? DIVINE Under Eye Roll On combines the potency of coffee bean extract, cold-pressed cucumber seed oil, sweet almond oil, and aloe vera. The metallic 360° roller ball provides an instant cooling lymphatic massage, boosting micro-circulation and waking up fatigued eyes.',
    keyIngredients: [
      'Coffee Bean Extract - Improves circulation & fades darkness',
      'Cucumber Seed Oil - Instantly depuffs and cools swollen skin',
      'Pure Sweet Almond Oil - Lightens pigmentation & nourishes',
      'Radish Root Ferment - Natural antioxidant & skin barrier protector',
      'Vitamin E (Tocopherol) - Smooths crow’s feet & prevents fine lines',
      'Pure Aloe Vera Gel Extract - Deep 24hr hydration'
    ],
    benefits: [
      'Visibly lightens dark circles within 2-3 weeks of regular use',
      'Instantly depuffs morning eye bags with soothing metallic cooling',
      'Hydrates delicate under-eye skin without heaviness or milia risk',
      'Convenient travel-friendly roller format, no mess, quick absorption',
      'Sulphate, Paraben, and Synthetic Fragrance Free'
    ],
    howToUse: 'Gently shake the bottle. Glide the cooling roller ball under each eye from inner to outer corner 2-3 times morning and before bed. Lightly dab any excess with your ring finger until absorbed. Can also be stored in the refrigerator for an extra cooling boost!',
    image: eyeRollImg,
    galleryImages: [
      eyeRollImg,
      heroBannerImg,
      faceSerumImg
    ],
    competitors: [
      {
        brandName: 'High-End Retail Eye Creams',
        price: 850,
        ingredientsType: 'Silicones, PEG stabilizers & artificial perfumes',
        packaging: 'Jar requiring dirty finger dips'
      },
      {
        brandName: 'Commercial Eye Rollers',
        price: 449,
        ingredientsType: 'Synthetic caffeine solutions with alcohol denat',
        packaging: 'Plastic roller ball with limited cooling'
      },
      {
        brandName: 'DIVINE Handcrafted Direct',
        price: 199,
        ingredientsType: 'Whole Arabica Coffee, Cucumber Seed Oil, Sweet Almond & Radish Ferment',
        packaging: 'Surgical-Grade Stainless Steel 360° Cooling Roller Ball'
      }
    ]
  },
  {
    id: 'div-face-serum-30',
    name: 'DIVINE Botanical Face Serum',
    slug: 'divine-botanical-face-serum',
    subtitle: 'Antioxidant & Radiance Booster with Radish Root & Jojoba Oil',
    category: 'skincare',
    price: 299,
    originalPrice: 399,
    marketPrice: 699,
    size: '30 ml',
    netWeightOrVolume: '30ml Dropper Bottle',
    packagingType: 'UV-Protected Amber Dropper Bottle',
    rating: 4.9,
    reviewCount: 112,
    inStock: true,
    stockCount: 28,
    badge: 'Glass Skin Glow 🌟',
    isFeatured: true,
    isBestseller: true,
    shortDescription: 'Ultra-lightweight antioxidant serum that restores radiant glow, fades dark spots, and locks in youthful bounce.',
    description: 'Transform dull, uneven skin with DIVINE Botanical Face Serum. Specially formulated with natural radish root extract, cold-pressed golden jojoba oil, pure rosehip seed oil, and Moroccan argan oil. It absorbs rapidly into the dermal layers without feeling greasy, creating an enviable glass-skin dewiness.',
    keyIngredients: [
      'Radish Root Extract - Potent natural antioxidant & moisture binder',
      'Golden Jojoba Oil - Balances sebum and mimics skin’s natural lipid barrier',
      'Pure Rosehip Seed Oil - Fades acne scars and dark hyperpigmentation',
      'Moroccan Argan Oil - Boosts elasticity and collagen synthesis',
      'Avocado Oil - Deep cellular nourishment with essential fatty acids',
      'Sweet Almond Oil - Brightens complexion and evens skin tone'
    ],
    benefits: [
      'Delivers an instant healthy, non-greasy dewy radiance',
      'Fades stubborn blemishes, post-acne marks, and sun spots',
      'Deeply locks in moisture for supple, plump texture all day',
      'Strengthens skin moisture barrier against pollution and harsh weather',
      'Non-comedogenic formula suitable for all skin types including sensitive'
    ],
    howToUse: 'Cleanse your face thoroughly. Take 3 to 4 drops of DIVINE Face Serum onto clean palms or directly on forehead and cheeks. Gently press and massage in upward circular motions until fully absorbed. Follow with moisturizer or sunscreen.',
    image: faceSerumImg,
    galleryImages: [
      faceSerumImg,
      clayMaskImg,
      heroBannerImg
    ],
    competitors: [
      {
        brandName: 'Dermatological Cosmetic Serums',
        price: 999,
        ingredientsType: 'Synthetic actives in silicone base (clogs pores over time)',
        packaging: 'Standard clear glass bottle prone to oxidation'
      },
      {
        brandName: 'Commercial Organic Serums',
        price: 699,
        ingredientsType: 'Low concentration actives with high water/filler ratios',
        packaging: 'Plastic pump bottle'
      },
      {
        brandName: 'DIVINE Handcrafted Direct',
        price: 299,
        ingredientsType: 'Pure Cold-Pressed Golden Jojoba, Rosehip, Argan & Fermented Radish Root',
        packaging: 'Medical-Grade UV Amber Glass Dropper for maximum botanical potency'
      }
    ]
  },
  {
    id: 'div-clay-mask-65',
    name: "DIVINE Fuller's Earth & Kaolin Clay Face Mask",
    slug: 'divine-clay-face-mask',
    subtitle: 'Detox • Brighten • Rejuvenate 100% Natural Herbal Pack',
    category: 'skincare',
    price: 149,
    originalPrice: 199,
    marketPrice: 349,
    size: '65 gm',
    netWeightOrVolume: '65g Eco Herbal Jar',
    packagingType: 'Aesthetic Jar with Airtight Seal',
    rating: 4.8,
    reviewCount: 88,
    inStock: true,
    stockCount: 50,
    badge: 'Instant Brightening 🍃',
    isFeatured: true,
    isBestseller: false,
    shortDescription: 'Deep pore detox mask that absorbs excess oil, calms active acne, and unveils fresh, bright porcelain skin.',
    description: "An authentic Ayurvedic face treatment crafted with therapeutic Multani Mitti (Fuller's Earth), micro-fine Kaolin Clay, Kasturi Manjal (Wild Turmeric), pure Sandalwood, and Neem. Formulated to unclog pores, eliminate blackheads, draw out environmental toxins, and leave your face visibly brighter in one use.",
    keyIngredients: [
      "Pure Multani Mitti (Fuller's Earth) - Deep pore suction & oil control",
      'Cosmetic Kaolin Clay - Softens skin & gently exfoliates dead cells',
      'Kasturi Manjal (Wild Turmeric) - Anti-bacterial glow with zero yellow staining',
      'Pure Chandan (Sandalwood) - Calms redness and soothes irritated skin',
      'Organic Neem Leaf Powder - Fights acne-causing bacteria',
      'Sun-Dried Damask Rose Petal Extract - Restores natural skin pH'
    ],
    benefits: [
      'Draws out trapped dirt, pollution, and excess sebum instantly',
      'Minimizes the appearance of open pores and prevents blackheads',
      'Provides an immediate visible skin brightening effect after washing',
      'Soothes sun tan, active pimples, and redness naturally',
      '100% Chemical-free, no fillers, artificial colors, or preservatives'
    ],
    howToUse: 'Take 1-2 teaspoons of mask powder in a bowl. Mix with pure rose water (for oily/normal skin) or raw milk/curd (for dry skin) to form a creamy paste. Apply evenly to face and neck, avoiding the eye contour. Relax for 10-12 minutes until semi-dry. Rinse gently with cold water while massaging in small circles.',
    image: clayMaskImg,
    galleryImages: [
      clayMaskImg,
      faceSerumImg,
      heroBannerImg
    ],
    competitors: [
      {
        brandName: 'Commercial Sheet & Mud Masks',
        price: 399,
        ingredientsType: 'Preserved with parabens, synthetic thickeners & artificial colorants',
        packaging: 'Single-use plastic packets with plastic waste'
      },
      {
        brandName: 'Local Packaged Multani Mitti',
        price: 199,
        ingredientsType: 'Coarse ground, non-cosmetic grade clay with dust & zero herbal actives',
        packaging: 'Open loose bags losing herbal potency'
      },
      {
        brandName: 'DIVINE Handcrafted Direct',
        price: 149,
        ingredientsType: "Micro-Fine Fuller's Earth, Cosmetic Kaolin, Kasturi Manjal, Sandalwood & Neem",
        packaging: 'Eco Herbal Moisture-Lock Sealed Jar for freshness'
      }
    ]
  },
  {
    id: 'div-hair-mask-50',
    name: 'DIVINE Jujube Leaf, Bhringraj & Lilac Hair Mask',
    slug: 'divine-jujube-bhringraj-hair-mask',
    subtitle: '100% Herbal Root Therapy for Dandruff & Hair Thinning',
    category: 'haircare',
    price: 169,
    originalPrice: 220,
    marketPrice: 399,
    size: '50 gm',
    netWeightOrVolume: '50g Herbal Powder Tub',
    packagingType: 'Herbal Moisture-Lock Jar',
    rating: 4.9,
    reviewCount: 76,
    inStock: true,
    stockCount: 38,
    badge: 'Root Repair & Volume 🌿',
    isFeatured: false,
    isBestseller: false,
    shortDescription: 'Intensive herbal scalp therapy that eradicates dandruff, stops hair breakage, and adds voluminous bounce.',
    description: 'Infused with rare Jujube Leaf (Ber Patta), potent Bhringraj, Indian Lilac (Neem Leaf), Shikakai, and Brahmi. This Ayurvedic hair mask detoxifies the scalp, cleanses stubborn fungal dandruff flakes, repairs split ends, and leaves hair naturally soft, lustrous, and thick.',
    keyIngredients: [
      'Jujube Leaf (Ber Patta) - Ancient remedy for extreme hair strengthening',
      'Bhringraj (King of Hair) - Revitalizes hair follicles & promotes density',
      'Indian Lilac (Neem Leaf) - Natural anti-fungal to permanently stop dandruff',
      'Shikakai & Reetha - Natural gentle herbal cleansing without harsh salts',
      'Brahmi Leaf Powder - Prevents premature split ends and breakage',
      'Hibiscus Flower - Infuses deep natural moisture and glossy shine'
    ],
    benefits: [
      'Clears stubborn scalp flakes and itching from the very first wash',
      'Strengthens fragile hair roots to prevent shedding during brushing',
      'Restores silky softness and natural bounce to dry, chemically treated hair',
      'Helps thicken hair strands over consistent weekly applications',
      '100% Pure ground whole herbs, completely free from chemicals & microplastics'
    ],
    howToUse: 'Mix 2-3 tablespoons of DIVINE Hair Mask with warm water, curd, or aloe vera juice to make a smooth paste. Part your hair and apply from roots all the way to ends. Leave for 30 to 45 minutes. Rinse thoroughly with water and follow with DIVINE Herbal Shampoo if required.',
    image: hairMaskImg,
    galleryImages: [
      hairMaskImg,
      hairOilImg,
      shampooImg
    ],
    competitors: [
      {
        brandName: 'Salon Chemical Hair Spas',
        price: 650,
        ingredientsType: 'Heavy Silicones (Dimethicone) & Quats that cause long-term scalp buildup',
        packaging: 'Large synthetic tub'
      },
      {
        brandName: 'Commercial Hair Masks',
        price: 380,
        ingredientsType: 'Water base with microplastic polymers and synthetic fragrance',
        packaging: 'Plastic squeeze tube'
      },
      {
        brandName: 'DIVINE Handcrafted Direct',
        price: 169,
        ingredientsType: '100% Whole Sun-Dried Botanical Powders: Jujube Leaf, Bhringraj, Neem & Shikakai',
        packaging: 'Moisture-Lock Sealed Jar for maximum herbal longevity'
      }
    ]
  },
  {
    id: 'div-shampoo-200',
    name: 'DIVINE Herbal Sulphate-Free Shampoo',
    slug: 'divine-herbal-shampoo',
    subtitle: 'Aloe Vera, Bhringraj & Amla Gentle Scalp Cleanser',
    category: 'haircare',
    price: 299,
    originalPrice: 350,
    marketPrice: 599,
    size: '200 ml',
    netWeightOrVolume: '200ml Pump Dispenser Bottle',
    packagingType: 'Pump Dispenser Bottle',
    rating: 4.8,
    reviewCount: 82,
    inStock: true,
    stockCount: 40,
    badge: 'Gentle Cleanse 🫧',
    isFeatured: true,
    isBestseller: false,
    shortDescription: 'Gentle, zero-sulphate herbal shampoo that cleanses without stripping moisture, leaving hair silky and manageable.',
    description: 'Conventional shampoos strip away your scalp’s protective natural sebum, leading to rebound oiliness and severe hair fall. DIVINE Herbal Shampoo cleanses with organic saponins from Reetha and Shikakai, enriched with fresh Aloe Vera gel, Bhringraj, and Amla extracts to keep your hair soft, nourished, and bouncy.',
    keyIngredients: [
      'Pure Aloe Vera Leaf Juice - Soothes and intensely hydrates the scalp',
      'Bhringraj Extract - Fortifies hair shafts and prevents root weakening',
      'Amla Extract - Rich in Vitamin C to maintain natural hair color and shine',
      'Shikakai & Reetha - Gentle herbal lather that preserves essential oils',
      'Tea Tree Oil - Keeps scalp fresh, bacteria-free, and cooling',
      'Plant Keratin & Provitamin B5 - Smooths frizzy flyaways'
    ],
    benefits: [
      '100% Free of SLS, SLES, Sulphates, Parabens, Silicones, and Mineral Oil',
      'Cleanses scalp thoroughly without making lengths dry or straw-like',
      'Safe for colored, keratin-treated, and daily hair washing routines',
      'Significantly reduces shower hair shedding and detangles effortlessly',
      'Delightful natural botanical aroma that stays fresh all day'
    ],
    howToUse: 'Wet hair completely with lukewarm water. Pump 1-2 doses onto hands and massage into the scalp until a rich, gentle lather forms. Work the lather down to your hair tips. Rinse thoroughly with water. Ideal for use after DIVINE Ayurvedic Hair Oil.',
    image: shampooImg,
    galleryImages: [
      shampooImg,
      hairOilImg,
      comboKitImg
    ],
    competitors: [
      {
        brandName: 'Commercial SLS/SLES Shampoos',
        price: 349,
        ingredientsType: 'Harsh Sodium Laureth Sulphate, Synthetic Foamers & Parabens',
        packaging: 'Standard flip bottle'
      },
      {
        brandName: 'Luxury Salon Herbal Shampoos',
        price: 799,
        ingredientsType: 'Claimed sulphate-free but uses hidden harsh surfactant cocobetaines',
        packaging: 'Expensive plastic pump bottle'
      },
      {
        brandName: 'DIVINE Handcrafted Direct',
        price: 299,
        ingredientsType: 'Natural Shikakai & Reetha Saponins, Fresh Aloe Vera & Whole Herb Decoction',
        packaging: 'Convenient Eco Pump Dispenser Bottle'
      }
    ]
  },
  {
    id: 'div-combo-hair-care',
    name: 'DIVINE Complete Ayurvedic Hair Care Combo',
    slug: 'divine-ayurvedic-hair-care-combo',
    subtitle: 'Hair Oil (100ml) + Hair Mask (50g) + Herbal Shampoo (200ml)',
    category: 'combo',
    price: 699,
    originalPrice: 918,
    marketPrice: 1699,
    size: '3-Piece Kit',
    netWeightOrVolume: 'Full Size 3-Product Treatment Regime',
    packagingType: 'Luxury Herbal Gift Box with Comb Applicator',
    rating: 5.0,
    reviewCount: 165,
    inStock: true,
    stockCount: 20,
    badge: 'Best Value Combo 🎁',
    isFeatured: true,
    isBestseller: true,
    shortDescription: 'The ultimate 3-step hair fall control & density revival system. Saves ₹219 + FREE Express Shipping!',
    description: 'Get the complete Ayurvedic salon-at-home regime! This master combo includes DIVINE Comb Applicator Hair Oil (100ml), DIVINE Jujube Leaf & Bhringraj Hair Mask (50g), and DIVINE Sulphate-Free Herbal Shampoo (200ml). Clinically proven botanical synergy to stop hair thinning and regrow healthy locks.',
    keyIngredients: [
      'Full Size 100ml Comb-Applicator Ayurvedic Hair Oil',
      'Full Size 50gm Jujube Leaf, Bhringraj & Lilac Hair Mask',
      'Full Size 200ml Gentle Sulphate-Free Herbal Shampoo',
      'Complete printed Step-by-Step Ayurvedic Routine Card inside'
    ],
    benefits: [
      'Comprehensive 3-step routine addresses root cause of hair fall',
      'Instant ₹219 discount compared to buying individually',
      'Eligible for 100% FREE Courier Delivery all across India',
      'Visible decrease in hair fall within 3 weeks of routine usage',
      'Perfect gift for loved ones or your self-care wellness journey'
    ],
    howToUse: 'Step 1: Oil scalp with Comb Hair Oil overnight or 2 hrs before bath. Step 2: Apply Jujube Hair Mask once a week for 30 mins. Step 3: Wash thoroughly with DIVINE Herbal Shampoo. Enjoy thick, bouncy, lustrous hair!',
    image: comboKitImg,
    galleryImages: [
      comboKitImg,
      hairOilImg,
      shampooImg,
      hairMaskImg
    ],
    competitors: [
      {
        brandName: 'Commercial Hair Fall Kits',
        price: 1650,
        ingredientsType: 'Commercial formulation with hidden chemical preservatives and diluted herbs',
        packaging: 'Separate unbranded bottles'
      },
      {
        brandName: 'DIVINE Handcrafted Direct',
        price: 699,
        ingredientsType: 'Full 3-Step 100% Pure Botanical Regime (Oil + Mask + Shampoo)',
        packaging: 'Curated Herbal Gift Presentation with Root Comb Applicator'
      }
    ]
  },
  {
    id: 'div-combo-skin-glow',
    name: 'DIVINE Royal Skin Radiance 3-in-1 Combo',
    slug: 'divine-skin-radiance-combo',
    subtitle: "Clay Mask (65g) + Face Serum (30ml) + Under Eye Roll On (10ml)",
    category: 'combo',
    price: 549,
    originalPrice: 647,
    marketPrice: 1399,
    size: '3-Piece Kit',
    netWeightOrVolume: 'Full Size 3-Product Glow Therapy Kit',
    packagingType: 'Eco Luxury Skincare Box',
    rating: 4.9,
    reviewCount: 124,
    inStock: true,
    stockCount: 25,
    badge: 'Complete Skin Glow ✨',
    isFeatured: true,
    isBestseller: true,
    shortDescription: 'Complete 3-step facial detox, glow serum, and under-eye renewal. Saves ₹98 + FREE Delivery!',
    description: "Achieve radiant, glass-like clarity with DIVINE's bestselling skincare trio. Features the Fuller's Earth Clay Face Mask (65g) to purify pores, the Botanical Face Serum (30ml) with Radish Root and Jojoba for deep radiance, and the Under Eye Roll On (10ml) to banish dark circles.",
    keyIngredients: [
      "Fuller's Earth & Kaolin Clay Face Mask (65g)",
      'Antioxidant Botanical Face Serum with Radish Root & Rosehip (30ml)',
      'Under Eye Roll On with Cooling Metallic Roller Ball (10ml)'
    ],
    benefits: [
      'Complete morning & night skincare routine in one curated kit',
      'Detoxifies pores, locks 24-hour hydration, and brightens eyes',
      'Saves ₹98 instantly with FREE Express Delivery across India',
      'Pure, fresh botanical extracts with zero synthetic dyes or parabens',
      'Visible skin transformation and healthy glow in 7 to 10 days'
    ],
    howToUse: 'Step 1: Use Clay Face Mask twice weekly to detoxify. Step 2: Roll Under Eye Ball under tired eyes morning & night. Step 3: Apply 3-4 drops of Face Serum for all-day luminous glow.',
    image: comboKitImg,
    galleryImages: [
      comboKitImg,
      faceSerumImg,
      eyeRollImg,
      clayMaskImg
    ],
    competitors: [
      {
        brandName: 'Commercial Skincare Regimes',
        price: 1800,
        ingredientsType: 'Synthetics, alcohol denat, artificial fragrance & pore-clogging fillers',
        packaging: 'Standard plastic jars'
      },
      {
        brandName: 'DIVINE Handcrafted Direct',
        price: 699,
        ingredientsType: 'Full 3-Step Glow Ritual (Clay Detox + Radical Serum + Metal Eye Roller)',
        packaging: 'Eco Herbal Box with UV Protection & Metal Roller'
      }
    ]
  }
];

export const BUSINESS_CONFIG = {
  name: 'DIVINE Herbal Cosmetics',
  tagline: '100% Ayurvedic & Herbal Care for Hair & Skin',
  subTagline: 'Handcrafted with Love & Pure Botanicals',
  phone: '9887777137',
  formattedPhone: '+91 9887777137',
  whatsappNumber: '9887777137',
  whatsappInternational: '919887777137',
  email: 'divine00404@gmail.com',
  upiId: 'divine4u@axl',
  instagramHandle: '@divine4_you',
  instagramUrl: 'https://instagram.com/divine4_you',
  freeShippingThreshold: 499,
  defaultShippingFee: 49,
  address: 'DIVINE Herbal Cosmetics, Rajasthan, India',
  workingHours: 'Mon - Sat: 9:00 AM - 8:00 PM IST'
};
