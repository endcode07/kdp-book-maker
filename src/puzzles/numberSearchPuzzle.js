import { rgb } from "pdf-lib";
import { makeNumberSearch } from "../generators/numbersearch";

const ORDER = ["easy", "medium", "hard", "expert"];

const TEXT = {
  en: {
    name: "Number Search",
    levels: { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" },
    howto: {
      easy: ["1. Find the numbers listed below each grid.", "2. Numbers go across and down.", "3. Circle each number you find."],
      medium: ["1. Find the numbers listed below each grid.", "2. Numbers go across, down and diagonally.", "3. Circle each number you find."],
      hard: ["1. Find the numbers listed below each grid.", "2. Numbers can go in any direction,", "    including backwards.", "3. Circle each number you find."],
      mixed: ["1. Find the numbers listed below each grid.", "2. Numbers go across, down and diagonally.", "    Harder puzzles can go backwards too.", "3. Circle each number you find."],
    },
  },
  ms: {
    name: "Cari Nombor",
    levels: { easy: "Mudah", medium: "Sederhana", hard: "Susah", expert: "Pakar" },
    howto: {
      easy: ["1. Cari nombor dalam senarai di bawah grid.", "2. Nombor tersembunyi ke kanan dan ke bawah.", "3. Bulatkan setiap nombor yang dijumpai."],
      medium: ["1. Cari nombor dalam senarai di bawah grid.", "2. Nombor tersembunyi ke kanan, bawah", "    dan serong.", "3. Bulatkan setiap nombor yang dijumpai."],
      hard: ["1. Cari nombor dalam senarai di bawah grid.", "2. Nombor boleh tersembunyi ke semua arah,", "    termasuk terbalik.", "3. Bulatkan setiap nombor yang dijumpai."],
      mixed: ["1. Cari nombor dalam senarai di bawah grid.", "2. Nombor tersembunyi ke kanan, bawah dan", "    serong. Tahap susah boleh terbalik.", "3. Bulatkan setiap nombor yang dijumpai."],
    },
  },
};

function drawGrid(ctx, page, p, gx, gy, size, answerMode, ratio) {
  const mono = ctx.fonts.mono;
  const cell = size / p.size;
  page.drawRectangle({
    x: gx, y: gy - size, width: size, height: size,
    color: rgb(1, 1, 1), borderColor: rgb(0.2, 0.2, 0.2),
    borderWidth: answerMode ? 0.5 : 1,
  });
  const lineColor = rgb(0.55, 0.55, 0.55);
  const lw = answerMode ? 0.4 : 0.5;
  for (let i = 1; i < p.size; i++) {
    page.drawLine({ start: { x: gx + i * cell, y: gy }, end: { x: gx + i * cell, y: gy - size }, thickness: lw, color: lineColor });
    page.drawLine({ start: { x: gx, y: gy - i * cell }, end: { x: gx + size, y: gy - i * cell }, thickness: lw, color: lineColor });
  }
  const fs = cell * ratio;
  for (let r = 0; r < p.size; r++) {
    for (let c = 0; c < p.size; c++) {
      const ch = (answerMode ? p.answer : p.grid)[r][c];
      if (!ch) continue;
      const tw = mono.widthOfTextAtSize(ch, fs);
      page.drawText(ch, {
        x: gx + c * cell + (cell - tw) / 2,
        y: gy - r * cell - cell / 2 - fs * 0.3,
        size: fs, font: mono,
        color: answerMode ? rgb(0.75, 0, 0) : rgb(0, 0, 0),
      });
    }
  }
}

export const numberSearch = {
  name: (lang) => (TEXT[lang] || TEXT.en).name,
  howto: (s, lang) => {
    const h = (TEXT[lang] || TEXT.en).howto;
    return h[s.level] || h.hard;
  },
  generate(s) {
    const out = [];
    for (let i = 0; i < s.count; i++) {
      const lv = s.level === "mixed" ? ORDER[Math.min(3, Math.floor((i * 4) / s.count))] : s.level;
      out.push(makeNumberSearch(lv));
    }
    return out;
  },
  drawPuzzle(ctx, page, p, n, x0, aw) {
    const { h, TOP, BOTTOM, fonts, L, lang, center } = ctx;
    const T = TEXT[lang] || TEXT.en;
    center(page, `${L.puzzle} ${n}`, h - TOP - 12, 18, fonts.hb, x0, aw);
    center(page, T.levels[p.level], h - TOP - 30, 11, fonts.reg, x0, aw);
    const size = Math.min(aw, h - TOP - BOTTOM - 140);
    const gx = x0 + (aw - size) / 2;
    const gy = h - TOP - 45;
    drawGrid(ctx, page, p, gx, gy, size, false, 0.6);
    const list = p.placed.join("   ");
    page.drawText(list, { x: gx, y: gy - size - 22, size: 12, font: fonts.reg, maxWidth: size, lineHeight: 17 });
  },
  drawAnswer(ctx, page, p, gx, gy, size) {
    drawGrid(ctx, page, p, gx, gy, size, true, 0.7);
  },
};
