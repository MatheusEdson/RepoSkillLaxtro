---
name: laxtro-video
description: Vestir o vídeo PRONTO de um cliente Laxtro com legendas, overlays e o repertório do HyperFrames — respeitando o DNA da marca. Pega a footage já editada do cliente, lê o dna.md + direcao-video.md dele, escolhe a identidade de legenda/overlay travada pela marca e dirige o HyperFrames até o MP4 final. Use quando o Joseph pedir pra legendar / animar / finalizar / "dar acabamento" num vídeo de um cliente (Dra. Wagnete, Studio Habttah, Dra. Daniella Freitas...).
---

# Laxtro — Acabamento de Vídeo pelo DNA do Cliente

**Você é o AIOS do Joseph.** Ele te entrega um vídeo **já editado** do cliente (corte pronto, take limpo) e diz o que quer ("legenda esse", "bota lower-third", "dá um acabamento"). **VOCÊ executa**: lê o DNA da marca, aplica a direção de vídeo travada, dirige o HyperFrames e devolve o MP4 final — **como se já dominasse a ferramenta**, porque a marca já está decidida no arquivo.

> O objetivo desta skill: o Joseph nunca reexplica a marca. O DNA + a direção de vídeo fazem o HyperFrames sair "com a cara do cliente" de primeira.

---

## Regra de ouro — LEIA ANTES DE TOCAR NO VÍDEO

> **Antes de qualquer render, leia os DOIS arquivos do cliente:**
> 1. [`clientes/<cliente>/dna.md`](../../../clientes) — a fonte da verdade da marca (voz, público, proibições).
> 2. [`clientes/<cliente>/direcao-video.md`](../../../clientes) — a **política de vídeo travada** derivada do DNA (tema de legenda, ênfase, ritmo, overlays, proibições visuais, formato).

O `direcao-video.md` é o que te faz "dominar a ferramenta": ele já decidiu a identidade de legenda, o que enfatizar, o ritmo, as **posições padrão (§4c)** e o que é **proibido**. Você **não reabre essas escolhas** a cada vídeo — você as aplica. Só muda se o Joseph pedir refino (e aí o refino vai PRA DENTRO do `direcao-video.md`, não fica solto).

---

## O modelo — pipeline de 2 ESTÁGIOS (travado)

```
[Joseph entrega: vídeo do cliente .mp4/.mov]
        │
        ▼
[0] Lê dna.md + direcao-video.md do cliente   ← a marca, decidida (regra de ouro)
        │
        ▼
ESTÁGIO 1 — CORTE  (skill `video-use`)
   transcrever (ElevenLabs Scribe, word-level) → cortar silêncios / refações / slate / bastidor
   (montar EDL → helpers/render.py) → base.mp4 → RE-TRANSCREVER o base (timings limpos)
        │
        ▼
ESTÁGIO 2 — ACABAMENTO  (HyperFrames)
   legenda editorial (componente `caption-editorial-emphasis`, engine original) +
   elementos glass nas posições §4c + SFX por elemento + push-ins / zoom no fecho
   → lint → snapshot QA → render
        │
        ▼
[QA contra as PROIBIÇÕES]  →  MP4 final em videos/<projeto>/edit/  →  avisa o Joseph
```

> A skill **CORTA e VESTE** o vídeo. **NÃO pule o Estágio 1** — mesmo footage marcada "Refinado" costuma ter
> silêncios, refações, slate ("um, dois, três e gravando") e bastidor no fim pra remover. Corte = `video-use`;
> acabamento = HyperFrames. (Só pula o corte se o Joseph disser explicitamente "já está cortado".)

---

## O loop de uma tarefa (você executa)

1. **Identifique o cliente e o vídeo.** Copie a footage pra `clientes/<cliente>/videos/<projeto>/source.*`.
2. **Leia `dna.md` + `direcao-video.md`** do cliente. Sem isso, pare e leia — é a regra de ouro.
3. **ESTÁGIO 1 — corte (`video-use`):** `python skills/video-use/helpers/transcribe.py <source>` (Scribe, PT, word-level).
   Leia o transcript, mapeie silêncios/refações/slate/bastidor, monte um **EDL** (keep-ranges em fronteira de palavra,
   pad ~50-80ms) e rode `helpers/render.py edl.json -o edit/base.mp4 --no-subtitles`
   (use `PYTHONIOENCODING=utf-8` no Windows). **Re-transcreva o `base.mp4`** pra ter timings limpos.
4. **ESTÁGIO 2 — acabamento (HyperFrames):** gere `index.html` com um script `build-*.cjs` que:
   - alimenta o componente **`caption-editorial-emphasis`** (engine original) com a transcrição do `base`;
   - marca a **ênfase escassa/curada** (heróis do direcao-video) como Playfair itálico;
   - adiciona os **elementos glass** (id padrão, cards, callouts) nas **posições §4c** com **SFX** (pop) por aparição;
   - adiciona **push-ins/zoom** quando o direcao-video pedir (ex: zoom no rosto no fecho/CTA, whoosh).
   `npx hyperframes lint .` → `snapshot` pra QA → `render -f <fps do base> --low-memory-mode`.
5. **QA obrigatório contra as PROIBIÇÕES** ANTES de entregar: sem promessa/urgência fake/política/estética vendedora;
   formato 9:16; **safe zones do Reels** (legenda/elementos fora das zonas mortas, ver §4c + não-negociáveis).
6. **Entregue** o MP4 final em `videos/<projeto>/edit/` e avise o Joseph. **Não suba pro Drive sem OK dele.**
7. **Refino → vira padrão:** todo ajuste que o Joseph pedir (posição, cor, tamanho, SFX, zoom) vai PRA DENTRO do
   `direcao-video.md` — assim o próximo vídeo já nasce certo, sem ele reexplicar.

---

## Mapa dos clientes

| Cliente | Pasta | Tema de legenda travado |
|---|---|---|
| **Dra. Wagnete Cruz** — previdenciário B2C | `clientes/dra-wagnete-cruz/` | `caption-editorial-emphasis` (creme; engine original; posições §4c) |
| **Dra. Daniella Freitas** — estética B2C | `clientes/dra-daniella-freitas/` | ⏳ `direcao-video.md` a criar |
| **Studio Habttah** — fitness premium B2C | `clientes/studio-habttah/` | ⏳ `direcao-video.md` a criar |

Cada cliente: leia o `dna.md` (fonte da verdade) e o `direcao-video.md` (política travada). Se faltar `direcao-video.md`, **derive-o do `dna.md` e mostre pro Joseph validar antes de renderizar** (mesmo formato da Wagnete).

---

## As ferramentas que você dirige (não reimplemente — invoque)

- **`video-use`** (`skills/video-use/`) — ESTÁGIO 1. `helpers/transcribe.py` (ElevenLabs Scribe, word-level, cache),
  `helpers/render.py` (EDL → extrai segmentos → concat → loudnorm). É o que corta silêncio/refação/bastidor.
- **`caption-editorial-emphasis`** — componente HyperFrames (registry, instalado em `compositions/components/`).
  É a **engine de legenda** da Wagnete: corpo Inter creme + termo-chave em Playfair itálico. Use a **engine original**
  (anima entrada palavra-a-palavra + ênfase deslizando) alimentada com a transcrição — NÃO reimplemente o estilo estático.
- **`hyperframes` CLI** (`npx hyperframes`) — `lint`, `snapshot`, `render`. Fonts/SFX locais ficam em `<projeto>/assets/`.
- Skills HyperFrames de referência em `skills/HyperFrames/` (`embedded-captions` CATALOG, `graphic-overlays`,
  `hyperframes-animation` pra count-up/zoom) — consulta de repertório.

Você é a **camada de política de marca** por cima dessas ferramentas. Elas sabem *fazer*; você sabe *fazer com a cara do cliente*.

---

## Não-negociáveis

- **Leia os dois `.md` do cliente antes de renderizar.** Sempre.
- **Pipeline de 2 estágios — SEMPRE.** Estágio 1 corta (`video-use`: transcreve → EDL → base.mp4 → re-transcreve),
  Estágio 2 veste (HyperFrames: legenda editorial + elementos + SFX + zoom). NÃO pule o corte só porque o vídeo parece pronto.
- **Nunca regrade/recolore a footage** além do loudnorm do corte. Legenda / elementos / SFX / zoom são a única adição.
- **As PROIBIÇÕES do `direcao-video.md` são lei.** Na dúvida entre um efeito legal e uma proibição da marca, a proibição ganha.
- **Safe zones do Reels/Stories (9:16) — lei de posição.** O Instagram cobre as bordas com a própria UI. Zonas mortas: **inferior ~30% (~580px)** = @usuário/legenda/áudio · **direita ~120px** = coluna de ícones (curtir/comentar/share) · **topo ~120-160px** = status/som. Área segura ≈ `x:60–960 · y:220–1340`. Por isso: **legendas em `bottom:~35%`** (acima da zona morta inferior), **cards da direita em `right:~13%`** (fora da coluna de ícones), **topo em `top:8–12%`**. NUNCA texto/elemento importante dentro de uma zona morta.
- **Visual ainda é STUB** (paleta/fontes) nos clientes — não invente cor de marca; use os defaults legíveis do tema travado até o Joseph fechar a parte visual.
- **Preview antes de render.** Render custa minutos; `preview-frames.cjs` custa segundos.
- **Não publica nada externo (Drive/redes) sem OK explícito do Joseph.**
