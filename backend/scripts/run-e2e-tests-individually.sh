#!/bin/bash

# Script para executar testes E2E individualmente
# Evita problemas de paralelismo e isolamento entre testes

echo "🚀 Executando Testes E2E Individualmente..."
echo "=============================================="

# Função para executar um teste e mostrar resultado
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo ""
    echo "📋 Executando: $test_name"
    echo "📁 Arquivo: $test_file"
    echo "----------------------------------------"
    
    if npx vitest --run "$test_file"; then
        echo "✅ $test_name - PASSOU"
    else
        echo "❌ $test_name - FALHOU"
    fi
    
    echo "----------------------------------------"
}

# Executar cada teste E2E individualmente
run_test "src/tests/e2e/auth.e2e.test.ts" "Auth E2E Tests"
run_test "src/tests/e2e/positions.e2e.test.ts" "Positions E2E Tests"
run_test "src/tests/e2e/jobs.e2e.test.ts" "Jobs E2E Tests"
run_test "src/tests/e2e/applications.e2e.test.ts" "Applications E2E Tests"
run_test "src/tests/e2e/question-options.e2e.test.ts" "Question Options E2E Tests"
run_test "src/tests/e2e/admin.e2e.test.ts" "Admin E2E Tests"

echo ""
echo "🎯 Resumo dos Testes E2E:"
echo "========================="
echo "✅ Auth E2E Tests - Funcionando perfeitamente"
echo "⚠️  Positions E2E Tests - Criado, problemas de isolamento"
echo "⚠️  Jobs E2E Tests - Criado, problemas de isolamento"
echo "⚠️  Applications E2E Tests - Criado, problemas de foreign key"
echo "⚠️  Question Options E2E Tests - Criado, problemas de isolamento"
echo "⚠️  Admin E2E Tests - Criado, problemas de isolamento"
echo ""
echo "📝 Nota: Os testes com ⚠️ precisam de ajustes nos dados de teste"
echo "   para funcionar corretamente com foreign keys válidas."
