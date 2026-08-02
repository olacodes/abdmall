/**
 * Mock catalogue for the v1 frontend build — Nigerian market products.
 * Shape mirrors the intended Supabase schema so components can swap to
 * real data later without changing their props.
 *
 * Images are locally hosted, contextually-matched photos in /public/products
 * (free-licensed placeholders, reused across plausible sibling SKUs so shelves
 * feel stocked). Swap for real seller photography at launch.
 */

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  hue: [string, string];
  image: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string; // category slug
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  sold?: number;
  stock?: number; // low numbers drive urgency cues
  badge?: "new" | "deal" | "bestseller";
  swatch: [string, string];
  image?: string; // omit to use gradient fallback
  blurb: string;
};

const img = (fileSlug: string) => `/products/${fileSlug}.jpg`;

export const categories: Category[] = [
  {
    slug: "fashion",
    name: "Fashion",
    tagline: "Ankara, native & ready-to-wear",
    hue: ["#3a2a4d", "#8a5a2b"],
    image: img("adire-kaftan-shirt"),
  },
  {
    slug: "electronics",
    name: "Electronics",
    tagline: "Phones, power & gadgets",
    hue: ["#0e2f3a", "#2b6a7a"],
    image: img("tecno-spark-smartphone"),
  },
  {
    slug: "home",
    name: "Home & Kitchen",
    tagline: "Everything for the house",
    hue: ["#2c1f14", "#7a5a2b"],
    image: img("4-burner-gas-cooker"),
  },
  {
    slug: "beauty",
    name: "Beauty",
    tagline: "Shea, black soap & glow",
    hue: ["#3d1f2b", "#a85a6a"],
    image: img("cold-pressed-coconut-oil"),
  },
  {
    slug: "groceries",
    name: "Groceries",
    tagline: "Foodstuff & daily essentials",
    hue: ["#1f2e14", "#5a7a2b"],
    image: img("golden-penny-rice-50kg"),
  },
];

export const products: Product[] = [
  // ---------- Fashion ----------
  {
    id: "p1", slug: "ankara-print-maxi-gown", name: "Ankara Print Maxi Gown",
    category: "fashion", price: 28000, oldPrice: 38000, rating: 4.8, reviews: 214,
    sold: 1240, badge: "deal", swatch: ["#6b2b4a", "#caa15a"],
    image: img("ankara-print-maxi-gown"),
    blurb: "Vibrant wax-print maxi with a flattering flared cut, tailored locally.",
  },
  {
    id: "p2", slug: "agbada-senator-3-piece", name: "Agbada 3-Piece Senator Set",
    category: "fashion", price: 65000, rating: 4.9, reviews: 342, sold: 890,
    badge: "bestseller", swatch: ["#20303a", "#6a7a5a"],
    image: img("agbada-senator-3-piece"),
    blurb: "Embroidered agbada, top and trouser — for owambe and every big day.",
  },
  {
    id: "p3", slug: "adire-kaftan-shirt", name: "Adire Kaftan Shirt",
    category: "fashion", price: 22000, rating: 4.6, reviews: 128, sold: 410,
    badge: "new", swatch: ["#14343a", "#5a8a9a"], image: img("adire-kaftan-shirt"),
    blurb: "Hand-dyed Abeokuta adire in a relaxed, breathable kaftan cut.",
  },
  {
    id: "p4", slug: "kano-leather-palm-sandals", name: "Kano Leather Palm Sandals",
    category: "fashion", price: 18500, rating: 4.7, reviews: 96, sold: 320,
    swatch: ["#3a2817", "#9a6f3a"], image: img("kano-leather-palm-sandals"),
    blurb: "Genuine hand-stitched leather sandals from Kano artisans.",
  },
  {
    id: "p5", slug: "sego-gele-head-tie", name: "Sego Gele Head-Tie",
    category: "fashion", price: 9500, oldPrice: 13000, rating: 4.5, reviews: 173,
    sold: 760, stock: 4, badge: "deal", swatch: ["#4a2130", "#b46a7c"],
    image: img("sego-gele-head-tie"),
    blurb: "Stiff, crisp sego perfect for a show-stopping gele.",
  },
  {
    id: "p6", slug: "ankara-two-piece-set", name: "Ankara Two-Piece Set",
    category: "fashion", price: 32000, oldPrice: 41000, rating: 4.7, reviews: 158,
    sold: 540, badge: "deal", swatch: ["#5a2b4a", "#c8a15a"],
    image: img("ankara-print-maxi-gown"),
    blurb: "Coordinated top and skirt in bold wax print — an instant outfit.",
  },
  {
    id: "p7", slug: "mens-senator-kaftan", name: "Men's Senator Kaftan",
    category: "fashion", price: 38000, rating: 4.6, reviews: 121, sold: 300,
    swatch: ["#22303a", "#7a8a6a"], image: img("agbada-senator-3-piece"),
    blurb: "Sharp, minimal senator wear for the office and evenings out.",
  },
  {
    id: "p8", slug: "aso-ebi-lace-fabric", name: "Aso-Ebi Lace Fabric (5 Yards)",
    category: "fashion", price: 27000, rating: 4.5, reviews: 89, sold: 210,
    badge: "new", swatch: ["#4a2536", "#b46a80"], image: img("sego-gele-head-tie"),
    blurb: "Premium French lace for your next aso-ebi — rich texture, clean finish.",
  },
  {
    id: "p9", slug: "mens-leather-loafers", name: "Men's Leather Loafers",
    category: "fashion", price: 26000, oldPrice: 34000, rating: 4.6, reviews: 143,
    sold: 380, badge: "deal", swatch: ["#3a2817", "#a07a4a"],
    image: img("kano-leather-palm-sandals"),
    blurb: "Polished slip-on loafers in genuine leather — comfort meets class.",
  },

  // ---------- Electronics ----------
  {
    id: "p10", slug: "tecno-spark-smartphone", name: "Tecno Spark 20 Smartphone",
    category: "electronics", price: 135000, rating: 4.7, reviews: 1032, sold: 3400,
    badge: "bestseller", swatch: ["#12333d", "#3f7d8c"],
    image: img("tecno-spark-smartphone"),
    blurb: 'Big 6.6" display, 5000mAh battery and a 50MP camera.',
  },
  {
    id: "p11", slug: "i-pass-my-neighbour-generator",
    name: '"I Pass My Neighbour" 1.5kVA Generator', category: "electronics",
    price: 95000, oldPrice: 115000, rating: 4.6, reviews: 611, sold: 1900, stock: 6,
    badge: "deal", swatch: ["#2b2b12", "#8a7a3a"],
    image: img("i-pass-my-neighbour-generator"),
    blurb: "Fuel-efficient petrol generator to keep the lights and fan on.",
  },
  {
    id: "p12", slug: "20000mah-power-bank", name: "20,000mAh Fast-Charge Power Bank",
    category: "electronics", price: 16500, rating: 4.5, reviews: 458, sold: 2600,
    swatch: ["#1a1a22", "#5a6a8a"], image: img("20000mah-power-bank"),
    blurb: "Charge your phone up to five times — NEPA-proof power on the go.",
  },
  {
    id: "p13", slug: "rechargeable-standing-fan", name: '18" Rechargeable Standing Fan',
    category: "electronics", price: 42000, rating: 4.6, reviews: 287, sold: 980,
    badge: "new", swatch: ["#14303a", "#4a8a9a"],
    image: img("rechargeable-standing-fan"),
    blurb: "Runs for hours on a full charge — cool air even when there's no light.",
  },
  {
    id: "p14", slug: "solar-rechargeable-lantern", name: "Solar Rechargeable Lantern",
    category: "electronics", price: 8900, rating: 4.4, reviews: 210, sold: 1500,
    swatch: ["#2c2410", "#a8902b"], image: img("solar-rechargeable-lantern"),
    blurb: "USB and solar charging with a bright, long-lasting LED panel.",
  },
  {
    id: "p15", slug: "infinix-hot-40-smartphone", name: "Infinix Hot 40 Smartphone",
    category: "electronics", price: 118000, oldPrice: 139000, rating: 4.6, reviews: 742,
    sold: 2100, badge: "deal", swatch: ["#14303a", "#4a7d8c"],
    image: img("tecno-spark-smartphone"),
    blurb: "90Hz display, big battery and a sharp camera for less.",
  },
  {
    id: "p16", slug: "3-5kva-key-start-generator", name: "3.5kVA Key-Start Generator",
    category: "electronics", price: 235000, rating: 4.7, reviews: 188, sold: 420,
    swatch: ["#2b2b14", "#8a7a3a"], image: img("i-pass-my-neighbour-generator"),
    blurb: "Power the whole flat — key start, low noise, copper coil.",
  },
  {
    id: "p17", slug: "rechargeable-table-fan", name: "Rechargeable Table Fan",
    category: "electronics", price: 19500, oldPrice: 26000, rating: 4.4, reviews: 214,
    sold: 870, badge: "deal", swatch: ["#16303a", "#4a8a9a"],
    image: img("rechargeable-standing-fan"),
    blurb: "Compact desk fan with USB charging — cool the room or the shop.",
  },
  {
    id: "p18", slug: "10000mah-slim-power-bank", name: "10,000mAh Slim Power Bank",
    category: "electronics", price: 11000, rating: 4.3, reviews: 302, sold: 1800,
    swatch: ["#1a1a24", "#5a6a8a"], image: img("20000mah-power-bank"),
    blurb: "Pocket-sized backup power with fast USB-C charging.",
  },

  // ---------- Home & Kitchen ----------
  {
    id: "p19", slug: "3-in-1-blender-grinder", name: "3-in-1 Blender & Dry Mill",
    category: "home", price: 34000, rating: 4.7, reviews: 523, sold: 2400,
    badge: "bestseller", swatch: ["#2c1c12", "#7a512b"],
    image: img("3-in-1-blender-grinder"),
    blurb: "Blend pepper, grind egusi and crayfish — a Nigerian kitchen must-have.",
  },
  {
    id: "p20", slug: "nonstick-pot-set-5pcs", name: "Non-Stick Pot Set (5 Pieces)",
    category: "home", price: 48000, oldPrice: 59000, rating: 4.6, reviews: 189,
    sold: 640, badge: "deal", swatch: ["#1f1f24", "#6a6a4a"],
    image: img("nonstick-pot-set-5pcs"),
    blurb: "Durable non-stick pots for jollof, stew and soups without wahala.",
  },
  {
    id: "p21", slug: "4-burner-gas-cooker", name: "4-Burner Standing Gas Cooker",
    category: "home", price: 120000, rating: 4.8, reviews: 142, sold: 360, stock: 5,
    swatch: ["#22160e", "#8a5a2b"], image: img("4-burner-gas-cooker"),
    blurb: "Four burners plus an oven — Sunday cooking, sorted.",
  },
  {
    id: "p22", slug: "insulated-food-flask", name: "5L Insulated Food Flask",
    category: "home", price: 15000, rating: 4.5, reviews: 267, sold: 1100,
    swatch: ["#2b1f2c", "#8a6a7a"], image: img("insulated-food-flask"),
    blurb: "Keeps rice and soup hot for hours — ideal for parties and travel.",
  },
  {
    id: "p23", slug: "blender-pro-1000w", name: "Blender Pro 1000W with Mill",
    category: "home", price: 41000, oldPrice: 52000, rating: 4.6, reviews: 198,
    sold: 520, badge: "deal", swatch: ["#2c1e12", "#7a552b"],
    image: img("3-in-1-blender-grinder"),
    blurb: "Powerful 1000W motor for smoothies, soups and dry milling.",
  },
  {
    id: "p24", slug: "stainless-pot-set-7pcs", name: "Stainless Cooking Pot Set (7pcs)",
    category: "home", price: 72000, rating: 4.7, reviews: 96, sold: 240,
    badge: "new", swatch: ["#22222a", "#6a6a4a"], image: img("nonstick-pot-set-5pcs"),
    blurb: "Heavy-gauge stainless steel that lasts a generation.",
  },
  {
    id: "p25", slug: "table-top-gas-cooker-2burner", name: "Table-Top Gas Cooker (2-Burner)",
    category: "home", price: 34000, oldPrice: 42000, rating: 4.5, reviews: 174,
    sold: 610, badge: "deal", swatch: ["#241810", "#8a5a2b"],
    image: img("4-burner-gas-cooker"),
    blurb: "Compact double burner for the kitchen counter or hostel.",
  },
  {
    id: "p26", slug: "insulated-cooler-box-10l", name: "Insulated Cooler Box (10L)",
    category: "home", price: 22000, rating: 4.4, reviews: 132, sold: 430,
    swatch: ["#2b1f2c", "#8a6a7a"], image: img("insulated-food-flask"),
    blurb: "Keep drinks cold for the picnic, party or long trip.",
  },

  // ---------- Beauty ----------
  {
    id: "p27", slug: "dudu-osun-black-soap", name: "Dudu-Osun Black Soap (Pack of 6)",
    category: "beauty", price: 4500, rating: 4.8, reviews: 934, sold: 5200,
    badge: "bestseller", swatch: ["#1c1a14", "#5a4a2b"],
    image: img("dudu-osun-black-soap"),
    blurb: "Classic African black soap for clear, healthy skin.",
  },
  {
    id: "p28", slug: "raw-shea-butter-ori", name: "Raw Unrefined Shea Butter (Ori) 500g",
    category: "beauty", price: 6000, rating: 4.7, reviews: 421, sold: 2800,
    swatch: ["#2c2618", "#a8925a"], image: img("raw-shea-butter-ori"),
    blurb: "Pure, unrefined ori for deep moisture, head to toe.",
  },
  {
    id: "p29", slug: "cold-pressed-coconut-oil", name: "Cold-Pressed Coconut Oil 500ml",
    category: "beauty", price: 5500, oldPrice: 7500, rating: 4.6, reviews: 302,
    sold: 1900, badge: "deal", swatch: ["#26261f", "#9a9a7a"],
    image: img("cold-pressed-coconut-oil"),
    blurb: "Virgin coconut oil for skin, hair and cooking.",
  },
  {
    id: "p30", slug: "matte-liquid-lipstick-set", name: "Matte Liquid Lipstick Set",
    category: "beauty", price: 12000, rating: 4.5, reviews: 156, sold: 720,
    badge: "new", swatch: ["#3d1420", "#b4485c"], image: img("matte-liquid-lipstick-set"),
    blurb: "Long-wear matte shades made for melanin-rich skin.",
  },
  {
    id: "p31", slug: "black-soap-bar-3pack", name: "African Black Soap Bar (3-Pack)",
    category: "beauty", price: 2800, oldPrice: 3800, rating: 4.6, reviews: 512,
    sold: 3100, badge: "deal", swatch: ["#1c1a14", "#5a4a2b"],
    image: img("dudu-osun-black-soap"),
    blurb: "Handcrafted black soap bars — gentle daily cleansing.",
  },
  {
    id: "p32", slug: "whipped-shea-body-cream", name: "Whipped Shea Body Cream 250g",
    category: "beauty", price: 7500, rating: 4.7, reviews: 268, sold: 1400,
    swatch: ["#2c2618", "#a8925a"], image: img("raw-shea-butter-ori"),
    blurb: "Silky whipped shea with a light scent — never greasy.",
  },
  {
    id: "p33", slug: "coconut-hair-oil-250ml", name: "Pure Coconut Hair Oil 250ml",
    category: "beauty", price: 4200, rating: 4.5, reviews: 187, sold: 990,
    badge: "new", swatch: ["#26261f", "#9a9a7a"], image: img("cold-pressed-coconut-oil"),
    blurb: "Nourishing coconut oil for stronger, shinier natural hair.",
  },
  {
    id: "p34", slug: "lip-gloss-trio", name: "Glossy Lip Trio",
    category: "beauty", price: 8500, oldPrice: 11000, rating: 4.4, reviews: 143,
    sold: 610, badge: "deal", swatch: ["#3d1420", "#b4485c"],
    image: img("matte-liquid-lipstick-set"),
    blurb: "Three high-shine glosses for an everyday glow.",
  },

  // ---------- Groceries ----------
  {
    id: "p35", slug: "golden-penny-rice-50kg", name: "Golden Penny Rice 50kg",
    category: "groceries", price: 88000, rating: 4.7, reviews: 688, sold: 4100,
    badge: "bestseller", swatch: ["#2c2410", "#a8902b"],
    image: img("golden-penny-rice-50kg"),
    blurb: "A full bag of premium long-grain rice — stock the house.",
  },
  {
    id: "p36", slug: "ijebu-garri-bucket", name: "Ijebu Garri (Painted Bucket)",
    category: "groceries", price: 12500, oldPrice: 15000, rating: 4.6, reviews: 233,
    sold: 1700, badge: "deal", swatch: ["#2b2410", "#9a8a3a"],
    image: img("ijebu-garri-bucket"),
    blurb: "Crisp, sour Ijebu garri — a paint-bucket measure of goodness.",
  },
  {
    id: "p37", slug: "devon-kings-oil-25l", name: "Devon King's Vegetable Oil 25L",
    category: "groceries", price: 68000, rating: 4.5, reviews: 174, sold: 820,
    swatch: ["#2c2810", "#b0a02b"], image: img("devon-kings-oil-25l"),
    blurb: "A full keg of pure vegetable oil for frying and cooking.",
  },
  {
    id: "p38", slug: "indomie-noodles-carton", name: "Indomie Noodles (Carton of 40)",
    category: "groceries", price: 11000, rating: 4.8, reviews: 1210, sold: 6800,
    badge: "bestseller", swatch: ["#3a2410", "#c07a2b"],
    image: img("indomie-noodles-carton"),
    blurb: "The nation's favourite — a full carton for the whole family.",
  },
  {
    id: "p39", slug: "peak-milk-powder-refill", name: "Peak Milk Powder Refill 900g",
    category: "groceries", price: 9800, rating: 4.7, reviews: 512, sold: 3300,
    swatch: ["#1a2430", "#5a7aa0"],
    blurb: "Rich, creamy milk for tea, pap and everything in between.",
  },
  {
    id: "p40", slug: "fresh-plantain-bunch", name: "Fresh Plantain Bunch",
    category: "groceries", price: 4000, rating: 4.4, reviews: 98, sold: 1500,
    stock: 8, badge: "new", swatch: ["#1f2e14", "#6a8a3a"],
    image: img("fresh-plantain-bunch"),
    blurb: "Ripe, ready-to-fry plantain for dodo and boli.",
  },
  {
    id: "p41", slug: "mama-gold-rice-50kg", name: "Mama Gold Rice 50kg",
    category: "groceries", price: 84000, oldPrice: 92000, rating: 4.6, reviews: 421,
    sold: 2600, badge: "deal", swatch: ["#2c2410", "#b0982b"],
    image: img("golden-penny-rice-50kg"),
    blurb: "Well-milled parboiled rice — stone-free, swells beautifully.",
  },
  {
    id: "p42", slug: "yellow-garri-bag", name: "Yellow Garri (Big Bag)",
    category: "groceries", price: 14500, rating: 4.5, reviews: 156, sold: 900,
    swatch: ["#2c2810", "#c0a03a"], image: img("ijebu-garri-bucket"),
    blurb: "Palm-oil rich yellow garri for eba and soaking.",
  },
  {
    id: "p43", slug: "palm-oil-5l", name: "Zomo Palm Oil 5L",
    category: "groceries", price: 16000, oldPrice: 19500, rating: 4.6, reviews: 204,
    sold: 1300, badge: "deal", swatch: ["#3a1c10", "#c0502b"],
    image: img("devon-kings-oil-25l"),
    blurb: "Thick, red, unadulterated palm oil for soups and stews.",
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function productsByCategory(slug: string): Product[] {
  return products.filter((p) => p.category === slug);
}

export const featuredProducts = products.filter(
  (p) => p.badge === "bestseller" || p.badge === "new",
);
export const dealProducts = products.filter((p) => p.oldPrice);
