# Sistema de Eventos - Microsserviços

## Descrição do Projeto
Sistema de gerenciamento de eventos, onde usuários podem se cadastrar, pesquisar eventos, inscrever-se, registrar presença, emitir certificados e validar certificados. O sistema suporta operações offline para check-in e sincronização posterior com o servidor.

---

## Funcionalidades Principais
1. Cadastro do usuário
2. Login
3. Consulta de inscrição
4. Cancelamento de inscrição
5. Registro de presença
6. Inscrição rápida
7. Inscrição completa (complemento de dados no portal)
8. Emissão de certificado
9. Validação de certificado
10. Envio de e-mail automático nas seguintes condições:
   - Inscrição
   - Cancelamento
   - Comparecimento (check-in)

---

## Fluxo Offline
- Participante chega sem internet:
  - Cadastro rápido (se não estiver cadastrado)
  - Inscrição no evento
  - Registro de presença
- Sincronização manual dos dados quando a internet estiver disponível.

---

## Endpoints da API

| Método | Endpoint | Ação |
|--------|----------|------|
| GET    | /eventos | Consulta todos os eventos vigentes |
| GET    | /eventos/{id} | Consulta detalhes de um evento |
| GET    | /certificados/{id} | Consulta certificado de participante |
| POST   | /certificados | Emite um certificado |
| GET    | /certificados/{id}/validar | Verifica autenticidade do certificado |
| GET    | /inscricoes/{id} | Consulta inscrição de participante |
| POST   | /inscricoes | Registra uma inscrição |
| DELETE | /inscricoes/{id} | Cancela inscrição |
| POST   | /presencas | Registra presença |
| POST   | /usuarios | Cria um usuário |
| POST   | /auth | Autenticação |
| POST   | /emails | Envio de e-mail |

---

## Controle de Acesso
- Todas as requisições são autenticadas.
- Logs de todas as requisições são gerados.

---

## Banco de Dados
- Estrutura modular para suportar microsserviços.
- Cadastro de eventos e dados de apoio alimentados via banco de dados.
- Modelos principais:
  - Usuário
  - Evento
  - Inscrição
  - Presença
  - Certificado
  - Logs
  - E-mails

---

## Roteiro de Testes

### Caso 1: Fluxo Tradicional
1. Listar eventos no portal
2. Consultar detalhes de um evento
3. Cadastrar participante 1
4. Login do participante 1
5. Inscrever participante 1
6. Registrar presença do participante 1
7. Verificar registro de presença no portal

### Caso 2: Operações Offline
1. Cadastrar participante 2 e inscrever no evento (sem registrar presença)
2. Sincronizar dados com ambiente local
3. Simular ausência de rede
4. Cadastrar participante 3
5. Inscrever participante 3
6. Registrar presença do participante 3
7. Restaurar conexão e sincronizar dados
8. Verificar no portal: participante 3, inscrição e presença

### Caso 3: Complemento de dados, certificados e e-mails
1. Participante 3 completa dados
2. Participante 3 emite certificado
3. Participante 3 valida certificado
4. Participante 2 cancela inscrição
5. Apresentar e-mails de inscrição, comparecimento e cancelamento

---

## Tecnologias Sugeridas
- Linguagens: múltiplas (ex: Node.js + Python, PHP + JS, etc.)
- Banco de dados: livre escolha (relacional ou NoSQL)
- Microsserviços: modularização por funcionalidade
- Interface gráfica: validação do roteiro de testes
- Autenticação: JWT ou similar
- Logs: todas as rotas registradas
- Teste de rotas: Postman, Insomnia ou similares

---

## Observações
- Cadastro simplificado para início de uso.
- Cada evento possui template de certificado.
- Operações offline permitem registro e sincronização posterior.
