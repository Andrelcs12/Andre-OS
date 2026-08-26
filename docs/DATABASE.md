# Banco de dados

O PostgreSQL do projeto `andre-os` (Supabase, `sa-east-1`) é infraestrutura de persistência. Prisma em `apps/api/prisma/schema.prisma` é o ORM oficial e modela `User`, `Task`, `Routine`, `RoutineEntry`, `Link` e `TimeEntry`.

## Baseline e transição

O banco já existia antes de Prisma. `00000000000000_baseline` é um marco histórico e nunca deve ser aplicado com `migrate deploy` no banco existente. Após configurar `DATABASE_URL`, registre-o com:

```bash
cd apps/api
npm run prisma:validate
npx prisma migrate resolve --applied 00000000000000_baseline
npx prisma migrate resolve --applied 20260826214000_consolidate_user_identity
```

A migration de consolidação deve ser aplicada de forma controlada antes do resolve: ela renomeia `profiles` para `users`, remove o vínculo com `auth.users`, adiciona identidade Google e remove policies ligadas a `auth.uid()`. Não execute sem confirmar backup/ausência de usuários ativos.

Para mudanças futuras, use `prisma migrate dev` localmente e `prisma migrate deploy` no ambiente publicado. RLS segue habilitado como proteção da Data API, sem policies permissivas; o Nest aplica ownership por `userId`.
