import type { Msg } from "../types";
import { GeneratingAnswerIcon } from "./SvgIcons";

type Props = {
  m: Msg;
  onRetry?: () => void;
};

export default function VoiceMessageRenderer({ m, onRetry }: Props) {
  // USER text
  if (m.role === "user" && m.kind === "text") {
    return (
      <div data-msg-id={m.id} className="vc-msg vc-msg--user">
        <div className="vc-bubble vc-bubble--user">{m.text}</div>
      </div>
    );
  }

  // ASSISTANT text
  if (m.role === "assistant" && m.kind === "text") {
    return (
      <div data-msg-id={m.id} className="vc-msg vc-msg--ai">
        <div className="vc-bubble vc-bubble--ai">{m.text}</div>
      </div>
    );
  }

  // ASSISTANT generating
  if (m.role === "assistant" && m.kind === "generating") {
    return (
      <div data-msg-id={m.id} className="vc-msg vc-msg--generating">
        <GeneratingAnswerIcon className="vc-generating-icon" />
        <p className="vc-generating-text">Generating answer…</p>
      </div>
    );
  }

  // ASSISTANT error
  if (m.role === "assistant" && m.kind === "error") {
    return (
      <div data-msg-id={m.id} className="vc-msg vc-msg--error">
        <div className="vc-bubble vc-bubble--error">
          <p>{m.text}</p>
          {onRetry && (
            <button className="vc-retry" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
