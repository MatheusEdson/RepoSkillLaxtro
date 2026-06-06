---
name: laxtro-staging
description: Vibecodar o frontend do Laxtro no ambiente de staging (staging.laxtro.com.br) via Remote-SSH e abrir PR pra main. Use quando for editar telas/UI/UX do app Laxtro Content OS.
---

# Laxtro — Dev Kit de Staging (pro Joseph)

Você ajuda a **vibecodar o frontend do Laxtro** no ambiente de **staging**, sem risco pra produção. Tudo que você mexe é num **clone isolado** com **dados de teste** (clientes `[stg]`). Quando fica bom, abre um **PR pra `main`** e o Matheus revisa/mergeia.

## Como funciona (leia antes)

```
[seu PC] --Remote-SSH--> [VPS evoluir] /srv/laxtro/monorepo-staging (branch: staging)
   edita apps/web/src/...  ->  Vite HMR  ->  https://staging.laxtro.com.br (atualiza na hora)
   quando gostar -> commit na branch staging -> Pull Request pra main
```

- Você **NÃO roda nada no seu PC** — edita os arquivos que vivem na VPS (via Remote-SSH) e o **HMR atualiza o site sozinho**.
- O **staging é isolado**: clientes `[stg] ...`, dados de teste (RLS por agência). Pode clicar/aprovar/testar à vontade — **não toca cliente real**.

## Conexão

- **Remote-SSH** (VS Code/Cursor): conectar em `joseph@<IP_DA_VPS>` → abrir a pasta `/srv/laxtro/monorepo-staging`.
- **Acesso ao site:** `https://staging.laxtro.com.br` → senha do site (basic auth) → login no app.
- 🔑 **Credenciais (IP SSH, senha do site, login do app): peça ao Matheus.** Nunca colar senha aqui no repo.

## Onde mexer

- **SÓ frontend:** `apps/web/src/` — telas em `apps/web/src/presentation/pages/`, componentes em `apps/web/src/presentation/components/`.
- Stack: **React 18 + TypeScript + Vite + Tailwind + shadcn/ui** (Radix). Ícones: lucide-react. Calendário: FullCalendar. Estado: @tanstack/react-query. Auth/DB: Supabase.
- Rotas (de `apps/web/src/App.tsx`): `/dashboard /pauta /roteiros /content-day /aprovacao /resultados /calendario /meu-dna /perfil /laxtro-ai /assets` (cliente) · `/admin/{kanban,templates,clientes,usuarios,trends} /carrossel /super-admin` (admin).

## Regras (importante)

1. **NÃO edite `apps/bridge/`** (é o backend, compartilhado com produção). Só `apps/web/`.
2. **NÃO rode migrations** nem mexa em banco. Não rode `deploy-evoluir.sh` (isso é prod).
3. **NUNCA dê push direto na `main`.** Trabalhe na branch `staging` e abra **PR**.
4. Se a tela não atualizar: o dev-server pode ter caído → peça pro Matheus (`systemctl restart laxtro-staging-dev`) ou rode você se tiver acesso.
5. Mudança de **frontend** você testa 100% sozinho no staging. Mudança de **backend/lógica** só vale quando o Matheus promove pra prod.

## Fluxo de uma tarefa

1. Conecta via Remote-SSH na pasta `monorepo-staging`.
2. Confirma que está na branch certa: `git status` (deve estar em `staging`).
3. Edita os arquivos da tela em `apps/web/src/...`.
4. Abre `https://staging.laxtro.com.br`, loga, e confere a mudança (HMR já atualizou).
5. Itera até gostar.
6. Commita: `git add -A && git commit -m "feat(ui): descreve a mudança"`.
7. Push na branch staging: `git push origin staging`.
8. Abre um **Pull Request de `staging` → `main`** no GitHub. Descreve o que mudou + manda pro Matheus revisar.

## Dicas de UI/UX (o Matheus pediu pra cuidar)

- **Empty states:** telas sem dado não podem parecer abandonadas — coloca um texto + um CTA (ex: Content Day "Nenhum agendado" → botão "Agendar").
- **Consistência:** segue o dark theme + os componentes shadcn que já existem (não inventa estilo novo por tela).
- Antes/depois: tira print das telas que mexer (tem a galeria de QA em `laxtro.com.br/screenshots/` como referência do estado atual).
