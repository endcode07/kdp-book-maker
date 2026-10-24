import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { TRIM } from "./trimSizes";
import { makeWordSearch } from "../generators/wordsearch";

// gutter dalam point ikut jumlah page (0.375" - 0.875")
const gutterFor = (n) =>
  n <= 150 ? 27 : n <= 300 ? 36 : n <= 500 ? 45 : n <= 700 ? 54 : 63;

const OUTER = 36; // 0.5 inci
const TOP = 45;
const BOTTOM = 45;

export async function exportWordSearchBook({
  trim, pages, wordsPerPuzzle, wordPool, title, blankBack = true,
}) {
  const { w, h } = TRIM[trim];
  const pdf = await PDFDocument.create();
  const bold = await pdf.embedFont(StandardFonts.CourierBold);
  const reg = await pdf.embedFont(StandardFonts.Helvetica);

  // 1. Jana puzzle
  const puzzles = [];
  for (let i = 0; i < pages; i++) {
    const pool = [...wordPool].sort(() => Math.random() - 0.5).slice(0, wordsPerPuzzle);
    puzzles.push(makeWordSearch(pool, 15));
  }

  // 2. Susun senarai page (puzzle kat page ganjil = kanan)
  const specs = [{ type: "title" }, { type: "blank" }];
  puzzles.forEach((p, i) => {
    specs.push({ type: "puzzle", p, n: i + 1 });
    if (blankBack) specs.push({ type: "blank" });
  });
  if (specs.length % 2 === 1) specs.push({ type: "blank" });
  specs.push({ type: "ansTitle" }, { type: "blank" });
  puzzles.forEach((p, i) => specs.push({ type: "answer", p, n: i + 1 }));
  while (specs.length < 24 || specs.length % 2 === 1) specs.push({ type: "blank" });

  const total = specs.length;
  const gutter = gutterFor(total);

  const center = (page, text, y, size, font, x0, aw) => {
    const tw = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: x0 + (aw - tw) / 2, y, size, font });
  };

  const drawPuzzle = (page, p, label, showAnswer, x0, aw) => {
    center(page, label, h - TOP - 10, 18, reg, x0, aw);
    const wordsH = showAnswer ? 0 : 80;
    const gridSize = Math.min(aw, h - TOP - BOTTOM - 40 - wordsH);
    const cell = gridSize / p.size;
    const gx = x0 + (aw - gridSize) / 2;
    const gy = h - TOP - 40; // atas grid
    const fs = cell * 0.6;
    for (let r = 0; r < p.size; r++) {
      for (let c = 0; c < p.size; c++) {
        const ch = (showAnswer ? p.answer : p.grid)[r][c];
        if (!ch) continue;
        const tw = bold.widthOfTextAtSize(ch, fs);
        page.drawText(ch, {
          x: gx + c * cell + (cell - tw) / 2,
          y: gy - r * cell - cell / 2 - fs * 0.3,
          size: fs, font: bold,
          color: showAnswer ? rgb(0.75, 0, 0) : rgb(0, 0, 0),
        });
      }
    }
    if (!showAnswer) {
      const ws = p.placed.map((x) => x.word).join("   ");
      page.drawText(ws, {
        x: gx, y: gy - gridSize - 20, size: 10, font: reg,
        maxWidth: gridSize, lineHeight: 14,
      });
    }
  };

  // 3. Lukis
  specs.forEach((s, idx) => {
    const page = pdf.addPage([w, h]);
    const pageNo = idx + 1;
    const isRight = pageNo % 2 === 1;
    const x0 = isRight ? gutter : OUTER;
    const aw = w - gutter - OUTER;

    if (s.type === "title") {
      center(page, title || "Word Search", h / 2, 26, reg, x0, aw);
    } else if (s.type === "ansTitle") {
      center(page, "Jawapan", h / 2, 26, reg, x0, aw);
    } else if (s.type === "puzzle") {
      drawPuzzle(page, s.p, `Puzzle ${s.n}`, false, x0, aw);
      center(page, String(pageNo), 22, 9, reg, x0, aw);
    } else if (s.type === "answer") {
      drawPuzzle(page, s.p, `Jawapan ${s.n}`, true, x0, aw);
      center(page, String(pageNo), 22, 9, reg, x0, aw);
    }
  });

  return pdf.save();
}
