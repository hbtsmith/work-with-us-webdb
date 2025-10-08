# 📜 Scripts do Backend

Este diretório contém scripts para facilitar o desenvolvimento, build e deploy do backend.

## 📋 Scripts Disponíveis

### 🚀 `start-production.sh`

Script completo para iniciar o backend em produção.

**O que faz:**
- ✅ Verifica se .env existe (NÃO cria ou edita)
- ✅ Instala/atualiza dependências
- ✅ Gera Prisma Client
- ✅ Aplica migrations (SEGURO - não deleta dados)
- ✅ Inicia servidor com tsx (resolve aliases @/)

**Como usar:**
```bash
# Executar diretamente
./scripts/start-production.sh

# Com PM2
pm2 start ./scripts/start-production.sh --name backend

# Com PM2 e auto-restart
pm2 start ./scripts/start-production.sh --name backend --watch
```

**Requisitos:**
- Arquivo `.env` configurado
- Node.js 20+
- npm ou yarn

---

### 🛠️ `start-dev.sh`

Script para iniciar o backend em modo de desenvolvimento com hot-reload.

**O que faz:**
- ✅ Verifica variáveis de ambiente (.env)
- ✅ Instala dependências (se necessário)
- ✅ Gera Prisma Client
- ✅ Inicia servidor em modo watch (tsx watch)

**Como usar:**
```bash
# Executar diretamente
./scripts/start-dev.sh

# Ou usar npm
npm run dev
```

**Características:**
- 🔄 Hot-reload automático
- 🐛 Melhor para debugging
- ⚡ Rápido para desenvolvimento

---

### 🔨 `build-and-deploy.sh`

Script para fazer build completo e preparar para deploy.

**O que faz:**
- ✅ Verifica se .env existe (NÃO cria ou edita)
- ✅ Limpa build anterior
- ✅ Instala/atualiza dependências
- ✅ Gera Prisma Client
- ✅ Aplica migrations (SEGURO - não deleta dados)
- ✅ Executa linter
- ✅ Compila TypeScript
- ✅ Verifica build gerado

**⚠️ IMPORTANTE:**
- NÃO mexe no arquivo .env
- NÃO deleta dados do banco
- Usa `--accept-data-loss=false` para segurança

**Como usar:**
```bash
# Executar build
./scripts/build-and-deploy.sh

# Build e iniciar
./scripts/build-and-deploy.sh && ./scripts/start-production.sh
```

**Quando usar:**
- 📦 Antes de fazer deploy
- 🧪 Para testar build de produção
- 🔍 Para verificar erros de compilação

---

## 🔧 Configuração

### Arquivo `.env` Necessário

**⚠️ IMPORTANTE:** Os scripts **NÃO criam nem editam** o arquivo `.env`.  
Você deve criar e configurar o `.env` manualmente antes de executar os scripts.

Todos os scripts requerem um arquivo `.env` na raiz do backend:

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@localhost:3306/work_with_us_db

# Segurança
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Ambiente
NODE_ENV=production  # ou development
PORT=3001

# Opcional
LOG_LEVEL=info
```

### Segurança do Banco de Dados

**✅ Os scripts são SEGUROS:**
- Usam `prisma db push --accept-data-loss=false`
- NÃO deletam dados existentes
- NÃO fazem reset do banco
- Apenas aplicam mudanças de schema necessárias

### Permissões

Torne os scripts executáveis:

```bash
chmod +x scripts/*.sh
```

---

## 📊 Fluxo de Trabalho Recomendado

### Desenvolvimento Local

```bash
# 1. Configurar .env
cp .env.example .env
# Editar .env com suas configurações

# 2. Iniciar em modo desenvolvimento
./scripts/start-dev.sh
```

### Deploy em Produção

```bash
# 1. Fazer build
./scripts/build-and-deploy.sh

# 2. Iniciar com PM2
pm2 start ./scripts/start-production.sh --name backend

# 3. Salvar configuração PM2
pm2 save

# 4. Configurar auto-start
pm2 startup
```

### Atualização em Produção

```bash
# 1. Parar servidor
pm2 stop backend

# 2. Atualizar código
git pull origin main

# 3. Rebuild
./scripts/build-and-deploy.sh

# 4. Reiniciar
pm2 restart backend
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@/...'"

**Solução:** Use `tsx` em vez de `node`:
```bash
# Em vez de
node dist/server.js

# Use
tsx src/server.ts
```

### Erro: "DATABASE_URL não definida"

**Solução:** Crie o arquivo `.env`:
```bash
echo 'DATABASE_URL=mysql://user:pass@localhost:3306/db' > .env
echo 'JWT_SECRET=your-secret' >> .env
```

### Erro: "Prisma Client não gerado"

**Solução:** Gere o Prisma Client:
```bash
npx prisma generate
```

### Servidor não inicia

**Verificações:**
1. ✅ Arquivo `.env` existe?
2. ✅ Banco de dados está rodando?
3. ✅ Porta 3001 está livre?
4. ✅ Dependências instaladas?

```bash
# Verificar porta
lsof -i :3001

# Verificar banco
npx prisma db execute --stdin <<< "SELECT 1;"

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Comandos Úteis

### PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs backend

# Ver logs em tempo real
pm2 logs backend --lines 100

# Reiniciar
pm2 restart backend

# Parar
pm2 stop backend

# Deletar
pm2 delete backend

# Monitorar
pm2 monit
```

### NPM Scripts

```bash
# Desenvolvimento
npm run dev              # Iniciar com hot-reload
npm run dev:nodemon      # Iniciar com nodemon

# Build
npm run build            # Compilar TypeScript

# Testes
npm run test             # Executar todos os testes
npm run test:unit        # Testes unitários
npm run test:e2e         # Testes E2E

# Linter
npm run lint             # Verificar código
npm run lint:fix         # Corrigir automaticamente

# Prisma
npm run db:generate      # Gerar Prisma Client
npm run db:push          # Aplicar schema
npm run db:studio        # Abrir Prisma Studio
npm run db:seed          # Popular banco
```

---

## 🎯 Melhores Práticas

### ✅ Desenvolvimento

- Use `start-dev.sh` para desenvolvimento local
- Sempre rode o linter antes de commit
- Execute testes antes de fazer push

### ✅ Produção

- Use `start-production.sh` com PM2
- Configure logs adequados
- Monitore performance com `pm2 monit`
- Configure auto-restart em caso de crash

### ✅ Deploy

- Sempre faça backup do banco antes
- Teste em ambiente de staging primeiro
- Use `build-and-deploy.sh` antes de deploy
- Mantenha `.env` seguro e fora do git

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique a seção de Troubleshooting
2. Consulte a documentação do projeto
3. Abra uma issue no repositório
