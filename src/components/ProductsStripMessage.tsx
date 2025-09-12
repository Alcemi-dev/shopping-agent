import { useRef, useEffect, useState } from "react";
import "../styles/products-strip.css";
import type { Product } from "../screens/ChatScreen";
import { useDragScroll } from "../hooks/useDragScroll";

type Props = {
  products: Product[];
  header?: string;
  footer?: string;
  visibleCount?: number; // kiek produktų rodyti vienoje eilėje
  showMore?: boolean; // ar rodyti "show more" mygtuką
  onAddToCart?: (title: string, delta: number) => void;
};

export function ProductsStripMessage({
  products,
  header,
  footer,
  visibleCount = 3,
  showMore = false,
  onAddToCart,
}: Props) {
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [groups, setGroups] = useState<Product[][]>([products.slice(0, visibleCount)]); // 👈 pirmoji grupė
  const [added, setAdded] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useDragScroll(scrollRef);

  useEffect(() => {
    const chatLog = document.querySelector(".chat-log") as HTMLElement | null;
    if (chatLog) {
      chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
    }
  }, [products, header, footer, groups, quantities, added]);

  const single = products.length === 1;

  const changeQty = (id: string, delta: number, title: string) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.max(0, current + delta);

      if (delta > 0) onAddToCart?.(title, +1);
      if (delta < 0 && current > 0) onAddToCart?.(title, -1);

      if (single && delta > 0) {
        setAdded(true);
      }

      return { ...prev, [id]: next };
    });
  };

  const handleShowMore = () => {
    const alreadyShown = groups.flat().length;
    const next = products.slice(alreadyShown, alreadyShown + visibleCount);
    if (next.length > 0) {
      setGroups((prev) => [...prev, next]);
    }
  };

  return (
    <div className="products-wrap">
      {header && (
        <div className="products-contain">
          <p className="products-header">{header}</p>
        </div>
      )}

      {/* Renderuojam visas grupes */}
      {groups.map((group, gIdx) => (
        <div
          key={gIdx}
          className={`products-scroll${single ? " is-single" : " is-multiple"}`}
          ref={scrollRef}
          role="list"
        >
          {group.map((p) => {
            const key = String(p.id);
            const isMuted = !!muted[key];
            const qty = quantities[key] ?? 0;

            return (
              <article key={key} className={`product-card${isMuted ? " is-muted" : ""}`} aria-label={p.title}>
                <div className="image-wrap">
                  <img className="product-img" src={p.img} alt={p.title} />

                  <div className="reactions">
                    <button
                      type="button"
                      className="circle circle--dislike"
                      aria-label="Dislike"
                      aria-pressed={isMuted}
                      onClick={() => setMuted((m) => ({ ...m, [key]: !m[key] }))}
                    >
                      <img src="/img/dislike.svg" alt="" />
                    </button>
                    <button type="button" className="circle circle--fav" aria-label="Save">
                      <img src="/img/favorite.svg" alt="" />
                    </button>
                  </div>

                  {qty > 0 ? (
                    <div className="qty-panel">
                      <button onClick={() => changeQty(key, -1, p.title)}>-</button>
                      <span>{qty}</span>
                      <button onClick={() => changeQty(key, +1, p.title)}>+</button>
                    </div>
                  ) : (
                    <button className="add-btn" onClick={() => changeQty(key, +1, p.title)}>
                      <img src="/img/add.svg" alt="" />
                    </button>
                  )}
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
                  <h4 className="title">{p.title}</h4>
                </div>
              </article>
            );
          })}
        </div>
      ))}

      <div className="products-contain">
        {/* CTA jei single product */}
        {single &&
          (!added ? (
            <div className="products-cta">
              <p className="cta-q">Add this to your cart?</p>
              <div className="cta-buttons">
                <button
                  className="btn-primary"
                  onClick={() => changeQty(String(products[0].id), +1, products[0].title)}
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

        {/* Show more mygtukas tik jei liko dar produktų */}
        {!single && showMore && groups.flat().length < products.length && (
          <button className="show-more-btn" onClick={handleShowMore}>
            Show more options
          </button>
        )}

        {footer && <p className="products-followup">{footer}</p>}
      </div>
    </div>
  );
}
