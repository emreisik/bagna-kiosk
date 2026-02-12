export interface Product {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  subcategory?: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  brand?: {
    id: string;
    name: string;
    logo?: string | null;
  } | null;
  tags: string[];
  shortDesc: string;
  images?: string[]; // Multiple images for gallery
  productCode: string;
  sizeRange: string; // e.g., "36-42", "S-XL", etc.
  price: string; // e.g., "92$", "150€", etc.
  status?: string;
}

export const products: Product[] = [
  {
    id: "1",
    title: "Ekru Tek Düğmeli Cepli Kadın Blazer Ceket",
    imageUrl: "https://via.placeholder.com/800x1000.png?text=Product",
    category: "ustgiyim",
    subcategory: "ceket",
    tags: ["blazer", "women"],
    shortDesc: "Premium single-button blazer with pocket details in ecru",
    images: [
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
    ],
    productCode: "1ya1ck0015-193",
    sizeRange: "36-42",
    price: "145$",
  },
  {
    id: "2",
    title: "Bordo Kadın Gömlek",
    imageUrl: "https://via.placeholder.com/800x1000.png?text=Product",
    category: "ustgiyim",
    subcategory: "gomlek",
    tags: ["shirt", "women"],
    shortDesc: "Classic bordeaux shirt with refined tailoring",
    images: [
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
    ],
    productCode: "1ya1gm0024-256",
    sizeRange: "36-42",
    price: "78$",
  },
  {
    id: "3",
    title: "Ekru Klasik Pantolon",
    imageUrl: "https://via.placeholder.com/800x1000.png?text=Product",
    category: "altgiyim",
    subcategory: "pantolon",
    tags: ["pants", "women"],
    shortDesc: "Classic tailored pants in ecru with refined fit",
    images: [
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
    ],
    productCode: "2165-192-26W101",
    sizeRange: "36-42",
    price: "95$",
  },
  {
    id: "4",
    title: "Bej Bisiklet Yaka Mini Elbise",
    imageUrl: "https://via.placeholder.com/800x1000.png?text=Product",
    category: "elbise",
    subcategory: "elbise",
    tags: ["dress", "women"],
    shortDesc: "Beige crew neck mini dress with elegant silhouette",
    images: [
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
    ],
    productCode: "BGNELB-001",
    sizeRange: "36-42",
    price: "120$",
  },
  {
    id: "5",
    title: "Kahverengi Pantolonlu Takım",
    imageUrl: "https://via.placeholder.com/800x1000.png?text=Product",
    category: "takim",
    subcategory: "takim",
    tags: ["suit", "women"],
    shortDesc: "Elegant brown suit with tailored pants",
    images: [
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
    ],
    productCode: "1ya1ta0007-207",
    sizeRange: "36-42",
    price: "185$",
  },
  {
    id: "6",
    title: "Siyah Kadın Gömlek",
    imageUrl: "https://via.placeholder.com/800x1000.png?text=Product",
    category: "ustgiyim",
    subcategory: "gomlek",
    tags: ["shirt", "women"],
    shortDesc: "Classic black shirt with refined tailoring",
    images: [
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
    ],
    productCode: "1ya1gm0006-228",
    sizeRange: "36-42",
    price: "82$",
  },
  {
    id: "7",
    title: "Koyu Yeşil Klasik Pantolon",
    imageUrl: "https://via.placeholder.com/800x1000.png?text=Product",
    category: "altgiyim",
    subcategory: "pantolon",
    tags: ["pants", "women"],
    shortDesc: "Tailored pants in deep green with refined fit",
    images: [
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
    ],
    productCode: "4175-272-26W109",
    sizeRange: "36-42",
    price: "95$",
  },
  {
    id: "8",
    title: "Yeşil Klasik Pantolon",
    imageUrl: "https://via.placeholder.com/800x1000.png?text=Product",
    category: "altgiyim",
    subcategory: "pantolon",
    tags: ["pants", "women"],
    shortDesc: "Classic tailored pants in green with elegant fit",
    images: [
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
    ],
    productCode: "4188-272-26W101",
    sizeRange: "36-42",
    price: "95$",
  },
  {
    id: "9",
    title: "Ekru Klasik Pantolon",
    imageUrl: "https://via.placeholder.com/800x1000.png?text=Product",
    category: "altgiyim",
    subcategory: "pantolon",
    tags: ["pants", "women"],
    shortDesc: "Classic tailored pants in ecru with refined details",
    images: [
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
      "https://via.placeholder.com/800x1000.png?text=Product",
    ],
    productCode: "2146-192-26W101",
    sizeRange: "36-42",
    price: "95$",
  },
];

export const categories = Array.from(new Set(products.map((p) => p.category)));
export const allTags = Array.from(new Set(products.flatMap((p) => p.tags)));
