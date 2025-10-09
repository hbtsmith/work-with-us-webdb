# 🚀 Guia de Deploy em Produção

## Scripts Disponíveis

### `deploy-and-restart.sh` - Deploy Completo

Script principal que executa todo o processo de deploy e restart dos serviços.

#### **O que faz:**
1. ✅ Verifica o ambiente de produção
2. 💾 Cria backup dos builds anteriores
3. 📦 Executa build e deploy do **backend**
4. 🎨 Executa build e deploy do **frontend**
5. 🔄 Reinicia os serviços **PM2** (backend e frontend)
6. 🏥 Verifica saúde dos serviços (health check)

#### **Como usar:**

```bash
# No servidor de produção (/var/www/work-with-us-webdb)
./deploy-and-restart.sh
```

#### **Requisitos:**
- ✅ Node.js e npm instalados
- ✅ PM2 instalado globalmente (`npm install -g pm2`)
- ✅ Arquivos `.env` configurados (backend e frontend)
- ✅ Serviços backend e frontend já registrados no PM2

---

## Scripts Individuais

### Backend

#### `backend/scripts/build-and-deploy.sh`

Faz o build e deploy apenas do backend.

```bash
cd /var/www/work-with-us-webdb/backend
./scripts/build-and-deploy.sh
```

**O que faz:**
- Verifica `.env`
- Instala dependências (`npm ci`)
- Gera Prisma Client
- Aplica migrations (modo seguro)
- Faz build do TypeScript
- Prepara para produção

#### `backend/scripts/start-production.sh`

Inicia o backend em produção.

```bash
cd /var/www/work-with-us-webdb/backend
./scripts/start-production.sh
```

---

### Frontend

#### `frontend-web/scripts/build-and-deploy.sh`

Faz o build e deploy apenas do frontend.

```bash
cd /var/www/work-with-us-webdb/frontend-web
./scripts/build-and-deploy.sh
```

**O que faz:**
- Verifica `.env` e `.env.production`
- Instala dependências (`npm ci`)
- Faz build otimizado para produção
- Valida build

#### `frontend-web/scripts/start-production.sh`

Inicia o frontend em produção (Vite preview).

```bash
cd /var/www/work-with-us-webdb/frontend-web
./scripts/start-production.sh
```

---

## Gerenciamento PM2

### Comandos Básicos

```bash
# Ver status dos serviços
pm2 status

# Ver logs em tempo real
pm2 logs

# Ver logs apenas do backend
pm2 logs backend

# Ver logs apenas do frontend
pm2 logs frontend

# Monitorar recursos (CPU, memória)
pm2 monit

# Reiniciar serviços
pm2 restart backend
pm2 restart frontend
pm2 restart all

# Parar serviços
pm2 stop backend
pm2 stop frontend

# Remover serviços do PM2
pm2 delete backend
pm2 delete frontend

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
```

---

## Configuração Inicial PM2

Se os serviços ainda não estão no PM2:

### Backend

```bash
cd /var/www/work-with-us-webdb/backend
pm2 start npm --name "backend" -- start
pm2 save
```

### Frontend

```bash
cd /var/www/work-with-us-webdb/frontend-web
pm2 start npm --name "frontend" -- run preview:prod
pm2 save
```

---

## Fluxo de Deploy Recomendado

### 1. Fazer Pull das Mudanças

```bash
cd /var/www/work-with-us-webdb
git pull origin main
```

### 2. Executar Deploy Completo

```bash
./deploy-and-restart.sh
```

### 3. Verificar Logs

```bash
pm2 logs
```

---

## Troubleshooting

### ❌ Erro: "Backend não está respondendo na porta 3001"

```bash
# Verificar se a porta está em uso
netstat -tlnp | grep 3001

# Ver logs do backend
pm2 logs backend

# Reiniciar backend
pm2 restart backend
```

### ❌ Erro: "PM2 não encontrado"

```bash
# Instalar PM2 globalmente
npm install -g pm2
```

### ❌ Erro: "Arquivo .env não encontrado"

```bash
# Backend
cp /var/www/work-with-us-webdb/backend/.env.example /var/www/work-with-us-webdb/backend/.env
# Editar com suas variáveis
nano /var/www/work-with-us-webdb/backend/.env

# Frontend
cp /var/www/work-with-us-webdb/frontend-web/.env.example /var/www/work-with-us-webdb/frontend-web/.env.production
# Editar com suas variáveis
nano /var/www/work-with-us-webdb/frontend-web/.env.production
```

### ❌ Erro: "Prisma migrations falharam"

```bash
cd /var/www/work-with-us-webdb/backend
npx prisma db push --skip-generate --accept-data-loss=false
npx prisma generate
```

---

## Rollback (Reverter Deploy)

Se algo der errado, você pode reverter para o backup anterior:

```bash
cd /var/www/work-with-us-webdb

# Listar backups disponíveis
ls -lh .backups/

# Restaurar backend
tar -xzf .backups/backup_TIMESTAMP_backend.tar.gz -C backend/

# Restaurar frontend
tar -xzf .backups/backup_TIMESTAMP_frontend.tar.gz -C frontend-web/

# Reiniciar serviços
pm2 restart all
```

---

## Monitoramento Contínuo

### Script de Monitoramento

```bash
# Ver status em tempo real
watch -n 2 'pm2 status && echo "" && netstat -tlnp | grep -E "3001|3002"'
```

### Logs Persistentes

```bash
# Salvar logs em arquivo
pm2 logs --lines 1000 > deploy-logs-$(date +%Y%m%d_%H%M%S).txt
```

---

## Checklist de Deploy

- [ ] Fazer backup do código atual
- [ ] Fazer `git pull` das últimas mudanças
- [ ] Verificar se `.env` está atualizado
- [ ] Executar `./deploy-and-restart.sh`
- [ ] Verificar logs (`pm2 logs`)
- [ ] Testar endpoints principais
- [ ] Verificar interface no navegador
- [ ] Confirmar que não há erros nos logs

---

## Contato e Suporte

Em caso de problemas, verificar:
1. Logs do PM2: `pm2 logs`
2. Logs do Apache: `/var/log/apache2/error.log`
3. Status dos serviços: `pm2 status`
4. Health check: `./deploy-and-restart.sh` (última seção)

---

**Última atualização:** 2025-10-08

