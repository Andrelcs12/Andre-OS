# Operações

## Desenvolvimento

```bash
npm install
npm run dev:web
npm run dev:api
```

Web: `NEXT_PUBLIC_API_URL`. API: `PORT`, `WEB_URL`, `DATABASE_URL`, `DIRECT_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` e `AUTH_SECRET` conforme `apps/api/.env.example`. Nunca registre valores reais.

`DATABASE_URL` é usada pela API em runtime e pode apontar para o pooler. `DIRECT_URL` é usada pelo Prisma CLI para migrations e deve usar uma conexão direta compatível. Em produção, `WEB_URL` deve ser a origem exata da web para CORS com cookies; o cookie de sessão recebe `Secure` automaticamente.

## Qualidade

```bash
npm run lint
npm run typecheck
npm run build
cd apps/api && npm run prisma:validate && npm run prisma:generate
cd apps/api && npx prisma migrate status
```

Teste `/health` e `/auth/me` (401 sem sessão) na API. Para produção, hospede a web e a API separadamente; Render ou Railway são opções apropriadas para a API Fastify. Configure CORS somente para a URL real da web.
