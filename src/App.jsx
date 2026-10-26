import { useState } from "react";
import MixedPanel from "./MixedPanel";
import CoverPanel from "./CoverPanel";

export default function App() {
  const [tab, setTab] = useState("book");
  const [pages, setPages] = useState(24);
  const tabStyle = (on) => ({
    flex: 1, padding: 10, border: "1px solid #888", cursor: "pointer",
    background: on ? "#222" : "#fff", color: on ? "#fff" : "#222",
  });
  const show = (t) => ({ display: tab === t ? "block" : "none" });
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 480, margin: "auto" }}>
      <h1>KDP Book Maker</h1>
      <div style={{ display: "flex", marginBottom: 16 }}>
        <button style={tabStyle(tab === "book")} onClick={() => setTab("book")}>Interior</button>
        <button style={tabStyle(tab === "cover")} onClick={() => setTab("cover")}>Cover</button>
      </div>
      <div style={show("book")}><MixedPanel onPages={setPages} /></div>
      <div style={show("cover")}><CoverPanel pages={pages} setPages={setPages} /></div>
    </div>
  );
}
