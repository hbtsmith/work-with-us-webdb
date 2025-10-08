#!/bin/bash

# =============================================================================
# SCRIPT PARA BUILD E DEPLOY DO FRONTEND
# =============================================================================
# Este script prepara o frontend para produção:
# - Instala/atualiza dependências
# - Executa linter
# - Verifica tipos TypeScript
# - Compila e faz build otimizado
# 
# NÃO mexe no arquivo .env
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 BUILD E DEPLOY DO FRONTEND${NC}"
echo -e "${BLUE}=============================${NC}"

# Obter diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"

cd "$FRONTEND_DIR"

echo -e "${YELLOW}📁 Diretório: $FRONTEND_DIR${NC}"

# =============================================================================
# 0. VERIFICAR .ENV
# =============================================================================
echo -e "${YELLOW}🔍 Verificando arquivo .env...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo -e "${YELLOW}Por favor, configure o .env antes de continuar${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"

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
# 3. EXECUTAR LINTER
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
# 4. VERIFICAR TIPOS TYPESCRIPT
# =============================================================================
echo -e "${YELLOW}🔍 Verificando tipos TypeScript...${NC}"

if npm run type-check; then
    echo -e "${GREEN}✅ Tipos TypeScript OK${NC}"
else
    echo -e "${YELLOW}⚠️  Erros de tipo encontrados${NC}"
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${RED}❌ Build cancelado${NC}"
        exit 1
    fi
fi

# =============================================================================
# 5. COMPILAR E BUILD
# =============================================================================
echo -e "${YELLOW}🔨 Compilando e fazendo build...${NC}"

# Usar modo production para garantir que .env.production seja carregado
npm run build:prod

echo -e "${GREEN}✅ Build concluído com sucesso${NC}"

# =============================================================================
# 6. VERIFICAR BUILD
# =============================================================================
echo -e "${YELLOW}🔍 Verificando build...${NC}"

if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ Build gerado com sucesso${NC}"
    echo -e "${BLUE}Tamanho do build: $(du -sh dist | cut -f1)${NC}"
    echo -e "${BLUE}Arquivos principais:${NC}"
    ls -lh dist/*.html dist/assets/*.js dist/assets/*.css 2>/dev/null | head -5 || echo "  (arquivos estáticos gerados)"
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
echo -e "${BLUE}📋 O que foi feito:${NC}"
echo -e "${GREEN}  ✅ Dependências atualizadas${NC}"
echo -e "${GREEN}  ✅ Linter executado${NC}"
echo -e "${GREEN}  ✅ Tipos verificados${NC}"
echo -e "${GREEN}  ✅ Build otimizado gerado${NC}"
echo -e ""
echo -e "${BLUE}🚀 Para iniciar o servidor:${NC}"
echo -e "${YELLOW}  ./scripts/start-production.sh${NC}"
echo -e "${BLUE}Ou com PM2:${NC}"
echo -e "${YELLOW}  pm2 start ./scripts/start-production.sh --name frontend${NC}"
echo -e ""
echo -e "${BLUE}📦 Para testar o build localmente:${NC}"
echo -e "${YELLOW}  npm run preview${NC}"
