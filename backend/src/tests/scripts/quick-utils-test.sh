#!/bin/bash

# Script rápido para executar testes unitários de utils individuais
# Uso: ./quick-utils-test.sh [utils]

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Executando teste unitário de utils...${NC}"

# Mapear nomes para arquivos
case "${1:-file-upload}" in
    "file-upload")
        TEST_FILE="src/tests/utils/fileUpload.test.ts"
        ;;
    "pagination")
        TEST_FILE="src/tests/utils/pagination.test.ts"
        ;;
    "slug")
        TEST_FILE="src/tests/utils/slug.test.ts"
        ;;
    *)
        echo -e "${RED}❌ Utils não encontrado: $1${NC}"
        echo "Utils disponíveis: file-upload, pagination, slug"
        exit 1
        ;;
esac

echo -e "${BLUE}📁 Arquivo: $TEST_FILE${NC}"
echo "----------------------------------------"

# Executar teste
if npx vitest --run "$TEST_FILE" --reporter=verbose; then
    echo -e "${GREEN}✅ Teste passou com sucesso!${NC}"
else
    echo -e "${RED}❌ Teste falhou!${NC}"
    exit 1
fi
