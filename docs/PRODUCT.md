# Produto — ANDRÉ OS

ANDRÉ OS não tenta organizar toda a vida. Ele reduz a distância entre intenção e execução.

O fluxo central é capturar, escolher o que importa, executar, concluir e revisar. A interface não usa XP, streaks, badges ou score de produtividade.

## Conceitos

- **Norte:** a prioridade maior atual. Há somente um Norte ativo por usuário; os anteriores ficam pausados ou concluídos.
- **Hoje:** compromisso real do dia. `plannedFor` é independente do prazo (`dueDate`).
- **Agora:** a execução corrente, representada por uma única sessão de tempo ativa.
- **Inbox:** tarefas capturadas sem decisão ou planejamento.
- **Revisão:** evidência do que aconteceu: tarefas concluídas, tempo focado, Norte, rotinas e histórico.

## Navegação

Hoje, Tarefas, Norte e Revisão são os destinos principais. Rotinas e Links ficam em Mais. Histórico e Analytics redirecionam para Revisão por compatibilidade.

## Autenticação

Supabase Auth administra Google e e-mail/senha. O Next envia o Bearer token para o Nest, o guard valida com `supabase.auth.getUser()`, associa o usuário local e os serviços aplicam ownership. O acesso é pessoal: `ALLOWED_EMAILS` deve conter os e-mails autorizados.
