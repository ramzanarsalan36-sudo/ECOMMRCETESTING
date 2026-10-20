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
    name: 'HOPEKRAFT Wooden Kids Easel',
    tagline: '2-in-1 Magnetic Dry-Erase Whiteboard & Traditional Blackboard with Integrated Craft Storage Shelf.',
    subtitle: 'Double-Sided Whiteboard & Blackboard',
    price: 3499,
    oldPrice: 4999,
    discount: '30% OFF',
    eyebrow: 'PREMIUM PINELAND COLLECTION',
    image: '/assets/images/product_easel_hd.jpg',
    badge: 'BESTSELLER',
    thumbnails: [
      { src: '/assets/images/product_easel_hd.jpg', label: 'Whiteboard Front' },
      { src: '/assets/images/easel_thumb_blackboard.jpg', label: 'Chalkboard' },
      { src: '/assets/images/easel_thumb_tray.jpg', label: 'Wood Tray' },
      { src: '/assets/images/easel_thumb_wood.jpg', label: 'Joinery' }
    ],
    features: [
      { icon: '🎨', text: 'Double-Sided Board' },
      { icon: '🌿', text: '100% Solid Beechwood' },
      { icon: '🧲', text: 'Magnetic Whiteboard' },
      { icon: '🎁', text: 'Free Markers & Chalk' }
    ],
    description: 'The premier centerpiece for your child’s creative development. Dual-sided easel with a magnetic whiteboard on one side and a traditional chalkboard on the other. Built from 100% sustainably harvested solid beechwood with a non-toxic natural wood finish.'
  },
  plant_stand: {
    id: 'plant_stand',
    name: 'Wooden Plant Stand',
    tagline: 'Handcrafted multi-tier solid beechwood plant stand for indoor greenery and natural living spaces.',
    subtitle: 'Multi-Tier Handcrafted Beechwood Stand',
    price: 2299,
    oldPrice: 3199,
    discount: '28% OFF',
    eyebrow: 'NATURAL LIVING COLLECTION',
    image: '/assets/images/product_plant_stand_hd.jpg',
    badge: 'NEW ARRIVAL',
    thumbnails: [
      { src: '/assets/images/product_plant_stand_hd.jpg', label: '3-Tier Stand' },
      { src: '/assets/images/hero_lifestyle_showcase.jpg', label: 'Living Room' },
      { src: '/assets/images/hero_all_products_showcase.jpg', label: 'Warm Sunlight' },
      { src: '/assets/images/product_calendar_hd.jpg', label: 'Natural Beechwood' }
    ],
    features: [
      { icon: '🌿', text: '100% Natural Beechwood' },
      { icon: '🪴', text: 'Multi-Tier Elevation' },
      { icon: '🛡️', text: 'Water-Resistant Finish' },
      { icon: '💪', text: 'Sturdy Load Bearing' }
    ],
    description: 'Elegant multi-tier handcrafted wooden plant stand designed to elevate your indoor greenery. Made from 100% solid natural wood with water-resistant eco-friendly lacquer.'
  },

  blocks: {
    id: 'blocks',
    name: 'Wooden Alphabet & Number Blocks',
    tagline: 'Handcrafted solid beechwood alphabet and number blocks with smooth rounded corners and vivid non-toxic colors.',
    subtitle: 'Natural Beechwood Montessori Blocks',
    price: 1299,
    oldPrice: 1799,
    discount: '28% OFF',
    eyebrow: 'MONTESSORI EARLY LEARNING',
    image: '/assets/images/product_blocks_hd.jpg',
    thumbnails: [
      { src: '/assets/images/product_blocks_hd.jpg', label: 'Blocks Set' },
      { src: '/assets/images/promo_blocks.png', label: 'Cotton Bag' },
      { src: '/assets/images/hero_all_products_showcase.jpg', label: 'Play Display' },
      { src: '/assets/images/product_shape_sorter_hd.jpg', label: 'Natural Beechwood' }
    ],
    features: [
      { icon: '🔤', text: 'Full A-Z & Numbers' },
      { icon: '🌿', text: '100% Solid Beechwood' },
      { icon: '🖐️', text: 'Sensory Tactile Play' },
      { icon: '🎒', text: 'Includes Cotton Bag' }
    ],
    description: 'Montessori-inspired wooden learning blocks designed for fine tactile motor training and early language/math foundation. Crafted with gentle rounded corners to ensure absolute safety.'
  },
  rings: {
    id: 'rings',
    name: 'Wooden Stacking Ring Tower',
    tagline: 'Classic rainbow wooden stacking ring tower designed to develop fine motor coordination and color recognition.',
    subtitle: 'Rainbow Polished Beechwood Ring Stack',
    price: 999,
    oldPrice: 1399,
    discount: '29% OFF',
    eyebrow: 'TODDLER SENSORY ESSENTIALS',
    image: '/assets/images/product_rings_hd.jpg',
    thumbnails: [
      { src: '/assets/images/product_rings_hd.jpg', label: 'Stack View' },
      { src: '/assets/images/hero_all_products_showcase.jpg', label: 'Sensory Play' },
      { src: '/assets/images/product_rainbow_arch_hd.jpg', label: 'Rainbow Colors' },
      { src: '/assets/images/hero_lifestyle_showcase.jpg', label: 'Nursery Setup' }
    ],
    features: [
      { icon: '🌈', text: '7 Rainbow Ring Sizes' },
      { icon: '🪵', text: 'Weighted Safety Base' },
      { icon: '👶', text: 'Choke-Proof Topper' },
      { icon: '💧', text: 'Non-Toxic Water Paint' }
    ],
    description: 'Timeless rainbow stacking rings made with food-grade water-based non-toxic vegetable dyes. Helps babies and toddlers master depth perception and color sequence.'
  },
  train: {
    id: 'train',
    name: 'Wooden Train Set',
    tagline: 'Classic magnetic connector wooden toy train with steam locomotive, passenger coaches, and cargo wagons.',
    subtitle: 'Classic Magnetic Locomotive & Carriages',
    price: 1499,
    oldPrice: 1999,
    discount: '25% OFF',
    eyebrow: 'CREATIVE TRACK COLLECTION',
    image: '/assets/images/product_train_hd.jpg',
    thumbnails: [
      { src: '/assets/images/product_train_hd.jpg', label: 'Train Set' },
      { src: '/assets/images/hero_all_products_showcase.jpg', label: 'Wooden Track' },
      { src: '/assets/images/product_blocks_hd.jpg', label: 'Magnetic Links' },
      { src: '/assets/images/hero_lifestyle_showcase.jpg', label: 'Playroom Display' }
    ],
    features: [
      { icon: '🚂', text: 'Locomotive + 3 Wagons' },
      { icon: '🧲', text: 'Strong Magnetic Couplers' },
      { icon: '🛤️', text: 'Universal Track Fit' },
      { icon: '🛡️', text: 'Child-Safe Non-Toxic' }
    ],
    description: 'High-strength magnetic coupling wooden train set with four magnetic carriages. Fits all standard wooden toy railway tracks.'
  },

  calendar: {
    id: 'calendar',
    name: 'HOPEKRAFT Wooden Desktop Calendar',
    tagline: 'Solid natural beechwood flip calendar stand with steel ring binder and engraved brand logo.',
    subtitle: 'Perpetual Beechwood Desktop Flip Calendar',
    price: 899,
    oldPrice: 1299,
    discount: '30% OFF',
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
      { icon: '✨', text: 'Laser Engraved Logo' },
      { icon: '🌿', text: 'Natural Matte Finish' }
    ],
    description: 'Handcrafted solid beechwood desktop calendar stand designed for home offices and study tables. Durable steel ring mechanism and engraved HOPEKRAFT signature.'
  },

  shape_sorter: {
    id: 'shape_sorter',
    name: 'Montessori Wooden Shape Sorter',
    tagline: 'Geometric sorting cube made with natural solid wood and vibrant non-toxic shape blocks.',
    subtitle: 'Sensory Geometric Motor Training Cube',
    price: 1199,
    oldPrice: 1699,
    discount: '29% OFF',
    eyebrow: 'MONTESSORI SENSORY',
    image: '/assets/images/product_shape_sorter_hd.jpg',
    thumbnails: [
      { src: '/assets/images/product_shape_sorter_hd.jpg', label: 'Cube & Blocks' },
      { src: '/assets/images/hero_all_products_showcase.jpg', label: 'Play Setup' },
      { src: '/assets/images/product_rainbow_arch_hd.jpg', label: 'Montessori Finish' },
      { src: '/assets/images/promo_blocks.png', label: 'Cotton Bag' }
    ],
    features: [
      { icon: '🧩', text: '4 Geometric Cutouts' },
      { icon: '🖐️', text: 'Tactile Motor Coordination' },
      { icon: '🌱', text: 'Natural Solid Beechwood' },
      { icon: '🛡️', text: 'Smooth Chamfered Edges' }
    ],
    description: 'Montessori-inspired wooden shape sorting box that develops spatial awareness, fine motor grip, and shape recognition in toddlers.'
  },

  rainbow_arch: {
    id: 'rainbow_arch',
    name: 'Wooden Stacking Rainbow Arch',
    tagline: '7-piece nesting rainbow balance arches for open-ended creative construction and tunnel play.',
    subtitle: 'Organic Pastel Stacking Rainbow Arches',
    price: 1099,
    oldPrice: 1599,
    discount: '31% OFF',
    eyebrow: 'OPEN-ENDED PLAY',
    image: '/assets/images/product_rainbow_arch_hd.jpg',
    thumbnails: [
      { src: '/assets/images/product_rainbow_arch_hd.jpg', label: 'Rainbow Arches' },
      { src: '/assets/images/hero_all_products_showcase.jpg', label: 'Nesting Tunnel' },
      { src: '/assets/images/product_rings_hd.jpg', label: 'Pastel Dyes' },
      { src: '/assets/images/hero_lifestyle_showcase.jpg', label: 'Play Shelf' }
    ],
    features: [
      { icon: '🌈', text: '7 Nesting Arches' },
      { icon: '🎨', text: 'Water-Based Eco Dyes' },
      { icon: '⚖️', text: 'Balance & Motor Training' },
      { icon: '🌲', text: 'FSC Solid Pine Wood' }
    ],
    description: 'Beautiful 7-piece wooden rainbow arch designed for Waldorf and Montessori open-ended play. Can be stacked, balanced, used as tunnels, bridges, or sculptures.'
  }
};

export const PRODUCT_LIST = Object.values(HOPEKRAFT_PRODUCTS);
