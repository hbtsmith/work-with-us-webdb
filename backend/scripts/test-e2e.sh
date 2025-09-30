#!/bin/bash

echo "🔗 Executando Testes E2E (End-to-End) - Work With Us Backend"
echo "============================================================"

# Verificar se o MySQL está rodando
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL não está rodando. Inicie o MySQL antes de executar os testes."
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npm run db:generate

# Reset do banco de dados
echo "🗄️ Resetando banco de dados..."
mysql -u root -proot -e "DROP DATABASE IF EXISTS work_with_us_db; CREATE DATABASE work_with_us_db;"
npm run db:push

echo ""
echo "🧪 Executando testes E2E sequencialmente..."
echo ""

# Executar testes E2E sequencialmente
echo "1️⃣ Testando Auth E2E..."
npm test -- src/tests/e2e/auth.e2e.test.ts --run
if [ $? -ne 0 ]; then
    echo "❌ Auth E2E falhou!"
    exit 1
fi

echo "2️⃣ Testando Jobs E2E..."
npm test -- src/tests/e2e/jobs.e2e.test.ts --run
if [ $? -ne 0 ]; then
    echo "❌ Jobs E2E falhou!"
    exit 1
fi

echo "3️⃣ Testando Applications E2E..."
npm test -- src/tests/e2e/applications.e2e.test.ts --run
if [ $? -ne 0 ]; then
    echo "❌ Applications E2E falhou!"
    exit 1
fi

echo ""
echo "✅ TODOS os testes E2E passaram com sucesso!"
echo "🔗 Integração completa da API funcionando perfeitamente!"
echo "🎉 Backend pronto para produção!"
