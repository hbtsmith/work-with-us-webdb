#!/bin/bash

# Script para executar todos os testes E2E em sequência
# Evita conflitos executando um por vez

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Executando todos os testes E2E individualmente...${NC}"
echo ""

# Lista de testes em ordem de dependência
TESTS=(
    "auth"
    "positions" 
    "jobs"
    "applications"
    "question"
    "question-types"
)

TOTAL_TESTS=${#TESTS[@]}
PASSED=0
FAILED=0

echo -e "${BLUE}📊 Total de testes: $TOTAL_TESTS${NC}"
echo ""

# Executar cada teste
for i in "${!TESTS[@]}"; do
    TEST_NAME="${TESTS[$i]}"
    TEST_NUM=$((i + 1))
    
    echo -e "${BLUE}[$TEST_NUM/$TOTAL_TESTS]${NC} Executando: $TEST_NAME"
    echo "----------------------------------------"
    
    if ./src/tests/scripts/quick-test.sh "$TEST_NAME" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $TEST_NAME - PASSOU${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $TEST_NAME - FALHOU${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    echo ""
done

# Resumo final
echo "========================================"
echo -e "${BLUE}📊 RESUMO FINAL:${NC}"
echo -e "${GREEN}✅ Testes que passaram: $PASSED${NC}"
echo -e "${RED}❌ Testes que falharam: $FAILED${NC}"
echo -e "${BLUE}📈 Taxa de sucesso: $(( (PASSED * 100) / TOTAL_TESTS ))%${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  $FAILED teste(s) falharam${NC}"
    exit 1
fi
