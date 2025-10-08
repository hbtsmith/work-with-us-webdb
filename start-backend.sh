#!/bin/bash

# Script para iniciar o backend
# Este script será usado pelo PM2

cd /var/www/work-with-us-webdb/backend

# Usar npm start que agora usa tsx (resolve aliases @/)
echo "Iniciando backend..."
exec npm start
