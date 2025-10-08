# Frontend Environment Configuration

## 📋 **Variáveis de Ambiente Disponíveis**

### **Porta do Servidor:**
- **Variável**: `VITE_PORT`
- **Padrão**: `3000`
- **Produção**: `3002`

### **URL da API:**
- **Variável**: `VITE_API_URL`
- **Padrão**: `http://localhost:3001`
- **Produção**: `http://localhost:3001` (ou URL do servidor)

### **Ambiente:**
- **Variável**: `VITE_NODE_ENV`
- **Valores**: `development`, `staging`, `production`

---

## 🚀 **Como Usar**

### **Desenvolvimento Local:**
```bash
# Usar porta padrão (3000)
npm run dev

# Usar porta personalizada
VITE_PORT=3002 npm run dev
```

### **Produção:**
```bash
# Usar configuração de produção (porta 3002)
npm run dev:prod

# Build para produção
npm run build:prod
```

---

## 📁 **Arquivos de Configuração**

### **`.env` (Desenvolvimento)**
```env
VITE_PORT=3000
VITE_API_URL=http://localhost:3001
VITE_NODE_ENV=development
```

### **`.env.production` (Produção)**
```env
VITE_PORT=3002
VITE_API_URL=http://localhost:3001
VITE_NODE_ENV=production
```

### **`.env.example` (Template)**
```env
VITE_PORT=3000
VITE_API_URL=http://localhost:3001
VITE_NODE_ENV=development
```

---

## 🔧 **Configuração no Servidor**

### **Para usar porta 3002 em produção:**

1. **Copie o arquivo de produção:**
   ```bash
   cp .env.production .env
   ```

2. **Ou defina a variável diretamente:**
   ```bash
   export VITE_PORT=3002
   npm run dev:prod
   ```

3. **Ou use no Docker/PM2:**
   ```bash
   VITE_PORT=3002 npm run dev:prod
   ```

---

## 📝 **Notas Importantes**

- ✅ **Vite** carrega automaticamente arquivos `.env`
- ✅ **Variáveis** devem começar com `VITE_` para serem acessíveis no frontend
- ✅ **Porta** é configurada no `vite.config.ts` via `process.env.VITE_PORT`
- ✅ **API URL** é usada nos serviços do frontend
- ✅ **Ambiente** pode ser usado para configurações condicionais

---

## 🎯 **Exemplos de Uso**

### **Desenvolvimento:**
```bash
# Porta 3000 (padrão)
npm run dev

# Porta 3002 (personalizada)
VITE_PORT=3002 npm run dev
```

### **Produção:**
```bash
# Usar configuração de produção
npm run dev:prod

# Build para produção
npm run build:prod
```

### **Docker:**
```dockerfile
ENV VITE_PORT=3002
ENV VITE_API_URL=http://backend:3001
ENV VITE_NODE_ENV=production
```
