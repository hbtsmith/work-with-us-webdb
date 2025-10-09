#!/bin/bash

# =============================================================================
# SCRIPT DE DEPLOY E RESTART COMPLETO PARA PRODUÇÃO
# =============================================================================
# Este script executa o build e deploy do backend e frontend, e reinicia os
# serviços PM2 em produção.
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Diretórios
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend-web"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        🚀 DEPLOY E RESTART PRODUÇÃO - WORK WITH US           ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# FUNÇÃO: Verificar se estamos em produção
# =============================================================================
check_environment() {
    echo -e "${BLUE}🔍 Verificando ambiente...${NC}"
    
    # Verificar se o diretório é /var/www
    if [[ ! "$PROJECT_ROOT" == /var/www/* ]]; then
        echo -e "${YELLOW}⚠️  ATENÇÃO: Este script parece não estar rodando em /var/www${NC}"
        echo -e "${YELLOW}   Caminho atual: $PROJECT_ROOT${NC}"
        read -p "Deseja continuar mesmo assim? (s/N): " confirm
        if [[ ! "$confirm" =~ ^[sS]$ ]]; then
            echo -e "${RED}❌ Deploy cancelado pelo usuário${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ Ambiente verificado${NC}"
    echo ""
}

# =============================================================================
# FUNÇÃO: Fazer backup antes do deploy
# =============================================================================
create_backup() {
    echo -e "${BLUE}💾 Criando backup...${NC}"
    
    BACKUP_DIR="$PROJECT_ROOT/.backups"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_NAME="backup_${TIMESTAMP}"
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup do backend dist (se existir)
    if [ -d "$BACKEND_DIR/dist" ]; then
        echo -e "${CYAN}   Fazendo backup do backend/dist...${NC}"
        tar -czf "$BACKUP_DIR/${BACKUP_NAME}_backend.tar.gz" -C "$BACKEND_DIR" dist 2>/dev/null || true
    fi
    
    # Backup do frontend dist (se existir)
    if [ -d "$FRONTEND_DIR/dist" ]; then
        echo -e "${CYAN}   Fazendo backup do frontend/dist...${NC}"
        tar -czf "$BACKUP_DIR/${BACKUP_NAME}_frontend.tar.gz" -C "$FRONTEND_DIR" dist 2>/dev/null || true
    fi
    
    # Manter apenas os últimos 5 backups
    cd "$BACKUP_DIR"
    ls -t backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
    
    echo -e "${GREEN}✅ Backup criado: $BACKUP_NAME${NC}"
    echo ""
}

# =============================================================================
# FUNÇÃO: Deploy do Backend
# =============================================================================
deploy_backend() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    📦 DEPLOY BACKEND                          ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    cd "$BACKEND_DIR"
    
    # Verificar se o script existe
    if [ ! -f "scripts/build-and-deploy.sh" ]; then
        echo -e "${RED}❌ Script backend/scripts/build-and-deploy.sh não encontrado!${NC}"
        exit 1
    fi
    
    # Tornar executável
    chmod +x scripts/build-and-deploy.sh
    
    # Executar deploy
    echo -e "${BLUE}🔨 Executando build e deploy do backend...${NC}"
    ./scripts/build-and-deploy.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend deployado com sucesso!${NC}"
    else
        echo -e "${RED}❌ Falha no deploy do backend!${NC}"
        exit 1
    fi
    
    echo ""
}

# =============================================================================
# FUNÇÃO: Deploy do Frontend
# =============================================================================
deploy_frontend() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    🎨 DEPLOY FRONTEND                         ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    cd "$FRONTEND_DIR"
    
    # Verificar se o script existe
    if [ ! -f "scripts/build-and-deploy.sh" ]; then
        echo -e "${RED}❌ Script frontend-web/scripts/build-and-deploy.sh não encontrado!${NC}"
        exit 1
    fi
    
    # Tornar executável
    chmod +x scripts/build-and-deploy.sh
    
    # Executar deploy
    echo -e "${BLUE}🔨 Executando build e deploy do frontend...${NC}"
    ./scripts/build-and-deploy.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend deployado com sucesso!${NC}"
    else
        echo -e "${RED}❌ Falha no deploy do frontend!${NC}"
        exit 1
    fi
    
    echo ""
}

# =============================================================================
# FUNÇÃO: Restart dos serviços PM2
# =============================================================================
restart_pm2() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    🔄 RESTART PM2                             ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Verificar se PM2 está instalado
    if ! command -v pm2 &> /dev/null; then
        echo -e "${RED}❌ PM2 não encontrado! Instale com: npm install -g pm2${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔄 Reiniciando backend...${NC}"
    pm2 restart backend 2>/dev/null || pm2 start backend
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend reiniciado${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend pode não estar no PM2. Verificando...${NC}"
        pm2 list | grep backend || echo -e "${RED}❌ Backend não encontrado no PM2${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🔄 Reiniciando frontend...${NC}"
    pm2 restart frontend 2>/dev/null || pm2 start frontend
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend reiniciado${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend pode não estar no PM2. Verificando...${NC}"
        pm2 list | grep frontend || echo -e "${RED}❌ Frontend não encontrado no PM2${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📊 Status dos serviços PM2:${NC}"
    pm2 list
    
    echo ""
    echo -e "${BLUE}💾 Salvando configuração do PM2...${NC}"
    pm2 save
    
    echo -e "${GREEN}✅ Serviços PM2 reiniciados!${NC}"
    echo ""
}

# =============================================================================
# FUNÇÃO: Verificar saúde dos serviços
# =============================================================================
health_check() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    🏥 HEALTH CHECK                            ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${BLUE}🔍 Verificando portas...${NC}"
    
    # Backend (porta 3001)
    if netstat -tlnp 2>/dev/null | grep -q ":3001 "; then
        echo -e "${GREEN}✅ Backend respondendo na porta 3001${NC}"
    else
        echo -e "${RED}❌ Backend NÃO está respondendo na porta 3001${NC}"
    fi
    
    # Frontend (porta 3002)
    if netstat -tlnp 2>/dev/null | grep -q ":3002 "; then
        echo -e "${GREEN}✅ Frontend respondendo na porta 3002${NC}"
    else
        echo -e "${RED}❌ Frontend NÃO está respondendo na porta 3002${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🔍 Testando endpoints...${NC}"
    
    # Testar backend
    if curl -s http://localhost:3001/api/jobs > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend API respondendo${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend API não respondeu (pode precisar de autenticação)${NC}"
    fi
    
    # Testar frontend
    if curl -s http://localhost:3002 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend respondendo${NC}"
    else
        echo -e "${RED}❌ Frontend não está respondendo${NC}"
    fi
    
    echo ""
}

# =============================================================================
# MAIN
# =============================================================================
main() {
    echo -e "${YELLOW}📅 Data/Hora: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""
    
    # Verificar ambiente
    check_environment
    
    # Criar backup
    create_backup
    
    # Deploy do backend
    deploy_backend
    
    # Deploy do frontend
    deploy_frontend
    
    # Restart PM2
    restart_pm2
    
    # Health check
    health_check
    
    # Resumo final
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    ✅ DEPLOY CONCLUÍDO                        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🎉 Deploy e restart concluídos com sucesso!${NC}"
    echo ""
    echo -e "${BLUE}📝 Logs disponíveis em:${NC}"
    echo -e "   Backend:  pm2 logs backend"
    echo -e "   Frontend: pm2 logs frontend"
    echo ""
    echo -e "${BLUE}🔧 Comandos úteis:${NC}"
    echo -e "   Ver status:  pm2 status"
    echo -e "   Ver logs:    pm2 logs"
    echo -e "   Monitorar:   pm2 monit"
    echo ""
}

# Executar
main

