#!/bin/bash

# Script rápido para executar testes E2E individuais
# Uso: ./quick-test.sh [nome_do_teste]

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Executando teste E2E individual...${NC}"

# Mapear nomes para arquivos
case "${1:-auth}" in
    "auth")
        TEST_FILE="src/tests/e2e/auth.e2e.test.ts"
        ;;
    "positions")
        TEST_FILE="src/tests/e2e/positions.e2e.test.ts"
        ;;
    "jobs")
        TEST_FILE="src/tests/e2e/jobs.e2e.test.ts"
        ;;
    "applications")
        TEST_FILE="src/tests/e2e/applications.e2e.test.ts"
        ;;
    "question")
        TEST_FILE="src/tests/e2e/question.e2e.test.ts"
        ;;
    "question-types")
        TEST_FILE="src/tests/e2e/question-types.e2e.test.ts"
        ;;
    *)
        echo -e "${RED}❌ Teste não encontrado: $1${NC}"
        echo "Testes disponíveis: auth, positions, jobs, applications, question, question-types"
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
