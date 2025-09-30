#!/bin/bash

echo "�� Executando Testes com Cobertura - Work With Us Backend"
echo "=================================================="

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

# Executar testes unitários
echo "🧪 Executando testes unitários..."
npm run test:unit

# Verificar se os testes unitários passaram
if [ $? -ne 0 ]; then
    echo "❌ Testes unitários falharam!"
    exit 1
fi

# Executar testes de integração
echo "�� Executando testes de integração..."
npm run test:integration

# Verificar se os testes de integração passaram
if [ $? -ne 0 ]; then
    echo "❌ Testes de integração falharam!"
    exit 1
fi

# Executar todos os testes com cobertura
echo "�� Executando todos os testes com cobertura..."
npm run test:coverage

# Verificar cobertura
echo "📈 Verificando cobertura de testes..."

# Extrair cobertura do relatório
COVERAGE=$(npm run test:coverage 2>&1 | grep -o "All files[[:space:]]*[0-9]*\.[0-9]*%" | grep -o "[0-9]*\.[0-9]*")

if [ -z "$COVERAGE" ]; then
    echo "⚠️  Não foi possível extrair cobertura do relatório"
    COVERAGE=0
fi

echo "📊 Cobertura atual: ${COVERAGE}%"

# Verificar se a cobertura está acima de 80%
if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
    echo "✅ Cobertura de testes está acima de 80% (${COVERAGE}%)"
    echo "🎉 Todos os testes passaram com sucesso!"
    exit 0
else
    echo "❌ Cobertura de testes está abaixo de 80% (${COVERAGE}%)"
    echo "📝 Consulte o relatório em coverage/index.html para mais detalhes"
    exit 1
fi