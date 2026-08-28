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

`apps/web` é exclusivamente UI. `apps/api` é a API e concentra autenticação, autorização, ownership e Prisma. A sessão é JWT assinado em cookie HttpOnly com `SameSite=Lax` e `Secure` em produção; não há tokens sensíveis em localStorage.

No frontend, `app/` contém routing e composição de página; `features/` agrupa código por domínio; `components/` é reservado para UI compartilhada; e `lib/` concentra infraestrutura técnica compartilhada.

O login inicia em `GET /auth/google`, retorna em `/auth/google/callback` e redireciona para `WEB_URL/today`. `GET /auth/me` exige o guard de sessão; `POST /auth/logout` invalida o cookie. Google OAuth só solicita `openid`, `email` e `profile`.
