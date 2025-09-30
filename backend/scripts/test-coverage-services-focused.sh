#!/bin/bash

echo "📊 Executando Testes com Cobertura - Foco em Serviços"
echo "====================================================="

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

# Executar todos os testes de serviços com cobertura focada
echo "📊 Executando todos os testes de serviços com cobertura focada..."

npx vitest --config vitest.config.services.ts --coverage --run src/tests/services/ src/tests/i18n.test.ts

echo "✅ Cobertura de testes concluída!"
echo "📈 Relatório de cobertura salvo em ./coverage-services/"
echo "🎉 Backend com cobertura completa!"
