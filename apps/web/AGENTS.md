<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

Read the relevant guide in `node_modules/next/dist/docs/` before using a Next.js API with this version.

<!-- END:nextjs-agent-rules -->

# ANDRÉ OS Web

`apps/web` é a UI Next.js App Router. Ela não acessa PostgreSQL, Prisma ou Supabase Data/Auth. A fronteira pública é `NEXT_PUBLIC_API_URL` e toda chamada passa por `src/lib/api` com credentials.

- Server Components por padrão; componentes client somente para interação e Browser APIs.
- Sessão é cookie HttpOnly emitido pela API Nest. Layouts consultam `/auth/me` no servidor e fazem proteção visual; não valide banco no proxy Next.
- Não implemente regra de negócio no frontend. Services web apenas consomem a API.
- UI usa tokens em `src/app/globals.css`, Geist Sans/Mono, shadcn/ui e Lucide. Evite cores hardcoded, glow, neon e excessos de radius/sombra.
- A marca oficial está em `public/brand`; metadata, manifest e ícone estão no App Router.
- Preserve responsividade e acessibilidade: foco visível, semântica e labels/aria adequados.

## Organização feature-first

- `app/` concentra rotas, layouts, composition e route boundaries.
- `features/` concentra componentes, services, types e utilitários específicos de cada domínio.
- `components/` contém somente UI e componentes realmente compartilhados.
- `lib/` contém infraestrutura técnica compartilhada, como cliente HTTP e utilitários.
