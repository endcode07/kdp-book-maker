const ALL8 = [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const LEVELS = {
  mudah: { size: 12, words: 8, dirs: [[0,1],[1,0]] },
  sederhana: { size: 15, words: 10, dirs: [[0,1],[1,0],[1,1],[-1,1]] },
  susah: { size: 15, words: 12, dirs: ALL8 },
};

export function makeWordSearch(words, level = "sederhana") {
  const { size, dirs } = LEVELS[level];
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const placed = [];
  const list = words
    .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ""))
    .filter((w) => w.length > 1 && w.length <= size)
    .sort((a, b) => b.length - a.length);

  for (const word of list) {
    let ok = false;
    for (let t = 0; t < 300 && !ok; t++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      const er = r + dr * (word.length - 1);
      const ec = c + dc * (word.length - 1);
      if (er < 0 || er >= size || ec < 0 || ec >= size) continue;
      let fit = true;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[r + dr * i][c + dc * i];
        if (cell !== "" && cell !== word[i]) { fit = false; break; }
      }
      if (!fit) continue;
      for (let i = 0; i < word.length; i++) grid[r + dr * i][c + dc * i] = word[i];
      placed.push({ word });
      ok = true;
    }
  }

  const answer = grid.map((row) => row.slice());
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c] === "") grid[r][c] = LETTERS[Math.floor(Math.random() * 26)];

  return { grid, answer, placed, size };
}
