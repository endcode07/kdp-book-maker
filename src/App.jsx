import { useState } from "react";
import WordSearchPanel from "./WordSearchPanel";
import SudokuPanel from "./SudokuPanel";

export default function App() {
  const [tab, setTab] = useState("ws");
  const tabStyle = (on) => ({
    flex: 1, padding: 10, border: "1px solid #888", cursor: "pointer",
    background: on ? "#222" : "#fff", color: on ? "#fff" : "#222",
  });
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 480, margin: "auto" }}>
      <h1>KDP Book Maker</h1>
      <div style={{ display: "flex", marginBottom: 16 }}>
        <button style={tabStyle(tab === "ws")} onClick={() => setTab("ws")}>Word Search</button>
        <button style={tabStyle(tab === "su")} onClick={() => setTab("su")}>Sudoku</button>
      </div>
      <div style={{ display: tab === "ws" ? "block" : "none" }}><WordSearchPanel /></div>
      <div style={{ display: tab === "su" ? "block" : "none" }}><SudokuPanel /></div>
    </div>
  );
}
