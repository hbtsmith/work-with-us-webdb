# 🏗️ **ARQUITETURA DO FRONTEND - WORK WITH US**

## 📁 **ESTRUTURA DE PASTAS**

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Design System (Button, Input, Modal)
│   ├── forms/           # Componentes de formulário
│   ├── layout/          # Layout, Header, Sidebar
│   ├── features/        # Componentes específicos por feature
│   └── index.ts         # Exports centralizados
├── pages/               # Páginas da aplicação
│   ├── auth/            # Autenticação (Login, ChangePassword)
│   ├── public/          # Páginas públicas (ApplicationPage)
│   ├── admin/           # Páginas administrativas (Dashboard, Jobs, Applications, Positions)
│   └── index.ts         # Exports centralizados
├── services/            # Lógica de negócio/API
│   ├── api/             # Cliente HTTP base
│   ├── auth/            # Serviços de autenticação
│   ├── jobs/            # Serviços de jobs
│   ├── applications/    # Serviços de applications
│   ├── positions/       # Serviços de positions
│   └── index.ts         # Exports centralizados
├── hooks/               # Custom hooks
├── types/               # Definições TypeScript
├── utils/               # Funções utilitárias
├── constants/           # Constantes da aplicação
├── i18n/                # Internacionalização
└── assets/              # Recursos estáticos
```

## 🎨 **DESIGN SYSTEM**

### **Componentes Base:**
- **Button** - Botões com variantes (primary, secondary, outline, ghost, danger)
- **Input** - Campos de entrada com validação
- **Modal** - Modais reutilizáveis

### **Características:**
- ✅ TypeScript com props tipadas
- ✅ Acessibilidade (a11y)
- ✅ Responsividade
- ✅ Temas (dark/light)
- ✅ Animações suaves

## 🔧 **SERVIÇOS POR DOMÍNIO**

### **AuthService:**
- `login()` - Autenticação
- `changePassword()` - Alterar senha
- `getProfile()` - Perfil do usuário
- `updateProfile()` - Atualizar perfil

### **JobsService:**
- `getJobs()` - Listar jobs
- `createJob()` - Criar job
- `updateJob()` - Atualizar job
- `deleteJob()` - Deletar job

### **ApplicationsService:**
- `getApplications()` - Listar applications
- `submitApplication()` - Submeter application
- `downloadResume()` - Download de currículo

### **PositionsService:**
- `getPositions()` - Listar positions
- `createPosition()` - Criar position
- `updatePosition()` - Atualizar position

## 📱 **PÁGINAS POR DOMÍNIO**

### **Auth (Público):**
- `LoginPage` - Página de login
- `ChangePasswordPage` - Alterar senha

### **Public (Sem autenticação):**
- `ApplicationPage` - Formulário de candidatura pública

### **Admin (Com autenticação):**
- `DashboardPage` - Dashboard administrativo
- `JobsPage` - Listagem de jobs
- `ApplicationsPage` - Listagem de applications
- `PositionsPage` - Gerenciamento de posições

## ⚙️ **CONFIGURAÇÃO DE AMBIENTE**

### **Variáveis (.env.example):**
```bash
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=10000

# Application Configuration
VITE_APP_NAME=Work With Us
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true

# Internationalization
VITE_DEFAULT_LOCALE=pt_BR
VITE_SUPPORTED_LOCALES=pt_BR,en_US

# Theme Configuration
VITE_DEFAULT_THEME=light
VITE_ENABLE_THEME_TOGGLE=true
```

## 🎯 **BENEFÍCIOS DA NOVA ESTRUTURA**

### **1. Organização:**
- ✅ Separação clara por domínio e acesso
- ✅ Fácil localização de arquivos
- ✅ Escalabilidade
- ✅ Segurança - Páginas públicas vs admin

### **2. Manutenibilidade:**
- ✅ Código modular
- ✅ Responsabilidades bem definidas
- ✅ Fácil refatoração
- ✅ Controle de acesso claro

### **3. Reutilização:**
- ✅ Design System consistente
- ✅ Componentes reutilizáveis
- ✅ Serviços especializados
- ✅ Páginas organizadas por contexto

### **4. Performance:**
- ✅ Imports otimizados
- ✅ Code splitting por domínio
- ✅ Lazy loading
- ✅ Roteamento otimizado por acesso

## 🚀 **PRÓXIMOS PASSOS**

### **Imediato:**
- [ ] Migrar imports para nova estrutura
- [ ] Testar funcionalidades
- [ ] Documentar componentes

### **Médio Prazo:**
- [ ] Implementar testes unitários
- [ ] Adicionar Storybook
- [ ] Otimizar performance

### **Longo Prazo:**
- [ ] Micro-frontends
- [ ] PWA features
- [ ] Acessibilidade avançada

## 📚 **PADRÕES SEGUIDOS**

- **Clean Architecture** - Separação de responsabilidades
- **Domain-Driven Design** - Organização por domínio
- **SOLID Principles** - Código limpo e manutenível
- **Atomic Design** - Componentes atômicos
- **Feature-Based Structure** - Estrutura por features

---

**Esta estrutura segue as melhores práticas do mercado e facilita a manutenção e evolução do projeto!** 🎉
