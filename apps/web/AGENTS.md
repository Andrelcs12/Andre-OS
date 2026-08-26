<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ANDRÉ OS Web

## Aplicação

Esta é a aplicação Next.js do ANDRÉ OS, usando App Router, TypeScript estrito, Tailwind CSS v4, shadcn/ui, Lucide, Geist e Supabase SSR. Respeite o contrato global em `../../AGENTS.md` e consulte `../../docs/` antes de mudanças de produto, banco ou operação.

## Estrutura e fronteiras

- `src/app`: rotas, layouts, páginas e Route Handlers.
- `src/components`: componentes compartilhados; `src/features`: composição específica de módulo.
- `src/services`: operações e acesso coordenado a dados, sem JSX ou estado React.
- `src/lib/supabase`: clients browser/server/proxy e validação de ambiente.
- `src/proxy.ts`: atualização de sessão e proteção de rotas no Next.js 16.
- `src/types`: tipos de interface e `database.generated.ts` derivado do Supabase.

Use Server Components por padrão. `"use client"` é permitido apenas para interações reais, Browser APIs, estado/hook cliente ou dependências client-only. Prefira Server Actions para mutações internas; use Route Handlers apenas para fronteiras HTTP, callbacks e APIs necessárias.

## Supabase, auth e env

Use os clients SSR existentes. Não duplique configuração de cookies ou tente ler dados privados por client sem necessidade. Sessões são sincronizadas no proxy; o callback OAuth fica em `src/app/auth/callback`. Variáveis públicas do Supabase são validadas em `src/lib/supabase/env.ts`; secrets jamais chegam ao cliente.

## UI, shadcn e acessibilidade

Componentes shadcn vivem em `src/components/ui` e devem consumir tokens CSS já definidos, sem hex hardcoded na UI. Use Lucide como biblioteca exclusiva de ícones. Preserve semântica, foco visível, labels e `aria-label` em controles apenas icônicos. Desktop-first, mas sem overflow ou quebra em mobile; o shell usa sidebar desktop e Sheet em telas menores.

## Design system

- Fontes: Geist Sans para interface e Geist Mono para métricas, tempo e dados técnicos curtos.
- Fonte de verdade dos tokens: `src/app/globals.css`.
- Direção de cores: primary light `#5B5CE2`, primary dark `#7C7DFF`, accent `#4EA1FF`, background light `#F8F9FB`, background dark `#0F1014`.
- Linguagem visual: clean, técnica, minimalista, pessoal e product-first; bordas discretas, poucas sombras e radius controlado.
- Evite glow, neon, glassmorphism excessivo e `rounded-3xl` como padrão.

## Marca e metadata

O nome principal é **ANDRÉ OS**; **ANDRÉ LUCAS OS** é secundário. Assets oficiais em `public/brand` são a fonte da verdade: não redesenhe logos automaticamente. Metadata, manifest e ícones pertencem a `src/app/layout.tsx`, `src/app/manifest.ts` e `src/app/icon.png`.
