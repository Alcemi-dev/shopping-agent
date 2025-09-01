import Chips from "../components/Chips";

type Props = {
  items: string[];
  onPick: (val: string) => void;
};

export default function ChipsScreen({ items, onPick }: Props) {
  return (
    <div className="suggestions">
      <Chips items={items} onPick={onPick} />
    </div>
  );
}
