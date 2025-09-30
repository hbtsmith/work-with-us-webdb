#!/bin/bash

echo "🔄 Restaurando Ambiente de Desenvolvimento"
echo "=========================================="

# Restaurar .env original
if [ -f ".env.production.backup" ]; then
    cp .env.production.backup .env
    rm .env.production.backup
    echo "✅ Ambiente de desenvolvimento restaurado!"
else
    echo "⚠️ Backup do ambiente de desenvolvimento não encontrado"
fi
