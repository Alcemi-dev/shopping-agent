// ===== Views =====
export type View =
  | "explain"
  | "chips"
  | "category"
  | "chat"
  | "feedback"
  | "feedback-filled"
  | "connection-lost"
  | "voice"
  | "voicechat";

export type Category =
  | "Product information"
  | "Consultation"
  | "Order status"
  | "Returns"
  | "Shipping & delivery"
  | "Payment";

// ===== Collected State (state machine memory) =====
export type Collected = {
  skinType?: string; // undefined | "pending" | value
  budget?: string;
};

// ===== Base Message (visiems bendra) =====
export type BaseMsg = {
  id: string;
  source?: "chat" | "voice"; // 👈 dabar visi msg gali turėti source
};

// ===== Messages =====
export type UserMsg = BaseMsg & {
  role: "user";
  kind: "text";
  text: string;
};

export type AssistantTextMsg = BaseMsg & {
  role: "assistant";
  kind: "text";
  text: string;
  extraClass?: string;
};

export type LoadingMsg = BaseMsg & {
  role: "system";
  kind: "loading";
  text?: string;
  target?: "text" | "products";
};

export type ProductsMsg = BaseMsg & {
  role: "assistant";
  kind: "products";
  products: Product[];
  header?: string;
  footer?: string;
  /** kiek produktų šiuo metu rodyti (naudojama "show more" logikai) */
  visibleCount?: number;
  showMore?: boolean;
};

export type ActionsMsg = BaseMsg & {
  role: "assistant";
  kind: "actions";
  actions: { label: string; value: string }[];
  extraClass?: string;
};

export type FeedbackMsg = BaseMsg & {
  role: "assistant";
  kind: "feedback";
};

export type ConnectionLostMsg = BaseMsg & {
  role: "assistant";
  kind: "connection-lost";
};

export type ErrorMsg = BaseMsg & {
  role: "assistant";
  kind: "error";
  text: string;
};

// ✅ Naujas tipas — generuojamas atsakymas
export type GeneratingMsg = BaseMsg & {
  role: "assistant";
  kind: "generating";
  text?: string;
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
  | ErrorMsg
  | GeneratingMsg;

// ===== Product model =====
export type Product = {
  id: string;
  title: string;
  img: string;
  price?: number | string;
  rating?: number;
  reviews?: number;
};

//---- toast state---//
export type ToastPayload = {
  items: { title: string; qty: number }[];
};

// ===== Configuration =====
export interface ShoppingAgentConfig {
  promptType?: string;
  welcomeMessage?: string;
  enableFloatingChat?: boolean;
  buttonText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

// ===== Static data (chips) =====
export const CHIP_ITEMS: Category[] = [
  "Product information",
  "Consultation",
  "Order status",
  "Returns",
  "Shipping & delivery",
  "Payment",
];

export const SUBCHIPS: Record<Category, string[]> = {
  "Product information": [
    "Ingredients",
    "How to use",
    "Allergies & safety",
    "Stock availability",
    "Sizes & variants",
  ],
  Consultation: [
    "Book a call",
    "Skin type quiz",
    "Routine advice",
    "Shade matching",
    "Best-sellers",
  ],
  "Order status": [
    "Track order",
    "Change address",
    "Cancel order",
    "Invoice copy",
    "Late delivery",
  ],
  Returns: [
    "Start a return",
    "Return policy",
    "Refund timing",
    "Exchange item",
    "Return label",
  ],
  "Shipping & delivery": [
    "Delivery methods",
    "Shipping status",
    "Shipping costs",
    "Delivery times",
    "International shipping",
  ],
  Payment: [
    "Payment methods",
    "Installments",
    "Promo codes",
    "Billing issues",
    "Tax & VAT",
  ],
};
