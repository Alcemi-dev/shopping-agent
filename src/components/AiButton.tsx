type Props = {
  onOpen: () => void;
  hasUnread?: boolean;
};

export default function AiButton({ onOpen, hasUnread }: Props) {
  return (
    <button className="ai-fab" onClick={onOpen} aria-haspopup="dialog" aria-controls="ai-modal">
      <span className="ai-fab__label">Quick search</span>
      <span className="ai-fab__icon" aria-hidden>
        <img src="img/search-icon.svg" alt="" />
        {hasUnread && <span className="notif-dot" />}
      </span>
    </button>
  );
}
