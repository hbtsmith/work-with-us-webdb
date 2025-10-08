#!/bin/bash

# =============================================================================
# SCRIPT PARA INICIAR O FRONTEND EM PRODUÇÃO
# =============================================================================
# Este script prepara e inicia o frontend em produção
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 INICIANDO FRONTEND EM PRODUÇÃO${NC}"
echo -e "${BLUE}==================================${NC}"

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
    echo -e "${YELLOW}Por favor, configure o .env antes de continuar${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"

# Carregar variáveis de ambiente
source .env

# Verificar variáveis obrigatórias
if [ -z "$VITE_API_URL" ]; then
    echo -e "${YELLOW}⚠️  VITE_API_URL não definida no .env${NC}"
    echo -e "${YELLOW}Usando valor padrão: http://localhost:3001${NC}"
fi

echo -e "${GREEN}✅ Variáveis de ambiente configuradas${NC}"

# =============================================================================
# 2. INSTALAR DEPENDÊNCIAS
# =============================================================================
echo -e "${YELLOW}📦 Instalando dependências...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Instalando todas as dependências...${NC}"
    npm ci
else
    echo -e "${GREEN}✅ Dependências já instaladas${NC}"
fi

# =============================================================================
# 3. VERIFICAR BUILD
# =============================================================================
echo -e "${YELLOW}🔍 Verificando build...${NC}"

if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo -e "${YELLOW}⚠️  Build não encontrado ou vazio${NC}"
    echo -e "${YELLOW}Execute './scripts/build-and-deploy.sh' primeiro${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build encontrado${NC}"
echo -e "${BLUE}Tamanho do build: $(du -sh dist | cut -f1)${NC}"

# =============================================================================
# 4. INICIAR SERVIDOR DE PREVIEW
# =============================================================================
echo -e "${YELLOW}🚀 Iniciando servidor de preview...${NC}"

# Obter porta do .env ou usar padrão
PORT=${VITE_PORT:-3000}

echo -e "${GREEN}✅ Servidor iniciando na porta ${PORT}...${NC}"
echo -e "${BLUE}Preview URL: http://localhost:${PORT}${NC}"
echo -e "${YELLOW}Pressione Ctrl+C para parar${NC}"

# Iniciar preview
exec npm run preview
