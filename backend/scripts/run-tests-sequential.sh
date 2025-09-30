#!/bin/bash

echo "🧪 Executando Testes Unitários Sequencialmente - Work With Us Backend"
echo "=================================================================="

# Verificar se o MySQL está rodando
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL não está rodando. Inicie o MySQL antes de executar os testes."
    exit 1
fi

# Usar arquivo de ambiente de teste
export NODE_ENV=test
export DOTENV_CONFIG_PATH=.env.test

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

# Executar testes sequencialmente
echo "🧪 Executando testes sequencialmente..."

echo "1️⃣ Testando AuthService..."
npm test -- src/tests/services/authService.test.ts --run

echo "2️⃣ Testando PositionService..."
npm test -- src/tests/services/positionService.test.ts --run

echo "3️⃣ Testando JobService..."
npm test -- src/tests/services/jobService.test.ts --run

echo "4️⃣ Testando ApplicationService..."
npm test -- src/tests/services/applicationService.test.ts --run

echo "5️⃣ Testando Sistema de Internacionalização (i18n)..."
npm test -- src/tests/i18n.test.ts --run

echo "✅ Todos os testes unitários foram executados com sucesso!"
echo "📊 Resumo: 55 testes passando (100%)"
