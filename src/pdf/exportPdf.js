import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { TRIM } from "./trimSizes";
import { makeWordSearch, LEVELS } from "../generators/wordsearch";

const LABELS = {
  ms: {
    puzzle: "Teka-teki", answers: "Jawapan", subtitle: "Buku Cari Kata",
    howTitle: "Cara Bermain", owner: "Buku ini milik:", rights: "Hak cipta terpelihara.",
    howto: {
      mudah: ["1. Cari perkataan dalam senarai di bawah grid.", "2. Perkataan tersembunyi ke kanan dan ke bawah.", "3. Bulatkan setiap perkataan yang dijumpai.", "4. Semak jawapan di bahagian belakang buku."],
      sederhana: ["1. Cari perkataan dalam senarai di bawah grid.", "2. Perkataan tersembunyi ke kanan, bawah", "    dan serong.", "3. Bulatkan setiap perkataan yang dijumpai.", "4. Semak jawapan di bahagian belakang buku."],
      susah: ["1. Cari perkataan dalam senarai di bawah grid.", "2. Perkataan boleh tersembunyi ke semua arah,", "    termasuk terbalik.", "3. Bulatkan setiap perkataan yang dijumpai.", "4. Semak jawapan di bahagian belakang buku."],
    },
  },
  en: {
    puzzle: "Puzzle", answers: "Answers", subtitle: "Word Search Puzzle Book",
    howTitle: "How to Play", owner: "This book belongs to:", rights: "All rights reserved.",
    howto: {
      mudah: ["1. Find the words listed below each grid.", "2. Words go across and down.", "3. Circle each word you find.", "4. Check the answers at the back."],
      sederhana: ["1. Find the words listed below each grid.", "2. Words go across, down and diagonally.", "3. Circle each word you find.", "4. Check the answers at the back."],
      susah: ["1. Find the words listed below each grid.", "2. Words can go in any direction,", "    including backwards.", "3. Circle each word you find.", "4. Check the answers at the back."],
    },
  },
};

const gutterFor = (n) => (n <= 150 ? 27 : n <= 300 ? 36 : n <= 500 ? 45 : n <= 700 ? 54 : 63);
const OUTER = 36, TOP = 45, BOTTOM = 45;

const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

function makeDealer(pool) {
  let deck = [];
  return (n) => {
    const out = [];
    const want = Math.min(n, pool.length);
    let guard = 0;
    while (out.length < want && guard++ < 5000) {
      if (!deck.length) deck = shuffle(pool);
      const w = deck.pop();
      if (!out.includes(w)) out.push(w);
    }
    return out;
  };
}

export async function exportWordSearchBook({ trim, count, level, wordPool, title, author, blankBack, lang }) {
  const L = LABELS[lang] || LABELS.ms;
  const cfg = LEVELS[level];
  const { w, h } = TRIM[trim];

  const pool = [...new Set(
    wordPool.map((x) => x.toUpperCase().replace(/[^A-Z]/g, "")).filter((x) => x.length >= 3 && x.length <= cfg.size)
  )];
  if (pool.length < cfg.words) {
    throw new Error(`Not enough words. Need at least ${cfg.words} words (max ${cfg.size} letters each).`);
  }

  const pdf = await PDFDocument.create();
  const mono = await pdf.embedFont(StandardFonts.CourierBold);
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const hb = await pdf.embedFont(StandardFonts.HelveticaBold);

  const deal = makeDealer(pool);
  const puzzles = [];
  for (let i = 0; i < count; i++) puzzles.push(makeWordSearch(deal(cfg.words), level));

  const specs = [{ type: "title" }, { type: "copyright" }, { type: "howto" }, { type: "owner" }];
  puzzles.forEach((p, i) => {
    specs.push({ type: "puzzle", p, n: i + 1 });
    if (blankBack) specs.push({ type: "blank" });
  });
  if (specs.length % 2 === 1) specs.push({ type: "blank" });
  specs.push({ type: "ansTitle" }, { type: "blank" });
  const PER = 6;
  for (let i = 0; i < puzzles.length; i += PER) {
    specs.push({ type: "answers", items: puzzles.slice(i, i + PER).map((p, k) => ({ p, n: i + k + 1 })) });
  }
  while (specs.length < 24 || specs.length % 2 === 1) specs.push({ type: "blank" });

  const total = specs.length;
  const gutter = gutterFor(total);

  const center = (page, text, y, size, font, x0, aw) => {
    let s = size;
    const tw = font.widthOfTextAtSize(text, s);
    if (tw > aw * 0.92) s = (size * aw * 0.92) / tw;
    const tw2 = font.widthOfTextAtSize(text, s);
    page.drawText(text, { x: x0 + (aw - tw2) / 2, y, size: s, font });
  };

  const drawGrid = (page, p, gx, gy, size, answerMode, ratio) => {
    const cell = size / p.size;
    page.drawRectangle({
      x: gx, y: gy - size, width: size, height: size,
      color: rgb(1, 1, 1), borderColor: rgb(0.2, 0.2, 0.2),
      borderWidth: answerMode ? 0.5 : 1,
    });
    const lineColor = rgb(0.55, 0.55, 0.55);
    const lw = answerMode ? 0.4 : 0.5;
    for (let i = 1; i < p.size; i++) {
      page.drawLine({
        start: { x: gx + i * cell, y: gy }, end: { x: gx + i * cell, y: gy - size },
        thickness: lw, color: lineColor,
      });
      page.drawLine({
        start: { x: gx, y: gy - i * cell }, end: { x: gx + size, y: gy - i * cell },
        thickness: lw, color: lineColor,
      });
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
  };

  const drawPuzzle = (page, p, n, x0, aw) => {
    center(page, `${L.puzzle} ${n}`, h - TOP - 12, 18, hb, x0, aw);
    const wordsH = 90;
    const size = Math.min(aw, h - TOP - BOTTOM - 40 - wordsH);
    const gx = x0 + (aw - size) / 2;
    const gy = h - TOP - 35;
    drawGrid(page, p, gx, gy, size, false, 0.6);
    const ws = p.placed.map((x) => x.word).join("   ");
    page.drawText(ws, { x: gx, y: gy - size - 22, size: 12, font: reg, maxWidth: size, lineHeight: 17 });
  };

  const drawAnswers = (page, items, x0, aw) => {
    center(page, L.answers, h - TOP - 12, 16, hb, x0, aw);
    const top = h - TOP - 35;
    const areaH = h - TOP - BOTTOM - 35;
    const cols = 2, rows = 3, gap = 14;
    const colW = (aw - gap) / cols;
    const rowH = areaH / rows;
    items.forEach((it, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const size = Math.min(colW, rowH - 24);
      const gx = x0 + col * (colW + gap) + (colW - size) / 2;
      const rowTop = top - row * rowH;
      page.drawText(`${L.puzzle} ${it.n}`, { x: gx, y: rowTop - 8, size: 9, font: reg });
      drawGrid(page, it.p, gx, rowTop - 14, size, true, 0.7);
    });
  };

  specs.forEach((s, idx) => {
    const page = pdf.addPage([w, h]);
    const pageNo = idx + 1;
    const isRight = pageNo % 2 === 1;
    const x0 = isRight ? gutter : OUTER;
    const aw = w - gutter - OUTER;
    const num = () => center(page, String(pageNo), 22, 9, reg, x0, aw);

    if (s.type === "title") {
      center(page, title || "Word Search", h / 2 + 30, 28, hb, x0, aw);
      center(page, L.subtitle, h / 2, 14, reg, x0, aw);
      if (author) center(page, author, h / 2 - 45, 14, reg, x0, aw);
    } else if (s.type === "copyright") {
      center(page, `© ${new Date().getFullYear()} ${author || ""}`.trim(), h / 2 + 10, 11, reg, x0, aw);
      center(page, L.rights, h / 2 - 8, 11, reg, x0, aw);
    } else if (s.type === "howto") {
      center(page, L.howTitle, h - 120, 22, hb, x0, aw);
      L.howto[level].forEach((line, i) => {
        page.drawText(line, { x: x0, y: h - 175 - i * 24, size: 13, font: reg });
      });
    } else if (s.type === "owner") {
      center(page, L.owner, h / 2 + 10, 18, reg, x0, aw);
      page.drawLine({ start: { x: x0 + 20, y: h / 2 - 20 }, end: { x: x0 + aw - 20, y: h / 2 - 20 }, thickness: 1, color: rgb(0, 0, 0) });
    } else if (s.type === "puzzle") {
      drawPuzzle(page, s.p, s.n, x0, aw);
      num();
    } else if (s.type === "ansTitle") {
      center(page, L.answers, h / 2, 26, hb, x0, aw);
    } else if (s.type === "answers") {
      drawAnswers(page, s.items, x0, aw);
      num();
    }
  });

  return pdf.save();
}
