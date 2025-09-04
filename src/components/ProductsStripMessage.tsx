import { useRef, useEffect, useState } from "react";
import "../styles/products-strip.css";
import type { Product } from "../screens/ChatScreen";
import { useDragScroll } from "../hooks/useDragScroll";

type Props = {
  products: Product[];
  header?: string;
  footer?: string;
  onAddToCart?: (title: string) => void;
};

export function ProductsStripMessage({ products, header, footer, onAddToCart }: Props) {
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useDragScroll(scrollRef);

  useEffect(() => {
    const chatLog = document.querySelector(".chat-log") as HTMLElement | null;
    if (chatLog) {
      chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
    }
  }, [products, header, footer, added]);

  const single = products.length === 1;
  const showFooter = !single && !!footer;

  return (
    <div className="products-wrap">
      {header && (
        <div className="products-contain">
          <p className="products-header">{header}</p>
        </div>
      )}

      <div className={`products-scroll${single ? " is-single" : " is-multiple"}`} ref={scrollRef} role="list">
        {products.map((p) => {
          const key = String(p.id);
          const isMuted = !!muted[key];

          return (
            <article key={key} className={`product-card${isMuted ? " is-muted" : ""}`} aria-label={p.title}>
              <div className="image-wrap">
                <img className="product-img" src={p.img} alt={p.title} />

                <div className="reactions">
                  <button
                    type="button"
                    className="circle"
                    aria-label="Dislike"
                    aria-pressed={isMuted}
                    onClick={() =>
                      setMuted((m) => {
                        const next = { ...m, [key]: !m[key] };
                        return next;
                      })
                    }
                  >
                    <img src="/img/dislike.svg" alt="" />
                  </button>
                  <button type="button" className="circle" aria-label="Save">
                    <img src="/img/favorite.svg" alt="" />
                  </button>
                </div>

                <button
                  type="button"
                  className="add-btn"
                  aria-label="Add"
                  onClick={() => {
                    onAddToCart?.(p.title);
                    setAdded(true);
                  }}
                >
                  <img src="/img/add.svg" alt="" />
                </button>
              </div>

              <div className="content">
                <div className="price-row">
                  {p.price != null ? (
                    <span className="price">{typeof p.price === "number" ? `${p.price} €` : p.price}</span>
                  ) : (
                    <span className="price">120 €</span>
                  )}
                  <span className="reviews">
                    <img src="/img/star.svg" alt="" />
                    <span>{p.rating ?? 4.8}</span>
                    <a className="reviews-count" href="#" onClick={(e) => e.preventDefault()}>
                      ({p.reviews ?? 20})
                    </a>
                  </span>
                </div>
                <h4 className="title" title={p.title}>
                  {p.title}
                </h4>
              </div>
            </article>
          );
        })}
      </div>

      <div className="products-contain">
        {single &&
          (!added ? (
            <div className="products-cta">
              <p className="cta-q">Add this to your cart?</p>
              <div className="cta-buttons">
                <button
                  className="btn-primary"
                  onClick={() => {
                    onAddToCart?.(products[0].title);
                    setAdded(true);
                  }}
                >
                  Add to cart
                </button>
                <button className="btn-secondary">Not now</button>
              </div>
            </div>
          ) : (
            <div className="success-block">
              <div className="checkmark">
                <img src="/img/check.svg" alt="✓" />
              </div>
              <div className="success-col">
                <div className="product-line">
                  <span className="product-name">{products[0].title}</span>
                  <span className="product-qty">x1</span>
                </div>
                <span className="added">Added to cart</span>
              </div>
              <button className="view-cart">View cart</button>
            </div>
          ))}

        {showFooter && <p className="products-followup">{footer}</p>}
      </div>
    </div>
  );
}
