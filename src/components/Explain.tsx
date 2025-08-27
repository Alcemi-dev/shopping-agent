import type { FC } from "react";
import "../styles/explain.css";

type Props = {
  onContinue: () => void;
};

const Explain: FC<Props> = ({ onContinue }) => {
  return (
    <section className="explain" aria-label="What the assistant can do">
      <ul className="explain-list" role="list">
        <li className="explain-item">
          <span className="explain-icon" aria-hidden="true">
            {/* headset / voice icon */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12a8 8 0 1 1 16 0v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.5" />
              <rect x="6" y="14" width="3.5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="14.5" y="14" width="3.5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <div className="explain-text">
            <h3 className="explain-subtitle">Speak with you</h3>
            <p className="explain-desc">Yes, volume up! Choose and have a voice conversation</p>
          </div>
        </li>

        <li className="explain-item">
          <span className="explain-icon" aria-hidden="true">
            {/* search wand icon */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path
                d="M12 6.5 12.5 5M8.5 8 7.8 7.2M14.5 8 15.2 7.2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div className="explain-text">
            <h3 className="explain-subtitle">Find perfect product</h3>
            <p className="explain-desc">
              Find the perfect match in the whole shop inventory based on your individual needs
            </p>
          </div>
        </li>

        <li className="explain-item">
          <span className="explain-icon" aria-hidden="true">
            {/* question icon */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 18h.01M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-.8.8-1.3 1.2-1.3 2.3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <div className="explain-text">
            <h3 className="explain-subtitle">Get information about anything</h3>
            <p className="explain-desc">
              Tracking your order? Product care information? We’ve got you covered on everything and anything.
            </p>
          </div>
        </li>
      </ul>

      <div className="explain-cta-wrap">
        <button type="button" className="explain-cta" onClick={onContinue}>
          Got it, let’s go!
        </button>
      </div>
    </section>
  );
};

export default Explain;
