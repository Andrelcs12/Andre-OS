<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ANDRÉ OS Web

`apps/web` é a UI Next.js App Router. Ela não acessa PostgreSQL, Prisma ou Supabase Data. Supabase Auth é usado somente para sessão, Google OAuth e e-mail/senha; a fronteira de dados é `NEXT_PUBLIC_API_URL`.

- Server Components por padrão; componentes client somente para interação e Browser APIs.
- Sessão é cookie gerenciado pelo Supabase SSR. Layouts consultam `/auth/me` com access token no servidor e fazem proteção visual; `proxy.ts` apenas mantém a sessão renovada.
- Não implemente regra de negócio no frontend. Services web apenas consomem a API.
- UI usa tokens em `src/app/globals.css`, Geist Sans/Mono, shadcn/ui e Lucide. Evite cores hardcoded, glow, neon e excessos de radius/sombra.
- A marca oficial está em `public/brand`; metadata, manifest e ícone estão no App Router.
- Preserve responsividade e acessibilidade: foco visível, semântica e labels/aria adequados.

## Organização feature-first

- `app/` concentra rotas, layouts, composition e route boundaries.
- `features/` concentra componentes, services, types e utilitários específicos de cada domínio.
- `components/` contém somente UI e componentes realmente compartilhados.
- `lib/` contém infraestrutura técnica compartilhada, como cliente HTTP e utilitários.
