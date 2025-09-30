#!/bin/bash

echo "🔧 Configurando Ambiente de Teste"
echo "================================="

# Copiar .env.test para .env temporariamente
cp .env.test .env.test.backup
cp .env .env.production.backup
cp .env.test .env

echo "✅ Ambiente de teste configurado!"
echo "📁 Usando banco: work_with_us_test_db"
echo "🔑 Usando JWT secret de teste"
echo "📂 Usando diretório de uploads de teste"
