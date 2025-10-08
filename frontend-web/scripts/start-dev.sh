#!/bin/bash

# =============================================================================
# SCRIPT PARA INICIAR O FRONTEND EM DESENVOLVIMENTO
# =============================================================================
# Este script inicia o frontend em modo de desenvolvimento com hot-reload
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 INICIANDO FRONTEND EM DESENVOLVIMENTO${NC}"
echo -e "${BLUE}=======================================${NC}"

# Obter diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"

cd "$FRONTEND_DIR"

echo -e "${YELLOW}📁 Diretório: $FRONTEND_DIR${NC}"

# =============================================================================
# 1. VERIFICAR VARIÁVEIS DE AMBIENTE
# =============================================================================
echo -e "${YELLOW}🔍 Verificando arquivo .env...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}Por favor, crie o arquivo .env antes de continuar${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"

# =============================================================================
# 2. INSTALAR DEPENDÊNCIAS
# =============================================================================
echo -e "${YELLOW}📦 Verificando dependências...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Instalando dependências...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependências já instaladas${NC}"
fi

# =============================================================================
# 3. INICIAR SERVIDOR EM MODO WATCH
# =============================================================================
echo -e "${YELLOW}🚀 Iniciando servidor em modo watch...${NC}"

# Obter porta do .env ou usar padrão
PORT=${VITE_PORT:-3000}

echo -e "${GREEN}✅ Servidor iniciando na porta ${PORT}...${NC}"
echo -e "${BLUE}Dev URL: http://localhost:${PORT}${NC}"
echo -e "${YELLOW}Pressione Ctrl+C para parar${NC}"

exec npm run dev
