export type Product = {
  _id: string;
  title: string;
  description?: string;
  media?: string[];
  category?: string;
  chapters?: string[];
  tags?: string[];
  price?: number;
  cost?: number;
  sizes?: string[];
  colors?: string[];
  variants?: Array<{ color?: string; size?: string; stock: number }>;
  countInStock?: number;
  createdAt?: string;
  updatedAt?: string;
  // Admin flag to expose product in the store
  fetchToStore?: boolean;
};

export type Chapter = {
  _id: string;
  title: string;
  image: string;
  description?: string;
  href?: string;
  products?: Product[];
};

export type User = {
  clerkId: string;
  wishlist: string[];
  orders: string[];
  createdAt: string;
  updatedAt: string;
};
