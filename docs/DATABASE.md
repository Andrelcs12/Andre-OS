# Banco de dados

## Fonte da verdade

As migrations em `apps/web/supabase/migrations` são a fonte da verdade. O schema não deve ser alterado manualmente em produção quando a mudança puder ser expressa em migration.

## Schema inicial

| Tabela | Finalidade | Ownership |
| --- | --- | --- |
| `profiles` | Identidade de apresentação do usuário autenticado | `id = auth.uid()` |
| `tasks` | Execução pessoal, status, área e prioridade | `user_id` |
| `routines` | Rotinas recorrentes | `user_id` |
| `routine_entries` | Check-ins diários de uma rotina | via rotina do usuário |
| `links` | Links salvos e categorizados | `user_id` |
| `time_entries` | Tempo investido em atividades | `user_id` |

`profiles` é criado a partir de `auth.users` por trigger de bootstrap. As tabelas privadas se conectam ao perfil por `user_id`; `routine_entries` se conecta à rotina e suas policies confirmam que ela pertence ao usuário autenticado.

## RLS

RLS está habilitado nas tabelas do schema público. Policies permitem leitura e mutação somente para dados do próprio usuário, usando `auth.uid()`. Não use `service_role` no browser, não desabilite RLS e não substitua as policies por filtros apenas no código de aplicação.

## Migrations

Crie uma migration a partir de `apps/web`:

```bash
npx supabase migration new describe_change
```

Revise constraints, FKs, índices, trigger e policies antes de aplicar. Em projeto remoto vinculado, aplique pela CLI ou pelo fluxo de deploy aprovado para o ambiente. Registre mudanças corretivas em nova migration; não reescreva migration já compartilhada sem uma razão operacional clara.

## Tipos gerados

Após aplicar migrations, gere tipos reais:

```bash
npm run db:types
```

O arquivo `src/types/database.generated.ts` é derivado do schema remoto e entra no Git quando alterado. Nunca o edite manualmente. Os comandos exigem que o projeto Supabase esteja vinculado e autenticado.
