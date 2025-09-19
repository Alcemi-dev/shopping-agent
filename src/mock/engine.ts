import type { Msg } from "../types";
import { MOCK_PRODUCTS } from "./products";

type Category = import("../types").Category;
type Collected = import("../types").Collected;

type Deps = {
  setMessages: React.Dispatch<React.SetStateAction<Msg[]>>;
  setCollected: React.Dispatch<React.SetStateAction<Collected>>;
  getProducts?: () => typeof MOCK_PRODUCTS;
  delayMs?: number; // default 900ms for text
};

const processedLoaderIds = new Set<string>();
const pendingQueries = new Map<string, string>();

export const uid = () => Math.random().toString(36).slice(2);

export function sentenceFor(c: Category) {
  return c;
}

export function createMockEngine({ setMessages, getProducts, delayMs = 900 }: Deps) {
  const products = () => (getProducts ? getProducts() : MOCK_PRODUCTS);

  function send(text: string, opts?: { source?: "chat" | "voice" }) {
    const q = text.trim();
    if (!q) return;

    const userMsg: Msg = {
      id: uid(),
      role: "user",
      kind: "text",
      text: q,
      source: opts?.source ?? "chat", // 👈 saugom iš kur žinutė
    } as Msg;

    const loaderId = uid();

    const isProductQuery = [
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "many",
      "alternative",
      "more",
    ].some((k) => q.toLowerCase().includes(k));

    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: loaderId,
        role: "system",
        kind: "loading",
        target: isProductQuery ? "products" : "text",
        source: userMsg.source, // 👈 forwardinam
      } as Msg,
    ]);

    pendingQueries.set(loaderId, q);
  }

  function handleMessagesEffect(messages: Msg[]) {
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

    const isProductsTarget = (loader as any).target === "products";
    const source = (loader as any).source ?? "chat";

    // 👇 skirtingi delay
    let waitMs: number;
    if (!isProductsTarget) {
      waitMs = delayMs; // tekstui greitas
    } else if (source === "voice") {
      waitMs = 3000; // voice + products
    } else {
      waitMs = 900; // chat + products, galima keist testinimui
    }

    const t = setTimeout(() => {
      pendingQueries.delete(loader!.id);

      let scenario: string;
      if (q.includes("none")) scenario = "none";
      else if (q.includes("alternative")) scenario = "alternative";
      else if (q.includes("many")) scenario = "many";
      else if (q.includes("one")) scenario = "one";
      else if (q.includes("two")) scenario = "two";
      else if (q.includes("three")) scenario = "three";
      else if (q.includes("four")) scenario = "four";
      else if (q.includes("five")) scenario = "five";
      else if (q.includes("six")) scenario = "six";
      else if (q.includes("seven")) scenario = "seven";
      else if (q.includes("eight")) scenario = "eight";
      else if (q.includes("more")) scenario = "more";
      else if (q.includes("feedback")) scenario = "feedback";
      else if (q.includes("connection")) scenario = "connection";
      else if (q.includes("error")) scenario = "error";
      else if (q.includes("tutorial")) scenario = "tutorial";
      else scenario = "default";

      // === Produktų scenarijai ===
      if (["one", "two", "three", "four", "five", "six", "seven", "eight"].includes(scenario)) {
        const countMap: Record<string, number> = {
          one: 1,
          two: 2,
          three: 3,
          four: 4,
          five: 5,
          six: 6,
          seven: 7,
          eight: 8,
        };
        const count = countMap[scenario] ?? 1;
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loader!.id)
            .concat([
              {
                id: loader!.id + "-" + scenario,
                role: "assistant",
                kind: "products",
                products: products().slice(0, count),
                header:
                  count === 1
                    ? "Based on your search, this is the best product match for your needs."
                    : `We found ${count} product(s) matching your request:`,
                visibleCount: Math.min(count, 3),
                showMore: count > 3,
              } as Msg,
            ])
        );
      } else if (scenario === "many") {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loader!.id)
            .concat([
              {
                id: loader!.id + "-many",
                role: "assistant",
                kind: "products",
                products: products(),
                header: "We found multiple products that match your request. Here they are:",
                footer: "Do you need any further help?",
                visibleCount: 3,
                showMore: false,
              } as Msg,
            ])
        );
      } else if (scenario === "alternative") {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loader!.id)
            .concat([
              {
                id: loader!.id + "-alternative",
                role: "assistant",
                kind: "products",
                products: products().slice(3, 6),
                header: `I couldn’t find anything for "${q}", but here are the closest matches our customers love:`,
                footer: "Do you need any further help?",
                visibleCount: 3,
                showMore: false,
              } as Msg,
            ])
        );
      } else if (scenario === "more") {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loader!.id)
            .concat([
              {
                id: loader!.id + "-more",
                role: "assistant",
                kind: "products",
                products: products(),
                header: "Based on your request we have found a lot of products matching your description:",
                visibleCount: 3,
                showMore: true,
              } as Msg,
            ])
        );
      }
      // === Tekstiniai scenarijai ===
      else if (scenario === "none") {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loader!.id)
            .concat([
              {
                id: loader!.id + "-none",
                role: "assistant",
                kind: "text",
                text: `No results found for "${q}". I suggest checking these items:`,
                extraClass: "no-results",
              } as Msg,
              {
                id: loader!.id + "-actions",
                role: "assistant",
                kind: "actions",
                actions: [
                  { label: "Recommendation 1", value: "rec1" },
                  { label: "Recommendation 2", value: "rec2" },
                ],
                extraClass: "recommendation-chips",
              } as Msg,
              {
                id: loader!.id + "-support",
                role: "assistant",
                kind: "text",
                text: "If you need immediate help, call us (+3706 465 8132) or send us an email (info@shop.lt).",
                extraClass: "support-text",
              } as Msg,
            ])
        );
      } else if (scenario === "feedback") {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loader!.id)
            .concat([{ id: loader!.id + "-feedback", role: "assistant", kind: "feedback" } as Msg])
        );
      } else if (scenario === "connection") {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loader!.id)
            .concat([{ id: loader!.id + "-connection", role: "assistant", kind: "connection-lost" } as Msg])
        );
      } else if (scenario === "error") {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loader!.id)
            .concat([
              {
                id: loader!.id + "-error",
                role: "assistant",
                kind: "error",
                text: "This is an error message that will be displayed when there's an error.",
              } as Msg,
            ])
        );
      } else if (scenario === "tutorial") {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loader!.id)
            .concat([
              {
                id: loader!.id + "-tutorial",
                role: "assistant",
                kind: "text",
                text:
                  "Here is the list of keywords you can try:\n" +
                  "- type 'one' → 1 product\n" +
                  "- type 'two' → 2 products\n" +
                  "- type 'three' → 3 products\n" +
                  "- type 'four' → 4 products\n" +
                  "- type 'five' → 5 products\n" +
                  "- type 'six' → 6 products\n" +
                  "- type 'seven' → 7 products\n" +
                  "- type 'eight' → 8 products\n" +
                  "- type 'many' → all products\n" +
                  "- type 'alternative' → 3 alternative products\n" +
                  "- type 'more' → many with show more\n" +
                  "- type 'none' → no results\n" +
                  "- type 'feedback' → feedback screen\n" +
                  "- type 'connection' → connection lost\n" +
                  "- type 'error' → error message",
              } as Msg,
            ])
        );
      } else {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== loader!.id)
            .concat([
              {
                id: loader!.id + "-default",
                role: "assistant",
                kind: "text",
                text: "This is a default message, for list of keywords type tutorial.",
              } as Msg,
            ])
        );
      }
    }, waitMs);

    return () => clearTimeout(t);
  }

  return { send, handleMessagesEffect };
}
