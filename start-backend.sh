#!/bin/bash

# Script para iniciar o backend
# Este script será usado pelo PM2

cd /var/www/work-with-us-webdb/backend

# Verificar se tsx está disponível
if command -v tsx &> /dev/null; then
    echo "Iniciando backend com tsx..."
    exec tsx src/server.ts
else
    echo "tsx não encontrado, compilando e executando com node..."
    npm run build
    exec node dist/server.js
fi
