export const MAZE_LEVELS = {
  easy: { n: 10 },
  medium: { n: 16 },
  hard: { n: 24 },
  expert: { n: 32 },
};

export function makeMaze(n) {
  const wallR = Array.from({ length: n }, () => Array(n).fill(true));
  const wallD = Array.from({ length: n }, () => Array(n).fill(true));
  const seen = Array.from({ length: n }, () => Array(n).fill(false));
  const stack = [[0, 0]];
  seen[0][0] = true;

  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const nb = [];
    if (r > 0 && !seen[r - 1][c]) nb.push([r - 1, c, "U"]);
    if (r < n - 1 && !seen[r + 1][c]) nb.push([r + 1, c, "D"]);
    if (c > 0 && !seen[r][c - 1]) nb.push([r, c - 1, "L"]);
    if (c < n - 1 && !seen[r][c + 1]) nb.push([r, c + 1, "R"]);
    if (!nb.length) { stack.pop(); continue; }
    const [nr, nc, d] = nb[Math.floor(Math.random() * nb.length)];
    if (d === "U") wallD[nr][nc] = false;
    else if (d === "D") wallD[r][c] = false;
    else if (d === "L") wallR[nr][nc] = false;
    else wallR[r][c] = false;
    seen[nr][nc] = true;
    stack.push([nr, nc]);
  }

  // Cari jalan penyelesaian (BFS) dari kiri atas ke kanan bawah
  const prev = Array.from({ length: n }, () => Array(n).fill(null));
  prev[0][0] = [-1, -1];
  const q = [[0, 0]];
  while (q.length) {
    const [r, c] = q.shift();
    if (r === n - 1 && c === n - 1) break;
    const go = (nr, nc, open) => {
      if (open && !prev[nr][nc]) { prev[nr][nc] = [r, c]; q.push([nr, nc]); }
    };
    if (r > 0) go(r - 1, c, !wallD[r - 1][c]);
    if (r < n - 1) go(r + 1, c, !wallD[r][c]);
    if (c > 0) go(r, c - 1, !wallR[r][c - 1]);
    if (c < n - 1) go(r, c + 1, !wallR[r][c]);
  }
  const path = [];
  let cur = [n - 1, n - 1];
  while (cur[0] !== -1) { path.push(cur); cur = prev[cur[0]][cur[1]]; }
  path.reverse();

  return { n, wallR, wallD, path };
}
