let cache = null;

async function get(name) {
  const r = await fetch(`${import.meta.env.BASE_URL}fonts/${name}`);
  const type = r.headers.get("content-type") || "";
  if (!r.ok || type.includes("text/html")) throw new Error(`Font file missing: ${name}`);
  return new Uint8Array(await r.arrayBuffer());
}

export async function loadFonts() {
  if (!cache) {
    cache = {
      reg: await get("DejaVuSans.ttf"),
      bold: await get("DejaVuSans-Bold.ttf"),
      mono: await get("DejaVuSansMono-Bold.ttf"),
    };
  }
  return cache;
}
