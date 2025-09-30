#!/bin/bash

# Script para executar todos os testes unitários de controllers em sequência
# Evita conflitos executando um por vez

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Executando todos os testes unitários de controllers individualmente...${NC}"
echo ""

# Lista de testes em ordem de dependência
CONTROLLERS=(
    "auth"
    "position" 
    "job"
    "application"
    "question-option"
    "admin"
)

TOTAL_TESTS=${#CONTROLLERS[@]}
PASSED=0
FAILED=0

echo -e "${BLUE}📊 Total de controllers: $TOTAL_TESTS${NC}"
echo ""

# Executar cada teste
for i in "${!CONTROLLERS[@]}"; do
    CONTROLLER_NAME="${CONTROLLERS[$i]}"
    TEST_NUM=$((i + 1))
    
    echo -e "${BLUE}[$TEST_NUM/$TOTAL_TESTS]${NC} Executando: $CONTROLLER_NAME"
    echo "----------------------------------------"
    
    if ./src/tests/scripts/quick-controller-test.sh "$CONTROLLER_NAME" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $CONTROLLER_NAME - PASSOU${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $CONTROLLER_NAME - FALHOU${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    echo ""
done

# Resumo final
echo "========================================"
echo -e "${BLUE}📊 RESUMO FINAL:${NC}"
echo -e "${GREEN}✅ Controllers que passaram: $PASSED${NC}"
echo -e "${RED}❌ Controllers que falharam: $FAILED${NC}"
echo -e "${BLUE}📈 Taxa de sucesso: $(( (PASSED * 100) / TOTAL_TESTS ))%${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TODOS OS CONTROLLERS PASSARAM!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  $FAILED controller(s) falharam${NC}"
    exit 1
fi
