// ===== Views =====
export type View = "explain" | "chips" | "category" | "chat" | "feedback" | "feedback-filled" | "connection-lost";

export type Category =
  | "Product information"
  | "Consultation"
  | "Order status"
  | "Shipping & delivery"
  | "Returns"
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
  extraClass?: string;
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
  extraClass?: string;
};

export type FeedbackMsg = {
  id: string;
  role: "assistant";
  kind: "feedback";
};

export type ConnectionLostMsg = {
  id: string;
  role: "assistant";
  kind: "connection-lost";
};

export type ErrorMsg = {
  id: string;
  role: "assistant";
  kind: "error";
  text: string;
};

// ===== Union =====
export type Msg =
  | UserMsg
  | AssistantTextMsg
  | LoadingMsg
  | ProductsMsg
  | ActionsMsg
  | FeedbackMsg
  | ConnectionLostMsg
  | ErrorMsg;

// ===== Static data (chips) =====
export const CHIP_ITEMS: Category[] = [
  "Product information",
  "Consultation",
  "Order status",
  "Shipping & delivery",
  "Returns",
  "Payment",
];

export const SUBCHIPS: Record<Category, string[]> = {
  "Product information": ["Ingredients", "How to use", "Allergies & safety", "Stock availability", "Sizes & variants"],
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
  Payment: ["Payment methods", "Installments", "Promo codes", "Billing issues", "Tax & VAT"],
};
