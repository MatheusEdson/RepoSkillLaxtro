# Laxtro Dev Kit

Kit pro **Joseph** vibecodar o frontend do Laxtro no ambiente de **staging**, sem risco pra produção. O teu Claude Code (AIOS) conecta via SSH e opera por você.

## O que vem no kit (`.claude/`)
- **Skill `laxtro-staging`** — guia o teu Claude a operar o front no staging via Remote-SSH e abrir PR pra `main`.
- **Agente `@laxtro`** — todo o contexto do produto Laxtro Content OS (arquitetura, pipeline IA, regras, stories).
- **Agente `@siteops`** — DevOps + SEO de qualquer site (útil se for mexer em infra/performance).

## Instalar (no seu PC)
1. Clone:
   ```bash
   git clone https://github.com/MatheusEdson/RepoSkillLaxtro.git
   ```
2. Jeito mais fácil: **abra essa pasta no Claude Code / Cursor** — ele carrega a skill + os agentes do `.claude/` automaticamente.
   Ou copie pro seu Claude global:
   ```bash
   # Mac/Linux
   cp -r .claude/skills/laxtro-staging ~/.claude/skills/
   cp -r .claude/commands/AIOS ~/.claude/commands/
   # Windows (PowerShell)
   Copy-Item -Recurse .\.claude\skills\laxtro-staging "$env:USERPROFILE\.claude\skills\"
   Copy-Item -Recurse .\.claude\commands\AIOS "$env:USERPROFILE\.claude\commands\"
   ```
3. Pronto: a skill **`laxtro-staging`** + os agentes **`@laxtro`** e **`@siteops`** ficam disponíveis. É só pedir pra editar uma tela do Laxtro.

## O que você precisa (peça ao Matheus)
- **IP da VPS** + seu **usuário SSH** (`joseph`) → pra Remote-SSH. *(você precisa me mandar sua chave SSH pública antes — `~/.ssh/id_ed25519.pub`; se não tiver, roda `ssh-keygen -t ed25519`.)*
- **Senha do site** de staging (basic auth) + **login do app** de staging.
- Acesso ao **repo `Laxtro-Content-OS`** no GitHub (pra abrir os PRs) — me manda teu usuário do GitHub.

## Fluxo, em 1 linha
Remote-SSH em `/srv/laxtro/monorepo-staging` → o Claude edita `apps/web/` → vê na hora em `staging.laxtro.com.br` → commita na branch `staging` → abre **PR pra `main`**.

> Detalhes completos pro teu Claude: `.claude/skills/laxtro-staging/SKILL.md`.
