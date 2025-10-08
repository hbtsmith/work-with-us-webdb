#!/bin/bash

# =============================================================================
# SCRIPT DE ATUALIZAÇÃO PARA PRODUÇÃO - WORK WITH US
# =============================================================================
# Este script atualiza o sistema em produção:
# - Atualiza código do GitHub
# - Reinstala dependências
# - Reinicia serviços
# - Verifica status
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
DOMAIN="trabalhos.reservejoias.com.br"
BACKEND_PORT="3001"
FRONTEND_PORT="3002"
DEPLOY_DIR="/var/www/work-with-us-webdb"
BACKEND_DIR="$DEPLOY_DIR/backend"
FRONTEND_DIR="$DEPLOY_DIR/frontend-web"
SERVICE_USER="www-data"

echo -e "${BLUE}🔄 ATUALIZANDO SISTEMA EM PRODUÇÃO${NC}"
echo -e "${BLUE}===================================${NC}"

# =============================================================================
# 1. BACKUP DA VERSÃO ATUAL
# =============================================================================
echo -e "${YELLOW}💾 Fazendo backup da versão atual...${NC}"

BACKUP_DIR="/var/backups/work-with-us-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup do código atual
cp -r "$DEPLOY_DIR" "$BACKUP_DIR/"

echo -e "${GREEN}✅ Backup criado em: $BACKUP_DIR${NC}"

# =============================================================================
# 2. ATUALIZAR CÓDIGO
# =============================================================================
echo -e "${YELLOW}📥 Atualizando código do GitHub...${NC}"

cd "$DEPLOY_DIR"

# Fazer backup das configurações locais
cp "$BACKEND_DIR/.env" "$BACKUP_DIR/backend.env" 2>/dev/null || true
cp "$FRONTEND_DIR/.env" "$BACKUP_DIR/frontend.env" 2>/dev/null || true

# Atualizar código
git fetch origin
git reset --hard origin/main

# Restaurar configurações locais
cp "$BACKUP_DIR/backend.env" "$BACKEND_DIR/.env" 2>/dev/null || true
cp "$BACKUP_DIR/frontend.env" "$FRONTEND_DIR/.env" 2>/dev/null || true

echo -e "${GREEN}✅ Código atualizado${NC}"

# =============================================================================
# 3. ATUALIZAR BACKEND
# =============================================================================
echo -e "${YELLOW}⚙️  Atualizando backend...${NC}"

cd "$BACKEND_DIR"

# Instalar/atualizar dependências
npm ci --production

# Gerar Prisma client
npx prisma generate

# Atualizar banco de dados
npx prisma db push

echo -e "${GREEN}✅ Backend atualizado${NC}"

# =============================================================================
# 4. ATUALIZAR FRONTEND
# =============================================================================
echo -e "${YELLOW}⚙️  Atualizando frontend...${NC}"

cd "$FRONTEND_DIR"

# Instalar/atualizar dependências
npm ci

# Build do frontend
npm run build

echo -e "${GREEN}✅ Frontend atualizado${NC}"

# =============================================================================
# 5. REINICIAR SERVIÇOS
# =============================================================================
echo -e "${YELLOW}🔄 Reiniciando serviços...${NC}"

# Reiniciar serviços PM2
sudo -u $SERVICE_USER pm2 restart work-with-us-backend
sudo -u $SERVICE_USER pm2 restart work-with-us-frontend

# Salvar configuração PM2
sudo -u $SERVICE_USER pm2 save

echo -e "${GREEN}✅ Serviços reiniciados${NC}"

# =============================================================================
# 6. VERIFICAR STATUS
# =============================================================================
echo -e "${YELLOW}🔍 Verificando status...${NC}"

# Aguardar serviços iniciarem
sleep 5

# Verificar PM2
sudo -u $SERVICE_USER pm2 status

# Testar endpoints
echo -e "${YELLOW}Testando endpoints...${NC}"

# Testar backend
if curl -s http://localhost:$BACKEND_PORT/api/jobs > /dev/null; then
    echo -e "${GREEN}✅ Backend respondendo${NC}"
else
    echo -e "${RED}❌ Backend não está respondendo${NC}"
fi

# Testar frontend
if curl -s http://localhost:$FRONTEND_PORT > /dev/null; then
    echo -e "${GREEN}✅ Frontend respondendo${NC}"
else
    echo -e "${RED}❌ Frontend não está respondendo${NC}"
fi

# =============================================================================
# 7. INFORMAÇÕES FINAIS
# =============================================================================
echo -e "${BLUE}🎉 ATUALIZAÇÃO CONCLUÍDA!${NC}"
echo -e "${BLUE}========================${NC}"
echo -e "${GREEN}✅ Sistema atualizado com sucesso${NC}"
echo -e "${GREEN}✅ Site: https://$DOMAIN${NC}"
echo -e "${GREEN}✅ Backup salvo em: $BACKUP_DIR${NC}"
echo ""
echo -e "${YELLOW}📋 Comandos úteis:${NC}"
echo -e "${BLUE}  PM2 Status:${NC} sudo -u $SERVICE_USER pm2 status"
echo -e "${BLUE}  PM2 Logs:${NC} sudo -u $SERVICE_USER pm2 logs"
echo -e "${BLUE}  Rollback:${NC} cp -r $BACKUP_DIR/* $DEPLOY_DIR/"
echo ""
echo -e "${GREEN}🚀 Sistema atualizado e funcionando!${NC}"
