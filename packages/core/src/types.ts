/**
 * Shared domain types for abdmall — consumed by both the web (Next.js) and
 * mobile (React Native/Expo) apps. Mirrors the Supabase schema shapes.
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
  stock?: number;
  badge?: "new" | "deal" | "bestseller";
  swatch: [string, string];
  image?: string;
  blurb: string;
};

export type Order = {
  ref: string;
  createdAt: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  method: "card" | "transfer";
  items: { name: string; qty: number; price: number; size?: string }[];
  subtotal: number;
  delivery: number;
  total: number;
};

export type CartItem = {
  /** Unique line key: product id + size (a product in two sizes = two lines). */
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  swatch: [string, string];
  image?: string;
  size?: string;
  qty: number;
};

export type AddPayload = {
  id: string;
  slug: string;
  name: string;
  price: number;
  swatch: [string, string];
  image?: string;
  size?: string;
  qty?: number;
};
