# Swagger Documentation Structure

Esta pasta contém toda a documentação do Swagger organizada seguindo as melhores práticas de Clean Architecture.

## Estrutura de Arquivos

```
src/swagger/
├── index.ts              # Exportações principais e tipos
├── schemas.ts             # Schemas base (requests/responses)
├── auth-docs.ts           # Documentação das rotas de autenticação
├── positions-docs.ts      # Documentação das rotas de cargos
├── jobs-docs.ts           # Documentação das rotas de vagas
├── applications-docs.ts    # Documentação das rotas de candidaturas
└── README.md              # Esta documentação
```

## Organização

### 1. `schemas.ts`
Contém os schemas base reutilizáveis:
- `LoginRequest` - Schema para login
- `ChangePasswordRequest` - Schema para alteração de senha
- `UpdateAdminRequest` - Schema para atualização de perfil
- `LoginResponse` - Schema de resposta do login
- `ErrorResponse` - Schema de resposta de erro

### 2. `auth-docs.ts`
Contém a documentação específica das rotas de autenticação:
- `login` - Documentação completa do endpoint de login
- `changePassword` - Documentação do endpoint de alteração de senha
- `updateProfile` - Documentação do endpoint de atualização de perfil
- `getProfile` - Documentação do endpoint de obtenção de perfil

### 3. `positions-docs.ts`
Contém a documentação das rotas de cargos:
- `getAllPositions` - Lista paginada de cargos
- `getAllPositionsSimple` - Lista simples de cargos
- `createPosition` - Criar novo cargo
- `getPositionById` - Obter cargo por ID
- `updatePosition` - Atualizar cargo
- `deletePosition` - Excluir cargo

### 4. `jobs-docs.ts`
Contém a documentação das rotas de vagas:
- `getJobBySlug` - Obter vaga por slug (público)
- `createJob` - Criar nova vaga
- `getJobs` - Lista paginada de vagas
- `getJobById` - Obter vaga por ID
- `updateJob` - Atualizar vaga
- `deleteJob` - Excluir vaga
- `cloneJob` - Clonar vaga
- `updateJobQuestions` - Atualizar perguntas da vaga
- `toggleJobStatus` - Alternar status da vaga

### 5. `applications-docs.ts`
Contém a documentação das rotas de candidaturas:
- `submitApplication` - Submeter candidatura (público)
- `getApplications` - Lista paginada de candidaturas
- `getApplicationById` - Obter candidatura por ID
- `deleteApplication` - Excluir candidatura
- `getApplicationsByJob` - Candidaturas por vaga
- `getApplicationStats` - Estatísticas das candidaturas

### 6. `index.ts`
Arquivo de índice que:
- Exporta todos os schemas e documentações
- Define tipos TypeScript para melhor tipagem
- Centraliza as exportações

## Como Usar

### Nas Rotas
```typescript
import { authSwaggerDocs } from '@/swagger';

fastify.post('/login', {
  preHandler: [validateBody(loginSchema)],
  schema: authSwaggerDocs.login
}, handler);
```

### Adicionando Novas Rotas
1. Crie um novo arquivo `[module]-docs.ts` (ex: `jobs-docs.ts`)
2. Defina os schemas necessários em `schemas.ts`
3. Crie a documentação das rotas no novo arquivo
4. Exporte no `index.ts`

## Benefícios desta Estrutura

✅ **Separação de Responsabilidades**: Cada arquivo tem uma responsabilidade específica  
✅ **Reutilização**: Schemas podem ser reutilizados em diferentes rotas  
✅ **Manutenibilidade**: Fácil de manter e atualizar  
✅ **Legibilidade**: Código mais limpo e organizado  
✅ **Tipagem**: TypeScript para melhor desenvolvimento  
✅ **Escalabilidade**: Fácil de adicionar novas rotas e módulos  

## Status Atual

✅ **Estrutura Completa Implementada:**
- [x] `schemas.ts` - Schemas base reutilizáveis
- [x] `auth-docs.ts` - Documentação das rotas de autenticação
- [x] `positions-docs.ts` - Documentação das rotas de cargos
- [x] `jobs-docs.ts` - Documentação das rotas de vagas
- [x] `applications-docs.ts` - Documentação das rotas de candidaturas
- [x] `index.ts` - Exportações centralizadas

## Próximos Passos

- [ ] Aplicar as documentações nas rotas existentes
- [ ] Testar todos os endpoints no Swagger UI
- [ ] Adicionar mais schemas reutilizáveis conforme necessário
- [ ] Implementar validações adicionais se necessário
