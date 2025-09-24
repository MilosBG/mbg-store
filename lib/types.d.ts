/* eslint-disable @typescript-eslint/no-wrapper-object-types */
type ChapterType = {
  href: string;
  _id: string;
  title: string;
  products: number;
  image: string;
};

type ProductType = {
  _id: string;
  title: string;
  description: string;
  media: [string];
  category: string;
  chapters: [string];
  tags: [string];
  price: number;
  cost: number;
  sizes: [string];
  colors: [string];
  // Variant-level availability (optional)
  variants?: Array<{
    color?: string;
    size?: string;
    stock: number;
  }>;
  // Number of items available in stock (optional in older docs)
  countInStock?: number;
  createdAt: string;
  updatedAt: string;
};

type UserType = {
  clerkId: string;
  wishlist: [string];
  orders: [string];
  createdAt: string;
  updatedAt: string;
};
type OrderType = {
  shippingAddress: Object;
  _id: string;
  customerClerkId: string;
  products: [OrderItemType];
  shippingRate: string;
  totalAmount: number;
  fulfillmentStatus?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  cancelledAt?: string;
};

type OrderItemType = {
  product: ProductType;
  color: string;
  size: string;
  quantity: number;
  _id: string;
};
