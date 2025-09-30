# 🛠️ Requisitos Não Funcionais

## 1. Padrões de Codificação e Qualidade
- Todo o código deve ser escrito em **inglês americano**, incluindo:
  - Nomes de funções, variáveis e classes
  - Comentários e documentação inline
  - Campos de banco de dados e arquivos de configuração
- O projeto deve seguir os **princípios SOLID**, aplicando boas práticas de arquitetura e design de software.
- O código deve ser **modular**, **reutilizável** e seguir o padrão **DRY (Don’t Repeat Yourself)**.
- Deve haver **linting** e **formatação automática** com **ESLint** e **Prettier** configurados.

## 2. Arquitetura e Tecnologias
- Deve ser utilizado **TypeScript** em todo o projeto.
- O projeto será desenvolvido como um **sistema web responsivo**, acessível via navegador, adaptável para **desktop** e **dispositivos móveis (mobile-first)**.
- A aplicação será **containerizada com Docker**, incluindo ambiente de desenvolvimento e produção.
- A aplicação deverá se comunicar com um banco de dados **MySQL 5** via conexão externa (por outro container), mas com estrutura adaptável para **PostgreSQL** se necessário.
- As variáveis sensíveis devem ser lidas de arquivos **.env**, nunca hardcoded no código.

## 3. Testes e Confiabilidade
- Deve haver cobertura de **testes unitários** para todos os serviços e regras de negócio, com uso de **Vitest** ou **Jest**.
- Cobertura mínima de testes: **80% das linhas e branches**.
- Devem ser realizados **testes de integração** nos pontos críticos da aplicação.
- Os testes devem rodar de forma **isolada e determinística** (sem dependência do ambiente).

## 4. Segurança
- O sistema deve seguir **boas práticas de segurança** como:
  - Proteção contra **SQL Injection**, **XSS** e **CSRF**
  - Utilização de **validação de entrada** de dados em todas as rotas e endpoints
  - Senhas e tokens devem ser armazenados com **hash seguro (ex: bcrypt)**
  - Requisições externas devem ser protegidas por **rate limiting**, **CORS** e autenticação adequada

## 5. Desempenho e Escalabilidade
- A aplicação deve ser **escalável horizontalmente**, com suporte a múltiplas instâncias.
- As APIs devem responder em **tempo inferior a 500ms** em condições normais de uso.
- A base de dados deve utilizar **índices apropriados** para garantir performance.

## 6. Deploy e Integração Contínua
- O projeto deve incluir scripts para **build, deploy e rollback** usando **Docker Compose**.
- Deve haver um pipeline de **CI/CD** usando **GitHub Actions**, com:
  - Execução automática de testes
  - Lint e formatação
  - Deploy automatizado (em staging ou produção)
- O ambiente de **staging** deve refletir as mesmas configurações de **produção**.

## 7. Documentação e Manutenção
- O projeto deve conter documentação técnica clara e concisa, incluindo:
  - Como rodar localmente
  - Estrutura de pastas
  - Variáveis de ambiente
  - Rotas e contratos da API (usar **Swagger**)
- Deve haver um **README.md** atualizado com instruções para novos desenvolvedores.

## 8. Compatibilidade e Ambiente de Execução
O sistema deve ser 100% compatível e executável no seguinte ambiente:
- **Sistema Operacional**: Debian GNU/Linux 12 (bookworm)
- **Kernel**: Linux 6.1.0-37-cloud-amd64 (x86_64)
- **Node.js**: v20.19.4
- **NPM**: 10.8.2
- **Docker**: Docker version 28.1.1, build 4eba377
- **MySQL**: 5.7
- O ambiente utilizará **contêineres Docker** para aplicação e banco de dados.
- O backend deverá funcionar corretamente em **modo headless** (sem interface gráfica) e ser adequado para **execução contínua em nuvem**.