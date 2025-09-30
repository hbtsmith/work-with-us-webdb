#!/bin/bash

# Script rápido para executar testes unitários de controllers individuais
# Uso: ./quick-controller-test.sh [controller]

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Executando teste unitário de controller...${NC}"

# Mapear nomes para arquivos
case "${1:-auth}" in
    "auth")
        TEST_FILE="src/tests/controllers/authController.test.ts"
        ;;
    "position")
        TEST_FILE="src/tests/controllers/positionController.test.ts"
        ;;
    "job")
        TEST_FILE="src/tests/controllers/jobController.test.ts"
        ;;
    "application")
        TEST_FILE="src/tests/controllers/applicationController.test.ts"
        ;;
    "question-option")
        TEST_FILE="src/tests/controllers/questionOptionController.test.ts"
        ;;
    "admin")
        TEST_FILE="src/tests/controllers/adminController.test.ts"
        ;;
    *)
        echo -e "${RED}❌ Controller não encontrado: $1${NC}"
        echo "Controllers disponíveis: auth, position, job, application, question-option, admin"
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
