#!/bin/bash

# =============================================================================
# SCRIPT PARA INICIAR O BACKEND EM PRODUÇÃO
# =============================================================================
# Este script compila, instala dependências e inicia o backend
# Pode ser usado manualmente ou pelo PM2
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 INICIANDO BACKEND EM PRODUÇÃO${NC}"
echo -e "${BLUE}================================${NC}"

# Obter diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

cd "$BACKEND_DIR"

echo -e "${YELLOW}📁 Diretório: $BACKEND_DIR${NC}"

# =============================================================================
# 1. VERIFICAR VARIÁVEIS DE AMBIENTE
# =============================================================================
echo -e "${YELLOW}🔍 Verificando variáveis de ambiente...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}Crie o arquivo .env com as seguintes variáveis:${NC}"
    echo -e "${BLUE}  DATABASE_URL=mysql://user:password@host:3306/database${NC}"
    echo -e "${BLUE}  JWT_SECRET=your-secret-key${NC}"
    echo -e "${BLUE}  NODE_ENV=production${NC}"
    echo -e "${BLUE}  PORT=3001${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"

# Carregar variáveis de ambiente
source .env

# Verificar variáveis obrigatórias
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL não definida no .env${NC}"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}❌ JWT_SECRET não definida no .env${NC}"
    exit 1
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
# 3. GERAR PRISMA CLIENT
# =============================================================================
echo -e "${YELLOW}🔧 Gerando Prisma Client...${NC}"

npx prisma generate

echo -e "${GREEN}✅ Prisma Client gerado${NC}"

# =============================================================================
# 4. VERIFICAR CONEXÃO COM BANCO DE DADOS
# =============================================================================
echo -e "${YELLOW}🔍 Verificando conexão com banco de dados...${NC}"

if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexão com banco de dados OK${NC}"
else
    echo -e "${YELLOW}⚠️  Não foi possível verificar conexão com banco${NC}"
    echo -e "${YELLOW}Continuando mesmo assim...${NC}"
fi

# =============================================================================
# 5. COMPILAR TYPESCRIPT (OPCIONAL)
# =============================================================================
echo -e "${YELLOW}🔨 Compilando TypeScript...${NC}"

if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript compilado com sucesso${NC}"
else
    echo -e "${YELLOW}⚠️  Erro ao compilar TypeScript${NC}"
    echo -e "${YELLOW}Continuando com tsx...${NC}"
fi

# =============================================================================
# 6. INICIAR SERVIDOR
# =============================================================================
echo -e "${YELLOW}🚀 Iniciando servidor...${NC}"

# Verificar se deve usar tsx ou node
if command -v tsx &> /dev/null && [ -f "src/server.ts" ]; then
    echo -e "${GREEN}✅ Usando tsx (resolve aliases @/)${NC}"
    echo -e "${BLUE}Servidor iniciando na porta ${PORT:-3001}...${NC}"
    exec tsx src/server.ts
elif [ -f "dist/server.js" ]; then
    echo -e "${YELLOW}⚠️  tsx não encontrado, usando node${NC}"
    echo -e "${BLUE}Servidor iniciando na porta ${PORT:-3001}...${NC}"
    exec node dist/server.js
else
    echo -e "${RED}❌ Não foi possível iniciar o servidor${NC}"
    echo -e "${RED}Nem tsx nem dist/server.js encontrados${NC}"
    exit 1
fi
