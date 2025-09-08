import "../styles/feedback-filled.css";

type Props = {
  onNewSearch: () => void;
};

export default function FeedbackFilledScreen({ onNewSearch }: Props) {
  return (
    <div className="feedback-filled-wrap">
      <div className="feedback-filled-col">
        <h1 className="feedback-filled-thankyou">Thank you!</h1>
        <h2 className="feedback-filled-title">We got your feedback</h2>
        <p className="feedback-filled-sub">What would you like to find next?</p>
      </div>

      {/* 👇 dock kaip inputui */}
      <div className="feedback-filled-dock">
        <button className="feedback-filled-btn" onClick={onNewSearch}>
          New search
        </button>
      </div>
    </div>
  );
}
