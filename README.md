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

Veja `apps/web/.env.example` e `apps/api/.env.example`. Nunca versione envs reais.

## Qualidade

```bash
npm run lint
npm run typecheck
npm run build
```

O banco existente deve ser baselineado conforme [docs/DATABASE.md](docs/DATABASE.md). Google OAuth permanece dependente da configuração externa segura no Google Cloud.
