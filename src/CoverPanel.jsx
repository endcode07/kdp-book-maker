import { useState } from "react";
import { buildCover, coverSpec, COLORS } from "./pdf/coverBuilder";

const box = { display: "block", width: "100%", padding: 8, marginBottom: 10, boxSizing: "border-box" };

export default function CoverPanel({ pages, setPages }) {
  const [trim, setTrim] = useState("6x9");
  const [paper, setPaper] = useState("white");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");
  const [blurb, setBlurb] = useState("");
  const [color, setColor] = useState("navy");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const n = Math.max(24, Number(pages) || 24);
  const sp = coverSpec(trim, n, paper);
  const inch = (pt) => (pt / 72).toFixed(3);
  const px = (pt) => Math.round((pt / 72) * 300);

  const download = async (guides) => {
    setErr("");
    if (!guides && !title.trim()) { setErr("Enter a title first."); return; }
    setBusy(true);
    try {
      const bytes = await buildCover({ trim, pages: n, paper, title, subtitle, author, blurb, color, guides });
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = guides ? "cover-template-guides.pdf" : "cover.pdf";
      a.click();
    } catch (e) {
      setErr(e.message || "Something went wrong");
    }
    setBusy(false);
  };

  return (
    <div>
      <label>Trim size (must match the interior)</label>
      <select style={box} value={trim} onChange={(e) => setTrim(e.target.value)}>
        <option value="6x9">6 x 9 in</option>
        <option value="8.5x11">8.5 x 11 in</option>
      </select>

      <label>Final page count (auto-filled from the Interior tab)</label>
      <input style={box} type="number" min="24" value={pages} onChange={(e) => setPages(e.target.value)} />

      <label>Paper type (must match what you pick on KDP)</label>
      <select style={box} value={paper} onChange={(e) => setPaper(e.target.value)}>
        <option value="white">Black ink, white paper</option>
        <option value="cream">Black ink, cream paper</option>
        <option value="color">Color interior</option>
      </select>

      <div style={{ border: "1px solid #999", borderRadius: 6, padding: 10, marginBottom: 12, background: "#f6f6f6", color: "#222" }}>
        <div>Spine width: <strong>{inch(sp.spine)} in</strong></div>
        <div>Full cover: <strong>{inch(sp.totalW)} x {inch(sp.totalH)} in</strong></div>
        <div>At 300 dpi: {px(sp.totalW)} x {px(sp.totalH)} px</div>
        <div style={{ marginTop: 4, color: n >= 80 ? "#166534" : "#b45309" }}>
          {n >= 80 ? "Spine text will be added." : "Under 80 pages: no spine text (too thin)."}
        </div>
      </div>

      <label>Title</label>
      <input style={box} value={title} onChange={(e) => setTitle(e.target.value)} />
      <label>Subtitle (optional)</label>
      <input style={box} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      <label>Author</label>
      <input style={box} value={author} onChange={(e) => setAuthor(e.target.value)} />
      <label>Back cover text (optional)</label>
      <textarea style={box} rows={4} value={blurb} onChange={(e) => setBlurb(e.target.value)} />
      <label>Color</label>
      <select style={box} value={color} onChange={(e) => setColor(e.target.value)}>
        {Object.keys(COLORS).map((k) => <option key={k} value={k}>{k}</option>)}
      </select>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <button onClick={() => download(false)} disabled={busy} style={{ padding: 12, width: "100%", marginBottom: 8 }}>
        {busy ? "Working..." : "Download cover (ready to upload)"}
      </button>
      <button onClick={() => download(true)} disabled={busy} style={{ padding: 12, width: "100%" }}>
        Download template with guides (for designing only)
      </button>
    </div>
  );
}
