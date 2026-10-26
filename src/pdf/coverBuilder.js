import { PDFDocument, rgb, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { TRIM } from "./trimSizes";
import { loadFonts } from "./fonts";

export const PAPER = { white: 0.002252, cream: 0.0025, color: 0.002347 };
export const COLORS = {
  navy: { bg: [0.12, 0.23, 0.37], fg: [1, 1, 1] },
  forest: { bg: [0.18, 0.37, 0.31], fg: [1, 1, 1] },
  burgundy: { bg: [0.48, 0.18, 0.23], fg: [1, 1, 1] },
  charcoal: { bg: [0.2, 0.2, 0.2], fg: [1, 1, 1] },
  sunny: { bg: [0.95, 0.72, 0.02], fg: [0.1, 0.1, 0.1] },
  sky: { bg: [0.35, 0.66, 0.9], fg: [0.05, 0.1, 0.2] },
};
const BLEED = 9;
const SAFE = 18;

export function coverSpec(trim, pages, paper) {
  const { w, h } = TRIM[trim];
  const spine = pages * PAPER[paper] * 72;
  return { w, h, spine, totalW: BLEED * 2 + w * 2 + spine, totalH: BLEED * 2 + h };
}

function wrap(text, font, size, maxW) {
  const lines = [];
  for (const para of String(text).split("\n")) {
    let cur = "";
    for (const word of para.split(" ")) {
      const t = cur ? cur + " " + word : word;
      if (font.widthOfTextAtSize(t, size) > maxW && cur) { lines.push(cur); cur = word; } else cur = t;
    }
    lines.push(cur);
  }
  return lines;
}

export async function buildCover(o) {
  const { w, h, spine, totalW, totalH } = coverSpec(o.trim, o.pages, o.paper);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const F = await loadFonts();
  const reg = await pdf.embedFont(F.reg, { subset: true });
  const bold = await pdf.embedFont(F.bold, { subset: true });
  const page = pdf.addPage([totalW, totalH]);

  const backX = BLEED, spineX = BLEED + w, frontX = BLEED + w + spine, base = BLEED;
  const bcW = 144, bcH = 86.4;
  const bcX = backX + w - SAFE - bcW, bcY = base + SAFE;
  const ctr = (text, cx, y, size, font, color) => {
    const tw = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: cx - tw / 2, y, size, font, color });
  };

  if (o.guides) {
    const red = rgb(0.85, 0.1, 0.1), blue = rgb(0.1, 0.3, 0.9), green = rgb(0.1, 0.6, 0.2), gray = rgb(0.45, 0.45, 0.45);
    const ln = (x1, y1, x2, y2, color, dash) =>
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 0.8, color, dashArray: dash });
    const box = (x, y, bw, bh, color, dash) => {
      ln(x, y, x + bw, y, color, dash); ln(x + bw, y, x + bw, y + bh, color, dash);
      ln(x + bw, y + bh, x, y + bh, color, dash); ln(x, y + bh, x, y, color, dash);
    };
    box(BLEED, base, totalW - 2 * BLEED, h, red);
    ln(spineX, 0, spineX, totalH, blue, [5, 3]);
    ln(frontX, 0, frontX, totalH, blue, [5, 3]);
    box(backX + SAFE, base + SAFE, w - 2 * SAFE, h - 2 * SAFE, green, [4, 3]);
    box(frontX + SAFE, base + SAFE, w - 2 * SAFE, h - 2 * SAFE, green, [4, 3]);
    page.drawRectangle({ x: bcX, y: bcY, width: bcW, height: bcH, color: rgb(0.93, 0.93, 0.93), borderColor: gray, borderWidth: 0.8 });
    ctr("BARCODE AREA", bcX + bcW / 2, bcY + bcH / 2 + 2, 9, bold, gray);
    ctr("2 x 1.2 in", bcX + bcW / 2, bcY + bcH / 2 - 11, 8, reg, gray);
    ctr("BACK COVER", backX + w / 2, base + h / 2 + 30, 16, bold, gray);
    ctr("FRONT COVER", frontX + w / 2, base + h / 2 + 30, 16, bold, gray);
    ["Red = trim edge", "Blue dashed = spine fold", "Green dashed = safe zone", "Outer edge = bleed (0.125 in)", "DELETE THESE GUIDES BEFORE UPLOADING"].forEach((t, i) => {
      ctr(t, backX + w / 2, base + h / 2 - 5 - i * 13, 9, i === 4 ? bold : reg, i === 4 ? red : gray);
    });
    if (spine > 20) {
      const lab = `SPINE ${(spine / 72).toFixed(3)} in`;
      const tw = bold.widthOfTextAtSize(lab, 9);
      page.drawText(lab, { x: spineX + spine / 2 - 3, y: base + h / 2 + tw / 2, size: 9, font: bold, color: gray, rotate: degrees(-90) });
    }
  } else {
    const col = COLORS[o.color] || COLORS.navy;
    const bg = rgb(...col.bg), fg = rgb(...col.fg);
    page.drawRectangle({ x: 0, y: 0, width: totalW, height: totalH, color: bg });

    const cx = frontX + w / 2;
    const maxW = w - 80;
    let fs = 44, lines = [];
    for (;;) {
      lines = wrap(o.title, bold, fs, maxW);
      const widest = Math.max(...lines.map((l) => bold.widthOfTextAtSize(l, fs)));
      if ((lines.length <= 5 && widest <= maxW) || fs <= 18) break;
      fs -= 2;
    }
    let y = base + h * 0.68;
    lines.forEach((l) => { ctr(l, cx, y, fs, bold, fg); y -= fs * 1.2; });
    if (o.subtitle) {
      y -= 8;
      wrap(o.subtitle, reg, 15, maxW).forEach((l) => { ctr(l, cx, y, 15, reg, fg); y -= 20; });
    }
    if (o.author) {
      let af = 18;
      while (bold.widthOfTextAtSize(o.author, af) > maxW && af > 10) af--;
      ctr(o.author, cx, base + 50, af, bold, fg);
    }

    if (o.pages >= 80) {
      const sf = Math.min(20, spine * 0.5);
      let tf = sf;
      while (bold.widthOfTextAtSize(o.title, tf) > h * 0.6 && tf > 6) tf -= 0.5;
      page.drawText(o.title, { x: spineX + spine / 2 - tf * 0.35, y: base + h - 36, size: tf, font: bold, color: fg, rotate: degrees(-90) });
      if (o.author) {
        const af2 = sf * 0.8;
        const aw = reg.widthOfTextAtSize(o.author, af2);
        page.drawText(o.author, { x: spineX + spine / 2 - af2 * 0.35, y: base + 36 + aw, size: af2, font: reg, color: fg, rotate: degrees(-90) });
      }
    }

    if (o.blurb) {
      let by = base + h - 80;
      for (const l of wrap(o.blurb, reg, 12, w - 72)) {
        if (by < bcY + bcH + 20) break;
        page.drawText(l, { x: backX + 36, y: by, size: 12, font: reg, color: fg });
        by -= 17;
      }
    }
    page.drawRectangle({ x: bcX, y: bcY, width: bcW, height: bcH, color: rgb(1, 1, 1) });
  }

  return pdf.save();
}
