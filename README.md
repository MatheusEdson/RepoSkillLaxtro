# Laxtro Dev Kit

Kit pro **Joseph** vibecodar o frontend do Laxtro no ambiente de **staging**, sem risco pra produção.

## Instalar a skill (no seu PC)

1. Clone este repo:
   ```bash
   git clone https://github.com/<owner>/laxtro-dev-kit.git
   ```
2. Copie a skill pro seu Claude Code global (ou use direto abrindo este repo no Claude Code):
   ```bash
   # Windows (PowerShell)
   Copy-Item -Recurse .\.claude\skills\laxtro-staging "$env:USERPROFILE\.claude\skills\"
   # Mac/Linux
   cp -r .claude/skills/laxtro-staging ~/.claude/skills/
   ```
3. No Claude Code, a skill **`laxtro-staging`** fica disponível. É só pedir pra editar uma tela do Laxtro que ela te guia.

## O que você precisa (peça ao Matheus)

- **IP da VPS** + seu **usuário SSH** (`joseph`) → pra Remote-SSH.
- **Senha do site** de staging (basic auth) + **login do app** de staging.
- Acesso ao **repo do Laxtro** no GitHub (pra abrir os PRs).

## Fluxo, em 1 linha

Conecta via Remote-SSH em `/srv/laxtro/monorepo-staging` → edita `apps/web/` → vê na hora em `staging.laxtro.com.br` → commita na branch `staging` → abre **PR pra `main`**.

> Detalhes completos: veja `.claude/skills/laxtro-staging/SKILL.md`.
