import "../styles/loading.css";

export function LoadingProducts() {
  return (
    <div className="loading-cards">
      {/* kortelės */}
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className={`loading-wrapper loading-wrapper-${i + 1}`} style={{ animationDelay: `${i * 0.15}s` }}>
          <img src="/img/loading-product-card.svg" alt="Loading product" className="loading-card" />
        </div>
      ))}

      {/* overlay ir tekstas */}
      <div className="loading-overlay" />
      <p className="loading-text">Finding best products for you</p>
    </div>
  );
}
