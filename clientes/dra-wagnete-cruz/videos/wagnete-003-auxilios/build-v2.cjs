/*
 * build-v2.cjs — composição HyperFrames v2 pra Dra. Wagnete [003] Auxílios.
 * Implementa o plano do storyboard / direcao-video.md:
 *   - legenda estilo `caption-editorial-emphasis` (Inter creme + termo-chave em Playfair itálico, sem box)
 *   - ênfase ESCASSA e curada (só os heróis do storyboard), não toda keyword
 *   - elementos glass creme/branco, nunca sobre o rosto: lower-third de identificação (acima da cabeça),
 *     callouts (não acumula / dica importante), card de número com count-up, chip de prova
 *   - fecho pela própria legenda ("me chama aqui")
 * Lê:   edit/transcripts/source.json   Gera: index.html
 */
const fs = require("fs");
const path = require("path");
const DIR = __dirname;
const tj = require(path.join(DIR, "edit", "transcripts", "source.json"));
const DURATION = +(tj.audio_duration_secs || 66.27).toFixed(3);
const W = 1080, H = 1920, FPS = 30;

const words = tj.words.filter((w) => w.type === "word");
const norm = (s) => s.toLowerCase().replace(/^[^0-9a-zà-ú]+|[^0-9a-zà-ú]+$/gi, "");

// ── ênfase curada (escassa): só estes heróis viram o display serifado (1ª ocorrência) ──
const HEROES = [
  "incapacidade temporária", "auxílio acidente", "outro benefício", "exceção",
  "cinco anos", "retroativos", "auxílio doença", "escritório", "me chama aqui",
];
const emph = new Array(words.length).fill(false);
function tagPhrase(phrase) {
  const toks = phrase.split(" ").map(norm);
  for (let i = 0; i <= words.length - toks.length; i++) {
    let ok = true;
    for (let k = 0; k < toks.length; k++) if (norm(words[i + k].text) !== toks[k]) { ok = false; break; }
    if (ok) { for (let k = 0; k < toks.length; k++) emph[i + k] = true; return words[i].start; }
  }
  return -1;
}
const at = {};
HEROES.forEach((h) => { at[h] = tagPhrase(h); });
function findStart(tok) { const t = norm(tok); for (const w of words) if (norm(w.text) === t) return w.start; return -1; }

// ── agrupar em legendas curtas (clausula / ≤6 palavras), sem órfã ──
const groups = [];
let cur = [];
for (let i = 0; i < words.length; i++) {
  const w = words[i]; cur.push(i);
  const t = w.text.trim();
  const endsSentence = /[.?!]$/.test(t), endsClause = /[,;:]$/.test(t);
  const next = words[i + 1]; const gap = next ? next.start - w.end : 0;
  const hold = /^(auxílio|auxilio|incapacidade|por|o|a|os|as|do|da|me)$/i.test(norm(t));
  if (!hold && (endsSentence || cur.length >= 5 || (endsClause && cur.length >= 3) || (gap > 0.45 && cur.length >= 2))) { groups.push(cur); cur = []; }
  else if (cur.length >= 6) { groups.push(cur); cur = []; }
}
if (cur.length) groups.push(cur);
for (let i = groups.length - 1; i > 0; i--) if (groups[i].length === 1 && groups[i - 1].length + 1 <= 6) { groups[i - 1] = groups[i - 1].concat(groups[i]); groups.splice(i, 1); }

// ── render de cada legenda: segmenta em linhas normais/ênfase (contíguas) ──
function renderGroup(idxs) {
  const segs = []; let buf = []; let mode = emph[idxs[0]];
  const flush = () => { if (buf.length) segs.push({ em: mode, text: buf.join(" ") }); buf = []; };
  idxs.forEach((gi) => { const e = emph[gi]; if (e !== mode) { flush(); mode = e; } buf.push(words[gi].text.trim()); });
  flush();
  return segs.map((s) => `<span class="${s.em ? "em" : "nrm"}">${s.text}</span>`).join("");
}
const caps = groups.map((g, i) => {
  const show = i === 0 ? 0 : words[g[0]].start;
  const hide = i < groups.length - 1 ? words[groups[i + 1][0]].start : DURATION;
  return { i, show: +show.toFixed(3), dur: +(hide - show - 0.001).toFixed(3), html: renderGroup(g) };
});

// ── elementos (gatilhos por timestamp) ──
const tAcum = findStart("acumulado");
const tDica = findStart("dica");
const tNum = at["cinco anos"];
const tProof = at["escritório"];
const els = [];
els.push({ id: "idcard", track: 3, start: 0, dur: 5.0, cls: "el-id",
  html: `<div class="id-in"><b>Dra. Wagnete Cruz</b><span>Advogada Previdenciária · OAB/MG</span></div>` });
if (tAcum > 0) els.push({ id: "co-acum", track: 4, start: +(tAcum - 0.1).toFixed(2), dur: 4.6, cls: "el-callout",
  html: `<span class="ic">⚠</span> Não acumula com outro benefício` });
if (tDica > 0) els.push({ id: "co-dica", track: 4, start: +(tDica - 0.3).toFixed(2), dur: 4.6, cls: "el-callout",
  html: `<span class="ic">★</span> Dica importante` });
if (tNum > 0) els.push({ id: "numcard", track: 5, start: +(tNum - 0.2).toFixed(2), dur: 6.0, cls: "el-num", count: +(tNum + 0.1).toFixed(2),
  html: `<div class="num-big"><span id="num-val">5</span> anos</div><div class="num-lab">retroativos · desde 2025</div>` });
if (tProof > 0) els.push({ id: "proof", track: 6, start: +(tProof - 0.2).toFixed(2), dur: 3.4, cls: "el-proof",
  html: `<div class="p-t">📂 casos reais no escritório</div><div class="p-s">sem identificar nomes</div>` });

// ── HTML ──
const capClips = caps.map((c) => `      <div id="cap-${c.i}" class="clip cap" data-start="${c.show}" data-duration="${c.dur}" data-track-index="2"><div class="cap-in">${c.html}</div></div>`).join("\n");
const elClips = els.map((e) => `      <div id="${e.id}" class="clip ${e.cls}" data-start="${e.start}" data-duration="${e.dur}" data-track-index="${e.track}">${e.html}</div>`).join("\n");

const capTweens = caps.map((c) => `      tl.from("#cap-${c.i} .cap-in", { opacity: 0, y: 16, duration: 0.24, ease: "power2.out" }, ${c.show});`).join("\n");
const elTweens = els.map((e) => {
  let s = `      tl.fromTo("#${e.id}", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }, ${e.start});\n` +
          `      tl.to("#${e.id}", { opacity: 0, duration: 0.3, ease: "power1.in" }, ${(e.start + e.dur - 0.32).toFixed(2)});`;
  if (e.count) {
    s += `\n      var _n${e.id} = { v: 0 };\n` +
         `      tl.set("#num-val", { textContent: 0 }, ${e.start});\n` +
         `      tl.to(_n${e.id}, { v: 5, duration: 1.1, ease: "power2.out", onUpdate: function(){ document.getElementById("num-val").textContent = Math.round(_n${e.id}.v); } }, ${e.count});\n` +
         `      tl.set("#num-val", { textContent: 5 }, ${(e.count + 1.2).toFixed(2)});`;
  }
  return s;
}).join("\n");

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>Dra. Wagnete — Auxílios · v2</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family:"Inter"; font-weight:400; font-style:normal; src:url("assets/fonts/inter-400.woff2") format("woff2"); }
      @font-face { font-family:"Playfair Display"; font-weight:800; font-style:italic; src:url("assets/fonts/playfair-italic-800.woff2") format("woff2"); }
      *{ box-sizing:border-box; }
      body{ margin:0; background:#000; font-family:"Inter",system-ui,sans-serif; }
      #root{ position:relative; width:${W}px; height:${H}px; overflow:hidden; }
      #bg{ width:${W}px; height:${H}px; object-fit:cover; }
      .shadow{ text-shadow:0 2px 14px rgba(0,0,0,.62), 0 6px 30px rgba(0,0,0,.4); }
      /* LEGENDA editorial-emphasis — Reels safe: acima da zona morta inferior (~30%), fora da coluna de ícones (dir ~12%) */
      .cap{ position:absolute; left:6%; right:13%; bottom:35%; text-align:left; }
      .cap-in .nrm{ display:block; color:#f5f0d0; font-family:"Inter",sans-serif; font-weight:400; font-size:50px; line-height:1.14;
        text-shadow:0 2px 14px rgba(0,0,0,.62),0 6px 30px rgba(0,0,0,.4); }
      .cap-in .em{ display:block; color:#f5f0d0; font-family:"Playfair Display",Georgia,serif; font-style:italic; font-weight:800;
        font-size:84px; line-height:.94; margin:6px 0 2px; letter-spacing:-.01em;
        text-shadow:0 2px 14px rgba(0,0,0,.62),0 8px 34px rgba(0,0,0,.45); }
      /* elementos glass creme/branco — nunca sobre o rosto */
      .glass{ background:rgba(245,240,208,.14); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px);
        border:1px solid rgba(255,255,255,.4); box-shadow:0 8px 30px rgba(0,0,0,.26); color:#fff; }
      .el-id{ position:absolute; top:8%; left:50%; transform:translateX(-50%); white-space:nowrap;
        background:rgba(245,240,208,.14); -webkit-backdrop-filter:blur(12px); backdrop-filter:blur(12px);
        border:1px solid rgba(255,255,255,.4); box-shadow:0 8px 24px rgba(0,0,0,.24); border-radius:18px; padding:14px 28px; }
      .el-id .id-in{ display:flex; flex-direction:column; align-items:center; line-height:1.2; }
      .el-id b{ color:#fff; font-size:30px; font-weight:700; }
      .el-id span{ color:rgba(255,255,255,.82); font-size:20px; }
      .el-callout{ position:absolute; top:12%; left:6%; border-radius:16px; padding:14px 22px; font-size:34px; font-weight:600; color:#fff;
        background:rgba(245,240,208,.14); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,.4); box-shadow:0 8px 30px rgba(0,0,0,.26); }
      .el-callout .ic{ color:#f0c970; margin-right:8px; }
      .el-num{ position:absolute; top:15%; right:13%; border-radius:18px; padding:18px 30px; text-align:center;
        background:rgba(245,240,208,.14); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,.42); box-shadow:0 10px 34px rgba(0,0,0,.28); }
      .el-num .num-big{ font-family:"Playfair Display",Georgia,serif; font-style:italic; font-weight:800; color:#f5f0d0; font-size:66px; line-height:1; }
      .el-num .num-lab{ color:rgba(255,255,255,.85); font-size:22px; letter-spacing:.1em; text-transform:uppercase; margin-top:6px; }
      .el-proof{ position:absolute; top:15%; right:13%; border-radius:16px; padding:14px 20px; text-align:right;
        background:rgba(245,240,208,.14); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,.4); box-shadow:0 8px 30px rgba(0,0,0,.26); }
      .el-proof .p-t{ color:#fff; font-size:28px; font-weight:600; }
      .el-proof .p-s{ color:rgba(255,255,255,.78); font-size:19px; margin-top:4px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="${W}" data-height="${H}" data-duration="${DURATION}" data-fps="${FPS}">
      <video id="bg" data-start="0" data-duration="${DURATION}" data-track-index="0" data-has-audio="true" src="source.mp4"></video>
${capClips}
${elClips}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
${capTweens}
${elTweens}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(DIR, "index.html"), html);
console.log(`v2 gerado · ${caps.length} legendas · ${els.length} elementos · ${DURATION}s`);
console.log("heróis (s):", JSON.stringify(at));
console.log("gatilhos: acumulado=" + tAcum + " dica=" + tDica + " num=" + tNum + " proof=" + tProof);
