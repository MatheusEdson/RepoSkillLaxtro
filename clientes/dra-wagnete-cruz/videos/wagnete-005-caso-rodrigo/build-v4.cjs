/*
 * build-v4.cjs — Caso Rodrigo. Engine ORIGINAL caption-editorial-emphasis (base.json) +
 * elementos glass nas posições PADRÃO (direcao-video §4c) + push-ins + ZOOM no hook final + SFX.
 * Posições idênticas ao vídeo 03 (mesmo cenário). Lower-third id padronizado (sem dot).
 * Lê: edit/transcripts/base.json + edit/base.mp4   Gera: index.html
 */
const fs = require("fs"), path = require("path");
const DIR = __dirname;
const tj = require(path.join(DIR, "edit", "transcripts", "base.json"));
const DURATION = +(tj.audio_duration_secs || 53.1).toFixed(3);
const CW = 1080, CH = 1920, FPS = 24;

const src = tj.words.filter((x) => x.type === "word");
const norm = (s) => s.toLowerCase().replace(/^[^0-9a-zà-ú]+|[^0-9a-zà-ú]+$/gi, "");
const W = src.map((w) => ({ text: w.text.trim(), start: +w.start.toFixed(3), end: +w.end.toFixed(3) }));

// ênfase curada (escassa) — 1ª ocorrência
const HEROES = ["história", "acompanhar a esposa", "músico", "cicatriz no braço",
  "atacado por um animal", "limitação", "auxílio-acidente", "entre em contato"];
const emph = new Array(W.length).fill(false);
const at = {};
HEROES.forEach((h) => {
  const toks = h.split(" ").map(norm);
  for (let i = 0; i <= W.length - toks.length; i++) {
    let ok = true; for (let k = 0; k < toks.length; k++) if (norm(W[i + k].text) !== toks[k]) { ok = false; break; }
    if (ok) { for (let k = 0; k < toks.length; k++) emph[i + k] = true; at[h] = W[i].start; break; }
  }
});
const findStart = (tok) => { const t = norm(tok); for (const x of W) if (norm(x.text) === t) return x.start; return -1; };
const findEnd = (tok) => { const t = norm(tok); for (const x of W) if (norm(x.text) === t) return x.end; return -1; };

// agrupar em legendas
const groups = []; let cur = [];
for (let i = 0; i < W.length; i++) {
  const t = W[i].text;
  cur.push(i);
  const endsSentence = /[.?!]$/.test(t), endsClause = /[,;:]$/.test(t);
  const gap = i + 1 < W.length ? W[i + 1].start - W[i].end : 0;
  const hold = /^(auxílio|auxilio|cicatriz|atacado|acompanhar|entre|em|por|um|o|a|os|as|do|da|no)$/i.test(norm(t));
  if (!hold && (endsSentence || cur.length >= 5 || (endsClause && cur.length >= 3) || (gap > 0.45 && cur.length >= 2))) { groups.push(cur); cur = []; }
  else if (cur.length >= 6) { groups.push(cur); cur = []; }
}
if (cur.length) groups.push(cur);
for (let i = groups.length - 1; i > 0; i--) if (groups[i].length === 1 && groups[i - 1].length + 1 <= 6) { groups[i - 1] = groups[i - 1].concat(groups[i]); groups.splice(i, 1); }

// grupos → BLOCKS
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
    if (lead.length) BLOCKS.push({ line1: lead, line2: heroes }); else BLOCKS.push({ line1: heroes, line2: null });
    if (trail.length) BLOCKS.push({ line1: trail, line2: null });
  }
});

// elementos (glass, posição padrão; mesmo cenário do vídeo 03)
const tRod = at["músico"], tCic = at["cicatriz no braço"], tAtk = at["atacado por um animal"];
const tAcomp = findStart("acompanhando"), tAux = at["auxílio-acidente"], tHook = findStart("identificou");
const tAtkEnd = findEnd("animal");
const els = [];
els.push({ id: "idcard", track: 3, start: 0, dur: 4.5, cls: "el-id", html: `<b>Dra. Wagnete Cruz</b><span>Advogada Previdenciária · OAB/MG</span>` });
if (tRod > 0) els.push({ id: "rodcard", track: 4, start: +(tRod - 0.3).toFixed(2), dur: 3.3, cls: "el-char", html: `<b>Rodrigo</b><span>músico</span>` });
if (tCic > 0) els.push({ id: "ciccall", track: 5, start: +(tCic - 0.2).toFixed(2), dur: 3.2, cls: "el-callout", html: `<span class="ic">⌖</span> cicatriz no braço` });
if (tAtk > 0) els.push({ id: "atkcall", track: 5, start: +(tAtk - 0.2).toFixed(2), dur: 3.2, cls: "el-callout", html: `<span class="ic">⚠</span> atacado por um animal` });
if (tAcomp > 0) els.push({ id: "payoff", track: 6, start: +(tAcomp - 0.2).toFixed(2), dur: 4.6, cls: "el-payoff", html: `<div>veio só pra <b>acompanhar a esposa</b></div><span>→ saiu com o auxílio-acidente</span>` });

const elClips = els.map((e) => `      <div id="${e.id}" class="clip el-pos" data-start="${e.start}" data-duration="${e.dur}" data-track-index="${e.track}"><div class="card ${e.cls}">${e.html}</div></div>`).join("\n");
// SFX: pop por elemento + whoosh no zoom do hook
const sfx = els.map((e, n) => ({ id: "sfx-" + e.id, t: e.start, file: "pop", tr: 20 + (n % 2) }));
sfx.push({ id: "sfx-hook", t: +(tHook - 0.25).toFixed(2), file: "whoosh", tr: 22 });
const sfxClips = sfx.map((s) => `      <audio id="${s.id}" data-start="${s.t}" data-duration="0.6" data-track-index="${s.tr}" src="assets/sfx/${s.file}.wav"></audio>`).join("\n");

const elTweens = els.map((e) =>
  `      tl.fromTo("#${e.id} .card", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, ${e.start});\n` +
  `      tl.to("#${e.id} .card", { opacity: 0, duration: 0.3, ease: "power1.in" }, ${(e.start + e.dur - 0.3).toFixed(2)});`
).join("\n");

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${CW}, height=${CH}" />
    <title>Dra. Wagnete — Caso Rodrigo</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family:"Inter"; font-weight:400; font-style:normal; src:url("assets/fonts/inter-400.woff2") format("woff2"); }
      @font-face { font-family:"Playfair Display"; font-weight:800; font-style:italic; src:url("assets/fonts/playfair-italic-800.woff2") format("woff2"); }
      *,*::before,*::after{ box-sizing:border-box; }
      html,body{ width:${CW}px; height:${CH}px; margin:0; overflow:hidden; background:#000; font-family:"Inter",sans-serif; }
      #root{ position:relative; width:${CW}px; height:${CH}px; overflow:hidden; }
      #bg-video{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transform-origin:50% 38%; will-change:transform; }
      .caption-layer{ position:absolute; inset:0; z-index:20; pointer-events:none; transform:translateZ(0); }
      /* §4c posições PADRÃO (idênticas ao vídeo 03) */
      .safe-zone{ position:absolute; top:1040px; left:60px; width:884px; height:290px; display:flex; align-items:flex-start; justify-content:flex-start; }
      .caption-block{ position:absolute; left:0; top:0; opacity:0; transform-origin:0% 0%; will-change:transform,opacity; backface-visibility:hidden; }
      .caption-line{ display:flex; align-items:baseline; gap:14px; line-height:1.1; white-space:nowrap; }
      .caption-line + .caption-line{ margin-top:8px; }
      .word{ display:inline-block; color:#f5f0d0; text-shadow:0 2px 14px rgba(0,0,0,.62),0 6px 30px rgba(0,0,0,.42); }
      .word--normal{ font-family:"Inter",sans-serif; font-size:60px; font-weight:400; }
      .word--italic{ font-family:"Inter",sans-serif; font-size:60px; font-weight:400; font-style:italic; }
      .word--emphasis{ font-family:"Playfair Display",Georgia,serif; font-size:120px; font-weight:800; font-style:italic; line-height:.9; color:#f5f0d0; }
      /* elementos glass — esquerda acima da legenda (§4c) */
      .el-pos{ position:absolute; left:60px; right:60px; bottom:49.5%; display:flex; justify-content:flex-start; pointer-events:none; }
      .card{ background:rgba(245,240,208,.16); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.5); box-shadow:0 10px 32px rgba(0,0,0,.34); color:#fff; }
      .el-id{ border-radius:16px; padding:11px 24px; text-align:center; }
      .el-id b{ font-size:25px; font-weight:700; color:#fff; } .el-id span{ display:block; font-size:16px; color:rgba(255,255,255,.84); margin-top:2px; }
      .el-char{ border-radius:16px; padding:11px 26px; text-align:center; }
      .el-char b{ font-family:"Playfair Display",Georgia,serif; font-style:italic; font-size:34px; color:#f5f0d0; line-height:1; } .el-char span{ display:block; font-size:17px; letter-spacing:.06em; text-transform:uppercase; color:rgba(255,255,255,.82); margin-top:4px; }
      .el-callout{ border-radius:14px; padding:11px 20px; font-size:27px; font-weight:600; }
      .el-callout .ic{ color:#f0c970; margin-right:8px; }
      .el-payoff{ border-radius:16px; padding:12px 22px; }
      .el-payoff div{ font-size:23px; font-weight:600; color:#fff; } .el-payoff b{ color:#f5f0d0; } .el-payoff span{ display:block; font-size:18px; color:var(--amber,#e9b24c); color:#e9b24c; margin-top:4px; font-weight:700; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="${CW}" data-height="${CH}" data-duration="${DURATION}" data-fps="${FPS}">
      <video id="bg-video" preload="auto" data-start="0" data-duration="${DURATION}" data-track-index="0" data-has-audio="true" src="edit/base.mp4"></video>
      <div class="caption-layer" aria-hidden="true"><div id="caption-stage" class="safe-zone"></div></div>
${elClips}
${sfxClips}
    </div>
    <script>
      var DURATION = ${DURATION};
      var SAFE_WIDTH = 860;
      var ENTRY_DUR = 0.1, SLIDE_DUR = 0.2;
      var _fc = document.createElement("canvas"), _ctx = _fc.getContext("2d");
      function fit(text, base, weight, family, maxW) { var s = base, m = Math.floor(base * 0.45); while (s > m) { _ctx.font = weight + " " + s + "px " + family; if (_ctx.measureText(text).width <= maxW) return s; s -= 2; } return m; }
      var W = ${JSON.stringify(W)};
      var BLOCKS = ${JSON.stringify(BLOCKS)};
      var CM = { n: "word word--normal", i: "word word--italic", e: "word word--emphasis" };
      function lineSize(p) { var hasE = p.some(function (x) { return x[1] === "e"; }); var t = p.map(function (x) { return W[x[0]].text; }).join(" "); return hasE ? fit(t, 120, "800", "Playfair Display", SAFE_WIDTH) : fit(t, 60, "400", "Inter", SAFE_WIDTH); }
      function build() {
        var stage = document.getElementById("caption-stage");
        BLOCKS.forEach(function (b, bi) {
          var el = document.createElement("div"); el.className = "caption-block"; el.id = "b" + bi;
          [["L1", b.line1], ["L2", b.line2]].forEach(function (pair) {
            var ln = pair[1]; if (!ln) return;
            var sz = lineSize(ln);
            var line = document.createElement("div"); line.className = "caption-line"; line.id = "b" + bi + pair[0];
            ln.forEach(function (p, wi) { var sp = document.createElement("span"); sp.className = CM[p[1]]; sp.id = "b" + bi + pair[0] + "w" + wi; sp.textContent = W[p[0]].text; sp.style.fontSize = sz + "px"; line.appendChild(sp); });
            el.appendChild(line);
          });
          stage.appendChild(el);
        });
      }
      build();
      (function () { BLOCKS.forEach(function (b, bi) { var el = document.getElementById("b" + bi); el.style.opacity = "1"; el.style.position = "relative"; var mw = 0; el.querySelectorAll(".caption-line").forEach(function (l) { if (l.scrollWidth > mw) mw = l.scrollWidth; }); if (mw > SAFE_WIDTH) el.style.transform = "scale(" + SAFE_WIDTH / mw + ")"; el.style.opacity = "0"; el.style.position = ""; }); })();
      window.__timelines = window.__timelines || {};
      var tl = gsap.timeline({ paused: true });
      var allEls = BLOCKS.map(function (_, i) { return document.getElementById("b" + i); });
      function bStart(bi) { return W[BLOCKS[bi].line1[0][0]].start; }
      BLOCKS.forEach(function (b, bi) {
        var el = allEls[bi], start = bStart(bi), next = bi < BLOCKS.length - 1 ? bStart(bi + 1) : DURATION;
        allEls.forEach(function (o, oi) { if (oi !== bi) tl.set(o, { opacity: 0 }, start); });
        tl.set(el, { opacity: 1 }, start);
        b.line1.forEach(function (p, wi) { var we = document.getElementById("b" + bi + "L1w" + wi); tl.set(we, { opacity: 0, scale: 1.12, transformOrigin: "0% 100%" }, start); tl.to(we, { opacity: 1, scale: 1, duration: ENTRY_DUR, ease: "power2.out" }, W[p[0]].start); });
        if (b.line2) {
          var hasE = b.line2.some(function (p) { return p[1] === "e"; }), l2 = document.getElementById("b" + bi + "L2");
          if (hasE) { tl.set(l2, { opacity: 0, x: -${CW} }, start); tl.to(l2, { opacity: 1, x: 0, duration: SLIDE_DUR, ease: "power2.out" }, W[b.line2[0][0]].start); }
          else { tl.set(l2, { opacity: 1 }, start); b.line2.forEach(function (p, wi) { var we = document.getElementById("b" + bi + "L2w" + wi); tl.set(we, { opacity: 0, scale: 1.12, transformOrigin: "0% 100%" }, start); tl.to(we, { opacity: 1, scale: 1, duration: ENTRY_DUR, ease: "power2.out" }, W[p[0]].start); }); }
        }
        tl.set(el, { opacity: 0 }, next);
      });
      // —— elementos glass ——
${elTweens}
      // —— ZOOM / push-ins no #bg-video ——
      // tensão (cicatriz→ataque): push leve e volta
      tl.set("#bg-video", { transformOrigin: "50% 44%" }, ${(tCic - 0.3).toFixed(2)});
      tl.fromTo("#bg-video", { scale: 1.0 }, { scale: 1.05, duration: 2.6, ease: "power1.inOut" }, ${(tCic - 0.3).toFixed(2)});
      tl.to("#bg-video", { scale: 1.0, duration: 1.6, ease: "power1.inOut" }, ${(tAtkEnd + 0.6).toFixed(2)});
      // clímax: push-in lento do payoff até o fim (zoom no hook)
      tl.set("#bg-video", { transformOrigin: "50% 36%" }, ${(tAcomp - 0.3).toFixed(2)});
      tl.to("#bg-video", { scale: 1.16, duration: ${(DURATION - (tAcomp - 0.3)).toFixed(2)}, ease: "power1.in" }, ${(tAcomp - 0.3).toFixed(2)});
      tl.to({}, { duration: DURATION }, 0);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(DIR, "index.html"), html);
console.log(`v4 Caso Rodrigo · ${BLOCKS.length} blocos · ${els.length} elementos · ${sfx.length} SFX · ${DURATION}s @ ${FPS}fps`);
console.log("heróis (s):", JSON.stringify(at));
console.log("triggers: rod=" + tRod + " cic=" + tCic + " atk=" + tAtk + " acomp=" + tAcomp + " aux=" + tAux + " hook=" + tHook);
