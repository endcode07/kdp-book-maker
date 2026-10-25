import { rgb, LineCapStyle } from "pdf-lib";
import { makeMaze, MAZE_LEVELS } from "../generators/maze";

const ORDER = ["easy", "medium", "hard", "expert"];

const TEXT = {
  en: {
    name: "Maze", start: "START", end: "END",
    levels: { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" },
    howto: ["1. Start at the opening on the top left.", "2. Find the path to the exit on the bottom right.", "3. You cannot cross the walls."],
  },
  ms: {
    name: "Labirin", start: "MULA", end: "TAMAT",
    levels: { easy: "Mudah", medium: "Sederhana", hard: "Susah", expert: "Pakar" },
    howto: ["1. Mula di bukaan kiri atas.", "2. Cari jalan ke pintu keluar kanan bawah.", "3. Jangan melintasi dinding."],
  },
};

function drawMaze(page, p, gx, gy, size, solved) {
  const n = p.n;
  const cell = size / n;
  const t = solved ? Math.max(0.4, Math.min(0.9, cell * 0.1)) : Math.max(1, Math.min(2.2, cell * 0.16));
  const black = rgb(0, 0, 0);
  const seg = (x1, y1, x2, y2) =>
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: t, color: black, lineCap: LineCapStyle.Projecting });

  seg(gx + cell, gy, gx + size, gy);
  seg(gx, gy, gx, gy - size);
  seg(gx + size, gy, gx + size, gy - size);
  seg(gx, gy - size, gx + size - cell, gy - size);

  for (let r = 0; r < n - 1; r++) {
    let c = 0;
    while (c < n) {
      if (!p.wallD[r][c]) { c++; continue; }
      let c2 = c;
      while (c2 < n && p.wallD[r][c2]) c2++;
      seg(gx + c * cell, gy - (r + 1) * cell, gx + c2 * cell, gy - (r + 1) * cell);
      c = c2;
    }
  }
  for (let c = 0; c < n - 1; c++) {
    let r = 0;
    while (r < n) {
      if (!p.wallR[r][c]) { r++; continue; }
      let r2 = r;
      while (r2 < n && p.wallR[r2][c]) r2++;
      seg(gx + (c + 1) * cell, gy - r * cell, gx + (c + 1) * cell, gy - r2 * cell);
      r = r2;
    }
  }

  if (solved) {
    const pts = [[gx + cell / 2, gy]];
    p.path.forEach(([r, c]) => pts.push([gx + c * cell + cell / 2, gy - r * cell - cell / 2]));
    pts.push([gx + (n - 1) * cell + cell / 2, gy - size]);
    const pt = Math.max(0.8, Math.min(3, cell * 0.28));
    for (let i = 1; i < pts.length; i++) {
      page.drawLine({
        start: { x: pts[i - 1][0], y: pts[i - 1][1] },
        end: { x: pts[i][0], y: pts[i][1] },
        thickness: pt, color: rgb(0.85, 0, 0), lineCap: LineCapStyle.Round,
      });
    }
  }
}

export const maze = {
  name: (lang) => (TEXT[lang] || TEXT.en).name,
  howto: (s, lang) => (TEXT[lang] || TEXT.en).howto,
  generate(s) {
    const out = [];
    for (let i = 0; i < s.count; i++) {
      const lv = s.level === "mixed" ? ORDER[Math.min(3, Math.floor((i * 4) / s.count))] : s.level;
      out.push({ ...makeMaze(MAZE_LEVELS[lv].n), level: lv });
    }
    return out;
  },
  drawPuzzle(ctx, page, p, n, x0, aw) {
    const { h, TOP, BOTTOM, fonts, L, lang, center } = ctx;
    const T = TEXT[lang] || TEXT.en;
    center(page, `${L.puzzle} ${n}`, h - TOP - 12, 18, fonts.hb, x0, aw);
    center(page, T.levels[p.level], h - TOP - 30, 11, fonts.reg, x0, aw);
    const size = Math.min(aw, h - TOP - BOTTOM - 80);
    const gx = x0 + (aw - size) / 2;
    const gy = h - TOP - 50;
    drawMaze(page, p, gx, gy, size, false);
    page.drawText(T.start, { x: gx, y: gy + 6, size: 9, font: fonts.hb });
    const ew = fonts.hb.widthOfTextAtSize(T.end, 9);
    page.drawText(T.end, { x: gx + size - ew, y: gy - size - 14, size: 9, font: fonts.hb });
  },
  drawAnswer(ctx, page, p, gx, gy, size) {
    drawMaze(page, p, gx, gy, size, true);
  },
};
