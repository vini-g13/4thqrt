export type ProductCategory = "tshirt" | "hoodie" | "accessory";

export interface Product {
  id: string;
  slug: string;
  name: { nl: string; en: string };
  description: { nl: string; en: string };
  price: number;
  category: ProductCategory;
  sizes: string[];
  colors: string[];
  images: string[];
  inStock: boolean;
  lowStock?: boolean; // toon "ALMOST GONE" label als true
  stockPercentage?: number;
  variantStock?: Array<{
    size: string;
    color: string;
    availableQuantity: number;
    targetQuantity: number;
  }>;
}

export const products: Product[] = [
  {
    id: "1",
    slug: "4thqrt-longsleeve-black",
    name: { nl: "4THQRT LONGSLEEVE - ZWART", en: "4THQRT LONGSLEEVE - BLACK" },
    description: {
      nl: "De 4THQRT Longsleeve. Clean. Direct. Geen overbodige franjes. Beschikbaar in maten S tot en met XL. Verzonden in branded verpakking.",
      en: "The 4THQRT Longsleeve. Clean. Direct. No excess. Available in sizes S through XL. Shipped in branded packaging.",
    },
    price: 39.99,
    category: "tshirt",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black"],
    images: [
      "https://picsum.photos/seed/4thqrt-ls-black-1/600/750",
      "https://picsum.photos/seed/4thqrt-ls-black-2/600/750",
    ],
    inStock: true,
    lowStock: false,
  },
  {
    id: "2",
    slug: "4thqrt-longsleeve-pink",
    name: { nl: "4THQRT LONGSLEEVE - ROZE", en: "4THQRT LONGSLEEVE - PINK" },
    description: {
      nl: "De 4THQRT Longsleeve. Zelfde snit, andere energie. Beschikbaar in maten S tot en met XL. Verzonden in branded verpakking.",
      en: "The 4THQRT Longsleeve. Same cut, different energy. Available in sizes S through XL. Shipped in branded packaging.",
    },
    price: 39.99,
    category: "tshirt",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Pink"],
    images: [
      "https://picsum.photos/seed/4thqrt-ls-pink-1/600/750",
      "https://picsum.photos/seed/4thqrt-ls-pink-2/600/750",
    ],
    inStock: true,
    lowStock: false,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: ProductCategory | "all"): Product[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}
