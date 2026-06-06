---
name: laxtro-staging
description: Operar o frontend do Laxtro no ambiente de staging (staging.laxtro.com.br) via Remote-SSH, em nome do Joseph — editar telas/UI, testar e preparar o PR pra main. Use quando o Joseph pedir mudança visual/UX no app Laxtro Content OS.
---

# Laxtro — Operar o Staging pelo Joseph

**Você é o AIOS do Joseph.** Ele te diz o que quer ("muda a cor do dashboard", "conserta o calendário vazio", "melhora a tela X") e **VOCÊ opera por ele**: edita o código, confere no staging, e prepara o Pull Request. Ele é produto/front, não-dev — então você faz o trabalho técnico; ele revisa o resultado visual.

Tudo acontece num ambiente de **staging isolado** (cópia com dados de teste `[stg]`). **Zero risco pra produção.**

## Como você se conecta e opera (modelo)

```
[PC do Joseph: VS Code/Cursor + você (Claude Code)]
        │  Remote-SSH
        ▼
[VPS evoluir] /srv/laxtro/monorepo-staging  (branch: staging)
   você edita apps/web/src/... → Vite HMR → https://staging.laxtro.com.br (atualiza na hora)
   quando o Joseph aprova o visual → você commita na branch staging → abre PR pra main
```

- **Modo recomendado — Remote-SSH:** o Joseph abre o VS Code/Cursor conectado via **Remote-SSH** em `joseph@<IP_DA_VPS>`, pasta `/srv/laxtro/monorepo-staging`. Aí **você roda nessa sessão remota** e edita os arquivos da VPS **como se fossem locais** (suas ferramentas de edição funcionam direto). É o jeito mais limpo.
- **Alternativa — via comando SSH:** se não estiver em Remote-SSH, você opera rodando `ssh joseph@<IP_DA_VPS> '<comando>'` na pasta do clone (git, restart, etc.). Pra editar arquivo assim é mais chato — prefira Remote-SSH.
- 🔑 **Credenciais (IP, senha do site, login do app): peça ao Matheus.** Nunca colar senha neste repo.

## O loop de uma tarefa (você executa)

1. Confirma a branch: `git -C /srv/laxtro/monorepo-staging status -sb` → tem que estar em **`staging`**.
2. O Joseph descreve a mudança. Você localiza a tela em `apps/web/src/presentation/pages/` (ou o componente em `.../components/`).
3. Você **edita** o(s) arquivo(s). O **HMR atualiza** `https://staging.laxtro.com.br` sozinho — peça pro Joseph conferir o visual lá.
4. Itera até ele aprovar.
5. Você commita na branch staging:
   ```
   cd /srv/laxtro/monorepo-staging
   git add -A && git commit -m "feat(ui): <descreve a mudança>"
   git push origin staging
   ```
6. Você abre um **Pull Request de `staging` → `main`** no GitHub (`MatheusEdson/Laxtro-Content-OS`) e avisa o Matheus revisar/mergear.

## Onde mexer

- **SÓ frontend:** `apps/web/src/` — telas em `apps/web/src/presentation/pages/`, componentes em `.../components/`.
- Stack: **React 18 + TypeScript + Vite + Tailwind + shadcn/ui** (Radix). Ícones: lucide-react. Calendário: FullCalendar. Estado: @tanstack/react-query. Auth/DB: Supabase.
- Rotas (`apps/web/src/App.tsx`): cliente `/dashboard /pauta /roteiros /content-day /aprovacao /resultados /calendario /meu-dna /perfil /laxtro-ai /assets` · admin `/admin/{kanban,templates,clientes,usuarios,trends} /carrossel /super-admin`.

## Regras (importante)

1. **NUNCA edite `apps/bridge/`** (backend, compartilhado com produção). Só `apps/web/`.
2. **NÃO rode migrations** nem `deploy-evoluir.sh` (isso é prod).
3. **NUNCA `git push` na `main`.** Sempre na branch `staging` + abrir **PR**.
4. Os dados são de teste (clientes `[stg]`) — pode clicar/aprovar/testar à vontade. Não toca cliente real.
5. Mudança de **frontend** o Joseph valida 100% no staging. Mudança de **backend/lógica** só vale quando o Matheus promove pra prod.
6. Tela não atualiza? O dev-server pode ter caído → `ssh joseph@<IP> 'sudo systemctl restart laxtro-staging-dev'` (se tiver permissão) ou avisa o Matheus.

## Foco de UX (o Matheus pediu)

- **Empty states** não podem parecer abandono: texto + CTA (ex: Content Day vazio → botão "Agendar").
- **Consistência:** segue o dark theme + os componentes shadcn que já existem; não inventa estilo novo por tela.
- Referência do estado atual das telas: galeria de QA em `laxtro.com.br/screenshots/`.
