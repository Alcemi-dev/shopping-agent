import Chips from "../components/Chips";

type Props = {
  items: string[];
  onPick: (val: string) => void;
};

export default function CategoryScreen({ items, onPick }: Props) {
  return (
    <>
      <p className="subquestion">What kind of information are you looking for?</p>
      <div className="chips-block">
        <Chips items={items} onPick={onPick} />
      </div>
    </>
  );
}
