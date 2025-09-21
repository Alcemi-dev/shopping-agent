// screens/ConnectionLostScreen.tsx
import type { FC } from "react";
import "../styles/connection-lost.css";
import { ConnectionLostIcon } from "../components/SvgIcons";

const ConnectionLostScreen: FC = () => {
  return (
    <section className="connection-lost-screen">
      <div className="cls-content">
        <div className="cls-icon">
          <ConnectionLostIcon />
        </div>

        <h2 className="cls-title">A-oh, we lost a connection :(</h2>
        <p className="cls-desc">Check your internet and try to refresh the page.</p>
      </div>
    </section>
  );
};

export default ConnectionLostScreen;
