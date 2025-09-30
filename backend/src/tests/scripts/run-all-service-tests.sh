#!/bin/bash

# Script para executar todos os testes unitários de services em sequência
# Evita conflitos executando um por vez

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Executando todos os testes unitários de services individualmente...${NC}"
echo ""

# Lista de services em ordem de dependência
SERVICES=(
    "auth"
    "position" 
    "job"
    "application"
    "question-option"
)

TOTAL_TESTS=${#SERVICES[@]}
PASSED=0
FAILED=0

echo -e "${BLUE}📊 Total de services: $TOTAL_TESTS${NC}"
echo ""

# Executar cada teste
for i in "${!SERVICES[@]}"; do
    SERVICE_NAME="${SERVICES[$i]}"
    TEST_NUM=$((i + 1))
    
    echo -e "${BLUE}[$TEST_NUM/$TOTAL_TESTS]${NC} Executando: $SERVICE_NAME"
    echo "----------------------------------------"
    
    if ./src/tests/scripts/quick-service-test.sh "$SERVICE_NAME" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $SERVICE_NAME - PASSOU${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $SERVICE_NAME - FALHOU${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    echo ""
done

# Resumo final
echo "========================================"
echo -e "${BLUE}📊 RESUMO FINAL:${NC}"
echo -e "${GREEN}✅ Services que passaram: $PASSED${NC}"
echo -e "${RED}❌ Services que falharam: $FAILED${NC}"
echo -e "${BLUE}📈 Taxa de sucesso: $(( (PASSED * 100) / TOTAL_TESTS ))%${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TODOS OS SERVICES PASSARAM!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  $FAILED service(s) falharam${NC}"
    exit 1
fi
