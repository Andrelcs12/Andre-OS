# ANDRÉ OS

Personal operating system for tasks, routines, saved links, time tracking and personal analytics.

## Status

Supabase Auth é responsável por Google OAuth, e-mail/senha e cookies SSR. A API Nest recebe access tokens Bearer e aplica autorização no PostgreSQL via Prisma.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS v4 + shadcn/ui + Lucide React
- Supabase PostgreSQL, Auth e SSR
- Google OAuth
- Biome

## Rodar localmente

```bash
npm install
copy .env.example .env.local
npm run dev
```

Preencha apenas as variáveis indicadas em `.env.local`. Nunca versione esse arquivo.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run db:types
```

`db:types` exige que a CLI esteja vinculada a um projeto Supabase e gera `src/types/database.generated.ts`; esse arquivo não deve ser editado manualmente.

## Arquitetura

```text
UI → Supabase Auth → API Nest → Services → Prisma → PostgreSQL
```

## Banco de dados

As migrations relacionais em uso estão em `../api/prisma/migrations`. A migration inicial histórica cria:

- profiles
- tasks
- routines
- routine_entries
- links
- time_entries

Todas as tabelas de usuário usam RLS e policies por proprietário. O profile é criado por trigger idempotente após o primeiro login.

## Configuração automatizada

- Clients Supabase para browser, servidor e `proxy.ts`.
- Login Google, e-mail/senha, callback PKCE e logout.
- Proteção SSR de rotas e refresh de sessão.
- Schema, constraints, índices, RLS e policies versionados.
- Assets oficiais em `public/brand` e metadata/manifest configurados.

## Configuração manual de conta

1. Crie ou vincule um projeto Supabase.
2. Adicione `http://localhost:3000/auth/callback` às Redirect URLs de Auth.
3. Aplique as migrations Prisma em `../api/prisma/migrations`.
4. Copie a Project URL e a Publishable Key para `.env.local` e para a API.
5. No Google Cloud, crie um OAuth Web Client e registre a callback fornecida pelo provider Google no Supabase.
6. No Supabase Auth, habilite Google e informe o Client ID e Client Secret do Google.

## Segurança

- Não use nem exponha `service_role` nesta aplicação.
- A Publishable Key pode ser pública; a proteção de dados é feita por RLS.
- `NEXT_PUBLIC_SUPABASE_*` é validado ao executar fluxos que dependem do Supabase, sem impedir build ou revisão sem secrets.
