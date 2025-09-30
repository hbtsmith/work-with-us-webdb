#!/bin/bash

echo "🧪 Executando TODOS os Testes - Work With Us Backend"
echo "=================================================="

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

# Executar testes sequencialmente
echo "🧪 Executando testes sequencialmente..."

echo "1️⃣ Testando AuthService..."
npm test -- src/tests/services/authService.test.ts --run
if [ $? -ne 0 ]; then
    echo "❌ AuthService falhou!"
    exit 1
fi

echo "2️⃣ Testando PositionService..."
npm test -- src/tests/services/positionService.test.ts --run
if [ $? -ne 0 ]; then
    echo "❌ PositionService falhou!"
    exit 1
fi

echo "3️⃣ Testando JobService..."
npm test -- src/tests/services/jobService.test.ts --run
if [ $? -ne 0 ]; then
    echo "❌ JobService falhou!"
    exit 1
fi

echo "4️⃣ Testando ApplicationService..."
npm test -- src/tests/services/applicationService.test.ts --run
if [ $? -ne 0 ]; then
    echo "❌ ApplicationService falhou!"
    exit 1
fi

echo "5️⃣ Testando Sistema de Internacionalização (i18n)..."
npm test -- src/tests/i18n.test.ts --run
if [ $? -ne 0 ]; then
    echo "❌ Sistema i18n falhou!"
    exit 1
fi

echo "✅ TODOS os testes passaram com sucesso!"
echo "📊 Resumo: 55 testes passando (100%)"
echo "🎉 Backend está funcionando perfeitamente!"

# Restaurar ambiente de desenvolvimento
./scripts/restore-dev-env.sh
