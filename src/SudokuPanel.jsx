import { useState } from "react";
import { exportSudokuBook } from "./pdf/exportSudoku";

export default function SudokuPanel() {
  const [title, setTitle] = useState("Sudoku Puzzle Book");
  const [author, setAuthor] = useState("");
  const [trim, setTrim] = useState("6x9");
  const [count, setCount] = useState(50);
  const [level, setLevel] = useState("mixed");
  const [lang, setLang] = useState("en");
  const [blankBack, setBlankBack] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const generate = async () => {
    setBusy(true);
    setErr("");
    await new Promise((r) => setTimeout(r, 50));
    try {
      const bytes = await exportSudokuBook({
        trim, count: Number(count), level, title, author, blankBack, lang,
      });
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "sudoku.pdf";
      a.click();
    } catch (e) {
      setErr(e.message || "Something went wrong");
    }
    setBusy(false);
  };

  const box = { display: "block", width: "100%", padding: 8, marginBottom: 12, boxSizing: "border-box" };
  return (
    <div>
      <label>Book title</label>
      <input style={box} value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Author name</label>
      <input style={box} value={author} onChange={(e) => setAuthor(e.target.value)} />

      <label>Trim size</label>
      <select style={box} value={trim} onChange={(e) => setTrim(e.target.value)}>
        <option value="6x9">6 x 9 in</option>
        <option value="8.5x11">8.5 x 11 in</option>
      </select>

      <label>Difficulty</label>
      <select style={box} value={level} onChange={(e) => setLevel(e.target.value)}>
        <option value="mixed">Mixed (Easy to Expert)</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
        <option value="expert">Expert</option>
      </select>

      <label>Number of puzzles</label>
      <input style={box} type="number" min="1" max="200" value={count} onChange={(e) => setCount(e.target.value)} />

      <label>Book text language</label>
      <select style={box} value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="en">English</option>
        <option value="ms">Bahasa Malaysia</option>
      </select>

      <label>
        <input type="checkbox" checked={blankBack} onChange={(e) => setBlankBack(e.target.checked)} />
        {" "}Leave the back of each puzzle blank
      </label>
      <div style={{ height: 12 }} />

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <button onClick={generate} disabled={busy} style={{ padding: 12, width: "100%" }}>
        {busy ? "Generating (may take a few seconds)..." : "Generate PDF"}
      </button>
    </div>
  );
}
