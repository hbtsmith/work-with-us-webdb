#!/bin/bash

# =============================================================================
# SCRIPT PARA BUILD E DEPLOY DO BACKEND
# =============================================================================
# Este script faz build, testes e deploy do backend em produção
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 BUILD E DEPLOY DO BACKEND${NC}"
echo -e "${BLUE}============================${NC}"

# Obter diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

cd "$BACKEND_DIR"

echo -e "${YELLOW}📁 Diretório: $BACKEND_DIR${NC}"

# =============================================================================
# 1. LIMPAR BUILD ANTERIOR
# =============================================================================
echo -e "${YELLOW}🧹 Limpando build anterior...${NC}"

if [ -d "dist" ]; then
    rm -rf dist
    echo -e "${GREEN}✅ Build anterior removido${NC}"
else
    echo -e "${GREEN}✅ Nenhum build anterior encontrado${NC}"
fi

# =============================================================================
# 2. INSTALAR DEPENDÊNCIAS
# =============================================================================
echo -e "${YELLOW}📦 Instalando dependências...${NC}"

npm ci

echo -e "${GREEN}✅ Dependências instaladas${NC}"

# =============================================================================
# 3. GERAR PRISMA CLIENT
# =============================================================================
echo -e "${YELLOW}🔧 Gerando Prisma Client...${NC}"

npx prisma generate

echo -e "${GREEN}✅ Prisma Client gerado${NC}"

# =============================================================================
# 4. EXECUTAR LINTER
# =============================================================================
echo -e "${YELLOW}🔍 Executando linter...${NC}"

if npm run lint; then
    echo -e "${GREEN}✅ Linter passou${NC}"
else
    echo -e "${YELLOW}⚠️  Linter encontrou problemas${NC}"
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${RED}❌ Build cancelado${NC}"
        exit 1
    fi
fi

# =============================================================================
# 5. COMPILAR TYPESCRIPT
# =============================================================================
echo -e "${YELLOW}🔨 Compilando TypeScript...${NC}"

npm run build

echo -e "${GREEN}✅ TypeScript compilado com sucesso${NC}"

# =============================================================================
# 6. VERIFICAR BUILD
# =============================================================================
echo -e "${YELLOW}🔍 Verificando build...${NC}"

if [ -f "dist/server.js" ]; then
    echo -e "${GREEN}✅ Build gerado com sucesso${NC}"
    echo -e "${BLUE}Tamanho do build: $(du -sh dist | cut -f1)${NC}"
else
    echo -e "${RED}❌ Build não foi gerado corretamente${NC}"
    exit 1
fi

# =============================================================================
# 7. RESUMO
# =============================================================================
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ BUILD CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${BLUE}Para iniciar o servidor:${NC}"
echo -e "${YELLOW}  ./scripts/start-production.sh${NC}"
echo -e "${BLUE}Ou com PM2:${NC}"
echo -e "${YELLOW}  pm2 start ./scripts/start-production.sh --name backend${NC}"
