/*
 * build-captions.cjs — gera index.html (HyperFrames) com legenda RAIL estilo `anchor`
 * para o vídeo da Dra. Wagnete, conforme clientes/dra-wagnete-cruz/direcao-video.md:
 *   - rail lower-third sóbrio, fonte grande, alto contraste (público sênior)
 *   - verbatim seletivo agrupado em frases curtas (2-5 palavras, fronteiras de oração)
 *   - ênfase (accent) em NÚMEROS de prova e NOMES DE BENEFÍCIO
 *   - sem neon/glitch/firula; entrada discreta (fade+rise)
 *
 * Lê:    edit/transcripts/source.json (ElevenLabs Scribe, word-level)
 * Gera:  index.html  (referencia source.mp4 no mesmo dir)
 */
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const tj = require(path.join(DIR, "edit", "transcripts", "source.json"));
const DURATION = +(tj.audio_duration_secs || 66.27).toFixed(3);
const W = 1080, H = 1920, FPS = 30;

// ── termos que ganham ênfase (números de prova + nomes de benefício traduzidos) ──
const EMPH = new Set([
  "auxílio", "auxilio", "acidente", "doença", "doenca",
  "incapacidade", "temporária", "temporaria",
  "aposentadoria", "retroativos", "retroativo",
  "2025", "cinco", "anos",
]);
const norm = (s) => s.toLowerCase().replace(/^[^0-9a-zà-ú]+|[^0-9a-zà-ú]+$/gi, "");

// ── agrupar palavras em legendas curtas ──
const words = tj.words.filter((w) => w.type === "word");
const groups = [];
let cur = [];
for (let i = 0; i < words.length; i++) {
  const w = words[i];
  cur.push(w);
  const t = w.text.trim();
  const endsSentence = /[.?!]$/.test(t);
  const endsClause = /[,;:]$/.test(t);
  const next = words[i + 1];
  const gap = next ? next.start - w.end : 0;
  const n = cur.length;
  // não quebra logo após "auxílio" / "incapacidade" / "por" (mantém o nome do benefício junto)
  const holdsPhrase = /^(auxílio|auxilio|incapacidade|por|o|a|os|as|do|da)$/i.test(norm(t));
  if (!holdsPhrase && (endsSentence || n >= 5 || (endsClause && n >= 3) || (gap > 0.45 && n >= 2))) {
    groups.push(cur);
    cur = [];
  } else if (n >= 6) {
    groups.push(cur);
    cur = [];
  }
}
if (cur.length) groups.push(cur);

// merge órfãs de 1 palavra na legenda anterior (evita "temporária?" sozinha)
for (let i = groups.length - 1; i > 0; i--) {
  if (groups[i].length === 1 && groups[i - 1].length + 1 <= 6) {
    groups[i - 1] = groups[i - 1].concat(groups[i]);
    groups.splice(i, 1);
  }
}

// ── timing: cada legenda fica no ar até a próxima entrar (sem buracos) ──
const caps = groups.map((g, i) => {
  const show = i === 0 ? 0 : g[0].start;
  const hide = i < groups.length - 1 ? groups[i + 1][0].start : DURATION;
  const html = g
    .map((w) => {
      const txt = w.text.trim();
      return EMPH.has(norm(txt)) ? `<span class="em">${txt}</span>` : txt;
    })
    .join(" ");
  return { i, show: +show.toFixed(3), dur: +(hide - show - 0.001).toFixed(3), html };
});

// ── HTML ──
const clips = caps
  .map(
    (c) =>
      `      <div id="cap-${c.i}" class="clip cap" data-start="${c.show}" data-duration="${c.dur}" data-track-index="2"><div class="cap-box">${c.html}</div></div>`,
  )
  .join("\n");

const tweens = caps
  .map(
    (c) =>
      `      tl.from("#cap-${c.i} .cap-box", { opacity: 0, y: 14, duration: 0.22, ease: "power2.out" }, ${c.show});`,
  )
  .join("\n");

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>Dra. Wagnete — Auxílios (legendado)</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #000; font-family: "Segoe UI", system-ui, Arial, sans-serif; }
      #root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; }
      #bg { width: ${W}px; height: ${H}px; object-fit: cover; }
      /* RAIL lower-third — sóbrio, legível p/ público sênior */
      .cap {
        position: absolute;
        left: 0; right: 0;
        bottom: 300px;            /* acima da área de UI mobile (9:16) */
        display: flex;
        justify-content: center;
        padding: 0 56px;
      }
      .cap-box {
        max-width: 920px;
        background: rgba(8, 12, 18, 0.72);
        border-radius: 22px;
        padding: 22px 34px;
        text-align: center;
        color: #fff;
        font-weight: 700;
        font-size: 60px;
        line-height: 1.18;
        letter-spacing: -0.01em;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(2px);
      }
      .cap-box .em { color: #ffc861; font-weight: 800; }  /* ênfase sóbria (âmbar), não neon */
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="${W}" data-height="${H}" data-duration="${DURATION}" data-fps="${FPS}">
      <video id="bg" data-start="0" data-duration="${DURATION}" data-track-index="0" data-has-audio="true" src="source.mp4"></video>
${clips}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
${tweens}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

fs.writeFileSync(path.join(DIR, "index.html"), html);
console.log(`index.html gerado · ${caps.length} legendas · ${DURATION}s · ${W}x${H}@${FPS}`);
console.log("primeiras 6 legendas:");
caps.slice(0, 6).forEach((c) => console.log(`  [${c.show}s +${c.dur}s] ${c.html.replace(/<[^>]+>/g, "")}`));
