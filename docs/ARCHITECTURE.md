# Arquitetura

## Visão de fluxo

```text
Browser → Next.js → Server Components / Server Actions / Route Handlers → Services → Supabase → PostgreSQL
```

O projeto mantém a aplicação web em `apps/web`. Next.js atua como interface e backend leve; Supabase fornece autenticação e PostgreSQL. Não existe API separada nem camada enterprise artificial.

## Estrutura relevante

```text
apps/web/
  src/app/           # App Router, layouts, páginas e route handlers
  src/components/    # UI compartilhada e composição visual
  src/features/      # Componentes e fluxos específicos de área
  src/services/      # Operações e acesso coordenado aos dados
  src/lib/supabase/  # Clients browser, server, proxy e env
  src/types/         # Tipos de UI e tipos gerados do banco
  src/proxy.ts       # Atualização de sessão e proteção de rotas
  supabase/          # Configuração e migrations versionadas
  public/brand/      # Assets oficiais de marca
```

## Renderização e fronteiras

Páginas e layouts são Server Components por padrão. Componentes client são isolados para interações como tema, menu, drawer e início do fluxo OAuth. Dados privados são lidos no servidor com o client SSR; o browser usa o client público somente onde a interação exige.

Route Handlers atendem fronteiras HTTP como `/auth/callback` e `/api/health`. Server Actions devem ser preferidas para mutações de UI que não precisam expor uma API pública.

## Autenticação SSR

`src/proxy.ts` sincroniza a sessão Supabase em cada requisição aplicável. O layout protegido obtém o usuário no servidor e redireciona quem não possui sessão. O callback troca o código OAuth por sessão e retorna à área autenticada. Serviços de auth/profile isolam consultas de identidade da UI.

## Serviços e tipos

Services não renderizam JSX e retornam dados prontos para consumo. Tipos do schema são gerados a partir do Supabase em `src/types/database.generated.ts`; tipos de interface e derivados devem ficar pequenos e próximos do uso.

## Decisões

- App Router e SSR preservam sessão e proteção sem expor segredos ao cliente.
- Supabase SSR centraliza configuração de cookies e evita lógica de auth espalhada.
- Migrations versionadas preservam auditabilidade e repetibilidade do schema.
- A organização por componentes/features/services permite crescer por módulo sem antecipar camadas sem uso.
