# ANDRÉ OS API

API NestJS com Fastify. O fluxo obrigatório é `Controller → Service → Prisma → PostgreSQL`.

- Controllers lidam com HTTP, DTOs e usuário autenticado; não implementam regra de negócio.
- Services usam `PrismaService` diretamente. Não criar repositories, use cases ou camadas genéricas.
- DTOs existem somente em fronteiras HTTP; ValidationPipe global usa whitelist, forbidNonWhitelisted e transform.
- Auth usa cookie HttpOnly assinado por JWT da aplicação. Guard lê a sessão, valida JWT e `@CurrentUser()` fornece identidade. Google OAuth usa somente `openid`, `email` e `profile`.
- Ownership é aplicado por `userId` em queries Prisma. Nunca aceite owner pelo body.
- `DATABASE_URL`, `DIRECT_URL`, `GOOGLE_CLIENT_SECRET` e `AUTH_SECRET` são server-only. Não logue secrets.
- RLS do Supabase é hardening contra Data API; autorização da API é responsabilidade do Nest.
- Use logger/erros padrão do Nest, CORS para origens conhecidas e cookies Secure em produção.
