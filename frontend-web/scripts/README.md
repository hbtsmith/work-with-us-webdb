# 📜 Scripts do Frontend

Este diretório contém scripts para facilitar o desenvolvimento, build e deploy do frontend.

## 📋 Scripts Disponíveis

### 🚀 `start-production.sh`

Script completo para iniciar o frontend em produção.

**O que faz:**
- ✅ Verifica se .env existe (NÃO cria ou edita)
- ✅ Instala/atualiza dependências
- ✅ Verifica se build existe
- ✅ Inicia servidor de preview (Vite preview)

**Como usar:**
```bash
# Executar diretamente
./scripts/start-production.sh

# Com PM2
pm2 start ./scripts/start-production.sh --name frontend

# Com PM2 e auto-restart
pm2 start ./scripts/start-production.sh --name frontend --watch
```

**Requisitos:**
- Arquivo `.env` configurado
- Build gerado (`dist/` folder)
- Node.js 18+
- npm

---

### 🛠️ `start-dev.sh`

Script para iniciar o frontend em modo de desenvolvimento com hot-reload.

**O que faz:**
- ✅ Verifica se .env existe (NÃO cria ou edita)
- ✅ Instala dependências (se necessário)
- ✅ Inicia servidor Vite em modo watch

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
- 🎨 Suporta Tailwind CSS

---

### 🔨 `build-and-deploy.sh`

Script para fazer build completo e preparar para deploy.

**O que faz:**
- ✅ Verifica se .env existe (NÃO cria ou edita)
- ✅ Limpa build anterior
- ✅ Instala/atualiza dependências
- ✅ Executa linter
- ✅ Verifica tipos TypeScript
- ✅ Compila e faz build otimizado
- ✅ Verifica build gerado

**⚠️ IMPORTANTE:**
- NÃO mexe no arquivo .env
- Build otimizado para produção
- Minificação e tree-shaking automáticos

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

Todos os scripts requerem um arquivo `.env` na raiz do frontend:

```env
# API Backend
VITE_API_URL=http://localhost:3001

# Porta do servidor
VITE_PORT=3000

# Ambiente
VITE_NODE_ENV=production  # ou development
```

### Variáveis de Ambiente

**Vite usa o prefixo `VITE_`** para expor variáveis ao cliente:

- `VITE_API_URL`: URL do backend API
- `VITE_PORT`: Porta do servidor de desenvolvimento/preview
- `VITE_NODE_ENV`: Ambiente (development/production)

**⚠️ Segurança:**
- Nunca coloque secrets no .env do frontend
- Variáveis com `VITE_` são públicas no bundle
- Use apenas URLs e configurações públicas

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
pm2 start ./scripts/start-production.sh --name frontend

# 3. Salvar configuração PM2
pm2 save

# 4. Configurar auto-start
pm2 startup
```

### Atualização em Produção

```bash
# 1. Parar servidor
pm2 stop frontend

# 2. Atualizar código
git pull origin main

# 3. Rebuild
./scripts/build-and-deploy.sh

# 4. Reiniciar
pm2 restart frontend
```

---

## 🐛 Troubleshooting

### Erro: ".env não encontrado"

**Solução:** Crie o arquivo `.env`:
```bash
echo 'VITE_API_URL=http://localhost:3001' > .env
echo 'VITE_PORT=3000' >> .env
echo 'VITE_NODE_ENV=production' >> .env
```

### Erro: "Build não encontrado"

**Solução:** Execute o build primeiro:
```bash
./scripts/build-and-deploy.sh
```

### Erro: "Port already in use"

**Solução:** Mude a porta no `.env`:
```bash
# Editar .env
VITE_PORT=3002
```

### Servidor não inicia

**Verificações:**
1. ✅ Arquivo `.env` existe?
2. ✅ Build foi gerado (`dist/` folder)?
3. ✅ Porta está livre?
4. ✅ Dependências instaladas?

```bash
# Verificar porta
lsof -i :3000

# Verificar build
ls -la dist/

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erros de tipo TypeScript

**Solução:** Execute verificação de tipos:
```bash
npm run type-check
```

### Problemas com Tailwind CSS

**Solução:** Reconstrua o projeto:
```bash
rm -rf dist node_modules
npm install
npm run build
```

---

## 📚 Comandos Úteis

### PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs frontend

# Ver logs em tempo real
pm2 logs frontend --lines 100

# Reiniciar
pm2 restart frontend

# Parar
pm2 stop frontend

# Deletar
pm2 delete frontend

# Monitorar
pm2 monit
```

### NPM Scripts

```bash
# Desenvolvimento
npm run dev              # Iniciar com hot-reload
npm run dev:prod         # Iniciar em modo produção

# Build
npm run build            # Build de produção
npm run build:prod       # Build otimizado

# Preview
npm run preview          # Preview do build
npm run preview:prod     # Preview em modo produção

# Qualidade
npm run lint             # Verificar código
npm run lint:fix         # Corrigir automaticamente
npm run type-check       # Verificar tipos
npm run format           # Formatar código

# Testes
npm run test             # Executar testes
npm run test:ui          # Testes com UI
npm run test:coverage    # Cobertura de testes
```

---

## 🎯 Melhores Práticas

### ✅ Desenvolvimento

- Use `start-dev.sh` para desenvolvimento local
- Sempre rode o linter antes de commit
- Execute testes antes de fazer push
- Verifique tipos TypeScript regularmente

### ✅ Produção

- Use `start-production.sh` com PM2
- Configure logs adequados
- Monitore performance com `pm2 monit`
- Configure auto-restart em caso de crash
- Use HTTPS em produção

### ✅ Deploy

- Sempre faça backup antes
- Teste em ambiente de staging primeiro
- Use `build-and-deploy.sh` antes de deploy
- Mantenha `.env` seguro e fora do git
- Verifique variáveis de ambiente

### ✅ Build

- Build otimizado para produção
- Minificação automática
- Tree-shaking de código não usado
- Code splitting automático
- Assets otimizados

---

## 🚀 Otimizações de Produção

### Vite Build Otimizações

O build de produção inclui automaticamente:

- ✅ **Minificação**: JavaScript e CSS minificados
- ✅ **Tree-shaking**: Remove código não usado
- ✅ **Code splitting**: Divide código em chunks
- ✅ **Asset optimization**: Otimiza imagens e assets
- ✅ **Compression**: Gzip/Brotli ready
- ✅ **Source maps**: Para debugging (opcional)

### Performance

```bash
# Analisar tamanho do bundle
npm run build
du -sh dist/assets/*

# Verificar performance
npm run preview
# Abrir DevTools > Lighthouse
```

---

## 📦 Estrutura do Build

```
dist/
├── index.html              # HTML principal
├── assets/
│   ├── index-[hash].js     # JavaScript principal
│   ├── index-[hash].css    # CSS principal
│   └── [name]-[hash].js    # Chunks de código
└── [outros assets]         # Imagens, fonts, etc.
```

---

## 🔒 Segurança

### Variáveis de Ambiente

**⚠️ CUIDADO:**
- Todas as variáveis `VITE_*` são **públicas**
- Nunca coloque secrets ou API keys
- Use apenas configurações públicas

**✅ Seguro:**
```env
VITE_API_URL=http://localhost:3001
VITE_PORT=3000
```

**❌ INSEGURO:**
```env
VITE_API_KEY=secret-key-123  # NÃO FAÇA ISSO!
VITE_DB_PASSWORD=password    # NÃO FAÇA ISSO!
```

### Build de Produção

- Código minificado
- Source maps removidos (opcional)
- Console.log removidos (opcional)
- Variáveis de ambiente validadas

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique a seção de Troubleshooting
2. Consulte a documentação do projeto
3. Verifique logs do PM2: `pm2 logs frontend`
4. Abra uma issue no repositório
