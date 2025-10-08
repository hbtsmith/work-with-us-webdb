#!/bin/bash

# Script para iniciar o frontend
# Este script será usado pelo PM2

cd /var/www/work-with-us-webdb/frontend-web

# Verificar se o build existe
if [ ! -d "dist" ]; then
    echo "Build não encontrado, fazendo build..."
    npm run build
fi

echo "Iniciando frontend..."
exec npm run preview
