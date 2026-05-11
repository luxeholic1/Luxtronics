import headphones from "@/assets/product-headphones.png";
import watch from "@/assets/product-watch.png";
import earbuds from "@/assets/product-earbuds.png";
import laptop from "@/assets/product-laptop.png";
import controller from "@/assets/product-controller.png";
import camera from "@/assets/product-camera.png";
import speaker from "@/assets/product-speaker.png";
import phone from "@/assets/hero-gadget.png";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  badge?: "New" | "Hot" | "-20%";
  categories: Array<{ id: number; name: string }>;
  categoryId?: number;
  variations?: Array<{
    id: string;
    sku?: string;
    price: number;
    oldPrice?: number;
    attributes: Array<{
      name: string;
      option: string;
    }>;
    image?: string;
    stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  }>;
};

export const categories = [
  { slug: "smartphones", name: "Smartphones", count: 124 },
  { slug: "audio", name: "Audio", count: 86 },
  { slug: "wearables", name: "Wearables", count: 52 },
  { slug: "laptops", name: "Laptops", count: 41 },
  { slug: "gaming", name: "Gaming", count: 73 },
  { slug: "cameras", name: "Cameras", count: 38 },
];

export const products: Product[] = [
  {
    id: "1",
    slug: "aurora-pro-headphones",
    name: "Aurora Pro Wireless Headphones",
    category: "Audio",
    price: 299,
    oldPrice: 379,
    image: headphones,
    rating: 4.8,
    reviews: 1247,
    badge: "-20%",
    categories: [{ id: 1, name: "Audio" }],
    description:
      "Studio-grade noise cancellation with 40-hour battery and adaptive spatial audio.",
  },
  {
    id: "2",
    slug: "pulse-smartwatch",
    name: "Pulse Smartwatch X3",
    category: "Wearables",
    price: 249,
    image: watch,
    rating: 4.7,
    reviews: 842,
    badge: "Hot",
    categories: [{ id: 2, name: "Wearables" }],
    description:
      "Advanced health tracking with always-on AMOLED display and 7-day battery life.",
  },
  {
    id: "3",
    slug: "echo-buds-mini",
    name: "Echo Buds Mini",
    category: "Audio",
    price: 129,
    oldPrice: 159,
    image: earbuds,
    rating: 4.6,
    reviews: 2156,
    badge: "New",
    categories: [{ id: 1, name: "Audio" }],
    description:
      "Custom-tuned drivers, personalized EQ, and pocket-sized charging case.",
  },
  {
    id: "4",
    slug: "nimbus-laptop-15",
    name: "Nimbus Laptop 15",
    category: "Laptops",
    price: 1499,
    image: laptop,
    rating: 4.9,
    reviews: 532,
    badge: "New",
    categories: [{ id: 3, name: "Laptops" }],
    description:
      "M3 Pro chip, Liquid Retina XDR display, and 22 hours of peak performance.",
  },
  {
    id: "5",
    slug: "vortex-game-controller",
    name: "Vortex Pro Controller",
    category: "Gaming",
    price: 89,
    image: controller,
    rating: 4.5,
    reviews: 756,
    categories: [{ id: 4, name: "Gaming" }],
    description:
      "Hall-effect sticks, RGB lighting, and ultra-low latency wireless play.",
  },
  {
    id: "6",
    slug: "lumix-mirrorless-camera",
    name: "Lumix Mirrorless Camera",
    category: "Cameras",
    price: 1899,
    oldPrice: 2199,
    image: camera,
    rating: 4.9,
    reviews: 318,
    badge: "-20%",
    categories: [{ id: 5, name: "Cameras" }],
    description:
      "Full-frame sensor, 8K video, and lightning-fast hybrid autofocus.",
  },
  {
    id: "7",
    slug: "sonic-bluetooth-speaker",
    name: "Sonic 360 Bluetooth Speaker",
    category: "Audio",
    price: 179,
    image: speaker,
    rating: 4.6,
    reviews: 945,
    categories: [{ id: 1, name: "Audio" }],
    description:
      "360° immersive sound with deep bass and 24-hour playtime.",
  },
  {
    id: "8",
    slug: "halo-phone-pro",
    name: "Halo Phone Pro",
    category: "Smartphones",
    price: 1099,
    image: phone,
    rating: 4.8,
    reviews: 2241,
    badge: "Hot",
    categories: [{ id: 6, name: "Smartphones" }],
    description:
      "Pro-grade triple camera, 120Hz display, and all-day battery in titanium.",
  },
];

export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);
