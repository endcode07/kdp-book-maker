import { useState } from "react";
import { exportWordSearchBook } from "./pdf/exportPdf";
import { THEMES } from "./data/themes";
import { THEMES_EN as BASE_EN } from "./data/themesEn";
import { THEMES_MORE } from "./data/themesMore";
const THEMES_EN = { ...BASE_EN, ...THEMES_MORE };

const ALL_THEMES = {
  ...THEMES_EN,
  ...Object.fromEntries(
    Object.entries(THEMES).map(([k, t]) => [`ms_${k}`, { ...t, label: `${t.label} (Malay)`, lang: "ms" }])
  ),
};

export default function App() {
  const [title, setTitle] = useState("Animals Word Search Book");
  const [author, setAuthor] = useState("");
  const [trim, setTrim] = useState("6x9");
  const [count, setCount] = useState(24);
  const [level, setLevel] = useState("sederhana");
  const [lang, setLang] = useState("en");
  const [blankBack, setBlankBack] = useState(true);
  const [theme, setTheme] = useState("animals");
  const [words, setWords] = useState(ALL_THEMES.animals.words.join(", "));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onTheme = (k) => {
    setTheme(k);
    if (k === "custom") {
      setWords("");
    } else {
      setWords(ALL_THEMES[k].words.join(", "));
      setLang(ALL_THEMES[k].lang);
    }
  };

  const wordPool = words.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

  const generate = async () => {
    setBusy(true);
    setErr("");
    try {
      const bytes = await exportWordSearchBook({
        trim, count: Number(count), level, wordPool, title, author, blankBack, lang,
      });
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "wordsearch.pdf";
      a.click();
    } catch (e) {
      setErr(e.message || "Something went wrong");
    }
    setBusy(false);
  };

  const box = { display: "block", width: "100%", padding: 8, marginBottom: 12, boxSizing: "border-box" };
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 480, margin: "auto" }}>
      <h1>KDP Book Maker</h1>

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
        <option value="mudah">Easy (12x12 grid, across and down)</option>
        <option value="sederhana">Medium (15x15 grid, includes diagonals)</option>
        <option value="susah">Hard (15x15 grid, all directions)</option>
      </select>

      <label>Number of puzzles</label>
      <input style={box} type="number" min="1" max="100" value={count} onChange={(e) => setCount(e.target.value)} />

      <label>Book text language (titles, instructions)</label>
      <select style={box} value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="en">English</option>
        <option value="ms">Bahasa Malaysia</option>
      </select>

      <label>
        <input type="checkbox" checked={blankBack} onChange={(e) => setBlankBack(e.target.checked)} />
        {" "}Leave the back of each puzzle blank
      </label>
      <div style={{ height: 12 }} />

      <label>Word theme</label>
      <select style={box} value={theme} onChange={(e) => onTheme(e.target.value)}>
        {Object.entries(ALL_THEMES).sort((a, b) => a[1].label.localeCompare(b[1].label)).map(([k, t]) => (
          <option key={k} value={k}>{t.label}</option>
        ))}
        <option value="custom">Custom (type your own)</option>
      </select>

      <label>Word list ({wordPool.length} words, editable)</label>
      <textarea style={box} rows={6} value={words} onChange={(e) => setWords(e.target.value)} />

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <button onClick={generate} disabled={busy} style={{ padding: 12, width: "100%" }}>
        {busy ? "Generating..." : "Generate PDF"}
      </button>
    </div>
  );
}
