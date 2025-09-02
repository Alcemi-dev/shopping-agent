// ===== Views =====
export type View = "explain" | "chips" | "category" | "chat";

// ===== Categories =====
export type Category =
  | "Consultation"
  | "Order status"
  | "Shipping & delivery"
  | "Returns"
  | "Product Information"
  | "Payment";

// ===== Collected State (state machine memory) =====
export type Collected = {
  skinType?: string; // undefined | "pending" | value
  budget?: string;
};

// ===== Messages =====
export type UserMsg = {
  id: string;
  role: "user";
  kind: "text";
  text: string;
};

export type AssistantTextMsg = {
  id: string;
  role: "assistant";
  kind: "text";
  text: string;
};

export type LoadingMsg = {
  id: string;
  role: "system";
  kind: "loading";
  text?: string;
};

export type ProductsMsg = {
  id: string;
  role: "assistant";
  kind: "products";
  products: { id: string; title: string; img: string }[];
  header?: string;
  footer?: string;
};

export type ActionsMsg = {
  id: string;
  role: "assistant";
  kind: "actions";
  actions: { label: string; value: string }[];
};

// Union
export type Msg = UserMsg | AssistantTextMsg | LoadingMsg | ProductsMsg | ActionsMsg;

// ===== Static data (chips) =====
export const CHIP_ITEMS: Category[] = [
  "Payment",
  "Returns",
  "Consultation",
  "Order status",
  "Product Information",
  "Shipping & delivery",
];

export const SUBCHIPS: Record<Category, string[]> = {
  Consultation: ["Book a call", "Skin type quiz", "Routine advice", "Shade matching", "Best-sellers"],
  "Order status": ["Track order", "Change address", "Cancel order", "Invoice copy", "Late delivery"],
  "Shipping & delivery": [
    "Delivery methods",
    "Shipping status",
    "Shipping costs",
    "Delivery times",
    "International shipping",
  ],
  Returns: ["Start a return", "Return policy", "Refund timing", "Exchange item", "Return label"],
  "Product Information": ["Ingredients", "How to use", "Allergies & safety", "Stock availability", "Sizes & variants"],
  Payment: ["Payment methods", "Installments", "Promo codes", "Billing issues", "Tax & VAT"],
};
