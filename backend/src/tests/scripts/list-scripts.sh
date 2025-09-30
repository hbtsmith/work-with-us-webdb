#!/bin/bash

# Script para listar e mostrar informações sobre todos os scripts de teste

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}📋 Scripts de Testes E2E Disponíveis${NC}"
echo "========================================"
echo ""

echo -e "${CYAN}1. Script Rápido (quick-test.sh)${NC}"
echo "   Uso: ./src/tests/scripts/quick-test.sh [teste]"
echo "   Exemplo: ./src/tests/scripts/quick-test.sh auth"
echo "   Descrição: Executa um teste específico rapidamente"
echo ""

echo -e "${CYAN}2. Script Completo (run-e2e-individual.sh)${NC}"
echo "   Uso: ./src/tests/scripts/run-e2e-individual.sh [teste]"
echo "   Exemplo: ./src/tests/scripts/run-e2e-individual.sh positions"
echo "   Descrição: Script avançado com relatórios detalhados"
echo ""

echo -e "${CYAN}3. Executar Todos (run-all-e2e.sh)${NC}"
echo "   Uso: ./src/tests/scripts/run-all-e2e.sh"
echo "   Descrição: Executa todos os testes em sequência"
echo ""

echo -e "${CYAN}4. Listar Scripts (list-scripts.sh)${NC}"
echo "   Uso: ./src/tests/scripts/list-scripts.sh"
echo "   Descrição: Mostra esta lista de scripts"
echo ""

echo -e "${YELLOW}🧪 Testes Disponíveis:${NC}"
echo "   • auth           - Testes de autenticação (8 testes)"
echo "   • positions      - Testes de posições (22 testes)"
echo "   • jobs           - Testes de vagas"
echo "   • applications   - Testes de candidaturas"
echo "   • question       - Testes de perguntas"
echo "   • question-types - Testes de tipos de pergunta"
echo ""

echo -e "${GREEN}🚀 Exemplos de Uso:${NC}"
echo "   # Executar teste de auth"
echo "   ./src/tests/scripts/quick-test.sh auth"
echo ""
echo "   # Executar todos os testes"
echo "   ./src/tests/scripts/run-all-e2e.sh"
echo ""
echo "   # Executar com script completo"
echo "   ./src/tests/scripts/run-e2e-individual.sh positions"
echo ""

echo -e "${BLUE}📁 Localização dos Scripts:${NC}"
echo "   /Applications/MAMP/work-with-us-webdb/backend/src/tests/scripts/"
echo ""

echo -e "${YELLOW}💡 Dica:${NC}"
echo "   Execute sempre do diretório raiz do projeto:"
echo "   cd /Applications/MAMP/work-with-us-webdb/backend"
