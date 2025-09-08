type Props = { onOpen: () => void };

export default function AiButton({ onOpen }: Props) {
  return (
    <button className="ai-fab" onClick={onOpen} aria-haspopup="dialog" aria-controls="ai-modal">
      <span className="ai-fab__label">Quick search</span>
      <span className="ai-fab__icon" aria-hidden>
        <img src="/img/search-icon.svg" alt="" />
      </span>
    </button>
  );
}
