import { rgb } from "pdf-lib";
import { makeMathSquare } from "../generators/mathsquare";

const ORDER = ["easy", "medium", "hard", "expert"];
const SYM = { "+": "+", "-": "\u2212", "*": "\u00D7", "/": "\u00F7" };
const INK = rgb(0.08, 0.13, 0.24);
const BLACK = rgb(0, 0, 0);
const RED = rgb(0.75, 0, 0);

const TEXT = {
  en: {
    name: "Math Squares", bank: "Use these numbers:",
    levels: { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" },
    howto: ["1. Fill each empty box with a number", "    from the list.", "2. Every row and column must be a", "    true equation.", "3. Use each number once."],
  },
  ms: {
    name: "Petak Matematik", bank: "Gunakan nombor ini:",
    levels: { easy: "Mudah", medium: "Sederhana", hard: "Susah", expert: "Pakar" },
    howto: ["1. Isi setiap kotak kosong dengan nombor", "    dari senarai.", "2. Setiap baris dan lajur mesti jadi", "    persamaan yang betul.", "3. Guna setiap nombor sekali sahaja."],
  },
};

function drawBoard(ctx, page, p, gx, gy, size, solved) {
  const hb = ctx.fonts.hb;
  const cell = size / 5;
  const box = cell * 0.82;
  const cx = (c) => gx + c * cell + cell / 2;
  const cy = (r) => gy - r * cell - cell / 2;
  const put = (s, x, y, fs, color) => {
    const tw = hb.widthOfTextAtSize(s, fs);
    page.drawText(s, { x: x - tw / 2, y: y - fs * 0.35, size: fs, font: hb, color });
  };

  for (let i = 0; i < 9; i++) {
    const r = Math.floor(i / 3) * 2, c = (i % 3) * 2;
    page.drawRectangle({
      x: cx(c) - box / 2, y: cy(r) - box / 2, width: box, height: box,
      color: rgb(1, 1, 1), borderColor: INK, borderWidth: solved ? 1 : 2,
    });
    if (p.given[i] || solved) {
      put(String(p.N[i]), cx(c), cy(r), cell * (solved ? 0.4 : 0.46), p.given[i] ? BLACK : RED);
    }
  }
  for (let i = 0; i < 3; i++) {
    put(SYM[p.R[i]], cx(1), cy(i * 2), cell * 0.55, BLACK);
    put("=", cx(3), cy(i * 2), cell * 0.55, BLACK);
    put(SYM[p.V[i]], cx(i * 2), cy(1), cell * 0.55, BLACK);
    put("=", cx(i * 2), cy(3), cell * 0.55, BLACK);
  }
}

export const mathSquare = {
  name: (lang) => (TEXT[lang] || TEXT.en).name,
  howto: (s, lang) => (TEXT[lang] || TEXT.en).howto,
  generate(s) {
    const out = [];
    for (let i = 0; i < s.count; i++) {
      const lv = s.level === "mixed" ? ORDER[Math.min(3, Math.floor((i * 4) / s.count))] : s.level;
      out.push(makeMathSquare(lv));
    }
    return out;
  },
  drawPuzzle(ctx, page, p, n, x0, aw) {
    const { h, TOP, BOTTOM, fonts, L, lang, center } = ctx;
    const T = TEXT[lang] || TEXT.en;
    center(page, `${L.puzzle} ${n}`, h - TOP - 12, 18, fonts.hb, x0, aw);
    center(page, T.levels[p.level], h - TOP - 30, 11, fonts.reg, x0, aw);
    const size = Math.min(aw, h - TOP - BOTTOM - 130);
    const gx = x0 + (aw - size) / 2;
    const gy = h - TOP - 45;
    drawBoard(ctx, page, p, gx, gy, size, false);

    const by = gy - size - 28;
    page.drawText(T.bank, { x: gx, y: by, size: 12, font: fonts.hb });
    const bs = 34, gap = 8;
    const total = p.bank.length * bs + (p.bank.length - 1) * gap;
    let x = gx + Math.max(0, (size - total) / 2);
    p.bank.forEach((v) => {
      page.drawRectangle({
        x, y: by - 12 - bs, width: bs, height: bs,
        color: rgb(1, 1, 1), borderColor: INK, borderWidth: 1.5,
      });
      const s = String(v);
      const tw = fonts.hb.widthOfTextAtSize(s, 16);
      page.drawText(s, { x: x + (bs - tw) / 2, y: by - 12 - bs / 2 - 5.6, size: 16, font: fonts.hb, color: BLACK });
      x += bs + gap;
    });
  },
  drawAnswer(ctx, page, p, gx, gy, size) {
    drawBoard(ctx, page, p, gx, gy, size, true);
  },
};
