# Direção de Vídeo — Dra. Wagnete Cruz

> Camada de tradução **DNA → escolhas de vídeo**. Derivada de [`dna.md`](dna.md).
> Decidida 1x, travada, reusada em todo vídeo. Refinar aqui quando um vídeo pedir ajuste.
> Visual (paleta/fontes/logo) ainda é STUB — preencher quando a marca fechar.

---

## 1. Identidade de legenda

- **Padrão travado:** componente **`caption-editorial-emphasis`** (instalável via
  `npx hyperframes add caption-editorial-emphasis`). Corpo da fala em Inter limpo;
  a palavra-chave vira um **display grande em Playfair itálico serifado** — destaque
  editorial sóbrio, sem neon.
- **Verbatim:** SELETIVO. Não embute toda palavra; o corpo lê, e SÓ o termo-chave
  (nome de benefício / número) sobe pra ênfase serifada.
- **Legibilidade:** fonte grande, alto contraste — público sênior assiste no celular.
  Manter a legenda no terço inferior, nunca cobrindo o rosto.

## 2. Ênfase (o que ganha destaque / glow / burst)

- **Números de prova social:** "476 processos", "8 de 10 atendimentos".
- **Nomes de benefício traduzidos:** auxílio-doença, BPC/LOAS, auxílio-acidente,
  aposentadoria por idade. (Nunca o juridiquês equivalente.)
- **Linguagem crua do cliente** — os termos do dia a dia, nunca o termo técnico.

## 3. Ritmo & energia

- **Calmo e constante** (beat ~0.12s entre segmentos, como no projeto IMG_7762).
  Sem cortes frenéticos, sem jump-cut agressivo.
- Energia de **"conversa de feira"**, não de "anúncio".

## 4. Overlays (`graphic-overlays`)

- **Lower-third padrão:** `Dra. Wagnete Cruz · Advogada Previdenciária · OAB/MG`.
- **Card de localização:** quando o conteúdo for presença off-line (feira livre de
  Santa Mônica/João Pinheiro, posto de caminhão, bairro).
- **Card de número:** quando citar prova social (processos, conversão).
- **Disclaimer leve** quando citar caso real: "história real, nome preservado".

## 4b. Biblioteca de elementos animados — FORMATO FIXO

> Este é o coração da direção: o mapa **gatilho na fala → elemento → mecanismo HyperFrames**.
> Decidido uma vez, reusado em TODO vídeo da Wagnete. É o que faz a skill "já dominar a ferramenta"
> em vez de reinventar o vídeo a cada peça. (Storyboard de referência:
> `videos/wagnete-003-auxilios/storyboard/index.html`.)

| Quando (gatilho na fala) | Elemento | Mecanismo HyperFrames |
|---|---|---|
| Corpo da fala (sempre) | Legenda editorial-emphasis (rail sóbrio; termo-chave em Playfair itálico) | `caption-editorial-emphasis` |
| Nome de benefício (auxílio-acidente, auxílio-doença, BPC/LOAS) | Vira o display de ênfase + glow leve | `caption-editorial-emphasis` + `asr-keyword-glow` |
| Número de prova (2025, "5 anos", R$, "8 de 10") | Card de número com contagem (count-up) | `hook-counter-burst` / `counting-dynamic-scale` |
| Jargão que ela traduz (retroativos, carência…) | Sublinhado/marker na palavra | `css-marker-patterns` |
| Regra / alerta / "dica importante" | Chip callout que desliza (cor sóbria) | `graphic-overlays` callout |
| Prova social / casos reais | Chip de prova (sem nomes) | `graphic-overlays` |
| Abertura (identificação) | **Lower-third id PADRÃO** (ver §4c) — glass, à esquerda acima da legenda | layer glass |
| Fechamento / CTA | **Sem lower-third** — a própria legenda fecha (ex.: "me chama aqui") | `caption-editorial-emphasis` |

**Estética dos elementos (trava):** cards/callouts seguem a paleta da legenda — **creme/branco translúcido com blur (glass)**,
cantos suaves, **nunca sobre o rosto** da Wagnete. Sem fundo escuro pesado, sem borda chamativa. Tamanho contido (não dominar a tela).
- **Posição:** alinhados à **esquerda** (mesma margem da legenda), **logo acima da legenda** com **gap proporcional** (não colado).
- **Som:** **SFX (pop glass) a cada aparição** de elemento — audível sobre a voz (pico ~-2 dB), pra sinalizar o dinamismo.

**Engine de legenda:** usar o componente **original** `caption-editorial-emphasis` (engine real, com as transições — entrada palavra-a-palavra
+ ênfase deslizando), alimentado com a transcrição. NÃO reimplementar o estilo estático.

## 4c. Posições padrão (ESTRUTURAL — travado)

> Valores exatos do render aprovado (vídeo 03 / `final_v4`). Composição **1080×1920**.

**Legenda (caption-stage) — SEMPRE estas posições:**
`top:1040px · left:60px · width:884px · height:290px` — alinhada à **esquerda**, no **terço inferior-médio**
(≈54% do topo), terminando acima da zona morta inferior do Reels; largura 884 mantém fora da coluna de ícones (direita).
Engine: ênfase Playfair itálico ~120px (auto-fit), corpo Inter ~60px, cor creme `#f5f0d0`.

**Elementos (glass):** `left:60px · bottom:49.5%` — alinhados à **esquerda na mesma margem da legenda (60px)**,
**logo acima da legenda** com **gap proporcional (~70px)**, menores que a legenda, nunca sobre o rosto.

**Lower-third de identificação (PADRÃO ÚNICO — usar IGUAL em todos os vídeos):**
- Conteúdo: linha 1 **Dra. Wagnete Cruz** · linha 2 `Advogada Previdenciária · OAB/MG`.
- Estilo: **glass creme** (igual aos outros elementos); nome ~25px bold branco, subtítulo ~16px branco translúcido;
  **sem dot/ícone decorativo** (mantém limpo).
- Posição: na faixa de elementos (à esquerda, acima da legenda). Janela ~0–5s + SFX pop na entrada.

> **Ressalva — posição dos ELEMENTOS é contextual:** a **legenda** fica SEMPRE nessas posições. Já os **elementos**
> podem ir pra outras posições quando o **contexto do vídeo** pedir (enquadramento, ação na tela, onde está o rosto).
> Regra prática: **mesmo cenário do vídeo anterior → mesmas posições**; cenário/enquadramento diferente → reposicionar
> respeitando as travas (glass, fora do rosto, safe zone do Reels). O **Lower-third id** é fixo (não muda entre vídeos).

> **Como generaliza pros outros clientes:** o `direcao-video.md` de cada cliente tem ESTA mesma tabela,
> mas com a identidade de legenda e os elementos calibrados pro DNA dele (ex.: estética/fitness podem usar
> identidade mais energética e cards de antes/depois; previdenciário fica sóbrio). A ESTRUTURA é fixa; o
> CONTEÚDO muda por DNA.

## 4d. Validação de posição — REGRAS TRAVADAS (lições do [004])

1. **Valide SEMPRE em frame REAL, nunca em mock HTML.** O storyboard de aprovação é feito com
   `hyperframes snapshot . --at <tempos>` (frames 1080×1920 da composição de verdade). Mock de storyboard
   (frame pequeno + px chutados) **mente na proporção**: faz card pequeno parecer "grande e sobre o rosto".
   A verdade do tamanho/posição só aparece no render real. Snapshot custa segundos; use-o antes de qualquer aprovação.
2. **Dois bancos de elemento conforme o enquadramento:**
   - **Cards compactos** (id, stat, processo, documentos) → **lower-third `left:60px · bottom:49.5%`** (padrão 006).
     No render real são pills pequenos e discretos à esquerda, sobre o ombro/colo — ficam fora do rosto mesmo
     quando ela inclina pra frente.
   - **Elementos visuais LARGOS** (ícones de local, timeline do processo, card de contraste — coisas que ocupam
     largura) → **ZONA SUPERIOR `top:~180–340px`** (acima da cabeça). Quando o sujeito se inclina pra frente e
     preenche o meio do quadro, o banco inferior largo bateria no rosto; o topo (parede acima do cabelo) é o
     espaço livre confiável. Confirme no frame real que `top do elemento < topo do cabelo`.
3. **Calibração por matte** (`hyperframes remove-background`) ajuda a achar a cabeça, mas a auto-detecção de
   queixo é frágil — a régua final é o **snapshot real**, não o número do matte.
4. **Pattern-interrupt** (texto full-frame + zoom-punch) é a exceção que PODE cobrir o rosto: é o "soco" de
   atenção proposital no meio do vídeo (scrim escurece, texto Playfair toma o quadro). Curto (~2s).

## 5. Proibições visuais (do DNA)

- ❌ Nada que sugira **promessa de resultado** — sem "garantido", sem countdown/urgência fake.
- ❌ Nada **político ou religioso**.
- ❌ Sem estética **comercial/vendedora agressiva** (a marca evita "parecer que se vende").
- ❌ Sem identidades `neon` / `glitch` / `arcade` / `stomp` / `laser` — destoam da marca.
- ❌ Sem **informação incompleta** que gere falsa esperança (vale pro texto de overlay também).

## 6. Formato

- **9:16 vertical**, 30-60s. (Origem da footage: 1080×1920 @24fps.)
- **Safe zones do Reels (lei de posição):** zona morta inferior ~30% (~580px), coluna direita ~120px, topo ~120-160px.
  Área segura ≈ `y:220–1340`. As **posições exatas** de legenda e elementos estão em **§4c** (já dentro da safe zone).
  Nunca texto/elemento importante na zona morta.

## 7. Visual — STUB (preencher depois)

- Paleta: `TBD`
- Fontes: `TBD`
- Logo: `TBD`
- Refs visuais: `TBD`
