# ANDRÉ OS — Engineering Contract

ANDRÉ OS é o sistema operacional pessoal de André Lucas. Não é SaaS público, multi-tenant empresarial ou rede social.

## Stack oficial

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui e Lucide.
- Backend: NestJS com Fastify.
- Dados: Prisma ORM e PostgreSQL hospedado no Supabase.
- Package manager: `npm` com workspaces `apps/*`. Não usar pnpm, yarn ou Turborepo sem solicitação explícita.

## Fluxo de dados

```text
Next.js Web → NestJS HTTP API → Controller → Service → Prisma → PostgreSQL
```

Web não acessa PostgreSQL, Prisma, Supabase Data API ou regras centrais de negócio. Serviços do Nest aplicam ownership pelo usuário autenticado; bodies nunca definem `userId`.

## Limites e qualidade

- Server Components são padrão na web; Client Components somente para interação real.
- Controllers cuidam de HTTP e DTOs; Services concentram regra e Prisma.
- Não criar repository layer, use-case layer, CQRS, event bus, DI tokens artificiais, GraphQL, tRPC ou abstrações genéricas sem necessidade concreta.
- Migrations Prisma passam a ser a fonte para mudanças relacionais futuras. RLS permanece como hardening contra Data API direta, não como autorização da API Nest.
- Nunca use `service_role` ou connection string no frontend. Secrets ficam somente em env server-side e nunca entram em commits, prompts ou relatórios.
- Cada mudança principal recebe commit próprio, após lint, typecheck e build aplicáveis.
