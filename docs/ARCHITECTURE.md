# Arquitetura

```text
┌─────────────────────┐
│ Next.js Web         │
│ React + shadcn      │
└──────────┬──────────┘
           │ HTTP / JSON
           ▼
┌─────────────────────┐
│ NestJS API / Fastify│
│ Controllers/Services│
│ Auth / Guards       │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Prisma ORM          │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ PostgreSQL          │
│ Supabase hosted     │
└─────────────────────┘
```

`apps/web` é exclusivamente UI. `apps/api` concentra autorização, ownership e Prisma. O Supabase Auth mantém a sessão em cookie SSR; o Next envia o access token Bearer à API, que o valida com `supabase.auth.getUser()`. Não há JWT próprio, Passport ou token sensível em localStorage.

No frontend, `app/` contém routing e composição de página; `features/` agrupa código por domínio; `components/` é reservado para UI compartilhada; e `lib/` concentra infraestrutura técnica compartilhada.

O login inicia no Next.js com Supabase Auth. Google retorna ao callback do Supabase e, em seguida, para `/auth/callback`, que troca o código PKCE pela sessão. E-mail/senha também é autenticado pelo Supabase. `GET /auth/me` e as rotas de negócio exigem um access token Bearer confirmado server-side pela API com `supabase.auth.getUser()`.
