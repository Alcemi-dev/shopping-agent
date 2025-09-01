import Explain from "../components/Explain";

export default function ExplainScreen({ onContinue }: { onContinue: () => void }) {
  return <Explain onContinue={onContinue} />;
}
