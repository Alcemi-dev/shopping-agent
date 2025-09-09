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

const processedLoaderIds = new Set<string>();
const pendingQueries = new Map<string, string>();

export const uid = () => Math.random().toString(36).slice(2);

export function sentenceFor(c: Category) {
  return c;
}

export function createMockEngine({ setMessages, setCollected, getProducts, delayMs = 900 }: Deps) {
  const products = () => (getProducts ? getProducts() : MOCK_PRODUCTS);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;

    const userMsg: Msg = { id: uid(), role: "user", kind: "text", text: q };
    const loaderId = uid();

    setMessages((prev) => [...prev, userMsg, { id: loaderId, role: "system", kind: "loading" } as Msg]);

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

    const t = setTimeout(() => {
      pendingQueries.delete(loader!.id);

      setCollected((current) => {
        let scenario: string;
        if (q.includes("none")) scenario = "none";
        else if (q.includes("many")) scenario = "many";
        else if (q.includes("one")) scenario = "one";
        else if (q.includes("feedback")) scenario = "feedback";
        else if (q.includes("connection")) scenario = "connection";
        else if (q.includes("error")) scenario = "error"; // 👈 nauja logika
        else scenario = "default";

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
                  header: "Based on your request, this is the single best match we recommend:",
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
                  header: "We found multiple products that match your request. Here they are:",
                  footer: "Do you need any further help?",
                } as Msg,
              ])
          );
        } else if (scenario === "none") {
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
                  text: `No results found for "${q}". I suggest checking these items:`,
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
                  text: "If you need immediate help, call us (+3706 465 8132) or send us an email (info@shop.lt).",
                  extraClass: "support-text",
                } as Msg,
              ])
          );
        } else if (scenario === "feedback") {
          const msgId = loader!.id + "-feedback";
          setMessages((prev) =>
            prev
              .filter((m) => m.id !== loader!.id)
              .concat([
                {
                  id: msgId,
                  role: "assistant",
                  kind: "feedback",
                } as Msg,
              ])
          );
        } else if (scenario === "connection") {
          const msgId = loader!.id + "-connection";
          setMessages((prev) =>
            prev
              .filter((m) => m.id !== loader!.id)
              .concat([
                {
                  id: msgId,
                  role: "assistant",
                  kind: "connection-lost",
                } as Msg,
              ])
          );
        } else if (scenario === "error") {
          const msgId = loader!.id + "-error";
          setMessages((prev) =>
            prev
              .filter((m) => m.id !== loader!.id)
              .concat([
                {
                  id: msgId,
                  role: "assistant",
                  kind: "error",
                  text: "This is an error message that will be displayed when there's an error.",
                } as Msg,
              ])
          );
        } else {
          const msgId = loader!.id + "-default";
          setMessages((prev) =>
            prev
              .filter((m) => m.id !== loader!.id)
              .concat([
                {
                  id: msgId,
                  role: "assistant",
                  kind: "text",
                  text:
                    "This is a default text message, to test different outcomes use the following keywords listed below:\n" +
                    "- type 'one' → one product\n" +
                    "- type 'many' → many products\n" +
                    "- type 'none' → no results + recommendations\n" +
                    "- type 'feedback' → feedback screen\n" +
                    "- type 'connection' → connection lost screen\n" +
                    "- type 'error' → error message",
                } as Msg,
              ])
          );
        }

        return current;
      });
    }, delayMs);

    return () => clearTimeout(t);
  }

  return { send, handleMessagesEffect };
}
