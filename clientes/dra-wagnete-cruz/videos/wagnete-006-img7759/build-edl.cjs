/*
 * build-edl.cjs — corte do arquivo 1 (IMG_7759). Remove slate (0-4), fillers/refações,
 * tighten silêncios ≥0.7s, e corta a cauda de bastidor (após idx 191 / 80.36s).
 * Saída: base1.mp4 (parte 1, pra colar com o arquivo 2/CTA depois).
 */
const fs = require("fs"), path = require("path");
const DIR = __dirname;
const tj = require(path.join(DIR, "edit", "transcripts", "source.json"));
const w = tj.words.filter((x) => x.type === "word");
const SRC = path.join(DIR, "source.mov").replace(/\\/g, "/");

const DROP = new Set([35, 38, 82, 110, 132, 133, 161, 165]); // fillers/refações
const START = 5, END = 191, SPLIT = 0.7, PIN = 0.05, POUT = 0.08;

let spans = [], a = null;
for (let i = START; i <= END; i++) {
  if (DROP.has(i)) { if (a !== null) { spans.push([a, i - 1]); a = null; } continue; }
  if (a === null) a = i;
  const gap = i < w.length - 1 ? w[i + 1].start - w[i].end : 0;
  if (i === END || DROP.has(i + 1) || gap >= SPLIT) { spans.push([a, i]); a = null; }
}

const ranges = spans.map(([a, b]) => {
  let start = +(w[a].start - PIN).toFixed(3);
  if (a > 0) start = Math.max(start, +(w[a - 1].end + 0.02).toFixed(3));
  start = Math.max(0, start);
  const end = +(w[b].end + POUT).toFixed(3);
  return { source: "R", start, end, beat: "seg",
    quote: w.slice(a, b + 1).map((x) => x.text).join(" ").slice(0, 54) };
});
const total = ranges.reduce((s, r) => s + (r.end - r.start), 0);
fs.writeFileSync(path.join(DIR, "edit", "edl.json"),
  JSON.stringify({ version: 1, sources: { R: SRC }, ranges, grade: "none", total_duration_s: +total.toFixed(2) }, null, 2));
console.log(`EDL arquivo 1: ${ranges.length} segmentos · ~${total.toFixed(2)}s (origem 104.5s; conteúdo até 80.4s)`);
ranges.forEach((r) => console.log("  [" + r.start.toFixed(2) + "-" + r.end.toFixed(2) + "] " + r.quote));
