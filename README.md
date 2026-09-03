# ANDRÉ OS

Personal operating system for tasks, routines, saved links, time tracking and personal analytics.

## Stack oficial

- **Frontend:** Next.js + React + TypeScript, Tailwind CSS, shadcn/ui e Lucide.
- **Backend:** NestJS + Fastify.
- **Database:** PostgreSQL + Prisma.
- **Infrastructure:** Supabase PostgreSQL.

## Workspace

```text
apps/web  # interface Next.js
apps/api  # API NestJS/Fastify
```

## Rodar

```bash
npm install
npm run dev:web
npm run dev:api
```

## Quick start

1. Execute `npm install` na raiz.
2. Crie `apps/api/.env` a partir de `apps/api/.env.example` e preencha as variáveis server-side.
3. Crie `apps/web/.env.local` a partir de `apps/web/.env.example` com a URL da API e a URL/Publishable Key do Supabase.
4. Verifique o banco com `cd apps/api && npm run prisma:validate && npm run prisma:generate`.
5. Inicie API e web em terminais separados com os comandos acima.

As migrations são versionadas em `apps/api/prisma/migrations`. Em um banco existente, valide o estado remoto e o histórico do Prisma antes de aplicar migrations pendentes. O Supabase Auth é responsável por Google OAuth e e-mail/senha; o Nest valida o access token e aplica autorização no PostgreSQL.

Veja `apps/web/.env.example` e `apps/api/.env.example`. Nunca versione envs reais.

## Qualidade

```bash
npm run lint
npm run typecheck
npm run build
```

O banco existente deve ser baselineado conforme [docs/DATABASE.md](docs/DATABASE.md). Google OAuth permanece dependente da configuração externa segura no Supabase e no Google Cloud.
