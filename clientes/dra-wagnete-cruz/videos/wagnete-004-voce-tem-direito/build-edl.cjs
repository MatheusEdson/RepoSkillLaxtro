/*
 * build-edl.cjs — corte do [004] "Você tem direito a receber".
 * Take limpo: dropa fillers "é," (42,47,300) e tighten silêncios ≥0.7s. Sem slate/bastidor.
 */
const fs = require("fs"), path = require("path");
const DIR = __dirname;
const w = require(path.join(DIR, "edit", "transcripts", "source.json")).words.filter((x) => x.type === "word");
const SRC = path.join(DIR, "source.mp4").replace(/\\/g, "/");
const DROP = new Set([42, 47, 300]);
const START = 0, END = w.length - 1, SPLIT = 0.7, PIN = 0.05, POUT = 0.08;

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
  return { source: "R", start: Math.max(0, start), end: +(w[b].end + POUT).toFixed(3), beat: "seg" };
});
const total = ranges.reduce((s, r) => s + (r.end - r.start), 0);
fs.writeFileSync(path.join(DIR, "edit", "edl.json"),
  JSON.stringify({ version: 1, sources: { R: SRC }, ranges, grade: "none", total_duration_s: +total.toFixed(2) }, null, 2));
console.log(`EDL: ${ranges.length} segmentos · ~${total.toFixed(2)}s (origem 125.7s)`);
