import { useEffect, useState } from "react";

export default function LoadingRail() {
  const frames: Array<[number, number, number, number, number]> = [
    [2, 1, 1, 1, 1],
    [3, 2, 1, 1, 1],
    [3, 3, 2, 1, 1],
    [3, 3, 3, 2, 1],
    [3, 3, 3, 3, 2],
    [3, 3, 3, 3, 3],
  ];
  const [f, setF] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setF((p) => (p + 1) % frames.length), 200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="loading-rail" aria-label="Loading" role="status">
      {frames[f].map((n, i) => (
        <span key={i} className={`dash dash--${n}`} />
      ))}
    </div>
  );
}
