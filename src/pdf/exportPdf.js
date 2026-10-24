import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { TRIM } from "./trimSizes";
import { makeWordSearch } from "../generators/wordsearch";

export async function exportWordSearchBook({ trim, pages, wordsPerPuzzle, wordPool, title }) {
  const { w, h } = TRIM[trim];
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.CourierBold);
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const puzzles = [];

  const drawPuzzle = (page, p, number, showAnswer) => {
    const margin = 54;
    page.drawText(`Puzzle ${number}${showAnswer ? " - Jawapan" : ""}`, {
      x: margin, y: h - 60, size: 20, font: reg,
    });
    const gridW = w - margin * 2;
    const cell = gridW / p.size;
    const top = h - 100;
    for (let r = 0; r < p.size; r++) {
      for (let c = 0; c < p.size; c++) {
        const ch = (showAnswer ? p.answer : p.grid)[r][c];
        if (ch === "") continue;
        page.drawText(ch, {
          x: margin + c * cell + cell / 2 - 5,
          y: top - r * cell - cell / 2,
          size: cell * 0.55, font,
          color: showAnswer ? rgb(0.8, 0, 0) : rgb(0, 0, 0),
        });
      }
    }
    if (!showAnswer) {
      const ws = p.placed.map((x) => x.word).join("  ");
      page.drawText(ws, {
        x: margin, y: top - p.size * cell - 30, size: 11, font: reg,
        maxWidth: gridW, lineHeight: 15,
      });
    }
  };

  const cover = pdf.addPage([w, h]);
  cover.drawText(title || "Word Search", { x: 54, y: h / 2, size: 28, font: reg });

  for (let i = 0; i < pages; i++) {
    const pool = [...wordPool].sort(() => Math.random() - 0.5).slice(0, wordsPerPuzzle);
    const p = makeWordSearch(pool, 15);
    puzzles.push(p);
    drawPuzzle(pdf.addPage([w, h]), p, i + 1, false);
  }
  const ansTitle = pdf.addPage([w, h]);
  ansTitle.drawText("Jawapan", { x: 54, y: h / 2, size: 28, font: reg });
  puzzles.forEach((p, i) => drawPuzzle(pdf.addPage([w, h]), p, i + 1, true));

  return pdf.save();
}
