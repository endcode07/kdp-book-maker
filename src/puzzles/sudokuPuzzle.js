import { rgb } from "pdf-lib";
import { makeSudoku } from "../generators/sudoku";

const ORDER = ["easy", "medium", "hard", "expert"];

const TEXT = {
  en: {
    name: "Sudoku",
    levels: { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" },
    howto: ["1. Fill every empty square with 1 to 9.", "2. Each row, column and 3x3 box", "    must contain 1-9 once."],
  },
  ms: {
    name: "Sudoku",
    levels: { easy: "Mudah", medium: "Sederhana", hard: "Susah", expert: "Pakar" },
    howto: ["1. Isi setiap petak kosong dengan 1 hingga 9.", "2. Setiap baris, lajur dan kotak 3x3", "    mesti ada 1-9 sekali sahaja."],
  },
};

function drawBoard(ctx, page, p, gx, gy, size, solved) {
  const { reg, hb } = ctx.fonts;
  const cell = size / 9;
  page.drawRectangle({ x: gx, y: gy - size, width: size, height: size, color: rgb(1, 1, 1) });
  for (let i = 0; i <= 9; i++) {
    const thick = i % 3 === 0;
    const t = thick ? (solved ? 1 : 2) : (solved ? 0.3 : 0.6);
    const col = thick ? rgb(0, 0, 0) : rgb(0.5, 0.5, 0.5);
    page.drawLine({ start: { x: gx + i * cell, y: gy }, end: { x: gx + i * cell, y: gy - size }, thickness: t, color: col });
    page.drawLine({ start: { x: gx, y: gy - i * cell }, end: { x: gx + size, y: gy - i * cell }, thickness: t, color: col });
  }
  const fs = cell * 0.62;
  for (let i = 0; i < 81; i++) {
    const given = p.puzzle[i];
    const v = solved ? p.solution[i] : given;
    if (!v) continue;
    const r = (i / 9) | 0, c = i % 9;
    const font = given ? hb : reg;
    const ch = String(v);
    const tw = font.widthOfTextAtSize(ch, fs);
    page.drawText(ch, {
      x: gx + c * cell + (cell - tw) / 2,
      y: gy - r * cell - cell / 2 - fs * 0.35,
      size: fs, font,
      color: solved && !given ? rgb(0.75, 0, 0) : rgb(0, 0, 0),
    });
  }
}

export const sudoku = {
  name: (lang) => (TEXT[lang] || TEXT.en).name,
  howto: (s, lang) => (TEXT[lang] || TEXT.en).howto,
  generate(s) {
    const out = [];
    for (let i = 0; i < s.count; i++) {
      const lv = s.level === "mixed" ? ORDER[Math.min(3, Math.floor((i * 4) / s.count))] : s.level;
      out.push({ ...makeSudoku(lv), level: lv });
    }
    return out;
  },
  drawPuzzle(ctx, page, p, n, x0, aw) {
    const { h, TOP, BOTTOM, fonts, L, lang, center } = ctx;
    center(page, `${L.puzzle} ${n}`, h - TOP - 12, 18, fonts.hb, x0, aw);
    center(page, (TEXT[lang] || TEXT.en).levels[p.level], h - TOP - 30, 11, fonts.reg, x0, aw);
    const size = Math.min(aw, h - TOP - BOTTOM - 70);
    drawBoard(ctx, page, p, x0 + (aw - size) / 2, h - TOP - 45, size, false);
  },
  drawAnswer(ctx, page, p, gx, gy, size) {
    drawBoard(ctx, page, p, gx, gy, size, true);
  },
};
