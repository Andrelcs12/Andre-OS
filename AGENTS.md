# ANDRÉ OS — Engineering Contract

## Produto

ANDRÉ OS é o sistema operacional pessoal de André Lucas para organizar execução, aprendizado, rotinas, links, tempo e evolução pessoal. Não é SaaS público, aplicação multi-tenant empresarial ou rede social.

## Stack e fluxo de trabalho

- Use a stack e as versões declaradas em `apps/web/package.json`; não faça upgrades gerais sem solicitação explícita.
- O package manager do repositório é `npm`. Não trocar para pnpm ou yarn sem instrução explícita.
- A aplicação web usa Next.js com App Router, React, TypeScript estrito, Tailwind CSS, shadcn/ui, Lucide, Geist e Supabase SSR.
- Antes de mudanças relevantes, leia este arquivo, `apps/web/AGENTS.md` e a documentação aplicável em `docs/`.

## Arquitetura

```text
UI → Server Component / Client Component apenas quando necessário → Server Action ou Route Handler → Service → Supabase → PostgreSQL
```

No cliente: `Component → Hook apenas se houver comportamento reutilizável real → Action/service adequado`.

Server Components são o padrão. Use `"use client"` somente para estado, eventos, APIs do navegador, hooks de cliente ou bibliotecas que o exijam.

## Escopo proporcional

Não introduza sem necessidade concreta: NestJS, Express separado, repository pattern, generic repository, camadas de use case/domínio, ports/adapters, CQRS, event bus, container de DI, Redux, microservices, tRPC, GraphQL, classes para funções triviais, interfaces artificiais ou DTOs para cada objeto.

Services concentram regras da operação, acesso coordenado a dados e transformações necessárias. Não devem conter JSX, UI, toast, navegação de componente ou estado React. Não crie services vazios.

Hooks existem apenas para estado/comportamento de cliente reutilizável, lifecycle, subscriptions ou Browser APIs. Não crie hooks só para encapsular uma chamada simples ao servidor.

DTOs/input types existem em fronteiras que recebem dados. Para tipos, priorize: tipos gerados do Supabase, tipos derivados e, por último, tipos específicos de UI/domínio realmente necessários. Não replique manualmente o schema inteiro.

## Banco de dados e segurança

- Migrations são a fonte da verdade do banco.
- RLS é obrigatório. Toda tabela privada pertence a `user_id`; `profiles.id = auth.uid()`.
- Nunca hardcode UUID do André, desative RLS ou use `service_role` no navegador.
- Não edite produção manualmente quando uma migration for a alteração apropriada.
- Consulte `docs/DATABASE.md` antes de mudar schema, policies ou tipos gerados.

## Variáveis e segredos

Nunca coloque secrets em prompts, README, commits, relatórios ou código cliente. Não invente valores. `.env.local` é local e gitignored; `.env.example` contém somente nomes e placeholders seguros. Configure variáveis de produção pelo mecanismo seguro do provedor.

## Qualidade e commits

Cada mudança principal deve ter commit próprio e não vazio. Prefira Conventional Commits. Antes de commitar, execute as validações relevantes; para a web, normalmente `npm run lint`, `npm run typecheck` e `npm run build` em `apps/web`.

Nunca resolva problemas com `any` desnecessário, `@ts-ignore`, desativação global de lint, remoção de validação/RLS, segredos no código ou exceções silenciosamente engolidas.
