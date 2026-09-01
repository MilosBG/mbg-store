export type CommerceInfo = {
  productReference?: string;
  productDetails?: string;
  materialComposition?: string;
  fabricName?: string;
  fabricWeight?: number | string;
  fabricDescription?: string;
  fit?: string;
  fitNotes?: string;
  careInstructions?: string;
  countryOfManufacture?: string;
  fabricOrigin?: string;
  craftsmanship?: string;
  certificationName?: string;

  certificationScope?:
    | ""
    | "FABRIC"
    | "FINISHED_GARMENT"
    | string;

  certificateNumber?: string;
  certificationInstitute?: string;
  certificateUrl?: string;
  manufacturerName?: string;
  manufacturerAddress?: string;
  manufacturerEmail?: string;
  shippingProcessingTime?: string;
  deliveryEstimate?: string;
  withdrawalDays?: number | string;
  returnCostBearer?: string;
  safetyWarnings?: string;
};

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

  variants?: Array<{
    color?: string;
    size?: string;
    stock: number;
  }>;

  countInStock?: number;
  createdAt?: string;
  updatedAt?: string;

  // Admin flag to expose product in the store.
  fetchToStore?: boolean;

  // Product technical/commercial information
  // displayed in ProductAccordion.
  commerceInfo?: CommerceInfo;
};

export type Chapter = {
  _id: string;
  title: string;
  badge?: string;
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