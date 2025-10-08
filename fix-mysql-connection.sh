#!/bin/bash

# =============================================================================
# SCRIPT PARA CORRIGIR CONEXÃO COM MYSQL DOCKER
# =============================================================================
# Este script ajuda a diagnosticar e corrigir problemas de conexão
# com o MySQL no container Docker
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 DIAGNÓSTICO DE CONEXÃO MYSQL DOCKER${NC}"
echo -e "${BLUE}=====================================${NC}"

# =============================================================================
# 1. VERIFICAR CONTAINER
# =============================================================================
echo -e "${YELLOW}📋 Verificando container MySQL...${NC}"

if docker ps | grep -q mysql57_prod; then
    echo -e "${GREEN}✅ Container mysql57_prod está rodando${NC}"
    
    # Mostrar informações do container
    echo -e "${YELLOW}Informações do container:${NC}"
    docker ps | grep mysql57_prod
else
    echo -e "${RED}❌ Container mysql57_prod não está rodando${NC}"
    echo -e "${YELLOW}Containers MySQL disponíveis:${NC}"
    docker ps | grep mysql
    exit 1
fi

# =============================================================================
# 2. VERIFICAR PORTAS
# =============================================================================
echo -e "${YELLOW}🔍 Verificando portas...${NC}"

# Verificar se a porta 3306 está exposta
if docker port mysql57_prod 2>/dev/null | grep -q 3306; then
    echo -e "${GREEN}✅ Porta 3306 está exposta${NC}"
    docker port mysql57_prod
else
    echo -e "${YELLOW}⚠️  Porta 3306 não está exposta no host${NC}"
    echo -e "${YELLOW}Isso é normal se o MySQL só for acessado via Docker network${NC}"
fi

# =============================================================================
# 3. TESTAR CONEXÃO DENTRO DO CONTAINER
# =============================================================================
echo -e "${YELLOW}🧪 Testando conexão dentro do container...${NC}"

# Solicitar credenciais
echo -ne "${YELLOW}Digite o usuário do MySQL [root]: ${NC}"
read MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

echo -ne "${YELLOW}Digite a senha do MySQL: ${NC}"
read -s MYSQL_PASSWORD
echo ""

# Testar conexão
if docker exec mysql57_prod mysql -u$MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexão dentro do container funcionando${NC}"
else
    echo -e "${RED}❌ Erro na conexão dentro do container${NC}"
    exit 1
fi

# =============================================================================
# 4. VERIFICAR REDE DOCKER
# =============================================================================
echo -e "${YELLOW}🌐 Verificando rede Docker...${NC}"

# Listar redes
echo -e "${YELLOW}Redes Docker disponíveis:${NC}"
docker network ls

# Verificar em qual rede o container está
CONTAINER_NETWORK=$(docker inspect mysql57_prod --format='{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}')
echo -e "${YELLOW}Container está na rede: $CONTAINER_NETWORK${NC}"

# =============================================================================
# 5. SOLUÇÕES POSSÍVEIS
# =============================================================================
echo -e "${YELLOW}💡 Soluções possíveis:${NC}"

echo -e "${BLUE}1. Usar nome do container na DATABASE_URL:${NC}"
echo -e "${GREEN}   DATABASE_URL=\"mysql://$MYSQL_USER:$MYSQL_PASSWORD@mysql57_prod:3306/work_with_us_db\"${NC}"

echo -e "${BLUE}2. Se o container estiver na mesma rede Docker:${NC}"
echo -e "${GREEN}   DATABASE_URL=\"mysql://$MYSQL_USER:$MYSQL_PASSWORD@mysql57_prod:3306/work_with_us_db\"${NC}"

echo -e "${BLUE}3. Se precisar expor a porta no host:${NC}"
echo -e "${GREEN}   docker run -p 3306:3306 mysql:5.7${NC}"

echo -e "${BLUE}4. Usar IP do container:${NC}"
CONTAINER_IP=$(docker inspect mysql57_prod --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
echo -e "${GREEN}   DATABASE_URL=\"mysql://$MYSQL_USER:$MYSQL_PASSWORD@$CONTAINER_IP:3306/work_with_us_db\"${NC}"

# =============================================================================
# 6. TESTAR CONEXÃO COM DIFERENTES HOSTS
# =============================================================================
echo -e "${YELLOW}🧪 Testando diferentes hosts...${NC}"

# Testar com localhost (se porta estiver exposta)
if docker port mysql57_prod 2>/dev/null | grep -q 3306; then
    echo -e "${YELLOW}Testando localhost:3306...${NC}"
    if timeout 5 mysql -h localhost -P 3306 -u$MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ localhost:3306 funcionando${NC}"
    else
        echo -e "${RED}❌ localhost:3306 não funcionando${NC}"
    fi
fi

# Testar com IP do container
echo -e "${YELLOW}Testando IP do container ($CONTAINER_IP:3306)...${NC}"
if timeout 5 mysql -h $CONTAINER_IP -P 3306 -u$MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ $CONTAINER_IP:3306 funcionando${NC}"
    echo -e "${GREEN}✅ Use este IP na DATABASE_URL: mysql://$MYSQL_USER:$MYSQL_PASSWORD@$CONTAINER_IP:3306/work_with_us_db${NC}"
else
    echo -e "${RED}❌ $CONTAINER_IP:3306 não funcionando${NC}"
fi

# =============================================================================
# 7. RECOMENDAÇÃO FINAL
# =============================================================================
echo -e "${BLUE}🎯 RECOMENDAÇÃO FINAL${NC}"
echo -e "${BLUE}===================${NC}"

if timeout 5 mysql -h $CONTAINER_IP -P 3306 -u$MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Use o IP do container: $CONTAINER_IP${NC}"
    echo -e "${GREEN}   DATABASE_URL=\"mysql://$MYSQL_USER:$MYSQL_PASSWORD@$CONTAINER_IP:3306/work_with_us_db\"${NC}"
elif docker port mysql57_prod 2>/dev/null | grep -q 3306; then
    echo -e "${GREEN}✅ Use localhost (porta exposta)${NC}"
    echo -e "${GREEN}   DATABASE_URL=\"mysql://$MYSQL_USER:$MYSQL_PASSWORD@localhost:3306/work_with_us_db\"${NC}"
else
    echo -e "${YELLOW}⚠️  Use o nome do container (pode precisar de rede Docker)${NC}"
    echo -e "${GREEN}   DATABASE_URL=\"mysql://$MYSQL_USER:$MYSQL_PASSWORD@mysql57_prod:3306/work_with_us_db\"${NC}"
fi

echo -e "${BLUE}🎉 Diagnóstico concluído!${NC}"
