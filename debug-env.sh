#!/bin/bash

# =============================================================================
# SCRIPT DE DEBUG PARA VARIÁVEIS DE AMBIENTE EM PRODUÇÃO
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 DEBUG VARIÁVEIS DE AMBIENTE - PRODUÇÃO${NC}"
echo -e "${BLUE}==========================================${NC}"

# =============================================================================
# 1. VERIFICAR ARQUIVO .ENV DO FRONTEND
# =============================================================================
echo -e "${YELLOW}📁 Verificando arquivo .env do frontend...${NC}"

FRONTEND_ENV="/var/www/work-with-us-webdb/frontend-web/.env"

if [ -f "$FRONTEND_ENV" ]; then
    echo -e "${GREEN}✅ Arquivo .env encontrado: $FRONTEND_ENV${NC}"
    echo -e "${BLUE}📄 Conteúdo do arquivo .env:${NC}"
    cat "$FRONTEND_ENV"
    echo ""
    
    # Verificar VITE_API_URL especificamente
    if grep -q "VITE_API_URL" "$FRONTEND_ENV"; then
        VITE_API_URL=$(grep "VITE_API_URL" "$FRONTEND_ENV" | cut -d'=' -f2)
        echo -e "${GREEN}✅ VITE_API_URL encontrada: $VITE_API_URL${NC}"
    else
        echo -e "${RED}❌ VITE_API_URL não encontrada no .env${NC}"
    fi
else
    echo -e "${RED}❌ Arquivo .env não encontrado: $FRONTEND_ENV${NC}"
fi

# =============================================================================
# 2. VERIFICAR BUILD DO FRONTEND
# =============================================================================
echo -e "${YELLOW}📦 Verificando build do frontend...${NC}"

FRONTEND_DIST="/var/www/work-with-us-webdb/frontend-web/dist"

if [ -d "$FRONTEND_DIST" ]; then
    echo -e "${GREEN}✅ Pasta dist encontrada${NC}"
    echo -e "${BLUE}📊 Tamanho: $(du -sh $FRONTEND_DIST | cut -f1)${NC}"
    
    # Verificar se há arquivos JS
    JS_FILES=$(find "$FRONTEND_DIST" -name "*.js" | wc -l)
    echo -e "${BLUE}📄 Arquivos JS: $JS_FILES${NC}"
    
    # Procurar por localhost nos arquivos JS (para ver se a variável foi substituída)
    echo -e "${YELLOW}🔍 Procurando por 'localhost' nos arquivos JS...${NC}"
    if grep -r "localhost" "$FRONTEND_DIST"/*.js 2>/dev/null | head -5; then
        echo -e "${RED}⚠️  Encontrado 'localhost' nos arquivos JS - variável pode não ter sido substituída${NC}"
    else
        echo -e "${GREEN}✅ Nenhum 'localhost' encontrado nos arquivos JS${NC}"
    fi
else
    echo -e "${RED}❌ Pasta dist não encontrada: $FRONTEND_DIST${NC}"
fi

# =============================================================================
# 3. VERIFICAR PROCESSO PM2
# =============================================================================
echo -e "${YELLOW}🚀 Verificando processo PM2...${NC}"

if command -v pm2 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PM2 disponível${NC}"
    pm2 status
    echo ""
    
    # Verificar logs do frontend
    echo -e "${YELLOW}📋 Últimas 20 linhas dos logs do frontend:${NC}"
    pm2 logs frontend --lines 20 --nostream
else
    echo -e "${RED}❌ PM2 não encontrado${NC}"
fi

# =============================================================================
# 4. TESTAR CONECTIVIDADE
# =============================================================================
echo -e "${YELLOW}🌐 Testando conectividade...${NC}"

# Testar se o backend está respondendo
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}✅ Backend respondendo em localhost:3001${NC}"
else
    echo -e "${RED}❌ Backend não está respondendo em localhost:3001${NC}"
fi

# Testar se o frontend está respondendo
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend respondendo em localhost:3002${NC}"
else
    echo -e "${RED}❌ Frontend não está respondendo em localhost:3002${NC}"
fi

# =============================================================================
# 5. VERIFICAR VARIÁVEIS DE AMBIENTE DO SISTEMA
# =============================================================================
echo -e "${YELLOW}🔧 Variáveis de ambiente do sistema:${NC}"
echo -e "${BLUE}NODE_ENV: ${NODE_ENV:-'não definida'}${NC}"
echo -e "${BLUE}PATH: ${PATH}${NC}"

echo -e "${GREEN}✅ Debug concluído!${NC}"
