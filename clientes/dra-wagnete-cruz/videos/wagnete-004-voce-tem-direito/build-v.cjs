/*
 * build-v.cjs — [004] "Você tem direito a receber" (auxílio-acidente).
 * FUNDAÇÃO 006 (1:1): engine ORIGINAL caption-editorial-emphasis (base.json) + cards glass lower-third
 * §4c (el-pos left:60 bottom:49.5%, tamanho 006) + zoom no rosto no fecho ("me procurar") + SFX.
 * + ELEMENTOS NOVOS de retenção na ZONA SUPERIOR (acima da cabeça, y170-340, livre nos frames reais):
 *   ícones de local (ping), timeline do processo (linha desenha + dots stagger), card de contraste glass,
 *   pattern-interrupt full-frame + zoom-punch no "Ninguém te contou isso?".
 */
const fs = require("fs"), path = require("path");
const DIR = __dirname;
const tj = require(path.join(DIR, "edit", "transcripts", "base.json"));
const DURATION = +(tj.audio_duration_secs || 115.5).toFixed(3);
const CW = 1080, CH = 1920, FPS = 24;

const src = tj.words.filter((x) => x.type === "word");
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^0-9a-z]/gi, "");
const W = src.map((w) => ({ text: w.text.trim(), start: +w.start.toFixed(3), end: +w.end.toFixed(3) }));

const HEROES = ["limitacao", "salario", "incapacidade temporaria", "auxilio-acidente", "administrativo", "judicial", "laudos"];
const emph = new Array(W.length).fill(false);
const at = {};
HEROES.forEach((h) => { const toks = h.split(" "); for (let i = 0; i <= W.length - toks.length; i++) { let ok = true; for (let k = 0; k < toks.length; k++) if (norm(W[i + k].text) !== toks[k]) { ok = false; break; } if (ok) { for (let k = 0; k < toks.length; k++) emph[i + k] = true; at[h] = W[i].start; break; } } });
const findStart = (t) => { t = norm(t); for (const x of W) if (norm(x.text) === t) return x.start; return -1; };
const findLast = (t) => { t = norm(t); let r = -1; for (const x of W) if (norm(x.text) === t) r = x.start; return r; };

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

// —— cards lower-third (fundação 006) ——
const tMeio = findStart("meio"), tAdmin = findStart("administrativo"), tLaudos = findStart("laudos"), tViu = findLast("procurar");
const els = [
  { id: "idcard",   track: 3, start: 0,                          dur: 5.0, cls: "el-id",   html: `<b>Dra. Wagnete Cruz</b><span>Advogada Previdenciária · OAB/MG</span>` },
  { id: "statcard", track: 4, start: +(tMeio - 0.3).toFixed(2),  dur: 6.5, cls: "el-stat", html: `<span class="big">½ salário</span><span class="sub">de contribuição · até a aposentadoria</span>` },
  { id: "proccard", track: 5, start: +(tAdmin - 1.6).toFixed(2), dur: 6.0, cls: "el-card", html: `<b>Como dar entrada</b><span>administrativo · ou · judicial</span>` },
  { id: "doccard",  track: 6, start: +(tLaudos - 3.4).toFixed(2),dur: 6.0, cls: "el-card", html: `<b>Documentos</b><span>do INSS + laudos atualizados</span>` },
];
const elClips = els.map((e) => `      <div id="${e.id}" class="clip el-pos" data-start="${e.start}" data-duration="${e.dur}" data-track-index="${e.track}"><div class="card ${e.cls}">${e.html}</div></div>`).join("\n");
const elTweens = els.map((e) => `      tl.fromTo("#${e.id} .card", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, ${e.start});\n      tl.to("#${e.id} .card", { opacity: 0, duration: 0.3, ease: "power1.in" }, ${(e.start + e.dur - 0.3).toFixed(2)});`).join("\n");

// —— ELEMENTOS NOVOS (zona superior) ——
const ICONS_START = 18.0, ICONS_DUR = 8.0;     // casa(18.3) trabalho(19.5) rua(20.8)
const TL_START = 29.0, TL_DUR = 13.0;          // incapacidade temporária → alta → volta ao trabalho
const CT_START = 46.0, CT_DUR = 8.2;           // Temporário × Auxílio-Acidente (até 54.2)
const PI_START = 54.5, PI_DUR = 2.4;           // "Ninguém te contou isso?" (54.7)
const ICO = {
  casa: `<svg viewBox="0 0 24 24" fill="none" stroke="#f5f0d0" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>`,
  trab: `<svg viewBox="0 0 24 24" fill="none" stroke="#f5f0d0" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7.5" width="18" height="12.5" rx="2"/><path d="M8.5 7.5V5.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"/><path d="M3 12.5h18"/></svg>`,
  rua:  `<svg viewBox="0 0 24 24" fill="none" stroke="#f5f0d0" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="4.5" r="2"/><path d="M13 8l-2.2 4.5 3 2.5 1.2 5"/><path d="M10.8 12.5L7.5 15"/><path d="M14.2 10.5l3.8 1.2"/></svg>`,
};
const tlMs = ["Acidente", "B. Temporário", "Alta", "limitação?", "Auxílio-Acidente"];
const tlDotTimes = [29.4, 31.6, 35.0, 39.5, 53.4]; // quando cada marco "acende"
const newClips = `
      <div id="iconsbox" class="clip icons-pos" data-start="${ICONS_START}" data-duration="${ICONS_DUR}" data-track-index="7">
        <div id="ic0" class="iconc">${ICO.casa}</div><div id="ic1" class="iconc">${ICO.trab}</div><div id="ic2" class="iconc">${ICO.rua}</div>
      </div>
      <div id="tlbox" class="clip tl-pos" data-start="${TL_START}" data-duration="${TL_DUR}" data-track-index="8">
        <div class="tl-line"><div id="tlfill" class="tl-fill"></div></div>
        <div class="tl-row">${tlMs.map((m, i) => `<div id="ms${i}" class="ms"><span class="dot"></span><span class="lbl">${m}</span></div>`).join("")}</div>
      </div>
      <div id="ctbox" class="clip ct-pos" data-start="${CT_START}" data-duration="${CT_DUR}" data-track-index="9">
        <div id="ctbad" class="ctc bad"><b>Temporário</b><span>cessa após a alta</span></div>
        <div id="ctgood" class="ctc good"><b>Auxílio-Acidente</b><span>fica enquanto há limitação</span></div>
      </div>
      <div id="pibox" class="clip pi-pos" data-start="${PI_START}" data-duration="${PI_DUR}" data-track-index="10">
        <div id="piscrim" class="pi-scrim"></div><div id="pitext" class="pi-text">Ninguém te<br>contou isso?</div>
      </div>`;

// —— SFX ——
const sfx = els.map((e, n) => ({ id: "sfx-" + e.id, t: e.start, file: "pop", tr: 20 + (n % 2) }));
sfx.push({ id: "sfx-ic0", t: 18.3, file: "ping", tr: 22 }, { id: "sfx-ic1", t: 19.5, file: "ping", tr: 23 }, { id: "sfx-ic2", t: 20.8, file: "ping", tr: 22 });
sfx.push({ id: "sfx-tl", t: TL_START + 0.3, file: "pop", tr: 23 }, { id: "sfx-ct", t: CT_START + 0.2, file: "pop", tr: 22 });
sfx.push({ id: "sfx-pi", t: PI_START + 0.1, file: "whoosh", tr: 23 }, { id: "sfx-zoom", t: +(tViu - 0.25).toFixed(2), file: "whoosh", tr: 22 });
const sfxClips = sfx.map((s) => `      <audio id="${s.id}" data-start="${s.t}" data-duration="0.6" data-track-index="${s.tr}" src="assets/sfx/${s.file}.wav"></audio>`).join("\n");

// —— tweens dos novos ——
const dotTweens = tlDotTimes.map((t, i) => `      tl.to("#ms${i} .dot", { backgroundColor: "#c8881e", borderColor: "#f5f0d0", scale: 1.18, duration: 0.22, ease: "power2.out" }, ${t});\n      tl.to("#ms${i} .lbl", { color: "#f0d49a", duration: 0.22 }, ${t});\n      tl.to("#ms${i} .dot", { scale: 1, duration: 0.2 }, ${(t + 0.22).toFixed(2)});`).join("\n");
const newTweens = `
      // ícones de local — entram 1 a 1 (ping)
      tl.fromTo("#ic0", { opacity: 0, scale: 0.55, y: -8 }, { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: "power2.out" }, 18.3);
      tl.fromTo("#ic1", { opacity: 0, scale: 0.55, y: -8 }, { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: "power2.out" }, 19.5);
      tl.fromTo("#ic2", { opacity: 0, scale: 0.55, y: -8 }, { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: "power2.out" }, 20.8);
      tl.to("#iconsbox", { opacity: 0, duration: 0.4, ease: "power1.in" }, ${(ICONS_START + ICONS_DUR - 0.4).toFixed(2)});
      // timeline — caixa surge, linha desenha, dots acendem em stagger
      tl.fromTo("#tlbox .tl-line, #tlbox .ms", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" }, ${TL_START});
      tl.fromTo("#tlfill", { width: "0%" }, { width: "100%", duration: 9.5, ease: "none" }, ${TL_START + 0.4});
${dotTweens}
      tl.to("#tlbox", { opacity: 0, duration: 0.4, ease: "power1.in" }, ${(TL_START + TL_DUR - 0.4).toFixed(2)});
      // card de contraste — dois cards entram dos lados
      tl.fromTo("#ctbad", { opacity: 0, x: -28 }, { opacity: 1, x: 0, duration: 0.36, ease: "power2.out" }, ${CT_START});
      tl.fromTo("#ctgood", { opacity: 0, x: 28 }, { opacity: 1, x: 0, duration: 0.36, ease: "power2.out" }, ${CT_START + 1.2});
      tl.to("#ctbox", { opacity: 0, duration: 0.4, ease: "power1.in" }, ${(CT_START + CT_DUR - 0.4).toFixed(2)});
      // pattern-interrupt — scrim + texto bump + zoom-punch no rosto
      tl.fromTo("#piscrim", { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power1.out" }, ${PI_START});
      tl.fromTo("#pitext", { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }, ${PI_START + 0.06});
      tl.to("#bg-video", { scale: 1.07, duration: 0.16, ease: "power2.out" }, ${PI_START + 0.06});
      tl.to("#bg-video", { scale: 1.0, duration: 0.5, ease: "power2.inOut" }, ${PI_START + 0.28});
      tl.to("#piscrim, #pitext", { opacity: 0, duration: 0.3, ease: "power1.in" }, ${(PI_START + PI_DUR - 0.35).toFixed(2)});`;

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${CW}, height=${CH}" />
    <title>Dra. Wagnete — [004] Você tem direito a receber</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family:"Inter"; font-weight:400; font-style:normal; src:url("assets/fonts/inter-400.woff2") format("woff2"); }
      @font-face { font-family:"Playfair Display"; font-weight:800; font-style:italic; src:url("assets/fonts/playfair-italic-800.woff2") format("woff2"); }
      *,*::before,*::after{ box-sizing:border-box; }
      html,body{ width:${CW}px; height:${CH}px; margin:0; overflow:hidden; background:#000; font-family:"Inter",sans-serif; }
      #root{ position:relative; width:${CW}px; height:${CH}px; overflow:hidden; }
      #bg-video{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transform-origin:50% 34%; will-change:transform; }
      .caption-layer{ position:absolute; inset:0; z-index:20; pointer-events:none; }
      .safe-zone{ position:absolute; top:1040px; left:60px; width:884px; height:290px; display:flex; align-items:flex-start; justify-content:flex-start; }
      .caption-block{ position:absolute; left:0; top:0; opacity:0; transform-origin:0% 0%; }
      .caption-line{ display:flex; align-items:baseline; gap:14px; line-height:1.1; white-space:nowrap; }
      .caption-line + .caption-line{ margin-top:8px; }
      .word{ display:inline-block; color:#f5f0d0; text-shadow:0 2px 14px rgba(0,0,0,.62),0 6px 30px rgba(0,0,0,.42); }
      .word--normal{ font-family:"Inter",sans-serif; font-size:60px; font-weight:400; }
      .word--italic{ font-family:"Inter",sans-serif; font-size:60px; font-weight:400; font-style:italic; }
      .word--emphasis{ font-family:"Playfair Display",Georgia,serif; font-size:120px; font-weight:800; font-style:italic; line-height:.9; color:#f5f0d0; }
      /* cards lower-third (006) */
      .el-pos{ position:absolute; left:60px; right:60px; bottom:49.5%; display:flex; justify-content:flex-start; pointer-events:none; }
      .card{ background:rgba(245,240,208,.16); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.5); box-shadow:0 10px 32px rgba(0,0,0,.34); color:#fff; }
      .el-id,.el-card{ border-radius:16px; padding:11px 24px; text-align:center; }
      .el-id b,.el-card b{ font-size:25px; font-weight:700; color:#fff; } .el-id span,.el-card span{ display:block; font-size:16px; color:rgba(255,255,255,.84); margin-top:2px; }
      .el-stat{ border-radius:16px; padding:12px 26px; text-align:center; }
      .el-stat .big{ display:block; font-family:"Playfair Display",Georgia,serif; font-style:italic; font-weight:800; font-size:46px; color:#f5f0d0; line-height:1; }
      .el-stat .sub{ display:block; font-size:16px; color:rgba(255,255,255,.84); margin-top:4px; }
      /* ZONA SUPERIOR (acima da cabeça) — glass cream, consistente */
      .glass{ background:rgba(245,240,208,.16); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.5); box-shadow:0 8px 24px rgba(0,0,0,.32); }
      .icons-pos{ position:absolute; left:0; right:0; top:178px; z-index:18; display:flex; justify-content:center; gap:36px; pointer-events:none; }
      .iconc{ width:128px; height:128px; border-radius:50%; background:rgba(245,240,208,.16); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.5); box-shadow:0 8px 24px rgba(0,0,0,.32); display:flex; align-items:center; justify-content:center; }
      .iconc svg{ width:64px; height:64px; }
      .tl-pos{ position:absolute; left:70px; right:70px; top:196px; z-index:18; pointer-events:none; }
      .tl-line{ position:absolute; left:9%; right:9%; top:16px; height:4px; background:rgba(255,255,255,.42); border-radius:3px; overflow:hidden; }
      .tl-fill{ position:absolute; left:0; top:0; height:100%; width:0; background:#c8881e; border-radius:3px; }
      .tl-row{ display:flex; position:relative; z-index:1; }
      .ms{ flex:1; display:flex; flex-direction:column; align-items:center; }
      .ms .dot{ width:24px; height:24px; border-radius:50%; background:#cdbf9f; border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.4); }
      .ms .lbl{ margin-top:11px; font-size:21px; font-weight:700; color:#fff; text-shadow:0 2px 8px rgba(0,0,0,.85); text-align:center; line-height:1.1; max-width:175px; }
      .ct-pos{ position:absolute; left:70px; right:70px; top:182px; z-index:18; display:flex; gap:20px; pointer-events:none; }
      .ctc{ flex:1; border-radius:18px; padding:18px 20px; background:rgba(245,240,208,.18); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.5); box-shadow:0 8px 24px rgba(0,0,0,.32); }
      .ctc.bad{ border-top:5px solid #c0492f; } .ctc.good{ border-top:5px solid #2f7d52; }
      .ctc b{ display:block; font-size:30px; font-weight:800; text-shadow:0 2px 8px rgba(0,0,0,.5); } .ctc.bad b{ color:#e3613f; } .ctc.good b{ color:#4fb37e; }
      .ctc span{ display:block; font-size:19px; color:rgba(255,255,255,.92); margin-top:6px; text-shadow:0 2px 8px rgba(0,0,0,.7); }
      .pi-pos{ position:absolute; inset:0; z-index:19; }
      .pi-scrim{ position:absolute; inset:0; background:rgba(18,15,12,.34); opacity:0; }
      .pi-text{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; text-align:center; font-family:"Playfair Display",Georgia,serif; font-style:italic; font-weight:800; color:#fff; font-size:96px; line-height:1.02; text-shadow:0 6px 30px rgba(0,0,0,.6); opacity:0; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="${CW}" data-height="${CH}" data-duration="${DURATION}" data-fps="${FPS}">
      <video id="bg-video" preload="auto" data-start="0" data-duration="${DURATION}" data-track-index="0" data-has-audio="true" src="edit/base.mp4"></video>
      <div class="caption-layer" aria-hidden="true"><div id="caption-stage" class="safe-zone"></div></div>
${elClips}
${newClips}
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
${newTweens}
      // —— ZOOM no rosto no fecho ("me procurar") ——
      tl.set("#bg-video", { transformOrigin: "50% 32%" }, ${(tViu - 0.3).toFixed(2)});
      tl.to("#bg-video", { scale: 1.14, duration: ${(DURATION - (tViu - 0.3)).toFixed(2)}, ease: "power1.in" }, ${(tViu - 0.3).toFixed(2)});
      tl.to({}, { duration: DURATION }, 0);
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(DIR, "index.html"), html);
console.log(`[004] · ${BLOCKS.length} blocos · ${els.length} cards + 4 novos · ${sfx.length} SFX · ${DURATION}s @ ${FPS}fps`);
console.log("novos: icons@18 timeline@29 contraste@46 interrupt@54.5 | zoom(procurar)=" + tViu);
