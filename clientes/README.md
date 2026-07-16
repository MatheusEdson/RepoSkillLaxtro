# Clientes Laxtro

Pasta-base dos clientes do Laxtro Content OS. **Uma pasta por cliente**, com o `dna.md` no topo.

## Regra de ouro

> **Antes de iniciar qualquer edição de vídeo de um cliente, leia o `dna.md` dele.**
> O `dna.md` é a fonte da verdade da marca: voz, posicionamento, público, pilares, o que é
> proibido. A edição (corte, ritmo, legendas, grade de cor, overlays) tem que respeitar esse DNA.

## Estrutura de cada cliente

```
<cliente>/
├── dna.md             ← DNA da marca (fonte da verdade — ler ANTES de editar)
├── direcao-video.md   ← política de vídeo travada (DNA → tema de legenda, ênfase, overlays, proibições)
├── brand/             ← logo, cores, fontes, refs visuais
└── videos/            ← projetos de vídeo
    └── <projeto>/
        ├── (footage bruto — .mp4 etc.)
        └── edit/   ← saídas do video-use (base.mp4, final.mp4, transcripts, ...)
```

O `direcao-video.md` é consumido pela skill **`laxtro-video`** (em `.claude/skills/laxtro-video/`), que veste o
vídeo pronto com HyperFrames (`embedded-captions` / `graphic-overlays`) já com a cara do cliente. Derive-o do
`dna.md` e valide com o Joseph antes do 1º render. Visual (paleta/fontes) começa como STUB.

## Clientes

| Cliente | Pasta | DNA |
|---|---|---|
| **Dra. Wagnete Cruz** — advocacia previdenciária (B2C, Uberlândia-MG) | [`dra-wagnete-cruz/`](dra-wagnete-cruz/) | ✅ preenchido (Supabase, ciclo 1) |
| **Dra. Daniella Freitas** — estética / harmonização orofacial (B2C) | [`dra-daniella-freitas/`](dra-daniella-freitas/) | ✅ preenchido (Supabase, ciclo 1) |
| **Studio Habttah** — fitness / personal premium (B2C, Uberlândia-MG) | [`studio-habttah/`](studio-habttah/) | ✅ preenchido (Supabase, ciclo 1) |

## Notas

- Os `dna.md` em branco são templates; preencha (ou peça pra eu puxar do Supabase) antes da 1ª edição.
- Footage e saídas de edição (`videos/`) são pesados e ficam **fora do git** (não versionados).
- O `dna.md` da Wagnete foi extraído da tabela `client_dna` do Supabase de produção em 22/06/2026.
