# Scripts de Testes E2E

Este diretório contém scripts para executar testes E2E de forma individual, evitando conflitos de dados entre testes.

## 📁 Scripts Disponíveis

### 1. `run-e2e-tests.sh` - Script Completo
Script principal com funcionalidades avançadas.

**Uso:**
```bash
# Executar todos os testes individualmente
./src/tests/scripts/run-e2e-tests.sh

# Executar um teste específico
./src/tests/scripts/run-e2e-tests.sh auth
./src/tests/scripts/run-e2e-tests.sh positions
./src/tests/scripts/run-e2e-tests.sh jobs
./src/tests/scripts/run-e2e-tests.sh applications
./src/tests/scripts/run-e2e-tests.sh question
./src/tests/scripts/run-e2e-tests.sh question-types

# Mostrar ajuda
./src/tests/scripts/run-e2e-tests.sh --help
```

### 2. `quick-e2e-test.sh` - Script Rápido
Script simples para execução rápida de um teste.

**Uso:**
```bash
# Executar teste de auth (padrão)
./src/tests/scripts/quick-e2e-test.sh

# Executar teste específico
./src/tests/scripts/quick-e2e-test.sh auth
./src/tests/scripts/quick-e2e-test.sh positions
./src/tests/scripts/quick-e2e-test.sh jobs
./src/tests/scripts/quick-e2e-test.sh applications
./src/tests/scripts/quick-e2e-test.sh question
./src/tests/scripts/quick-e2e-test.sh question-types
```

### 3. `run-all-e2e.sh` - Executar Todos
Script para executar todos os testes em sequência.

**Uso:**
```bash
# Executar todos os testes em sequência
./src/tests/scripts/run-all-e2e.sh
```

## 🧪 Testes Disponíveis

| Nome | Arquivo | Descrição |
|------|---------|-----------|
| `auth` | `auth.e2e.test.ts` | Testes de autenticação e perfil |
| `positions` | `positions.e2e.test.ts` | Testes de posições/cargos |
| `jobs` | `jobs.e2e.test.ts` | Testes de vagas |
| `applications` | `applications.e2e.test.ts` | Testes de candidaturas |
| `question` | `question.e2e.test.ts` | Testes de perguntas |
| `question-types` | `question-types.e2e.test.ts` | Testes de tipos de pergunta |

## 🚀 Como Usar

### Executar do diretório raiz do projeto:
```bash
cd /Applications/MAMP/work-with-us-webdb/backend

# Executar todos os testes
./src/tests/scripts/run-all-e2e.sh

# Executar um teste específico
./src/tests/scripts/quick-e2e-test.sh auth

# Executar com script completo
./src/tests/scripts/run-e2e-tests.sh positions
```

## 📊 Vantagens dos Scripts

### ✅ **Isolamento de Testes**
- Cada teste é executado individualmente
- Evita conflitos de dados entre testes
- Limpeza adequada entre execuções

### ✅ **Relatórios Detalhados**
- Status de cada teste
- Resumo final com estatísticas
- Cores para melhor visualização

### ✅ **Flexibilidade**
- Executar todos os testes
- Executar um teste específico
- Scripts simples e avançados

## 🔧 Solução de Problemas

### Problema: "Permission denied"
```bash
chmod +x src/tests/scripts/*.sh
```

### Problema: "npx not found"
```bash
# Certifique-se de que o Node.js está instalado
node --version
npm --version
```

### Problema: "Execute from project root"
```bash
# Execute sempre do diretório raiz do projeto
cd /Applications/MAMP/work-with-us-webdb/backend
./src/tests/scripts/quick-e2e-test.sh auth
```

## 📈 Resultados Esperados

### ✅ **Testes que Devem Passar**
- `auth.e2e.test.ts` - 8/8 testes
- `positions.e2e.test.ts` - Testes de CRUD
- `jobs.e2e.test.ts` - Testes de vagas
- `applications.e2e.test.ts` - Testes de candidaturas
- `question.e2e.test.ts` - Testes de perguntas
- `question-types.e2e.test.ts` - Testes de tipos

### 🎯 **Objetivo**
- **100% de sucesso** em testes individuais
- **Isolamento perfeito** entre testes
- **Relatórios claros** de status

## 🧪 Scripts de Testes Unitários de Controllers

### 5. `run-controller-tests.sh` - Script Completo para Controllers
Script principal com funcionalidades avançadas para testes unitários.

**Uso:**
```bash
# Executar todos os testes individualmente
./src/tests/scripts/run-controller-tests.sh

# Executar um teste específico
./src/tests/scripts/run-controller-tests.sh auth
./src/tests/scripts/run-controller-tests.sh position
./src/tests/scripts/run-controller-tests.sh job
./src/tests/scripts/run-controller-tests.sh application
./src/tests/scripts/run-controller-tests.sh question-option
./src/tests/scripts/run-controller-tests.sh admin

# Mostrar ajuda
./src/tests/scripts/run-controller-tests.sh --help
```

### 6. `quick-controller-test.sh` - Script Rápido para Controllers
Script simples para execução rápida de um teste unitário.

**Uso:**
```bash
# Executar teste de auth (padrão)
./src/tests/scripts/quick-controller-test.sh

# Executar teste específico
./src/tests/scripts/quick-controller-test.sh auth
./src/tests/scripts/quick-controller-test.sh position
./src/tests/scripts/quick-controller-test.sh job
./src/tests/scripts/quick-controller-test.sh application
./src/tests/scripts/quick-controller-test.sh question-option
./src/tests/scripts/quick-controller-test.sh admin
```

### 7. `run-all-controller-tests.sh` - Executar Todos os Controllers
Script para executar todos os testes unitários em sequência.

**Uso:**
```bash
# Executar todos os testes em sequência
./src/tests/scripts/run-all-controller-tests.sh
```

## 🧪 Scripts de Testes Unitários de Services

### 8. `run-service-tests.sh` - Script Completo para Services
Script principal com funcionalidades avançadas para testes unitários de services.

**Uso:**
```bash
# Executar todos os testes individualmente
./src/tests/scripts/run-service-tests.sh

# Executar um teste específico
./src/tests/scripts/run-service-tests.sh auth
./src/tests/scripts/run-service-tests.sh position
./src/tests/scripts/run-service-tests.sh job
./src/tests/scripts/run-service-tests.sh application
./src/tests/scripts/run-service-tests.sh question-option

# Mostrar ajuda
./src/tests/scripts/run-service-tests.sh --help
```

### 9. `quick-service-test.sh` - Script Rápido para Services
Script simples para execução rápida de um teste unitário de service.

**Uso:**
```bash
# Executar teste de auth (padrão)
./src/tests/scripts/quick-service-test.sh

# Executar teste específico
./src/tests/scripts/quick-service-test.sh auth
./src/tests/scripts/quick-service-test.sh position
./src/tests/scripts/quick-service-test.sh job
./src/tests/scripts/quick-service-test.sh application
./src/tests/scripts/quick-service-test.sh question-option
```

### 10. `run-all-service-tests.sh` - Executar Todos os Services
Script para executar todos os testes unitários de services em sequência.

**Uso:**
```bash
# Executar todos os testes em sequência
./src/tests/scripts/run-all-service-tests.sh
```

## 🧪 Testes Unitários Disponíveis

### Controllers
| Nome | Arquivo | Testes | Status |
|------|---------|--------|--------|
| `auth` | `authController.test.ts` | 8 testes | ✅ 100% Funcional |
| `position` | `positionController.test.ts` | 14 testes | ✅ 100% Funcional |
| `job` | `jobController.test.ts` | 14 testes | ✅ 100% Funcional |
| `application` | `applicationController.test.ts` | 6 testes | ✅ 100% Funcional |
| `question-option` | `questionOptionController.test.ts` | 14 testes | ✅ 100% Funcional |
| `admin` | `adminController.test.ts` | 6 testes | ✅ 100% Funcional |

### Services
| Nome | Arquivo | Testes | Status |
|------|---------|--------|--------|
| `auth` | `authService.test.ts` | 10 testes | ✅ 100% Funcional |
| `position` | `positionService.test.ts` | 10 testes | ✅ 100% Funcional |
| `job` | `jobService.test.ts` | 17 testes | ✅ 100% Funcional |
| `application` | `applicationService.test.ts` | 14 testes | ✅ 100% Funcional |
| `question-option` | `questionOptionService.test.ts` | 16 testes | ✅ 100% Funcional |

## 🚀 Próximos Passos

1. **Execute os testes individuais** para verificar funcionamento
2. **Identifique problemas** específicos em cada teste
3. **Corrija issues** de isolamento se necessário
4. **Integre** com CI/CD se aplicável
