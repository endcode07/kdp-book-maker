const DIRS = [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function makeWordSearch(words, size = 15) {
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const placed = [];
  const list = words
    .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ""))
    .filter((w) => w.length > 1 && w.length <= size)
    .sort((a, b) => b.length - a.length);

  for (const word of list) {
    let ok = false;
    for (let t = 0; t < 200 && !ok; t++) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
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
      const cells = [];
      for (let i = 0; i < word.length; i++) {
        grid[r + dr * i][c + dc * i] = word[i];
        cells.push([r + dr * i, c + dc * i]);
      }
      placed.push({ word, cells });
      ok = true;
    }
  }

  const answer = grid.map((row) => row.slice());
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c] === "") grid[r][c] = LETTERS[Math.floor(Math.random() * 26)];

  return { grid, answer, placed, size };
}
