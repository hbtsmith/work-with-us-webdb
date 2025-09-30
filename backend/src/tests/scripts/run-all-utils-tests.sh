#!/bin/bash

# Script para executar todos os testes unitários de utils em sequência
# Evita conflitos executando um por vez

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Executando todos os testes unitários de utils individualmente...${NC}"
echo ""

# Lista de utils em ordem de dependência
UTILS=(
    "file-upload"
    "pagination" 
    "slug"
)

TOTAL_TESTS=${#UTILS[@]}
PASSED=0
FAILED=0

echo -e "${BLUE}📊 Total de utils: $TOTAL_TESTS${NC}"
echo ""

# Executar cada teste
for i in "${!UTILS[@]}"; do
    UTILS_NAME="${UTILS[$i]}"
    TEST_NUM=$((i + 1))
    
    echo -e "${BLUE}[$TEST_NUM/$TOTAL_TESTS]${NC} Executando: $UTILS_NAME"
    echo "----------------------------------------"
    
    if ./src/tests/scripts/quick-utils-test.sh "$UTILS_NAME" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $UTILS_NAME - PASSOU${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $UTILS_NAME - FALHOU${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    echo ""
done

# Resumo final
echo "========================================"
echo -e "${BLUE}📊 RESUMO FINAL:${NC}"
echo -e "${GREEN}✅ Utils que passaram: $PASSED${NC}"
echo -e "${RED}❌ Utils que falharam: $FAILED${NC}"
echo -e "${BLUE}📈 Taxa de sucesso: $(( (PASSED * 100) / TOTAL_TESTS ))%${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TODOS OS UTILS PASSARAM!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  $FAILED utils falharam${NC}"
    exit 1
fi
