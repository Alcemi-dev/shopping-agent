import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/products-strip.css";
import type { Product } from "../screens/ChatScreen";
import { useDragScroll } from "../hooks/useDragScroll"; // 👈 import

type Props = {
  products: Product[];
  anchorRect: DOMRect | null;
  header?: string;
  footer?: string;
};

export function ProductsStripMessage({ products, anchorRect, header, footer }: Props) {
  const overlayRoot = typeof document !== "undefined" ? document.getElementById("modal-overlays") : null;
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const topPx = useMemo(() => (anchorRect ? anchorRect.top + window.scrollY : 0), [anchorRect]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useDragScroll(scrollRef);

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

      {/* 👇 drag-scroll ref */}
      <div className="products-scroll" ref={scrollRef} role="list">
        {products.map((p) => {
          const isMuted = !!muted[p.id];
          return (
            <article
              key={p.id}
              role="listitem"
              className={`product-card${isMuted ? " is-muted" : ""}`}
              aria-label={p.title}
            >
              <div className="image-wrap">
                <img className="product-img" src={p.img} alt={p.title} />

                <div className="reactions">
                  <button
                    type="button"
                    className="circle"
                    aria-label="Dislike"
                    aria-pressed={isMuted}
                    onClick={() => setMuted((m) => ({ ...m, [p.id]: !m[p.id] }))}
                  >
                    <img src="/img/dislike.svg" alt="" />
                  </button>
                  <button type="button" className="circle" aria-label="Save">
                    <img src="/img/favorite.svg" alt="" />
                  </button>
                </div>

                <button type="button" className="add-btn" aria-label="Add">
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
          <div className="products-cta">
            <p className="cta-q">Would you like me to add this product to your cart?</p>
            <div className="cta-buttons">
              <button className="btn-primary">Yes, add to cart</button>
              <button className="btn-secondary">No</button>
            </div>
          </div>
        ) : null}

        {showFooter ? <p className="products-followup">{footer}</p> : null}
      </div>
    </div>,
    overlayRoot
  );
}
