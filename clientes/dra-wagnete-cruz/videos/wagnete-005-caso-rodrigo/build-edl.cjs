/*
 * build-edl.cjs — EDL de corte do [005] Caso Rodrigo.
 * Mantém 9 segmentos (remove refações + dead-airs); hook final (idx 151→173) contínuo.
 */
const fs = require("fs"), path = require("path");
const DIR = __dirname;
const tj = require(path.join(DIR, "edit", "transcripts", "source.json"));
const w = tj.words.filter((x) => x.type === "word");
const SRC = path.join(DIR, "source.mp4").replace(/\\/g, "/");

// keep-ranges por índice de palavra (inclusive). Drops entre eles = refações/silêncio.
const KEEP = [[0,5],[7,27],[29,35],[39,52],[53,62],[67,86],[89,95],[102,136],[140,173]];
const PAD_IN = 0.05, PAD_OUT = 0.08;

const ranges = KEEP.map(([a,b], i) => {
  let start = +(w[a].start - PAD_IN).toFixed(3);
  if (a > 0) start = Math.max(start, +(w[a-1].end + 0.02).toFixed(3)); // não invade palavra anterior (dropada)
  start = Math.max(0, start);
  const end = +(w[b].end + PAD_OUT).toFixed(3);
  return { source: "R", start, end, beat: "seg"+i,
    quote: w.slice(a,b+1).map(x=>x.text).join(" ").slice(0,60) };
});
const total = ranges.reduce((s,r)=>s+(r.end-r.start),0);
const edl = { version:1, sources:{ R: SRC }, ranges, grade:"none", total_duration_s:+total.toFixed(2) };
fs.writeFileSync(path.join(DIR,"edit","edl.json"), JSON.stringify(edl,null,2));
console.log("EDL: "+ranges.length+" segmentos · ~"+total.toFixed(2)+"s (origem 62.3s)");
ranges.forEach(r=>console.log("  ["+r.start.toFixed(2)+"-"+r.end.toFixed(2)+"] "+r.quote));
