import type { Msg } from "../types";
import { MOCK_PRODUCTS } from "../data/products";

type Category = import("../types").Category;
type Collected = import("../types").Collected;

type Deps = {
  setMessages: React.Dispatch<React.SetStateAction<Msg[]>>;
  setCollected: React.Dispatch<React.SetStateAction<Collected>>;
  getProducts?: () => typeof MOCK_PRODUCTS;
  delayMs?: number; // default 900ms
};

// Vidaus būsenos (modulio lygio – imituoja backend užklausų vykdymą)
const processedLoaderIds = new Set<string>();
const pendingQueries = new Map<string, string>();

export const uid = () => Math.random().toString(36).slice(2);

export function sentenceFor(c: Category) {
  switch (c) {
    case "Consultation":
      return "I’d like a consultation.";
    case "Order status":
      return "I’m looking for my order status.";
    case "Shipping & delivery":
      return "I’m looking for information about Shipping & delivery.";
    case "Returns":
      return "I need help with returns.";
    case "Product Information":
      return "I’m looking for product information.";
    case "Payment":
      return "I have a question about payments.";
  }
}

export function createMockEngine({ setMessages, setCollected, getProducts, delayMs = 900 }: Deps) {
  const products = () => (getProducts ? getProducts() : MOCK_PRODUCTS);

  /** Viešas metodas: registruoja user žinutę + loader’į */
  function send(text: string) {
    const q = text.trim();
    if (!q) return;

    const userMsg: Msg = { id: uid(), role: "user", kind: "text", text: q };
    const loaderId = uid();

    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.kind === "loading") return prev;
      return [...prev, userMsg, { id: loaderId, role: "system", kind: "loading" } as Msg];
    });

    pendingQueries.set(loaderId, q);
  }

  /** Kviečiama iš React useEffect – apdoroja naują "loading" žinutę */
  function handleMessagesEffect(messages: Msg[]) {
    // Surandam naujausią "loading"
    let loader: Msg | undefined;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.kind === "loading") {
        loader = m;
        break;
      }
    }
    if (!loader) return;
    if (processedLoaderIds.has(loader.id)) return;

    processedLoaderIds.add(loader.id);
    const q = (pendingQueries.get(loader.id) ?? "").toLowerCase();

    const t = setTimeout(() => {
      pendingQueries.delete(loader!.id);

      setCollected((current) => {
        // 1) ask skinType
        if (!current.skinType) {
          const msgId = loader!.id + "-skin";
          setMessages((prev) =>
            prev
              .filter((m) => m.id !== loader!.id)
              .concat([
                {
                  id: msgId,
                  role: "assistant",
                  kind: "text",
                  text: "What’s your skin type? (oily, dry, normal…)",
                } as Msg,
              ])
          );
          return { ...current, skinType: "pending" };
        }

        // 2) ask budget
        if (current.skinType === "pending") {
          const msgId = loader!.id + "-budget";
          setMessages((prev) =>
            prev
              .filter((m) => m.id !== loader!.id)
              .concat([
                {
                  id: msgId,
                  role: "assistant",
                  kind: "text",
                  text: "Great! What’s your budget range?",
                } as Msg,
              ])
          );
          return { ...current, skinType: q || "normal" };
        }

        // 3) branching pagal "none" / "many" / "one"
        if (!current.budget) {
          const newState = { ...current, budget: q || "mid" };
          const scenario = q.includes("none") ? "none" : q.includes("many") ? "many" : "one";

          if (scenario === "one") {
            const msgId = loader!.id + "-one";
            setMessages((prev) =>
              prev
                .filter((m) => m.id !== loader!.id)
                .concat([
                  {
                    id: msgId,
                    role: "assistant",
                    kind: "products",
                    products: [products()[0]],
                    header:
                      "Based on your skin type and other indications, this is the best match for your needs in our store:",
                  } as Msg,
                ])
            );
          } else if (scenario === "many") {
            const msgId = loader!.id + "-many";
            setMessages((prev) =>
              prev
                .filter((m) => m.id !== loader!.id)
                .concat([
                  {
                    id: msgId,
                    role: "assistant",
                    kind: "products",
                    products: products(),
                    header:
                      "I couldn’t find anything for your exact request, but here are the closest matches that our customers love:",
                    footer: "Do you need any further help?",
                  } as Msg,
                ])
            );
          } else {
            const noResultsId = loader!.id + "-none";
            const actionsId = loader!.id + "-actions";
            const supportId = loader!.id + "-support";

            setMessages((prev) =>
              prev
                .filter((m) => m.id !== loader!.id)
                .concat([
                  {
                    id: noResultsId,
                    role: "assistant",
                    kind: "text",
                    text: `No results found for ${q || "your query"}. I suggest checking these items:`,
                    extraClass: "no-results",
                  } as Msg,
                  {
                    id: actionsId,
                    role: "assistant",
                    kind: "actions",
                    actions: [
                      { label: "Recommendation 1", value: "rec1" },
                      { label: "Recommendation 2", value: "rec2" },
                    ],
                    extraClass: "recommendation-chips",
                  } as Msg,
                  {
                    id: supportId,
                    role: "assistant",
                    kind: "text",
                    text: "If you need immediate help, call us (+3706 465 8132) or send us an email (info@shop.lt). Would you like me to help you draft and send an email to our customer support manager?",
                    extraClass: "support-text",
                  } as Msg,
                ])
            );
          }
          return newState;
        }

        return current;
      });
    }, delayMs);

    // grąžinam cancel funkciją, jei norėtum kviesti ranka (nebūtina naudoti)
    return () => clearTimeout(t);
  }

  return { send, handleMessagesEffect };
}
