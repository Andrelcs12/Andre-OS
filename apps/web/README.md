# ANDRÉ OS

Personal operating system for tasks, routines, saved links, time tracking and personal analytics.

## Contexto

ANDRÉ OS é uma aplicação pessoal para apoiar execução, aprendizado e evolução diária. Não é um SaaS nem uma aplicação multi-tenant.

## Status

**Phase 1 — Foundation** concluída: interface, design system, rotas protegidas por sessão local de desenvolvimento e base do App Router estão disponíveis.

Supabase Auth + PostgreSQL integration will be added in Phase 2.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS v4
- shadcn/ui + Lucide React
- Geist Sans + Geist Mono
- Biome

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Em `/login`, use **Entrar como André** para criar a sessão local de desenvolvimento.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Estrutura

```text
src/
  app/               # Rotas, layouts e route handlers
  components/        # Shell, dashboard, tema, marca e shadcn/ui
  lib/auth/          # TEMPORARY DEV AUTH / LOCAL SESSION
  lib/constants/     # Navegação da aplicação
  lib/mock/          # Dados temporários centralizados
  lib/types/         # Tipos de domínio iniciais
```

## Próximos passos

- Supabase PostgreSQL e schema inicial
- Supabase Auth e Google OAuth
- Persistência real
- CRUD inicial de tarefas e rotinas

> A sessão atual é apenas para desenvolvimento e não deve ser usada como autenticação de produção.
