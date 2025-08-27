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
            <img src="/img/speak-icon.svg" alt="" />
          </span>
          <div className="explain-text">
            <h3 className="explain-subtitle">Speak with you</h3>
            <p className="explain-desc">Yes, volume up! Choose and have a voice conversation</p>
          </div>
        </li>

        <li className="explain-item">
          <span className="explain-icon" aria-hidden="true">
            <img src="/img/find-icon.svg" alt="" />
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
            <img src="/img/get-info-icon.svg" alt="" />
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
