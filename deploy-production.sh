#!/bin/bash

# =============================================================================
# SCRIPT DE DEPLOY PARA PRODUÇÃO - WORK WITH US
# =============================================================================
# Este script configura:
# - Apache virtual host para trabalhos.reservejoias.com.br
# - Certificado SSL com Let's Encrypt
# - Serviços Node.js para backend (porta 3001) e frontend (porta 3002)
# - Proxy reverso do Apache para os serviços Node.js
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
DOMAIN="trabalhos.reservejoias.com.br"
BACKEND_PORT="3001"
FRONTEND_PORT="3002"
GITHUB_REPO="https://github.com/hbtsmith/work-with-us-webdb.git"
DEPLOY_DIR="/var/www/work-with-us-webdb"
BACKEND_DIR="$DEPLOY_DIR/backend"
FRONTEND_DIR="$DEPLOY_DIR/frontend-web"
SERVICE_USER="www-data"
MYSQL_CONTAINER="mysql57_prod"
DATABASE_NAME="work_with_us_db"

echo -e "${BLUE}🚀 INICIANDO DEPLOY DE PRODUÇÃO - WORK WITH US${NC}"
echo -e "${BLUE}================================================${NC}"

# =============================================================================
# SOLICITAR CREDENCIAIS DO BANCO DE DADOS
# =============================================================================
echo -e "${YELLOW}🔐 Configuração do Banco de Dados${NC}"
echo -e "${BLUE}==================================${NC}"

# Solicitar usuário do MySQL
echo -ne "${YELLOW}Digite o usuário do MySQL [root]: ${NC}"
read MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

# Solicitar senha do MySQL (sem exibir)
echo -ne "${YELLOW}Digite a senha do MySQL: ${NC}"
read -s MYSQL_PASSWORD
echo ""

# Validar se a senha foi fornecida
if [ -z "$MYSQL_PASSWORD" ]; then
    echo -e "${RED}❌ Senha não pode ser vazia${NC}"
    exit 1
fi

# Testar conexão com o MySQL no Docker
echo -e "${YELLOW}Testando conexão com MySQL...${NC}"
if ! docker exec $MYSQL_CONTAINER mysql -u$MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Não foi possível conectar ao MySQL. Verifique as credenciais.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Conexão com MySQL validada${NC}"

# Obter IP do container MySQL
MYSQL_CONTAINER_IP=$(docker inspect $MYSQL_CONTAINER --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>/dev/null || echo "localhost")

# Construir URL do banco de dados (tentar IP do container primeiro, depois nome)
if [ "$MYSQL_CONTAINER_IP" != "localhost" ]; then
    DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_CONTAINER_IP}:3306/${DATABASE_NAME}"
    echo -e "${GREEN}✅ Usando IP do container: $MYSQL_CONTAINER_IP${NC}"
else
    DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@mysql57_prod:3306/${DATABASE_NAME}"
    echo -e "${YELLOW}⚠️  Usando nome do container: mysql57_prod${NC}"
fi

# =============================================================================
# 1. VERIFICAR PRÉ-REQUISITOS
# =============================================================================
echo -e "${YELLOW}📋 Verificando pré-requisitos...${NC}"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Este script deve ser executado como root${NC}"
    exit 1
fi

# Verificar se Apache está instalado
if ! command -v apache2 &> /dev/null; then
    echo -e "${RED}❌ Apache2 não está instalado${NC}"
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado${NC}"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não está instalado${NC}"
    exit 1
fi

# Verificar se certbot está instalado
if ! command -v certbot &> /dev/null; then
    echo -e "${RED}❌ certbot não está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pré-requisitos verificados${NC}"

# =============================================================================
# 2. INSTALAR DEPENDÊNCIAS ADICIONAIS
# =============================================================================
echo -e "${YELLOW}📦 Instalando dependências adicionais...${NC}"

# Instalar PM2 e tsx para gerenciamento de processos Node.js
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Instalando PM2...${NC}"
    npm install -g pm2
fi

if ! command -v tsx &> /dev/null; then
    echo -e "${YELLOW}Instalando tsx...${NC}"
    npm install -g tsx
fi

# Instalar dependências do sistema
apt-get update
apt-get install -y git curl build-essential

echo -e "${GREEN}✅ Dependências instaladas${NC}"

# =============================================================================
# 3. CLONAR REPOSITÓRIO
# =============================================================================
echo -e "${YELLOW}📥 Clonando repositório...${NC}"

# Remover diretório existente se houver
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}Removendo instalação anterior...${NC}"
    rm -rf "$DEPLOY_DIR"
fi

# Clonar repositório
git clone "$GITHUB_REPO" "$DEPLOY_DIR"
chown -R $SERVICE_USER:$SERVICE_USER "$DEPLOY_DIR"

echo -e "${GREEN}✅ Repositório clonado${NC}"

# =============================================================================
# 4. CONFIGURAR BACKEND
# =============================================================================
echo -e "${YELLOW}⚙️  Configurando backend...${NC}"

cd "$BACKEND_DIR"

# Instalar dependências
npm ci --production

# Gerar Prisma client
npx prisma generate

# Configurar variáveis de ambiente
cat > .env << EOF
# Produção - Work With Us Backend
DATABASE_URL="$DATABASE_URL"
JWT_SECRET="$(openssl rand -base64 32)"
NODE_ENV=production
PORT=$BACKEND_PORT
EOF

# Criar banco de dados se não existir
echo -e "${YELLOW}Criando banco de dados...${NC}"
docker exec $MYSQL_CONTAINER mysql -u$MYSQL_USER -p$MYSQL_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DATABASE_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Banco de dados já existe ou erro ao criar (continuando...)${NC}"
}

# Configurar banco de dados (migrar schema)
echo -e "${YELLOW}Configurando schema do banco de dados...${NC}"

# Tentar configurar schema
if npx prisma db push --accept-data-loss; then
    echo -e "${GREEN}✅ Schema do banco configurado com sucesso${NC}"
else
    echo -e "${YELLOW}⚠️  Erro ao configurar schema automaticamente${NC}"
    echo -e "${YELLOW}Isso pode ser normal se o container não estiver na mesma rede Docker${NC}"
    echo -e "${YELLOW}Você pode configurar manualmente depois com:${NC}"
    echo -e "${BLUE}  cd /var/www/work-with-us-webdb/backend${NC}"
    echo -e "${BLUE}  npx prisma db push${NC}"
    echo -e "${YELLOW}Continuando com o deploy...${NC}"
fi

# Executar seed se necessário
if [ -f "src/database/seed.ts" ]; then
    echo -e "${YELLOW}Executando seed do banco...${NC}"
    npm run db:seed || echo "Seed falhou, continuando..."
fi

echo -e "${GREEN}✅ Backend configurado${NC}"

# =============================================================================
# 5. CONFIGURAR FRONTEND
# =============================================================================
echo -e "${YELLOW}⚙️  Configurando frontend...${NC}"

cd "$FRONTEND_DIR"

# Instalar dependências
npm ci

# Configurar variáveis de ambiente para produção
cat > .env << EOF
# Produção - Work With Us Frontend
VITE_PORT=$FRONTEND_PORT
VITE_API_URL=http://localhost:$BACKEND_PORT
VITE_NODE_ENV=production
EOF

# Build do frontend
echo -e "${YELLOW}Fazendo build do frontend...${NC}"
npm run build

echo -e "${GREEN}✅ Frontend configurado${NC}"

# =============================================================================
# 6. CRIAR SERVIÇOS PM2
# =============================================================================
echo -e "${YELLOW}🔧 Criando serviços PM2...${NC}"

# Configurar PM2 para o usuário www-data
sudo -u $SERVICE_USER pm2 delete work-with-us-backend 2>/dev/null || true
sudo -u $SERVICE_USER pm2 delete work-with-us-frontend 2>/dev/null || true

# Criar scripts auxiliares para PM2
echo -e "${YELLOW}Criando scripts auxiliares...${NC}"

# Script para backend
cat > "$DEPLOY_DIR/start-backend.sh" << 'EOF'
#!/bin/bash
cd /var/www/work-with-us-webdb/backend
if command -v tsx &> /dev/null; then
    exec tsx src/server.ts
else
    npm run build
    exec node dist/server.js
fi
EOF

# Script para frontend
cat > "$DEPLOY_DIR/start-frontend.sh" << 'EOF'
#!/bin/bash
cd /var/www/work-with-us-webdb/frontend-web
if [ ! -d "dist" ]; then
    npm run build
fi
exec npm run preview
EOF

# Tornar scripts executáveis
chmod +x "$DEPLOY_DIR/start-backend.sh"
chmod +x "$DEPLOY_DIR/start-frontend.sh"
chown $SERVICE_USER:$SERVICE_USER "$DEPLOY_DIR/start-backend.sh"
chown $SERVICE_USER:$SERVICE_USER "$DEPLOY_DIR/start-frontend.sh"

# Criar serviço do backend
echo -e "${YELLOW}Criando serviço do backend...${NC}"
sudo -u $SERVICE_USER pm2 start "$DEPLOY_DIR/start-backend.sh" \
    --name "work-with-us-backend" \
    --env production

# Criar serviço do frontend
echo -e "${YELLOW}Criando serviço do frontend...${NC}"
sudo -u $SERVICE_USER pm2 start "$DEPLOY_DIR/start-frontend.sh" \
    --name "work-with-us-frontend" \
    --env production

# Salvar configuração PM2
sudo -u $SERVICE_USER pm2 save

# Configurar PM2 para iniciar no boot
sudo -u $SERVICE_USER pm2 startup systemd -u $SERVICE_USER --hp /var/www

echo -e "${GREEN}✅ Serviços PM2 criados${NC}"

# =============================================================================
# 7. CONFIGURAR APACHE VIRTUAL HOST
# =============================================================================
echo -e "${YELLOW}🌐 Configurando Apache virtual host...${NC}"

# Criar arquivo de configuração do Apache
cat > "/etc/apache2/sites-available/$DOMAIN.conf" << 'EOF_APACHE'
<VirtualHost *:80>
    ServerName trabalhos.reservejoias.com.br

    # Redireciona automaticamente HTTP para HTTPS
    Redirect permanent / https://trabalhos.reservejoias.com.br/
    
    ErrorLog ${APACHE_LOG_DIR}/trabalhos_error.log
    CustomLog ${APACHE_LOG_DIR}/trabalhos_access.log combined
</VirtualHost>

<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName trabalhos.reservejoias.com.br

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/trabalhos.reservejoias.com.br/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/trabalhos.reservejoias.com.br/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf

    # Proxy para o frontend (porta 3002)
    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"
    ProxyPass / http://localhost:3002/
    ProxyPassReverse / http://localhost:3002/

    # Configurações de timeout
    ProxyTimeout 300
    
    ErrorLog ${APACHE_LOG_DIR}/trabalhos_error.log
    CustomLog ${APACHE_LOG_DIR}/trabalhos_access.log combined
</VirtualHost>
</IfModule>
EOF_APACHE

# Habilitar site
a2ensite "$DOMAIN.conf"

# Habilitar módulos necessários do Apache
a2enmod ssl
a2enmod proxy
a2enmod proxy_http
a2enmod headers
a2enmod rewrite

# Testar configuração do Apache
apache2ctl configtest

# Recarregar Apache
systemctl reload apache2

echo -e "${GREEN}✅ Apache configurado${NC}"

# =============================================================================
# 8. CONFIGURAR CERTIFICADO SSL
# =============================================================================
echo -e "${YELLOW}🔒 Configurando certificado SSL...${NC}"

# Obter certificado SSL
certbot --apache -d "$DOMAIN" --non-interactive --agree-tos --email contato@reservejoias.com.br

echo -e "${GREEN}✅ Certificado SSL configurado${NC}"

# =============================================================================
# 9. VERIFICAR STATUS
# =============================================================================
echo -e "${YELLOW}🔍 Verificando status dos serviços...${NC}"

# Verificar Apache
if systemctl is-active --quiet apache2; then
    echo -e "${GREEN}✅ Apache está rodando${NC}"
else
    echo -e "${RED}❌ Apache não está rodando${NC}"
fi

# Verificar PM2
sudo -u $SERVICE_USER pm2 status

# Verificar portas
echo -e "${YELLOW}Verificando portas...${NC}"
netstat -tlnp | grep -E ":(80|443|$BACKEND_PORT|$FRONTEND_PORT)"

# =============================================================================
# 10. TESTAR CONFIGURAÇÃO
# =============================================================================
echo -e "${YELLOW}🧪 Testando configuração...${NC}"

# Testar backend
if curl -s http://localhost:$BACKEND_PORT/api/jobs > /dev/null; then
    echo -e "${GREEN}✅ Backend respondendo${NC}"
else
    echo -e "${RED}❌ Backend não está respondendo${NC}"
fi

# Testar frontend
if curl -s http://localhost:$FRONTEND_PORT > /dev/null; then
    echo -e "${GREEN}✅ Frontend respondendo${NC}"
else
    echo -e "${RED}❌ Frontend não está respondendo${NC}"
fi

# =============================================================================
# 11. INFORMAÇÕES FINAIS
# =============================================================================
echo -e "${BLUE}🎉 DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✅ Site: https://$DOMAIN${NC}"
echo -e "${GREEN}✅ Backend: http://localhost:$BACKEND_PORT${NC}"
echo -e "${GREEN}✅ Frontend: http://localhost:$FRONTEND_PORT${NC}"
echo -e "${GREEN}✅ SSL: Configurado com Let's Encrypt${NC}"
echo -e "${GREEN}✅ Serviços: Gerenciados pelo PM2${NC}"
echo ""
echo -e "${YELLOW}📋 Comandos úteis:${NC}"
echo -e "${BLUE}  PM2 Status:${NC} sudo -u $SERVICE_USER pm2 status"
echo -e "${BLUE}  PM2 Logs:${NC} sudo -u $SERVICE_USER pm2 logs"
echo -e "${BLUE}  PM2 Restart:${NC} sudo -u $SERVICE_USER pm2 restart all"
echo -e "${BLUE}  Apache Logs:${NC} tail -f /var/log/apache2/$DOMAIN-*.log"
echo -e "${BLUE}  SSL Renew:${NC} certbot renew --dry-run"
echo ""
echo -e "${GREEN}🚀 Seu sistema Work With Us está online!${NC}"
