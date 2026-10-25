import { useState } from "react";
import MixedPanel from "./MixedPanel";
import WordSearchPanel from "./WordSearchPanel";

export default function App() {
  const [tab, setTab] = useState("mixed");
  const tabStyle = (on) => ({
    flex: 1, padding: 10, border: "1px solid #888", cursor: "pointer",
    background: on ? "#222" : "#fff", color: on ? "#fff" : "#222",
  });
  const show = (t) => ({ display: tab === t ? "block" : "none" });
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 480, margin: "auto" }}>
      <h1>KDP Book Maker</h1>
      <div style={{ display: "flex", marginBottom: 16 }}>
        <button style={tabStyle(tab === "mixed")} onClick={() => setTab("mixed")}>Mixed / Sudoku</button>
        <button style={tabStyle(tab === "ws")} onClick={() => setTab("ws")}>Word Search</button>
      </div>
      <div style={show("mixed")}><MixedPanel /></div>
      <div style={show("ws")}><WordSearchPanel /></div>
    </div>
  );
}
