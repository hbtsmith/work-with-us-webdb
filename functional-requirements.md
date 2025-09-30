# 📄 Requisitos Funcionais – Sistema de Pré-entrevista de Emprego

## Sobre o projeto

Esse será um sistema onde candidatos à vaga de emprego na minha empresa entrarão e preencherão dados, esses dados serão avaliados posteriormente em um ambiente administrativo. Qualquer pessoa pode acessar esse formulário para preencher, sem qualquer tipo de recurso de segurança para acessar, a página contará com o reCaptcha do Google para proteção contra envios automatizados.

Já no ambiente administrativo, que só poderá ser acessado através de login/senha, esse usuário será simples e pré-carregado com e-mail e senha padrão. No ambiente administrativo a primeira vez que o usuário administrativo acessar precisará trocar seu login e senha.

---

## RF-001 – Formulário Público de Candidatura
- RF-001.01: Qualquer visitante pode acessar um formulário de candidatura a partir de uma URL única da vaga.
- RF-001.02: O sistema deve exibir o título e a descrição da vaga ao carregar a página.
- RF-001.03: O formulário deve ser gerado dinamicamente com base nas perguntas cadastradas para a vaga.
- RF-001.04: Caso a vaga exija upload de currículo, um campo de upload de arquivo (PDF) deve ser exibido.
- RF-001.05: O sistema deve validar os campos obrigatórios definidos pelo administrador.
- RF-001.06: O formulário deve incluir proteção reCAPTCHA (Google) antes do envio.
- RF-001.07: As respostas do formulário devem ser armazenadas no banco de dados com data/hora da submissão.

## RF-002 – Autenticação Administrativa
- RF-002.01: O sistema deve possuir um usuário administrativo pré-cadastrado (e-mail/senha).
- RF-002.02: No primeiro acesso, o sistema deve forçar o administrador a alterar o e-mail e senha padrão.
- RF-002.03: O sistema deve permitir apenas alteração de e-mail e senha do usuário logado, sem criar novos usuários.
- RF-002.04: O acesso ao painel administrativo deve ser protegido por autenticação JWT e sessão expirada.

## RF-003 – Gestão de Cargos
- RF-003.01: O administrador pode cadastrar, editar, listar e excluir cargos.
- RF-003.02: Os campos obrigatórios do cargo são: ID (auto), título, nível e faixa salarial.
- RF-003.03: O cargo não pode ser removido ou alterado se ele estiver em uso em algum formulário.
- RF-003.04: A listagem de cargos deve seguir o padrão de todas as listagens do sistema com paginação, ordenação por campo e ordem DESC|ASC.

## RF-004 – Gestão de Vagas
- RF-004.01: O administrador pode cadastrar, editar, listar e excluir vagas.
- RF-004.02: Os campos obrigatórios da vaga são:
  - Título (string) - Preenchido pelo ADM, apresentado ao candidato
  - Descrição (text) - Preenchido pelo ADM, apresentado ao candidato
  - Cargo (select) - Preenchido pelo ADM, apresentado ao candidato
  - Identificador único da vaga (slug da URL)
  - Flag: exige envio de currículo em PDF (boolean)
- RF-004.03: O sistema deve garantir que cada identificador de vaga (slug) seja único.
- RF-004.04: A cada vaga criada, o administrador deve cadastrar pelo menos uma pergunta associada.
- RF-004.05: A vaga não pode ser removida ou alterada se já tiver sido preenchida por um candidato.
- RF-004.07: A listagem de vagas deve seguir o padrão de todas as listagens do sistema com paginação, ordenação por campo e ordem DESC|ASC.
- RF-004.08: Deve existir uma funcionalidade para clonar uma vaga e todas as suas configurações, perguntas e campos.

## RF-005 – Configuração das Perguntas da Vaga
- RF-005.01: O administrador pode adicionar múltiplas perguntas a uma vaga.
- RF-005.02: Cada pergunta deve conter:
  - Label (texto descritivo)
  - Tipo de campo: texto curto, texto longo, múltipla escolha (checkbox), escolha única (select)
  - Se for múltipla ou única escolha: deve ser possível adicionar/remover opções
  - Indicação se a pergunta é obrigatória ou opcional

## RF-006 – Visualização de Candidaturas
- RF-006.01: O administrador pode visualizar todas as candidaturas recebidas por vaga.
- RF-006.02: A visualização deve apresentar as respostas preenchidas pelo candidato, incluindo uploads.
- RF-006.03: Deve ser possível filtrar ou buscar candidaturas por vaga.
- RF-006.04: A listagem de candidaturas deve seguir o padrão de todas as listagens do sistema com paginação, ordenação por campo e ordem DESC|ASC.

## RF-007 – Segurança e Organização do Projeto
- RF-007.01: O sistema deve seguir arquitetura com separação de responsabilidades:
  - routes, controllers, services, models, middlewares, helpers, utils, i18n, tests
- RF-007.02: Todos os textos e mensagens devem estar centralizados em arquivos de internacionalização (i18n).
- RF-007.03: Os erros devem ser tratados e retornados com mensagens amigáveis e padronizadas (ex: via middleware de erros).

## RF-008 – Testes
- RF-008.01: O sistema deve possuir testes automatizados para as principais rotas e serviços (unitários e e2e).
- RF-008.02: Os testes devem cobrir:
  - CRUD de vagas e cargos
  - Submissão de formulário
  - Autenticação e troca de senha
  - Criação e exibição das perguntas

## RF-009 – Restrições e Regras de Negócio
- RF-009.01: Não é permitido excluir ou alterar uma vaga que já possua candidaturas.
- RF-009.02: Não é permitido excluir ou alterar cargos vinculados a vagas existentes.
- RF-009.03: Não é permitido cadastrar vagas sem pelo menos uma pergunta.