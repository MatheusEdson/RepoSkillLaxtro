# RepoSkillLaxtro

Repositório de skills do Joseph. Skills instaladas ficam em `skills/<NomeDaSkill>/`.

## Edição de vídeo (skill video-use)

A skill **video-use** (`skills/video-use/`) edita vídeo por conversa: transcrever → cortar →
color grade → overlays → legendas. É só largar o footage numa pasta e pedir em linguagem natural
(ex: *"transcreve esses takes e propõe um corte"* ou *"edita de [URL] um clipe de 30s"*).

### Já configurado (não precisa refazer)
- **Chave ElevenLabs** (transcrição via Scribe): em `skills/video-use/.env`, escopo mínimo
  (só Speech to Text). O helper acha esse `.env` automaticamente de qualquer pasta de trabalho
  (`skills/video-use/helpers/transcribe.py`) — **não existe `.env` por projeto nem por edição**.
- **ffmpeg/ffprobe** no PATH. **Deps Python** (librosa, numpy, matplotlib, pillow, scipy) instaladas.
- **yt-dlp** instalado, mas a pasta Scripts não está no PATH → invocar via `python -m yt_dlp`
  (nunca `yt-dlp` direto).

### Clientes Laxtro (`clientes/`)
- Os 3 clientes do Laxtro vivem em `clientes/<cliente>/`: **Dra. Wagnete Cruz**
  (`dra-wagnete-cruz/`), **Dra. Daniella Freitas** (`dra-daniella-freitas/`), **Studio Habttah**
  (`studio-habttah/`).
- Cada cliente tem `dna.md` (DNA da marca — fonte da verdade), `brand/` (logo/cores/refs) e
  `videos/` (projetos de vídeo daquele cliente).
- **REGRA: antes de qualquer edição de vídeo de um cliente, ler o `dna.md` dele** — voz,
  posicionamento, público, pilares e o que é **proibido** guiam corte, legendas, grade e overlays.
- O DNA da Wagnete foi extraído da tabela `client_dna` do Supabase de produção (service-role key na
  VPS, `monorepo/apps/bridge/.env`). Daniella e Habttah ainda são templates a preencher.
- Índice e detalhes em `clientes/README.md`.

### Convenção de projetos de vídeo
- Cada vídeo = uma pasta em `clientes/<cliente>/videos/<nome-do-projeto>/`. Largar o footage bruto lá.
  (Vídeos de marca do próprio Laxtro, sem cliente, podem ficar em `videos/<projeto>/`.)
- Outputs da edição caem em `<pasta_do_video>/edit/` por padrão (o repo fica limpo).
- Um projeto é reaproveitado entre edições/iterações — não se cria pasta/config nova por edição.
- `videos/laxtro-promo*` são composições HyperFrames (HTML), não footage do video-use.

### Entregas oficiais (onde vive o render final aprovado)
- **`edit/` é rascunho** — pode ter N versões, logs, `base.mp4`, `clips_graded/`. Nada ali é oficial.
- **O render FINAL APROVADO vive só em `clientes/<cliente>/entregas/`**, com nome canônico
  `<projeto>_FINAL.mp4`. Se está em `entregas/`, é oficial. Único lugar, sem ambiguidade.
- **Anti-duplicação: MOVER (não copiar)** a versão aprovada do `edit/` pra `entregas/`, e deixar
  no `edit/` um breadcrumb `_OFICIAL.txt` apontando pra cá. O oficial existe em 1 lugar só.
- Cada cliente tem `entregas/ENTREGAS.md` (índice: projeto → arquivo oficial → versão de origem →
  data → status). Ao aprovar/re-renderizar, atualizar a linha; re-render **substitui** o arquivo
  de mesmo nome — nunca acumular `_v2` em `entregas/`.
- Vale pra todos os clientes e edits futuros.

### Helpers (rodar via `python skills/video-use/helpers/<nome>.py`)
`transcribe.py` (Scribe), `render.py`, `grade.py`, `timeline_view.py`, `pack_transcripts.py`.
Detalhes do fluxo completo em `skills/video-use/SKILL.md`.
