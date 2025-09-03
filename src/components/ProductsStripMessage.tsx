import { useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/products-strip.css";
import type { Product } from "../screens/ChatScreen";
import { useDragScroll } from "../hooks/useDragScroll";

type Props = {
  products: Product[];
  anchorRect: DOMRect | null;
  header?: string;
  footer?: string;
  onAddToCart?: (title: string) => void; // 🛒 callback
};

export function ProductsStripMessage({ products, anchorRect, header, footer, onAddToCart }: Props) {
  const overlayRoot = typeof document !== "undefined" ? document.getElementById("modal-overlays") : null;
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState(false); // 👈 CTA -> Success toggle
  const topPx = useMemo(() => (anchorRect ? anchorRect.top + window.scrollY : 0), [anchorRect]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useDragScroll(scrollRef);

  // 👇 kai tik produktai atsiranda ar pasikeičia, scrollinam į apačią
  useEffect(() => {
    const chatLog = document.querySelector(".chat-log") as HTMLElement | null;
    if (chatLog) {
      chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
    }
  }, [products, header, footer, added]);

  if (!overlayRoot || !anchorRect) return null;

  const single = products.length === 1;
  const showFooter = !single && !!footer;

  return createPortal(
    <div className="products-wrap" style={{ top: topPx }}>
      {/* Header */}
      {header ? (
        <div className="products-contain">
          <p className="products-header">{header}</p>
        </div>
      ) : null}

      {/* 👇 scroll konteineris su klase pagal kiekį */}
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
                    onClick={() => {
                      setMuted((m) => {
                        const key = String(p.id);
                        const next = { ...m, [key]: !m[key] };
                        return next;
                      });
                    }}
                  >
                    <img src="/img/dislike.svg" alt="" />
                  </button>
                  <button type="button" className="circle" aria-label="Save">
                    <img src="/img/favorite.svg" alt="" />
                  </button>
                </div>

                {/* 🛒 Add-to-cart mygtukas */}
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

      {/* Footer / CTA */}
      <div className="products-contain">
        {single ? (
          !added ? (
            <div className="products-cta">
              <p className="cta-q">Would you like me to add this product to your cart?</p>
              <div className="cta-buttons">
                <button
                  className="btn-primary"
                  onClick={() => {
                    onAddToCart?.(products[0].title);
                    setAdded(true); // 👈 CTA -> Success block
                  }}
                >
                  Yes, add to cart
                </button>
                <button className="btn-secondary">No</button>
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
          )
        ) : null}

        {showFooter ? <p className="products-followup">{footer}</p> : null}
      </div>
    </div>,
    overlayRoot
  );
}
