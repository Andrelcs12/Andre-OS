# Operações

## Setup local

```bash
cd apps/web
npm install
copy .env.example .env.local
npm run dev
```

Preencha localmente apenas as variáveis documentadas em `.env.example`. `.env.local` é ignorado pelo Git e nunca deve ser compartilhado em texto, commits ou screenshots.

## Qualidade

Execute em `apps/web` antes de mudanças relevantes ou deploy:

```bash
npm run lint
npm run typecheck
npm run build
```

Use `GET /api/health` para uma verificação simples de disponibilidade.

## Supabase

O projeto remoto deve estar vinculado ao diretório `apps/web`. Migrations ficam em `supabase/migrations`; revise e aplique-as antes de gerar tipos com `npm run db:types`. Consulte [DATABASE.md](./DATABASE.md) para ownership, RLS e workflow do schema.

## Google OAuth

No Google Cloud, use apenas os scopes `openid`, `email` e `profile`. O client OAuth é do tipo Web application e seu redirect principal aponta para o callback Supabase do projeto remoto. No Supabase, habilite o provider Google, mantenha o Client Secret apenas no painel seguro e configure Site URL/Redirect URLs para:

- `http://localhost:3000/auth/callback`
- `https://<dominio-de-producao>/auth/callback`

O callback interno da aplicação é `/auth/callback`. Nunca coloque Client Secret no código, nas variáveis públicas ou no Git.

## Vercel e deploy

Crie um projeto Vercel com Root Directory `apps/web`; mantenha framework e comandos detectados automaticamente, salvo falha comprovada. Configure em Production, Preview e Development, quando aplicável:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Depois do primeiro deploy, use a URL de produção real como Site URL no Supabase e inclua o callback de produção nas Redirect URLs. Se o fluxo Google exigir nova configuração de origin/callback, use os valores exatos fornecidos por Supabase e Vercel.

## Checklist de incidente simples

1. Consulte logs do deploy e do navegador sem expor variáveis.
2. Confirme as variáveis por nome e ambiente.
3. Valide `/api/health`, `/login` e a rota protegida.
4. Confira sessão após login, refresh e logout.
5. Corrija em migration ou código versionado; faça commit específico após validação.
