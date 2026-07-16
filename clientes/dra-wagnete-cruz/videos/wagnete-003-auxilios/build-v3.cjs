/*
 * build-v3.cjs — usa a ENGINE ORIGINAL do componente caption-editorial-emphasis
 * (compositions/components/caption-editorial-emphasis.html) alimentada com os dados da Wagnete.
 * Mantém as animações boas (entrada palavra-a-palavra, linha de ênfase deslizando, troca de bloco).
 *   - vertical 1080x1920 + safe-zone do Reels (legenda acima da zona morta inferior)
 *   - cor creme #f5f0d0 (mantida)
 *   - ênfase escassa e curada (Playfair itálico), tamanho reduzido p/ não dominar
 *   - elementos glass MENORES, centralizados ACIMA da legenda (melhor contraste sobre o blazer)
 *   - SFX (pop) a cada aparição de elemento
 * Lê: edit/transcripts/source.json   Gera: index.html
 */
const fs = require("fs");
const path = require("path");
const DIR = __dirname;
const tj = require(path.join(DIR, "edit", "transcripts", "source.json"));
const DURATION = +(tj.audio_duration_secs || 66.27).toFixed(3);
const CW = 1080, CH = 1920, FPS = 30;

const src = tj.words.filter((w) => w.type === "word");
const norm = (s) => s.toLowerCase().replace(/^[^0-9a-zà-ú]+|[^0-9a-zà-ú]+$/gi, "");
const W = src.map((w) => ({ text: w.text.trim(), start: +w.start.toFixed(3), end: +w.end.toFixed(3) }));

// ── ênfase curada (escassa) — 1ª ocorrência de cada herói ──
const HEROES = ["incapacidade temporária", "auxílio acidente", "outro benefício", "exceção",
  "cinco anos", "retroativos", "auxílio doença", "escritório", "me chama aqui"];
const emph = new Array(W.length).fill(false);
const at = {};
HEROES.forEach((h) => {
  const toks = h.split(" ").map(norm);
  for (let i = 0; i <= W.length - toks.length; i++) {
    let ok = true; for (let k = 0; k < toks.length; k++) if (norm(W[i + k].text) !== toks[k]) { ok = false; break; }
    if (ok) { for (let k = 0; k < toks.length; k++) emph[i + k] = true; at[h] = W[i].start; break; }
  }
});
const findStart = (tok) => { const t = norm(tok); for (const w of W) if (norm(w.text) === t) return w.start; return -1; };

// ── agrupar em legendas curtas ──
const groups = [];
let cur = [];
for (let i = 0; i < W.length; i++) {
  const t = W[i].text; cur.push(i);
  const endsSentence = /[.?!]$/.test(t), endsClause = /[,;:]$/.test(t);
  const gap = i + 1 < W.length ? W[i + 1].start - W[i].end : 0;
  const hold = /^(auxílio|auxilio|incapacidade|por|o|a|os|as|do|da|me)$/i.test(norm(t));
  if (!hold && (endsSentence || cur.length >= 5 || (endsClause && cur.length >= 3) || (gap > 0.45 && cur.length >= 2))) { groups.push(cur); cur = []; }
  else if (cur.length >= 6) { groups.push(cur); cur = []; }
}
if (cur.length) groups.push(cur);
for (let i = groups.length - 1; i > 0; i--) if (groups[i].length === 1 && groups[i - 1].length + 1 <= 6) { groups[i - 1] = groups[i - 1].concat(groups[i]); groups.splice(i, 1); }

// ── grupos → BLOCKS (formato da engine: {line1:[[idx,type]], line2:[]|null}) ──
const BLOCKS = [];
groups.forEach((idxs) => {
  let rs = -1, re = -1;
  for (let k = 0; k < idxs.length; k++) { if (emph[idxs[k]]) { if (rs < 0) rs = k; re = k; } else if (rs >= 0) break; }
  if (rs < 0) {
    const all = idxs.map((i) => [i, "n"]);
    if (all.length <= 3) BLOCKS.push({ line1: all, line2: null });
    else { const m = Math.ceil(all.length / 2); BLOCKS.push({ line1: all.slice(0, m), line2: all.slice(m) }); }
  } else {
    const lead = idxs.slice(0, rs).map((i) => [i, "n"]);
    const heroes = idxs.slice(rs, re + 1).map((i) => [i, "e"]);
    const trail = idxs.slice(re + 1).map((i) => [i, "n"]);
    if (lead.length) BLOCKS.push({ line1: lead, line2: heroes });   // ênfase desliza na linha 2
    else BLOCKS.push({ line1: heroes, line2: null });
    if (trail.length) BLOCKS.push({ line1: trail, line2: null });
  }
});

// ── elementos (glass menores, ACIMA da legenda, centralizados) + SFX ──
const tAcum = findStart("acumulado"), tDica = findStart("dica"), tNum = at["cinco anos"], tProof = at["escritório"];
const els = [];
els.push({ id: "idcard", track: 3, start: 0, dur: 5.0, cls: "el-id", html: `<b>Dra. Wagnete Cruz</b><span>Advogada Previdenciária · OAB/MG</span>` });
if (tAcum > 0) els.push({ id: "coacum", track: 4, start: +(tAcum - 0.1).toFixed(2), dur: 4.6, cls: "el-callout", html: `<span class="ic">⚠</span> Não acumula com outro benefício` });
if (tDica > 0) els.push({ id: "codica", track: 4, start: +(tDica - 0.3).toFixed(2), dur: 4.6, cls: "el-callout", html: `<span class="ic">★</span> Dica importante` });
if (tNum > 0) els.push({ id: "numcard", track: 5, start: +(tNum - 0.2).toFixed(2), dur: 6.0, cls: "el-num", count: +(tNum + 0.1).toFixed(2), html: `<div class="num-big"><span id="num-val">5</span> anos</div><div class="num-lab">retroativos · desde 2025</div>` });
if (tProof > 0) els.push({ id: "proof", track: 6, start: +(tProof - 0.2).toFixed(2), dur: 3.4, cls: "el-proof", html: `<div class="p-t">📂 casos reais no escritório</div><div class="p-s">sem identificar nomes</div>` });

const elClips = els.map((e) => `      <div id="${e.id}" class="clip el-pos" data-start="${e.start}" data-duration="${e.dur}" data-track-index="${e.track}"><div class="card ${e.cls}">${e.html}</div></div>`).join("\n");
const sfxClips = els.map((e, n) => `      <audio id="sfx-${e.id}" data-start="${e.start}" data-duration="0.4" data-track-index="${20 + (n % 2)}" src="assets/sfx/pop.wav"></audio>`).join("\n");

const elTweens = els.map((e) => {
  let s = `      tl.fromTo("#${e.id} .card", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }, ${e.start});\n` +
          `      tl.to("#${e.id} .card", { opacity: 0, duration: 0.3, ease: "power1.in" }, ${(e.start + e.dur - 0.32).toFixed(2)});`;
  if (e.count) s += `\n      var _n = { v: 0 };\n      tl.set("#num-val", { textContent: 0 }, ${e.start});\n` +
    `      tl.to(_n, { v: 5, duration: 1.1, ease: "power2.out", onUpdate: function(){ document.getElementById("num-val").textContent = Math.round(_n.v); } }, ${e.count});\n` +
    `      tl.set("#num-val", { textContent: 5 }, ${(e.count + 1.3).toFixed(2)});`;
  return s;
}).join("\n");

// ── HTML (engine original reproduzida; tamanhos/safe-zone adaptados ao vertical) ──
const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${CW}, height=${CH}" />
    <title>Dra. Wagnete — Auxílios · v3 (engine original)</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family:"Inter"; font-weight:400; font-style:normal; src:url("assets/fonts/inter-400.woff2") format("woff2"); }
      @font-face { font-family:"Playfair Display"; font-weight:800; font-style:italic; src:url("assets/fonts/playfair-italic-800.woff2") format("woff2"); }
      *,*::before,*::after{ box-sizing:border-box; }
      html,body{ width:${CW}px; height:${CH}px; margin:0; overflow:hidden; background:#000; font-family:"Inter",sans-serif; }
      #root{ position:relative; width:${CW}px; height:${CH}px; overflow:hidden; }
      #bg-video{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
      /* —— camada de legenda (engine original) —— */
      .caption-layer{ position:absolute; inset:0; z-index:20; pointer-events:none; transform:translateZ(0); }
      .safe-zone{ position:absolute; top:1040px; left:60px; width:884px; height:290px; display:flex; align-items:flex-start; justify-content:flex-start; }
      .caption-block{ position:absolute; left:0; top:0; opacity:0; transform-origin:0% 0%; will-change:transform,opacity; backface-visibility:hidden; }
      .caption-line{ display:flex; align-items:baseline; gap:14px; line-height:1.1; white-space:nowrap; }
      .caption-line + .caption-line{ margin-top:8px; }
      .word{ display:inline-block; color:#f5f0d0; text-shadow:0 2px 14px rgba(0,0,0,.62),0 6px 30px rgba(0,0,0,.42); will-change:transform,opacity; backface-visibility:hidden; }
      .word--normal{ font-family:"Inter",sans-serif; font-size:60px; font-weight:400; font-style:normal; }
      .word--italic{ font-family:"Inter",sans-serif; font-size:60px; font-weight:400; font-style:italic; }
      .word--emphasis{ font-family:"Playfair Display",Georgia,serif; font-size:120px; font-weight:800; font-style:italic; line-height:.9; color:#f5f0d0; }
      /* —— elementos glass MENORES, centralizados ACIMA da legenda —— */
      /* elementos alinhados à ESQUERDA (mesma margem da legenda) e acima dela, com gap proporcional (não colado) */
      .el-pos{ position:absolute; left:60px; right:60px; bottom:49.5%; display:flex; justify-content:flex-start; pointer-events:none; }
      .card{ background:rgba(245,240,208,.16); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.5); box-shadow:0 10px 32px rgba(0,0,0,.34); color:#fff; }
      .el-id{ border-radius:16px; padding:11px 24px; text-align:center; }
      .el-id b{ font-size:25px; font-weight:700; color:#fff; } .el-id span{ display:block; font-size:16px; color:rgba(255,255,255,.84); margin-top:2px; }
      .el-callout{ border-radius:14px; padding:11px 20px; font-size:27px; font-weight:600; }
      .el-callout .ic{ color:#f0c970; margin-right:8px; }
      .el-num{ border-radius:16px; padding:13px 26px; text-align:center; }
      .el-num .num-big{ font-family:"Playfair Display",Georgia,serif; font-style:italic; font-weight:800; color:#f5f0d0; font-size:48px; line-height:1; }
      .el-num .num-lab{ font-size:16px; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.85); margin-top:5px; }
      .el-proof{ border-radius:14px; padding:11px 20px; text-align:center; }
      .el-proof .p-t{ font-size:23px; font-weight:600; color:#fff; } .el-proof .p-s{ font-size:15px; color:rgba(255,255,255,.78); margin-top:3px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="${CW}" data-height="${CH}" data-duration="${DURATION}" data-fps="${FPS}">
      <video id="bg-video" preload="auto" data-start="0" data-duration="${DURATION}" data-track-index="0" data-has-audio="true" src="source.mp4"></video>
      <div class="caption-layer" aria-hidden="true"><div id="caption-stage" class="safe-zone"></div></div>
${elClips}
${sfxClips}
    </div>
    <script>
      var DURATION = ${DURATION};
      var SAFE_WIDTH = 860;
      var ENTRY_DUR = 0.1;
      var SLIDE_DUR = 0.2;
      var _fitCanvas = document.createElement("canvas");
      var _fitCtx = _fitCanvas.getContext("2d");
      function fitFontSize(text, base, weight, family, maxW) {
        var size = base, min = Math.floor(base * 0.45);
        while (size > min) { _fitCtx.font = weight + " " + size + "px " + family; if (_fitCtx.measureText(text).width <= maxW) return size; size -= 2; }
        return min;
      }
      var W = ${JSON.stringify(W)};
      var BLOCKS = ${JSON.stringify(BLOCKS)};
      var CLASS_MAP = { n: "word word--normal", i: "word word--italic", e: "word word--emphasis" };
      function computeLineSize(pairs) {
        var hasE = pairs.some(function (p) { return p[1] === "e"; });
        var t = pairs.map(function (p) { return W[p[0]].text; }).join(" ");
        return hasE ? fitFontSize(t, 120, "800", "Playfair Display", SAFE_WIDTH) : fitFontSize(t, 60, "400", "Inter", SAFE_WIDTH);
      }
      function buildBlocks() {
        var stage = document.getElementById("caption-stage");
        BLOCKS.forEach(function (block, bi) {
          var el = document.createElement("div"); el.className = "caption-block"; el.id = "b" + bi;
          var l1Size = computeLineSize(block.line1);
          var l1 = document.createElement("div"); l1.className = "caption-line"; l1.id = "b" + bi + "L1";
          block.line1.forEach(function (pair, wi) {
            var span = document.createElement("span"); span.className = CLASS_MAP[pair[1]]; span.id = "b" + bi + "L1w" + wi;
            span.textContent = W[pair[0]].text; span.style.fontSize = l1Size + "px"; l1.appendChild(span);
          });
          el.appendChild(l1);
          if (block.line2) {
            var l2Size = computeLineSize(block.line2);
            var l2 = document.createElement("div"); l2.className = "caption-line"; l2.id = "b" + bi + "L2";
            block.line2.forEach(function (pair, wi) {
              var span = document.createElement("span"); span.className = CLASS_MAP[pair[1]]; span.id = "b" + bi + "L2w" + wi;
              span.textContent = W[pair[0]].text; span.style.fontSize = l2Size + "px"; l2.appendChild(span);
            });
            el.appendChild(l2);
          }
          stage.appendChild(el);
        });
      }
      buildBlocks();
      (function fitBlocks() {
        BLOCKS.forEach(function (block, bi) {
          var el = document.getElementById("b" + bi);
          el.style.opacity = "1"; el.style.position = "relative";
          var lines = el.querySelectorAll(".caption-line"); var maxW = 0;
          lines.forEach(function (line) { if (line.scrollWidth > maxW) maxW = line.scrollWidth; });
          if (maxW > SAFE_WIDTH) el.style.transform = "scale(" + SAFE_WIDTH / maxW + ")";
          el.style.opacity = "0"; el.style.position = "";
        });
      })();
      window.__timelines = window.__timelines || {};
      var tl = gsap.timeline({ paused: true });
      var allEls = BLOCKS.map(function (_, i) { return document.getElementById("b" + i); });
      function blockStart(bi) { return W[BLOCKS[bi].line1[0][0]].start; }
      BLOCKS.forEach(function (block, bi) {
        var el = allEls[bi];
        var start = blockStart(bi);
        var nextStart = bi < BLOCKS.length - 1 ? blockStart(bi + 1) : DURATION;
        allEls.forEach(function (other, oi) { if (oi !== bi) tl.set(other, { opacity: 0 }, start); });
        tl.set(el, { opacity: 1 }, start);
        block.line1.forEach(function (pair, wi) {
          var wordEl = document.getElementById("b" + bi + "L1w" + wi);
          tl.set(wordEl, { opacity: 0, scale: 1.12, transformOrigin: "0% 100%" }, start);
          tl.to(wordEl, { opacity: 1, scale: 1, duration: ENTRY_DUR, ease: "power2.out" }, W[pair[0]].start);
        });
        if (block.line2) {
          var hasEmphasis = block.line2.some(function (p) { return p[1] === "e"; });
          var l2El = document.getElementById("b" + bi + "L2");
          if (hasEmphasis) {
            tl.set(l2El, { opacity: 0, x: -${CW} }, start);
            tl.to(l2El, { opacity: 1, x: 0, duration: SLIDE_DUR, ease: "power2.out" }, W[block.line2[0][0]].start);
          } else {
            tl.set(l2El, { opacity: 1 }, start);
            block.line2.forEach(function (pair, wi) {
              var wordEl = document.getElementById("b" + bi + "L2w" + wi);
              tl.set(wordEl, { opacity: 0, scale: 1.12, transformOrigin: "0% 100%" }, start);
              tl.to(wordEl, { opacity: 1, scale: 1, duration: ENTRY_DUR, ease: "power2.out" }, W[pair[0]].start);
            });
          }
        }
        tl.set(el, { opacity: 0 }, nextStart);
      });
      // —— elementos glass + count-up ——
${elTweens}
      tl.to({}, { duration: DURATION }, 0);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(DIR, "index.html"), html);
console.log(`v3 (engine original) · ${BLOCKS.length} blocos · ${els.length} elementos · ${els.length} SFX · ${DURATION}s`);
console.log("heróis (s):", JSON.stringify(at));
