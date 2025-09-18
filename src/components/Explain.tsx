import type { FC } from "react";
import "../styles/explain.css";
import CtaButton from "./CtaButton";

type Props = {
  onContinue: () => void;
};

const Explain: FC<Props> = ({ onContinue }) => {
  return (
    <section className="explain" aria-label="What the assistant can do">
      <ul className="explain-list" role="list">
        <li className="explain-item">
          <img
            src="/img/find-icon.svg"
            alt=""
            className="explain-icon"
            aria-hidden="true"
          />
          <div className="explain-text">
            <h3 className="explain-subtitle">Find Perfect Product</h3>
            <p className="explain-desc">
              Explain what you're looking for just like you would to a store
              assistant
            </p>
          </div>
        </li>
        <li className="explain-item">
          <img
            src="/img/speak-icon.svg"
            alt=""
            className="explain-icon"
            aria-hidden="true"
          />
          <div className="explain-text">
            <h3 className="explain-subtitle">Voice Chat</h3>
            <p className="explain-desc">
              Choose voice mode and have a natural back-and-forth conversation
            </p>
          </div>
        </li>

        <li className="explain-item">
          <img
            src="/img/get-info-icon.svg"
            alt=""
            className="explain-icon"
            aria-hidden="true"
          />
          <div className="explain-text">
            <h3 className="explain-subtitle">Get Instant Answers</h3>
            <p className="explain-desc">
              Fast help with anything from tracking your order to receiving a
              consultation
            </p>
          </div>
        </li>
      </ul>

      {/* <div className="explain-cta-wrap"> */}
      <CtaButton onClick={onContinue}>Get started</CtaButton>
      {/* </div> */}
    </section>
  );
};

export default Explain;
