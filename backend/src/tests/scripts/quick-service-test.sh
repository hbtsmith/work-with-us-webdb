#!/bin/bash

# Script rápido para executar testes unitários de services individuais
# Uso: ./quick-service-test.sh [service]

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Executando teste unitário de service...${NC}"

# Mapear nomes para arquivos
case "${1:-auth}" in
    "auth")
        TEST_FILE="src/tests/services/authService.test.ts"
        ;;
    "position")
        TEST_FILE="src/tests/services/positionService.test.ts"
        ;;
    "job")
        TEST_FILE="src/tests/services/jobService.test.ts"
        ;;
    "application")
        TEST_FILE="src/tests/services/applicationService.test.ts"
        ;;
    "question-option")
        TEST_FILE="src/tests/services/questionOptionService.test.ts"
        ;;
    *)
        echo -e "${RED}❌ Service não encontrado: $1${NC}"
        echo "Services disponíveis: auth, position, job, application, question-option"
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
