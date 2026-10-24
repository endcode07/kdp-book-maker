import { useState } from "react";
import { exportWordSearchBook } from "./pdf/exportPdf";
import { THEMES } from "./data/themes";

export default function App() {
  const [title, setTitle] = useState("Buku Cari Kata Haiwan");
  const [author, setAuthor] = useState("");
  const [trim, setTrim] = useState("6x9");
  const [count, setCount] = useState(24);
  const [level, setLevel] = useState("sederhana");
  const [lang, setLang] = useState("ms");
  const [blankBack, setBlankBack] = useState(true);
  const [theme, setTheme] = useState("haiwan");
  const [words, setWords] = useState(THEMES.haiwan.words.join(", "));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onTheme = (k) => {
    setTheme(k);
    setWords(k === "custom" ? "" : THEMES[k].words.join(", "));
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
      setErr(e.message || "Ada masalah");
    }
    setBusy(false);
  };

  const box = { display: "block", width: "100%", padding: 8, marginBottom: 12, boxSizing: "border-box" };
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 480, margin: "auto" }}>
      <h1>KDP Book Maker</h1>

      <label>Tajuk</label>
      <input style={box} value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Nama penulis</label>
      <input style={box} value={author} onChange={(e) => setAuthor(e.target.value)} />

      <label>Saiz buku</label>
      <select style={box} value={trim} onChange={(e) => setTrim(e.target.value)}>
        <option value="6x9">6 x 9 inci</option>
        <option value="8.5x11">8.5 x 11 inci</option>
      </select>

      <label>Tahap</label>
      <select style={box} value={level} onChange={(e) => setLevel(e.target.value)}>
        <option value="mudah">Mudah (grid 12, ke kanan dan bawah)</option>
        <option value="sederhana">Sederhana (grid 15, termasuk serong)</option>
        <option value="susah">Susah (grid 15, semua arah)</option>
      </select>

      <label>Jumlah puzzle</label>
      <input style={box} type="number" min="1" max="100" value={count} onChange={(e) => setCount(e.target.value)} />

      <label>Bahasa label (tajuk puzzle, cara bermain)</label>
      <select style={box} value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="ms">Bahasa Malaysia</option>
        <option value="en">English</option>
      </select>

      <label>
        <input type="checkbox" checked={blankBack} onChange={(e) => setBlankBack(e.target.checked)} />
        {" "}Page belakang puzzle kosong
      </label>
      <div style={{ height: 12 }} />

      <label>Tema perkataan</label>
      <select style={box} value={theme} onChange={(e) => onTheme(e.target.value)}>
        {Object.entries(THEMES).map(([k, t]) => (
          <option key={k} value={k}>{t.label}</option>
        ))}
        <option value="custom">Tulis sendiri</option>
      </select>

      <label>Senarai perkataan ({wordPool.length}), boleh edit</label>
      <textarea style={box} rows={6} value={words} onChange={(e) => setWords(e.target.value)} />

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <button onClick={generate} disabled={busy} style={{ padding: 12, width: "100%" }}>
        {busy ? "Tengah buat..." : "Generate PDF"}
      </button>
    </div>
  );
}
