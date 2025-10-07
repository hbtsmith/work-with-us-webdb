# 🏗️ **ESTRUTURA DE PASTAS - WORK WITH US**

## 📁 **ORGANIZAÇÃO POR ACESSO**

### **🔓 PÁGINAS PÚBLICAS** (Sem autenticação)
```
src/pages/
├── auth/                    # Autenticação
│   ├── LoginPage.tsx        # Login
│   └── ChangePasswordPage.tsx # Alterar senha
└── public/                  # Páginas públicas
    └── ApplicationPage.tsx   # Formulário de candidatura
```

### **🔒 PÁGINAS ADMINISTRATIVAS** (Com autenticação)
```
src/pages/
└── admin/                   # Páginas administrativas
    ├── DashboardPage.tsx     # Dashboard
    ├── JobsPage.tsx         # Gerenciamento de jobs
    ├── ApplicationsPage.tsx  # Gerenciamento de applications
    └── PositionsPage.tsx    # Gerenciamento de posições
```

## 🛡️ **CONTROLE DE ACESSO**

### **Rotas Públicas:**
- ✅ `/login` - Login
- ✅ `/application/:slug` - Candidatura pública

### **Rotas Protegidas:**
- 🔒 `/` - Dashboard (admin)
- 🔒 `/jobs` - Gerenciar jobs (admin)
- 🔒 `/applications` - Gerenciar applications (admin)
- 🔒 `/positions` - Gerenciar posições (admin)
- 🔒 `/change-password` - Alterar senha (admin)

## 🎯 **BENEFÍCIOS DA ORGANIZAÇÃO**

### **1. Segurança:**
- ✅ **Separação clara** entre público e admin
- ✅ **Controle de acesso** visual
- ✅ **Proteção** de rotas administrativas

### **2. Manutenibilidade:**
- ✅ **Fácil identificação** do tipo de página
- ✅ **Organização lógica** por contexto
- ✅ **Manutenção** simplificada

### **3. Escalabilidade:**
- ✅ **Adição fácil** de novas páginas
- ✅ **Separação** de responsabilidades
- ✅ **Evolução** organizada

## 📊 **ESTRUTURA FINAL**

```
src/
├── components/              # Componentes reutilizáveis
│   ├── ui/                 # Design System
│   ├── forms/              # Formulários
│   ├── layout/             # Layout
│   └── features/           # Features específicas
├── pages/                  # Páginas da aplicação
│   ├── auth/               # Autenticação (público)
│   ├── public/             # Páginas públicas
│   └── admin/              # Páginas administrativas
├── services/               # Lógica de negócio
│   ├── api/                # Cliente HTTP
│   ├── auth/               # Autenticação
│   ├── jobs/               # Jobs
│   ├── applications/       # Applications
│   └── positions/         # Positions
├── hooks/                  # Custom hooks
├── types/                  # TypeScript types
├── utils/                  # Utilitários
├── constants/              # Constantes
├── i18n/                   # Internacionalização
└── assets/                 # Recursos estáticos
```

## 🚀 **IMPLEMENTAÇÃO**

### **Exports Centralizados:**
```typescript
// src/pages/index.ts
export { LoginPage } from './auth/LoginPage';
export { ApplicationPage } from './public/ApplicationPage';
export { DashboardPage } from './admin/DashboardPage';
export { JobsPage } from './admin/JobsPage';
export { ApplicationsPage } from './admin/ApplicationsPage';
export { PositionsPage } from './admin/PositionsPage';
```

### **Roteamento:**
```typescript
// App.tsx
<Routes>
  {/* Públicas */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/application/:slug" element={<ApplicationPage />} />
  
  {/* Protegidas */}
  <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
  <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
  <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
  <Route path="/positions" element={<ProtectedRoute><PositionsPage /></ProtectedRoute>} />
</Routes>
```

---

**Esta estrutura garante organização, segurança e manutenibilidade!** 🎉
