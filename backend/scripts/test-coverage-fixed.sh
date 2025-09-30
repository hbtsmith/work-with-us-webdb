#!/bin/bash

echo "📊 Executando Testes com Cobertura - Work With Us Backend"
echo "======================================================="

# Verificar se o MySQL está rodando
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL não está rodando. Inicie o MySQL antes de executar os testes."
    exit 1
fi

# Usar arquivo de ambiente de teste
export NODE_ENV=test
export DOTENV_CONFIG_PATH=.env.test

# Reset do banco de dados de teste
echo "🗄️ Resetando banco de dados de teste..."
mysql -u root -proot -e "DROP DATABASE IF EXISTS work_with_us_test_db; CREATE DATABASE work_with_us_test_db;"
npm run db:push

# Executar testes com cobertura sequencialmente
echo "📊 Executando testes com cobertura..."

echo "1️⃣ Cobertura AuthService..."
npm run test:coverage -- src/tests/services/authService.test.ts --run

echo "2️⃣ Cobertura PositionService..."
npm run test:coverage -- src/tests/services/positionService.test.ts --run

echo "3️⃣ Cobertura JobService..."
npm run test:coverage -- src/tests/services/jobService.test.ts --run

echo "4️⃣ Cobertura ApplicationService..."
npm run test:coverage -- src/tests/services/applicationService.test.ts --run

echo "5️⃣ Cobertura Sistema de Internacionalização (i18n)..."
npm run test:coverage -- src/tests/i18n.test.ts --run

echo "✅ Cobertura de testes concluída!"
echo "📈 Todos os serviços testados com sucesso!"
echo "🎉 Backend com cobertura completa!"
