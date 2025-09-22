// src/components/ProductsStrip/ProductsStripVoice.tsx
import { useEffect, useState } from "react";
import "../../styles/voice-products.css";
import type { Product } from "../../screens/ChatScreen";
import { useProductsState } from "./useProductsState";
import { ThumbsDownIcon, ThumbsUpIcon, RemoveIcon, AddIcon, StarIcon } from "../SvgIcons";

type Props = {
  products: Product[];
  header?: string;
  footer?: string;
  visibleCount?: number;
  showMore?: boolean;
  onAddToCart?: (title: string, qty: number) => void;
  onShowToast?: (payload: { items: { title: string; qty: number }[] }) => void;
  onFollowUp?: () => void;
  className?: string;
};

export function ProductsStripVoice({ products, header, onAddToCart, onShowToast, onFollowUp }: Props) {
  const { muted, favorites, quantities, changeQty, toggleDislike, toggleFavorite } = useProductsState(products, {
    onAddToCart,
    onShowToast,
  });

  const [ctaDismissed, setCtaDismissed] = useState(false);

  const single = products.length === 1;

  useEffect(() => {
    const chatLog = document.querySelector(".chat-log") as HTMLElement | null;
    if (chatLog) {
      chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
    }
  }, [products, header, ctaDismissed]);

  const handleAddAllToCart = () => {
    const product = products[0];
    if (!product) return;
    onAddToCart?.(product.title, 1);
    onShowToast?.({ items: [{ title: product.title, qty: 1 }] });
    setCtaDismissed(true);
  };

  const handleNotNow = () => {
    setCtaDismissed(true);
  };

  // 👇 dinaminė klasė grid'ui
  const gridClass = products.length <= 4 ? "voice-products-grid few" : "voice-products-grid many";

  return (
    <>
      <div className="voice-products-wrap">
        {/* Header */}
        {header && (
          <div className={`voice-products-header ${single ? "is-single" : "is-multiple"}`}>
            <p>{header}</p>
          </div>
        )}

        {/* Products */}
        <div className="voice-products-grid-outer">
          <div className={`${gridClass} ${single ? "is-single" : ""}`}>
            {products.map((p) => {
              const key = String(p.id);
              const isMuted = !!muted[key];
              const isFav = !!favorites[key];
              const qty = quantities[key] ?? 0;

              return (
                <article
                  key={key}
                  className={`product-card${isMuted ? " is-muted" : ""}${single ? " is-single-card" : ""}`}
                  aria-label={p.title}
                >
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
                          <ThumbsDownIcon fill="#02092E" />
                        </button>
                        <button
                          type="button"
                          className={`circle circle--fav ${isFav ? "is-fav" : ""}`}
                          aria-label="Save"
                          aria-pressed={isFav}
                          onClick={() => toggleFavorite(key)}
                        >
                          <ThumbsUpIcon fill="#02092E" />
                        </button>
                    </div>

                    {qty > 0 ? (
                      <div className={`qty-panel${isMuted ? " is-disabled" : ""}`}>
                        <button disabled={isMuted} onClick={() => changeQty(key, -1, p)}>
                          <RemoveIcon className="icon-remove" />
                        </button>
                        <span>{qty}</span>
                        <button disabled={isMuted} onClick={() => changeQty(key, +1, p)}>
                          <AddIcon className="icon-add" fill="#02092E" />
                        </button>
                      </div>
                    ) : (
                      <button
                        className={`add-btn${isMuted ? " is-disabled" : ""}`}
                        onClick={() => changeQty(key, +1, p)}
                        disabled={isMuted}
                      >
                        <AddIcon className="icon-add" fill="#02092E" />
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
                        <StarIcon />
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
        </div>
      </div>

      {/* CTA footer (tik Add to cart / Not now single mode) */}
      {single && !ctaDismissed && (
        <div className="voice-products-footer">
          <div className="cta-buttons">
            <button className="btn-primary add-to-cart-btn" onClick={handleAddAllToCart}>
              Add to cart
            </button>
            <button className="btn-secondary cart-followup-btn" onClick={handleNotNow}>
              Follow up
            </button>
          </div>
        </div>
      )}

      {/* Follow up mygtukas – iškeltas už voice-products-wrap */}
      {(single && ctaDismissed) || !single ? (
        <button className="btn-primary followup-btn" onClick={onFollowUp}>
          Follow up
        </button>
      ) : null}
    </>
  );
}
