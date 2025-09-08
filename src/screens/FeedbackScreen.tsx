import { useState } from "react";
import "../styles/feedback.css";

type Props = {
  onSubmit: (rating: number, comment?: string) => void;
};

const icons = [
  { value: 1, label: "Terrible", file: "Terrible.svg" },
  { value: 2, label: "Bad", file: "Bad.svg" },
  { value: 3, label: "Neutral", file: "Neutral.svg" },
  { value: 4, label: "Good", file: "Good.svg" },
  { value: 5, label: "Great", file: "Great.svg" },
];

export default function FeedbackScreen({ onSubmit }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const handleSelect = (value: number) => {
    setRating(value);
    if (value > 3) setComment(""); // jei >3, input nereikalingas
  };

  const handleSubmit = () => {
    if (rating) {
      onSubmit(rating, comment.trim() || undefined);
    }
  };

  return (
    <div className="feedback-wrap">
      <h1 className="feedback-title">How was your search?</h1>

      <div className="feedback-icons">
        {icons.map((icon) => (
          <button
            key={icon.value}
            className={`feedback-icon ${rating === icon.value ? "selected" : ""}`}
            onClick={() => handleSelect(icon.value)}
          >
            <img src={`/img/${icon.file}`} alt={icon.label} />
            <span>{icon.label}</span>
          </button>
        ))}
      </div>

      {rating !== null && rating <= 3 && (
        <div className="feedback-input">
          <input
            id="feedback-comment"
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Have more thoughts?"
          />
        </div>
      )}

      {rating && (
        <button className="feedback-submit" onClick={handleSubmit}>
          Submit
        </button>
      )}
    </div>
  );
}
