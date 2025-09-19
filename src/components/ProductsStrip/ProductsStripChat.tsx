// src/components/ProductsStrip/ProductsStripChat.tsx
import { useRef, useEffect, useState } from "react";
import "../../styles/products-strip.css";
import type { Product } from "../../screens/ChatScreen";
import { useDragScroll } from "../../hooks/useDragScroll";
import { useProductsState } from "./useProductsState";

type Props = {
  products: Product[];
  header?: string;
  footer?: string;
  visibleCount?: number;
  showMore?: boolean;
  onAddToCart?: (title: string, qty: number) => void;
  onShowToast?: (payload: { items: { title: string; qty: number }[] }) => void;
};

export function ProductsStripChat({
  products,
  header,
  footer,
  visibleCount = 3,
  showMore = false,
  onAddToCart,
  onShowToast,
}: Props) {
  const { muted, favorites, quantities, changeQty, toggleDislike, toggleFavorite } = useProductsState(products, {
    onAddToCart,
    onShowToast,
  });

  const [groups, setGroups] = useState<Product[][]>([products.slice(0, visibleCount)]);
  const [ctaDismissed, setCtaDismissed] = useState(false);
  const [showFollowup, setShowFollowup] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useDragScroll(scrollRef);

  const single = products.length === 1;
  const more = !!showMore;

  // 👇 auto scroll kai atsiranda naujų produktų ar CTA
  useEffect(() => {
    const chatLog = document.querySelector(".chat-log") as HTMLElement | null;
    if (chatLog) {
      chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
    }
  }, [products, header, footer, groups, ctaDismissed, showFollowup]);

  const handleAddAllToCart = () => {
    if (!single) return;
    const product = products[0];
    if (product) {
      onAddToCart?.(product.title, 1);
      onShowToast?.({ items: [{ title: product.title, qty: 1 }] });
      setCtaDismissed(true);
      setShowFollowup(true);
    }
  };

  const handleNotNow = () => {
    setCtaDismissed(true);
    setShowFollowup(true);
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
            const isFav = !!favorites[key];
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
                      onClick={() => toggleDislike(key)}
                    >
                      <img src="/img/dislike.svg" alt="" />
                    </button>
                    <button
                      type="button"
                      className={`circle circle--fav ${isFav ? "is-fav" : ""}`}
                      aria-label="Save"
                      aria-pressed={isFav}
                      onClick={() => toggleFavorite(key)}
                    >
                      <img src="/img/favorite.svg" alt="" />
                    </button>
                  </div>

                  {qty > 0 ? (
                    <div className={`qty-panel${isMuted ? " is-disabled" : ""}`}>
                      <button disabled={isMuted} onClick={() => changeQty(key, -1, p)}>
                        <img src="/img/remove.svg" alt="Remove" className="icon-remove" />
                      </button>
                      <span>{qty}</span>
                      <button disabled={isMuted} onClick={() => changeQty(key, +1, p)}>
                        <img src="/img/add.svg" alt="Add" className="icon-add" />
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`add-btn${isMuted ? " is-disabled" : ""}`}
                      onClick={() => changeQty(key, +1, p)}
                      disabled={isMuted}
                    >
                      <img src="/img/add.svg" alt="Add" className="icon-add" />
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
        {!single && showMore && groups.flat().length < products.length && (
          <button className="show-more-btn" onClick={handleShowMore}>
            Show more options
          </button>
        )}
        {more && (
          <p className="products-header products-header-more">
            Showing Top {groups.flat().length} best matching results.
          </p>
        )}

        {single && !ctaDismissed && (
          <div className="products-cta">
            <p className="cta-q">Add this to your cart?</p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={handleAddAllToCart}>
                Add to cart
              </button>
              <button className="btn-secondary" onClick={handleNotNow}>
                Not now
              </button>
            </div>
          </div>
        )}

        {(showFollowup || (single && ctaDismissed)) && (
          <p className="products-followup">Do you need any further assistance?</p>
        )}
      </div>
    </div>
  );
}
