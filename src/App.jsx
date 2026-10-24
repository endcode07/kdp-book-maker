import { useState } from "react";
import { exportWordSearchBook } from "./pdf/exportPdf";

export default function App() {
  const [title, setTitle] = useState("Cari Kata Haiwan");
  const [trim, setTrim] = useState("6x9");
  const [pages, setPages] = useState(20);
  const [words, setWords] = useState(
    "KUCING,HARIMAU,GAJAH,SINGA,ZIRAFAH,MONYET,BURUNG,IKAN,KUDA,LEMBU,KAMBING,ARNAB,RUSA,BERUANG,SERIGALA"
  );
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    const wordPool = words.split(",").map((s) => s.trim()).filter(Boolean);
    const bytes = await exportWordSearchBook({
      trim, pages: Number(pages), wordsPerPuzzle: 10, wordPool, title,
    });
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url; a.download = "wordsearch.pdf"; a.click();
    setBusy(false);
  };

  const box = { display: "block", width: "100%", padding: 8, marginBottom: 12, boxSizing: "border-box" };
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 480, margin: "auto" }}>
      <h1>KDP Book Maker</h1>
      <label>Tajuk</label>
      <input style={box} value={title} onChange={(e) => setTitle(e.target.value)} />
      <label>Saiz</label>
      <select style={box} value={trim} onChange={(e) => setTrim(e.target.value)}>
        <option value="6x9">6 x 9 inci</option>
        <option value="8.5x11">8.5 x 11 inci</option>
      </select>
      <label>Jumlah puzzle</label>
      <input style={box} type="number" value={pages} onChange={(e) => setPages(e.target.value)} />
      <label>Senarai perkataan (asing dengan koma)</label>
      <textarea style={box} rows={5} value={words} onChange={(e) => setWords(e.target.value)} />
      <button onClick={generate} disabled={busy} style={{ padding: 12, width: "100%" }}>
        {busy ? "Tengah buat..." : "Generate PDF"}
      </button>
    </div>
  );
}
