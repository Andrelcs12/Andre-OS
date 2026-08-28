# Produto — ANDRÉ OS

## Visão

ANDRÉ OS é o sistema operacional pessoal de André Lucas: um lugar para transformar intenções em execução consistente, aprendizado mensurável e evolução contínua.

## Problema e usuário

O produto reduz a fragmentação entre tarefas, rotinas, estudos, projetos, referências e registro de tempo. O usuário principal é o próprio André; não há ambição de SaaS público ou colaboração multi-tenant neste momento.

## Módulos

- **Today:** foco e execução do dia.
- **Tasks:** tarefas e prioridades.
- **Routines:** hábitos e check-ins recorrentes.
- **Links:** referências salvas e contextualizadas.
- **History:** histórico de execução.
- **Time Tracking:** tempo investido por área e atividade.
- **Analytics:** leitura diária, semanal e mensal da evolução.
- **Norte:** trilha principal de estudo e trabalho profundo, executada em sequência.

## Áreas

Engineering, University, Career, Product, Distribution e Personal são os recortes iniciais para classificar o trabalho.

## Princípios

Pessoal antes de genérico; execução antes de volume de recursos; dados privados por padrão; interface técnica, calma e direta; evolução incremental baseada em uso real.

## Escopo atual

Tasks, Routines, Links, Time Tracking, History, Analytics, Today e Norte usam a API Nest e PostgreSQL. O login é Google OAuth administrado pela API, com cookie HttpOnly da aplicação.

## Fora de escopo atual

Multi-tenant, compartilhamento social, marketplace, integrações amplas de terceiros e gamificação não fazem parte do produto neste estágio.

## Roadmap macro

1. Consolidar infraestrutura e autenticação real.
2. Implementar Tasks com CRUD, validação e persistência.
3. Evoluir Today, Routines, Links e Time Tracking.
4. Construir History e Analytics sobre dados reais.
