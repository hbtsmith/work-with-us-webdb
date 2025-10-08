#!/bin/bash

# =============================================================================
# SCRIPT PARA EXECUTAR SEED DO BANCO DE DADOS
# =============================================================================
# Este script executa o seed do banco após o deploy
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌱 EXECUTANDO SEED DO BANCO DE DADOS${NC}"
echo -e "${BLUE}===================================${NC}"

# Configurações
BACKEND_DIR="/var/www/work-with-us-webdb/backend"

# Verificar se estamos no diretório correto
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Diretório do backend não encontrado: $BACKEND_DIR${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado${NC}"
    echo -e "${YELLOW}Execute primeiro o deploy-production.sh${NC}"
    exit 1
fi

# Verificar se DATABASE_URL está configurado
if ! grep -q "DATABASE_URL" .env; then
    echo -e "${RED}❌ DATABASE_URL não encontrado no .env${NC}"
    echo -e "${YELLOW}Verifique a configuração do banco de dados${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"

# Verificar se o arquivo de seed existe
if [ ! -f "src/database/seed.ts" ]; then
    echo -e "${YELLOW}⚠️  Arquivo de seed não encontrado${NC}"
    echo -e "${YELLOW}Seed não é necessário para este projeto${NC}"
    exit 0
fi

echo -e "${YELLOW}Executando seed do banco de dados...${NC}"

# Executar seed
if npm run db:seed; then
    echo -e "${GREEN}✅ Seed executado com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao executar seed${NC}"
    echo -e "${YELLOW}Verifique os logs acima para mais detalhes${NC}"
    exit 1
fi

echo -e "${BLUE}🎉 Seed concluído!${NC}"
