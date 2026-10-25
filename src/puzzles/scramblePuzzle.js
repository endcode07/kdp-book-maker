import { rgb } from "pdf-lib";
import { ALL_THEMES } from "../data/allThemes";

const ORDER = ["easy", "medium", "hard", "expert"];
const RANGE = {
  easy: { min: 4, max: 6, count: 8 },
    medium: { min: 5, max: 8, count: 10 },
      hard: { min: 7, max: 12, count: 12 },
        expert: { min: 8, max: 14, count: 12 },
        };

        const TEXT = {
          en: {
              name: "Word Scramble", theme: "Theme",
                  levels: { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" },
                      howto: ["1. Unscramble the letters to find each word.", "2. Write your answer on the line.", "3. Check the solutions at the back."],
                        },
                          ms: {
                              name: "Susun Huruf", theme: "Tema",
                                  levels: { easy: "Mudah", medium: "Sederhana", hard: "Susah", expert: "Pakar" },
                                      howto: ["1. Susun semula huruf untuk cari setiap perkataan.", "2. Tulis jawapan pada garisan.", "3. Semak jawapan di belakang buku."],
                                        },
                                        };

                                        const shuffle = (a) => {
                                          const b = [...a];
                                            for (let i = b.length - 1; i > 0; i--) {
                                                const j = Math.floor(Math.random() * (i + 1));
                                                    [b[i], b[j]] = [b[j], b[i]];
                                                      }
                                                        return b;
                                                        };

                                                        const clean = (x) => x.trim().toUpperCase().replace(/[^A-Z]/g, "");
                                                        const key = (w) => w.split("").sort().join("");

                                                        function scramble(word) {
                                                          const a = word.split("");
                                                            if (new Set(a).size === 1) return word;
                                                              let out = word;
                                                                let guard = 0;
                                                                  while (out === word && guard++ < 50) out = shuffle(a).join("");
                                                                    return out;
                                                                    }

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

                                                                                                                    function buildPool(all, lv) {
                                                                                                                      const { min, max, count } = RANGE[lv];
                                                                                                                        let pool = all.filter((w) => w.length >= min && w.length <= max);
                                                                                                                          if (pool.length < count) {
                                                                                                                              const mid = (min + max) / 2;
                                                                                                                                  const rest = all
                                                                                                                                        .filter((w) => !pool.includes(w))
                                                                                                                                              .sort((a, b) => Math.abs(a.length - mid) - Math.abs(b.length - mid));
                                                                                                                                                  pool = pool.concat(rest);
                                                                                                                                                    }
                                                                                                                                                      return pool;
                                                                                                                                                      }

                                                                                                                                                      function hintFor(s) {
                                                                                                                                                        const t = ALL_THEMES[s.theme];
                                                                                                                                                          if (!t) return "";
                                                                                                                                                            return t.label.split(":").pop().replace(/\s*\(Malay\)/, "").trim();
                                                                                                                                                            }

                                                                                                                                                            export const scrambleP = {
                                                                                                                                                              name: (lang) => (TEXT[lang] || TEXT.en).name,
                                                                                                                                                                howto: (s, lang) => (TEXT[lang] || TEXT.en).howto,
                                                                                                                                                                  generate(s) {
                                                                                                                                                                      const words = [...new Set(s.words.split(/[,\n]/).map(clean).filter((w) => w.length >= 4 && w.length <= 14))];
                                                                                                                                                                          const keys = {};
                                                                                                                                                                              words.forEach((w) => { keys[key(w)] = (keys[key(w)] || 0) + 1; });
                                                                                                                                                                                  const all = words.filter((w) => keys[key(w)] === 1);
                                                                                                                                                                                      const hint = hintFor(s);
                                                                                                                                                                                          const dealers = {};
                                                                                                                                                                                              const out = [];
                                                                                                                                                                                                  for (let i = 0; i < s.count; i++) {
                                                                                                                                                                                                        const lv = s.level === "mixed" ? ORDER[Math.min(3, Math.floor((i * 4) / s.count))] : s.level;
                                                                                                                                                                                                              const n = RANGE[lv].count;
                                                                                                                                                                                                                    if (all.length < n) {
                                                                                                                                                                                                                            throw new Error(`Word Scramble (${lv}) needs at least ${n} words of 4-14 letters. You have ${all.length}.`);
                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                        if (!dealers[lv]) dealers[lv] = makeDealer(buildPool(all, lv));
                                                                                                                                                                                                                                              const picked = dealers[lv](n);
                                                                                                                                                                                                                                                    out.push({ words: picked, scr: picked.map(scramble), level: lv, hint });
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                            return out;
                                                                                                                                                                                                                                                              },
                                                                                                                                                                                                                                                                drawPuzzle(ctx, page, p, n, x0, aw) {
                                                                                                                                                                                                                                                                    const { h, TOP, BOTTOM, fonts, L, lang, center } = ctx;
                                                                                                                                                                                                                                                                        const T = TEXT[lang] || TEXT.en;
                                                                                                                                                                                                                                                                            center(page, `${L.puzzle} ${n}`, h - TOP - 12, 18, fonts.hb, x0, aw);
                                                                                                                                                                                                                                                                                const sub = p.hint ? `${T.levels[p.level]} - ${T.theme}: ${p.hint}` : T.levels[p.level];
                                                                                                                                                                                                                                                                                    center(page, sub, h - TOP - 30, 11, fonts.reg, x0, aw);

                                                                                                                                                                                                                                                                                        const top = h - TOP - 55;
                                                                                                                                                                                                                                                                                            const rowH = Math.min(56, (top - BOTTOM) / p.scr.length);
                                                                                                                                                                                                                                                                                                const maxLen = Math.max(...p.scr.map((w) => w.length));
                                                                                                                                                                                                                                                                                                    const fs = Math.min(22, (0.5 * aw) / (0.95 * maxLen));
                                                                                                                                                                                                                                                                                                        const step = 0.95 * fs;
                                                                                                                                                                                                                                                                                                            const lx = x0 + 26 + maxLen * step + 14;

                                                                                                                                                                                                                                                                                                                p.scr.forEach((word, i) => {
                                                                                                                                                                                                                                                                                                                      const base = top - i * rowH - rowH * 0.6;
                                                                                                                                                                                                                                                                                                                            page.drawText(`${i + 1}.`, { x: x0, y: base, size: 12, font: fonts.hb });
                                                                                                                                                                                                                                                                                                                                  for (let k = 0; k < word.length; k++) {
                                                                                                                                                                                                                                                                                                                                          const ch = word[k];
                                                                                                                                                                                                                                                                                                                                                  const tw = fonts.mono.widthOfTextAtSize(ch, fs);
                                                                                                                                                                                                                                                                                                                                                          page.drawText(ch, { x: x0 + 26 + k * step + (step - tw) / 2, y: base, size: fs, font: fonts.mono });
                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                      page.drawLine({
                                                                                                                                                                                                                                                                                                                                                                              start: { x: lx, y: base - 3 }, end: { x: x0 + aw, y: base - 3 },
                                                                                                                                                                                                                                                                                                                                                                                      thickness: 0.8, color: rgb(0.3, 0.3, 0.3),
                                                                                                                                                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                                                                                                                                                                  },
                                                                                                                                                                                                                                                                                                                                                                                                    drawAnswer(ctx, page, p, gx, gy, size) {
                                                                                                                                                                                                                                                                                                                                                                                                        page.drawRectangle({
                                                                                                                                                                                                                                                                                                                                                                                                              x: gx, y: gy - size, width: size, height: size,
                                                                                                                                                                                                                                                                                                                                                                                                                    color: rgb(1, 1, 1), borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5,
                                                                                                                                                                                                                                                                                                                                                                                                                        });
                                                                                                                                                                                                                                                                                                                                                                                                                            const n = p.words.length;
                                                                                                                                                                                                                                                                                                                                                                                                                                const lh = size / (n + 0.5);
                                                                                                                                                                                                                                                                                                                                                                                                                                    const fs = Math.min(9, lh * 0.72);
                                                                                                                                                                                                                                                                                                                                                                                                                                        p.words.forEach((w, i) => {
                                                                                                                                                                                                                                                                                                                                                                                                                                              page.drawText(`${i + 1}. ${w}`, {
                                                                                                                                                                                                                                                                                                                                                                                                                                                      x: gx + 4, y: gy - (i + 0.8) * lh, size: fs, font: ctx.fonts.reg, color: rgb(0.75, 0, 0),
                                                                                                                                                                                                                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  },
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  };