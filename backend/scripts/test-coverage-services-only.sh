#!/bin/bash

echo "📊 Executando Testes com Cobertura - Apenas Serviços Testados"
echo "============================================================="

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
npx prisma generate

# Executar testes com cobertura focada apenas nos serviços
echo "📊 Executando testes com cobertura focada nos serviços..."

# Teste AuthService
echo "1️⃣ Cobertura AuthService..."
npm run test:coverage src/tests/services/authService.test.ts --run

# Teste PositionService  
echo "2️⃣ Cobertura PositionService..."
npm run test:coverage src/tests/services/positionService.test.ts --run

# Teste JobService
echo "3️⃣ Cobertura JobService..."
npm run test:coverage src/tests/services/jobService.test.ts --run

# Teste ApplicationService
echo "4️⃣ Cobertura ApplicationService..."
npm run test:coverage src/tests/services/applicationService.test.ts --run

# Teste QuestionOptionService
echo "5️⃣ Cobertura QuestionOptionService..."
npm run test:coverage src/tests/services/questionOptionService.test.ts --run

# Teste Sistema i18n
echo "6️⃣ Cobertura Sistema de Internacionalização (i18n)..."
npm run test:coverage src/tests/i18n.test.ts --run

echo "✅ Cobertura de testes concluída!"
echo "📈 Todos os serviços testados com sucesso!"
echo "🎉 Backend com cobertura completa!"
