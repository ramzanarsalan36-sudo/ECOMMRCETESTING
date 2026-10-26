export interface ProductThumbnail {
  src: string;
  label: string;
}

export interface ProductFeature {
  icon: string;
  text: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  subtitle: string;
  price: number;
  oldPrice: number;
  discount: string;
  eyebrow: string;
  image: string;
  thumbnails: ProductThumbnail[];
  features: ProductFeature[];
  description?: string;
  badge?: string;
}

export const HOPEKRAFT_PRODUCTS: Record<string, Product> = {
  easel: {
    id: 'easel',
    name: 'HOPEKRAFT Kids Write Board & Easel',
    tagline: '2-in-1 Magnetic Dry-Erase Whiteboard & Traditional Blackboard with Solid Beechwood Frame.',
    subtitle: 'Double-Sided Whiteboard & Blackboard',
    price: 999,
    oldPrice: 1999,
    discount: '50% OFF',
    eyebrow: 'BESTSELLER COLLECTION',
    image: '/assets/images/product_easel_hd.jpg',
    badge: 'TOP SELLER',
    thumbnails: [
      { src: '/assets/images/product_easel_hd.jpg', label: 'Whiteboard Front' },
      { src: '/assets/images/easel_thumb_blackboard.jpg', label: 'Chalkboard' },
      { src: '/assets/images/easel_thumb_tray.jpg', label: 'Wood Tray' },
      { src: '/assets/images/easel_thumb_wood.jpg', label: 'Joinery' }
    ],
    features: [
      { icon: '🎨', text: 'Double-Sided Write Board' },
      { icon: '🌿', text: '100% Solid Beechwood' },
      { icon: '🧲', text: 'Magnetic Surface' },
      { icon: '🎁', text: 'Markers & Duster Included' }
    ],
    description: 'Double-sided write board featuring a magnetic dry-erase whiteboard on one side and a classic blackboard on the other. Built with sustainably harvested solid beechwood with smooth child-safe rounded corners.'
  },

  blocks: {
    id: 'blocks',
    name: 'Alphabet Beta Blocks',
    tagline: 'Handcrafted solid beechwood alphabet blocks with smooth rounded corners and non-toxic finish.',
    subtitle: 'Natural Beechwood Alphabet Learning Blocks',
    price: 250,
    oldPrice: 499,
    discount: '50% OFF',
    eyebrow: 'EARLY LEARNING COLLECTION',
    image: '/assets/images/product_blocks_hd.jpg',
    thumbnails: [
      { src: '/assets/images/product_blocks_hd.jpg', label: 'Blocks Set' },
      { src: '/assets/images/promo_blocks.png', label: 'Cotton Bag' },
      { src: '/assets/images/hero_all_products_showcase.jpg', label: 'Play Display' },
      { src: '/assets/images/product_shape_sorter_hd.jpg', label: 'Natural Beechwood' }
    ],
    features: [
      { icon: '🔤', text: 'Complete Alphabet Set' },
      { icon: '🌿', text: '100% Solid Beechwood' },
      { icon: '🖐️', text: 'Sensory Tactile Learning' },
      { icon: '🎒', text: 'Convenient Storage Bag' }
    ],
    description: 'Montessori-inspired wooden alphabet blocks designed for fine motor skills and early language foundation. Crafted with gentle rounded corners for maximum safety.'
  },

  calendar: {
    id: 'calendar',
    name: 'Wooden Desktop Calendar',
    tagline: 'Solid natural beechwood flip calendar stand with steel ring binder and engraved brand logo.',
    subtitle: 'Perpetual Beechwood Desktop Flip Calendar',
    price: 200,
    oldPrice: 400,
    discount: '50% OFF',
    eyebrow: 'DESK & LIVING ESSENTIALS',
    image: '/assets/images/product_calendar_hd.jpg',
    thumbnails: [
      { src: '/assets/images/product_calendar_hd.jpg', label: 'Front View' },
      { src: '/assets/images/hero_all_products_showcase.jpg', label: 'Desk Setup' },
      { src: '/assets/images/product_plant_stand_hd.jpg', label: 'Natural Beechwood' },
      { src: '/assets/images/hero_lifestyle_showcase.jpg', label: 'Study Setup' }
    ],
    features: [
      { icon: '🪵', text: 'Solid Beechwood Base' },
      { icon: '📅', text: 'Perpetual Flip Cards' },
      { icon: '✨', text: 'Laser Engraved Details' },
      { icon: '🌿', text: 'Natural Matte Finish' }
    ],
    description: 'Handcrafted solid beechwood desktop calendar stand designed for home offices and study tables. Durable steel ring mechanism and engraved HOPEKRAFT signature.'
  },

  plant_stand: {
    id: 'plant_stand',
    name: 'Wooden Plant Stand',
    tagline: 'Handcrafted solid beechwood plant stand for indoor greenery and natural living spaces.',
    subtitle: 'Handcrafted Beechwood Indoor Plant Stand',
    price: 150,
    oldPrice: 300,
    discount: '50% OFF',
    eyebrow: 'NATURAL LIVING COLLECTION',
    image: '/assets/images/product_plant_stand_hd.jpg',
    badge: 'NEW ARRIVAL',
    thumbnails: [
      { src: '/assets/images/product_plant_stand_hd.jpg', label: 'Plant Stand' },
      { src: '/assets/images/hero_lifestyle_showcase.jpg', label: 'Living Room' },
      { src: '/assets/images/hero_all_products_showcase.jpg', label: 'Warm Sunlight' },
      { src: '/assets/images/product_calendar_hd.jpg', label: 'Natural Beechwood' }
    ],
    features: [
      { icon: '🌿', text: '100% Natural Beechwood' },
      { icon: '🪴', text: 'Elevated Display' },
      { icon: '🛡️', text: 'Water-Resistant Finish' },
      { icon: '💪', text: 'Sturdy Load Bearing' }
    ],
    description: 'Elegant handcrafted wooden plant stand designed to elevate your indoor greenery. Made from 100% solid natural wood with water-resistant eco-friendly finish.'
  }
};

export const PRODUCT_LIST = Object.values(HOPEKRAFT_PRODUCTS);
