/*
 * build-v.cjs — IMG_7759 (checklist auxílio-acidente). Engine ORIGINAL caption-editorial-emphasis (base.json)
 * + elementos glass nas posições PADRÃO §4c + 3 CARDS NUMERADOS (checklist) + zoom no rosto no fecho + SFX.
 */
const fs = require("fs"), path = require("path");
const DIR = __dirname;
const tj = require(path.join(DIR, "edit", "transcripts", "base.json"));
const DURATION = +(tj.audio_duration_secs || 70.17).toFixed(3);
const CW = 1080, CH = 1920, FPS = 24;

const src = tj.words.filter((x) => x.type === "word");
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^0-9a-z]/gi, "");
const W = src.map((w) => ({ text: w.text.trim(), start: +w.start.toFixed(3), end: +w.end.toFixed(3) }));

const HEROES = ["auxilio-acidente", "trabalhando", "limitacao", "documentos", "facil"];
const emph = new Array(W.length).fill(false);
const at = {};
HEROES.forEach((h) => { const toks = h.split(" "); for (let i = 0; i <= W.length - toks.length; i++) { let ok = true; for (let k = 0; k < toks.length; k++) if (norm(W[i + k].text) !== toks[k]) { ok = false; break; } if (ok) { for (let k = 0; k < toks.length; k++) emph[i + k] = true; at[h] = W[i].start; break; } } });
const findStart = (t) => { t = norm(t); for (const x of W) if (norm(x.text) === t) return x.start; return -1; };

const groups = []; let cur = [];
for (let i = 0; i < W.length; i++) {
  const t = W[i].text; cur.push(i);
  const endsSentence = /[.?!]$/.test(t), endsClause = /[,;:]$/.test(t);
  const gap = i + 1 < W.length ? W[i + 1].start - W[i].end : 0;
  const hold = /^(auxilio|um|o|a|os|as|do|da|no|de|ao)$/i.test(norm(t));
  if (!hold && (endsSentence || cur.length >= 5 || (endsClause && cur.length >= 3) || (gap > 0.45 && cur.length >= 2))) { groups.push(cur); cur = []; }
  else if (cur.length >= 6) { groups.push(cur); cur = []; }
}
if (cur.length) groups.push(cur);
for (let i = groups.length - 1; i > 0; i--) if (groups[i].length === 1 && groups[i - 1].length + 1 <= 6) { groups[i - 1] = groups[i - 1].concat(groups[i]); groups.splice(i, 1); }

const BLOCKS = [];
groups.forEach((idxs) => {
  let rs = -1, re = -1;
  for (let k = 0; k < idxs.length; k++) { if (emph[idxs[k]]) { if (rs < 0) rs = k; re = k; } else if (rs >= 0) break; }
  if (rs < 0) { const all = idxs.map((i) => [i, "n"]); if (all.length <= 3) BLOCKS.push({ line1: all, line2: null }); else { const m = Math.ceil(all.length / 2); BLOCKS.push({ line1: all.slice(0, m), line2: all.slice(m) }); } }
  else { const lead = idxs.slice(0, rs).map((i) => [i, "n"]), heroes = idxs.slice(rs, re + 1).map((i) => [i, "e"]), trail = idxs.slice(re + 1).map((i) => [i, "n"]); if (lead.length) BLOCKS.push({ line1: lead, line2: heroes }); else BLOCKS.push({ line1: heroes, line2: null }); if (trail.length) BLOCKS.push({ line1: trail, line2: null }); }
});

// elementos: id + 3 cards numerados (checklist) — posição padrão §4c
const t1 = findStart("trabalhando"), t2 = at["limitacao"], t3 = findStart("documentos"), tViu = findStart("viu");
const els = [
  { id: "idcard", track: 3, start: 0, dur: 4.5, cls: "el-id", html: `<b>Dra. Wagnete Cruz</b><span>Advogada Previdenciária · OAB/MG</span>` },
  { id: "step1", track: 4, start: +(t1 - 0.3).toFixed(2), dur: 6.0, cls: "el-step", html: `<span class="num">1</span><div class="txt"><b>Você contribuía?</b><span>trabalhava · pagava o INSS</span></div>` },
  { id: "step2", track: 5, start: +(t2 - 0.3).toFixed(2), dur: 6.0, cls: "el-step", html: `<span class="num">2</span><div class="txt"><b>Ficou com limitação?</b><span>ligada à sua atividade</span></div>` },
  { id: "step3", track: 6, start: +(t3 - 0.3).toFixed(2), dur: 6.0, cls: "el-step", html: `<span class="num">3</span><div class="txt"><b>Tem os documentos?</b><span>da época do acidente</span></div>` },
];
const elClips = els.map((e) => `      <div id="${e.id}" class="clip el-pos" data-start="${e.start}" data-duration="${e.dur}" data-track-index="${e.track}"><div class="card ${e.cls}">${e.html}</div></div>`).join("\n");
const sfx = els.map((e, n) => ({ id: "sfx-" + e.id, t: e.start, file: "pop", tr: 20 + (n % 2) }));
sfx.push({ id: "sfx-zoom", t: +(tViu - 0.25).toFixed(2), file: "whoosh", tr: 22 });
const sfxClips = sfx.map((s) => `      <audio id="${s.id}" data-start="${s.t}" data-duration="0.6" data-track-index="${s.tr}" src="assets/sfx/${s.file}.wav"></audio>`).join("\n");
const elTweens = els.map((e) => `      tl.fromTo("#${e.id} .card", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, ${e.start});\n      tl.to("#${e.id} .card", { opacity: 0, duration: 0.3, ease: "power1.in" }, ${(e.start + e.dur - 0.3).toFixed(2)});`).join("\n");

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${CW}, height=${CH}" />
    <title>Dra. Wagnete — Checklist Auxílio-acidente</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family:"Inter"; font-weight:400; font-style:normal; src:url("assets/fonts/inter-400.woff2") format("woff2"); }
      @font-face { font-family:"Playfair Display"; font-weight:800; font-style:italic; src:url("assets/fonts/playfair-italic-800.woff2") format("woff2"); }
      *,*::before,*::after{ box-sizing:border-box; }
      html,body{ width:${CW}px; height:${CH}px; margin:0; overflow:hidden; background:#000; font-family:"Inter",sans-serif; }
      #root{ position:relative; width:${CW}px; height:${CH}px; overflow:hidden; }
      #bg-video{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transform-origin:50% 36%; will-change:transform; }
      .caption-layer{ position:absolute; inset:0; z-index:20; pointer-events:none; }
      .safe-zone{ position:absolute; top:1040px; left:60px; width:884px; height:290px; display:flex; align-items:flex-start; justify-content:flex-start; }
      .caption-block{ position:absolute; left:0; top:0; opacity:0; transform-origin:0% 0%; }
      .caption-line{ display:flex; align-items:baseline; gap:14px; line-height:1.1; white-space:nowrap; }
      .caption-line + .caption-line{ margin-top:8px; }
      .word{ display:inline-block; color:#f5f0d0; text-shadow:0 2px 14px rgba(0,0,0,.62),0 6px 30px rgba(0,0,0,.42); }
      .word--normal{ font-family:"Inter",sans-serif; font-size:60px; font-weight:400; }
      .word--italic{ font-family:"Inter",sans-serif; font-size:60px; font-weight:400; font-style:italic; }
      .word--emphasis{ font-family:"Playfair Display",Georgia,serif; font-size:120px; font-weight:800; font-style:italic; line-height:.9; color:#f5f0d0; }
      .el-pos{ position:absolute; left:60px; right:60px; bottom:49.5%; display:flex; justify-content:flex-start; pointer-events:none; }
      .card{ background:rgba(245,240,208,.16); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.5); box-shadow:0 10px 32px rgba(0,0,0,.34); color:#fff; }
      .el-id{ border-radius:16px; padding:11px 24px; text-align:center; }
      .el-id b{ font-size:25px; font-weight:700; color:#fff; } .el-id span{ display:block; font-size:16px; color:rgba(255,255,255,.84); margin-top:2px; }
      .el-step{ display:flex; align-items:center; gap:16px; border-radius:16px; padding:12px 24px 12px 20px; }
      .el-step .num{ font-family:"Playfair Display",Georgia,serif; font-style:italic; font-weight:800; font-size:52px; color:#f5f0d0; line-height:1; min-width:38px; text-align:center; }
      .el-step .txt b{ font-size:25px; font-weight:700; color:#fff; } .el-step .txt span{ display:block; font-size:16px; color:rgba(255,255,255,.82); margin-top:2px; }
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
      var DURATION = ${DURATION}, SAFE_WIDTH = 860, ENTRY_DUR = 0.1, SLIDE_DUR = 0.2;
      var _fc = document.createElement("canvas"), _ctx = _fc.getContext("2d");
      function fit(t, b, wt, fm, mw){ var s=b, m=Math.floor(b*0.45); while(s>m){ _ctx.font=wt+" "+s+"px "+fm; if(_ctx.measureText(t).width<=mw) return s; s-=2;} return m; }
      var W = ${JSON.stringify(W)};
      var BLOCKS = ${JSON.stringify(BLOCKS)};
      var CM = { n:"word word--normal", i:"word word--italic", e:"word word--emphasis" };
      function ls(p){ var h=p.some(function(x){return x[1]==="e";}); var t=p.map(function(x){return W[x[0]].text;}).join(" "); return h?fit(t,120,"800","Playfair Display",SAFE_WIDTH):fit(t,60,"400","Inter",SAFE_WIDTH); }
      function build(){ var st=document.getElementById("caption-stage"); BLOCKS.forEach(function(b,bi){ var el=document.createElement("div"); el.className="caption-block"; el.id="b"+bi; [["L1",b.line1],["L2",b.line2]].forEach(function(pr){ var ln=pr[1]; if(!ln)return; var sz=ls(ln); var line=document.createElement("div"); line.className="caption-line"; line.id="b"+bi+pr[0]; ln.forEach(function(p,wi){ var sp=document.createElement("span"); sp.className=CM[p[1]]; sp.id="b"+bi+pr[0]+"w"+wi; sp.textContent=W[p[0]].text; sp.style.fontSize=sz+"px"; line.appendChild(sp); }); el.appendChild(line); }); st.appendChild(el); }); }
      build();
      (function(){ BLOCKS.forEach(function(b,bi){ var el=document.getElementById("b"+bi); el.style.opacity="1"; el.style.position="relative"; var mw=0; el.querySelectorAll(".caption-line").forEach(function(l){ if(l.scrollWidth>mw)mw=l.scrollWidth; }); if(mw>SAFE_WIDTH) el.style.transform="scale("+SAFE_WIDTH/mw+")"; el.style.opacity="0"; el.style.position=""; }); })();
      window.__timelines = window.__timelines || {};
      var tl = gsap.timeline({ paused: true });
      var allEls = BLOCKS.map(function(_,i){ return document.getElementById("b"+i); });
      function bStart(bi){ return W[BLOCKS[bi].line1[0][0]].start; }
      BLOCKS.forEach(function(b,bi){ var el=allEls[bi], start=bStart(bi), next=bi<BLOCKS.length-1?bStart(bi+1):DURATION; allEls.forEach(function(o,oi){ if(oi!==bi) tl.set(o,{opacity:0},start); }); tl.set(el,{opacity:1},start); b.line1.forEach(function(p,wi){ var we=document.getElementById("b"+bi+"L1w"+wi); tl.set(we,{opacity:0,scale:1.12,transformOrigin:"0% 100%"},start); tl.to(we,{opacity:1,scale:1,duration:ENTRY_DUR,ease:"power2.out"},W[p[0]].start); }); if(b.line2){ var hasE=b.line2.some(function(p){return p[1]==="e";}), l2=document.getElementById("b"+bi+"L2"); if(hasE){ tl.set(l2,{opacity:0,x:-${CW}},start); tl.to(l2,{opacity:1,x:0,duration:SLIDE_DUR,ease:"power2.out"},W[b.line2[0][0]].start);} else { tl.set(l2,{opacity:1},start); b.line2.forEach(function(p,wi){ var we=document.getElementById("b"+bi+"L2w"+wi); tl.set(we,{opacity:0,scale:1.12,transformOrigin:"0% 100%"},start); tl.to(we,{opacity:1,scale:1,duration:ENTRY_DUR,ease:"power2.out"},W[p[0]].start); }); } } tl.set(el,{opacity:0},next); });
${elTweens}
      // —— ZOOM no rosto no fecho ("viu como é fácil...") ——
      tl.set("#bg-video", { transformOrigin: "50% 34%" }, ${(tViu - 0.3).toFixed(2)});
      tl.to("#bg-video", { scale: 1.14, duration: ${(DURATION - (tViu - 0.3)).toFixed(2)}, ease: "power1.in" }, ${(tViu - 0.3).toFixed(2)});
      tl.to({}, { duration: DURATION }, 0);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(DIR, "index.html"), html);
console.log(`IMG_7759 · ${BLOCKS.length} blocos · ${els.length} elementos · ${sfx.length} SFX · ${DURATION}s @ ${FPS}fps`);
console.log("triggers: step1=" + t1 + " step2=" + t2 + " step3=" + t3 + " zoom(viu)=" + tViu);
