#!/bin/bash

echo "🔗 Executando Testes E2E Simplificados - Work With Us Backend"
echo "============================================================="

# Verificar se o MySQL está rodando
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL não está rodando. Inicie o MySQL antes de executar os testes."
    exit 1
fi

# Configurar ambiente de teste
./scripts/setup-test-env.sh

# Reset do banco de dados de teste
echo "🗄️ Resetando banco de dados de teste..."
mysql -u root -proot -e "DROP DATABASE IF EXISTS work_with_us_test_db; CREATE DATABASE work_with_us_test_db;"
npm run db:push

echo ""
echo "🧪 Executando testes E2E simplificados..."
echo ""

# Executar testes E2E simplificados sequencialmente
echo "1️⃣ Testando Auth E2E Simplificado..."
npm test -- src/tests/e2e/simple-auth.e2e.test.ts --run
if [ $? -ne 0 ]; then
    echo "❌ Auth E2E falhou!"
    exit 1
fi

echo "2️⃣ Testando Jobs E2E Simplificado..."
npm test -- src/tests/e2e/simple-jobs.e2e.test.ts --run
if [ $? -ne 0 ]; then
    echo "❌ Jobs E2E falhou!"
    exit 1
fi

echo "3️⃣ Testando Applications E2E Simplificado..."
npm test -- src/tests/e2e/simple-applications.e2e.test.ts --run
if [ $? -ne 0 ]; then
    echo "❌ Applications E2E falhou!"
    exit 1
fi

echo ""
echo "✅ TODOS os testes E2E simplificados passaram com sucesso!"
echo "🔗 Fluxos de integração funcionando perfeitamente!"
echo "🎉 Backend pronto para produção!"

# Restaurar ambiente de desenvolvimento
./scripts/restore-dev-env.sh
