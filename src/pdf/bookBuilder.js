import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { TRIM } from "./trimSizes";
import { PUZZLES } from "../puzzles";

const COMMON = {
  en: { puzzle: "Puzzle", answers: "Solutions", part: "Part", subtitle: "Puzzle Activity Book", howTitle: "How to Play", owner: "This book belongs to:", rights: "All rights reserved." },
  ms: { puzzle: "Teka-teki", answers: "Jawapan", part: "Bahagian", subtitle: "Buku Aktiviti Teka-teki", howTitle: "Cara Bermain", owner: "Buku ini milik:", rights: "Hak cipta terpelihara." },
};

const gutterFor = (n) => (n <= 150 ? 27 : n <= 300 ? 36 : n <= 500 ? 45 : n <= 700 ? 54 : 63);
const OUTER = 36, TOP = 45, BOTTOM = 45;

export async function buildBook({ trim, title, author, lang, blankBack, sections }) {
  if (!sections.length) throw new Error("Add at least one section.");
  const L = COMMON[lang] || COMMON.en;
  const { w, h } = TRIM[trim];
  const pdf = await PDFDocument.create();
  const fonts = {
    reg: await pdf.embedFont(StandardFonts.Helvetica),
    hb: await pdf.embedFont(StandardFonts.HelveticaBold),
    mono: await pdf.embedFont(StandardFonts.CourierBold),
  };

  const parts = [];
  for (const s of sections) {
    const mod = PUZZLES[s.type];
    parts.push({ s, mod, name: mod.name(lang), puzzles: mod.generate(s) });
  }

  const specs = [{ type: "title" }, { type: "copyright" }, { type: "owner" }, { type: "blank" }];
  parts.forEach((pt, pi) => {
    if (specs.length % 2 === 1) specs.push({ type: "blank" });
    specs.push({ type: "divider", pt, pi }, { type: "blank" });
    pt.puzzles.forEach((p, i) => {
      specs.push({ type: "puzzle", pt, p, n: i + 1 });
      if (blankBack) specs.push({ type: "blank" });
    });
  });
  if (specs.length % 2 === 1) specs.push({ type: "blank" });
  specs.push({ type: "ansTitle" }, { type: "blank" });
  const PER = 6;
  parts.forEach((pt, pi) => {
    for (let i = 0; i < pt.puzzles.length; i += PER) {
      specs.push({ type: "answers", pt, pi, items: pt.puzzles.slice(i, i + PER).map((p, k) => ({ p, n: i + k + 1 })) });
    }
  });
  while (specs.length < 24 || specs.length % 2 === 1) specs.push({ type: "blank" });

  const gutter = gutterFor(specs.length);

  const center = (page, text, y, size, font, x0, aw) => {
    let s = size;
    const tw = font.widthOfTextAtSize(text, s);
    if (tw > aw * 0.92) s = (size * aw * 0.92) / tw;
    const tw2 = font.widthOfTextAtSize(text, s);
    page.drawText(text, { x: x0 + (aw - tw2) / 2, y, size: s, font });
  };

  const ctx = { w, h, TOP, BOTTOM, fonts, L, lang, center };

  specs.forEach((sp, idx) => {
    const page = pdf.addPage([w, h]);
    const pageNo = idx + 1;
    const x0 = pageNo % 2 === 1 ? gutter : OUTER;
    const aw = w - gutter - OUTER;
    const num = () => center(page, String(pageNo), 22, 9, fonts.reg, x0, aw);

    if (sp.type === "title") {
      center(page, title || "Puzzle Book", h / 2 + 30, 28, fonts.hb, x0, aw);
      center(page, L.subtitle, h / 2, 14, fonts.reg, x0, aw);
      if (author) center(page, author, h / 2 - 45, 14, fonts.reg, x0, aw);
    } else if (sp.type === "copyright") {
      center(page, `© ${new Date().getFullYear()} ${author || ""}`.trim(), h / 2 + 10, 11, fonts.reg, x0, aw);
      center(page, L.rights, h / 2 - 8, 11, fonts.reg, x0, aw);
    } else if (sp.type === "owner") {
      center(page, L.owner, h / 2 + 10, 18, fonts.reg, x0, aw);
      page.drawLine({ start: { x: x0 + 20, y: h / 2 - 20 }, end: { x: x0 + aw - 20, y: h / 2 - 20 }, thickness: 1, color: rgb(0, 0, 0) });
    } else if (sp.type === "divider") {
      center(page, `${L.part} ${sp.pi + 1}`, h / 2 + 70, 16, fonts.reg, x0, aw);
      center(page, sp.pt.name, h / 2 + 35, 30, fonts.hb, x0, aw);
      center(page, L.howTitle, h / 2 - 15, 14, fonts.hb, x0, aw);
      sp.pt.mod.howto(sp.pt.s, lang).forEach((line, i) => {
        page.drawText(line, { x: x0 + 10, y: h / 2 - 45 - i * 20, size: 12, font: fonts.reg });
      });
    } else if (sp.type === "puzzle") {
      sp.pt.mod.drawPuzzle(ctx, page, sp.p, sp.n, x0, aw);
      num();
    } else if (sp.type === "ansTitle") {
      center(page, L.answers, h / 2, 26, fonts.hb, x0, aw);
    } else if (sp.type === "answers") {
      center(page, `${L.part} ${sp.pi + 1} - ${sp.pt.name}`, h - TOP - 12, 15, fonts.hb, x0, aw);
      const top = h - TOP - 35;
      const rowH = (h - TOP - BOTTOM - 35) / 3;
      const gap = 14, colW = (aw - gap) / 2;
      sp.items.forEach((it, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const size = Math.min(colW, rowH - 24);
        const gx = x0 + col * (colW + gap) + (colW - size) / 2;
        const rowTop = top - row * rowH;
        page.drawText(`${L.puzzle} ${it.n}`, { x: gx, y: rowTop - 8, size: 9, font: fonts.reg });
        sp.pt.mod.drawAnswer(ctx, page, it.p, gx, rowTop - 14, size);
      });
      num();
    }
  });

  return pdf.save();
}
