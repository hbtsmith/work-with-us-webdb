#!/bin/bash

# =============================================================================
# SCRIPT DE MONITORAMENTO PARA PRODUÇÃO - WORK WITH US
# =============================================================================
# Este script monitora o sistema em produção:
# - Status dos serviços
# - Logs em tempo real
# - Métricas de performance
# - Verificação de saúde
# =============================================================================

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
SERVICE_USER="www-data"

echo -e "${BLUE}📊 MONITORAMENTO DO SISTEMA - WORK WITH US${NC}"
echo -e "${BLUE}===========================================${NC}"

# =============================================================================
# 1. STATUS DOS SERVIÇOS
# =============================================================================
echo -e "${YELLOW}🔍 Status dos Serviços${NC}"
echo -e "${BLUE}======================${NC}"

# Status do Apache
if systemctl is-active --quiet apache2; then
    echo -e "${GREEN}✅ Apache: Ativo${NC}"
else
    echo -e "${RED}❌ Apache: Inativo${NC}"
fi

# Status do PM2
echo -e "${YELLOW}PM2 Status:${NC}"
sudo -u $SERVICE_USER pm2 status

# Status das portas
echo -e "${YELLOW}Portas em uso:${NC}"
netstat -tlnp | grep -E ":(80|443|$BACKEND_PORT|$FRONTEND_PORT)" | while read line; do
    echo -e "${GREEN}✅ $line${NC}"
done

# =============================================================================
# 2. VERIFICAÇÃO DE SAÚDE
# =============================================================================
echo -e "${YELLOW}🏥 Verificação de Saúde${NC}"
echo -e "${BLUE}=======================${NC}"

# Testar backend
echo -e "${YELLOW}Testando Backend...${NC}"
if curl -s -f http://localhost:$BACKEND_PORT/api/jobs > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend: Saudável${NC}"
else
    echo -e "${RED}❌ Backend: Não responde${NC}"
fi

# Testar frontend
echo -e "${YELLOW}Testando Frontend...${NC}"
if curl -s -f http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend: Saudável${NC}"
else
    echo -e "${RED}❌ Frontend: Não responde${NC}"
fi

# Testar site público
echo -e "${YELLOW}Testando Site Público...${NC}"
if curl -s -f https://$DOMAIN > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Site Público: Acessível${NC}"
else
    echo -e "${RED}❌ Site Público: Não acessível${NC}"
fi

# =============================================================================
# 3. MÉTRICAS DE PERFORMANCE
# =============================================================================
echo -e "${YELLOW}📈 Métricas de Performance${NC}"
echo -e "${BLUE}===========================${NC}"

# Uso de CPU e Memória
echo -e "${YELLOW}Uso de Recursos:${NC}"
ps aux | grep -E "(node|apache2)" | grep -v grep | while read line; do
    echo -e "${GREEN}📊 $line${NC}"
done

# Uso de disco
echo -e "${YELLOW}Uso de Disco:${NC}"
df -h | grep -E "(/var|/home)" | while read line; do
    echo -e "${GREEN}💾 $line${NC}"
done

# =============================================================================
# 4. LOGS RECENTES
# =============================================================================
echo -e "${YELLOW}📋 Logs Recentes${NC}"
echo -e "${BLUE}================${NC}"

# Logs do Apache
echo -e "${YELLOW}Apache Logs (últimas 5 linhas):${NC}"
tail -5 /var/log/apache2/$DOMAIN-error.log 2>/dev/null || echo "Nenhum log de erro encontrado"
tail -5 /var/log/apache2/$DOMAIN-access.log 2>/dev/null || echo "Nenhum log de acesso encontrado"

# Logs do PM2
echo -e "${YELLOW}PM2 Logs (últimas 5 linhas):${NC}"
sudo -u $SERVICE_USER pm2 logs --lines 5

# =============================================================================
# 5. INFORMAÇÕES DO SISTEMA
# =============================================================================
echo -e "${YELLOW}💻 Informações do Sistema${NC}"
echo -e "${BLUE}==========================${NC}"

# Versão do Node.js
echo -e "${YELLOW}Node.js:${NC} $(node --version)"
echo -e "${YELLOW}npm:${NC} $(npm --version)"

# Versão do Apache
echo -e "${YELLOW}Apache:${NC} $(apache2 -v | head -1)"

# Uptime do sistema
echo -e "${YELLOW}Uptime:${NC} $(uptime)"

# =============================================================================
# 6. COMANDOS DE MANUTENÇÃO
# =============================================================================
echo -e "${YELLOW}🔧 Comandos de Manutenção${NC}"
echo -e "${BLUE}=========================${NC}"

echo -e "${GREEN}Para reiniciar serviços:${NC}"
echo -e "${BLUE}  sudo -u $SERVICE_USER pm2 restart all${NC}"
echo -e "${BLUE}  systemctl restart apache2${NC}"

echo -e "${GREEN}Para ver logs em tempo real:${NC}"
echo -e "${BLUE}  sudo -u $SERVICE_USER pm2 logs --follow${NC}"
echo -e "${BLUE}  tail -f /var/log/apache2/$DOMAIN-*.log${NC}"

echo -e "${GREEN}Para verificar SSL:${NC}"
echo -e "${BLUE}  certbot certificates${NC}"
echo -e "${BLUE}  certbot renew --dry-run${NC}"

echo -e "${GREEN}Para atualizar sistema:${NC}"
echo -e "${BLUE}  ./update-production.sh${NC}"

# =============================================================================
# 7. RESUMO FINAL
# =============================================================================
echo -e "${BLUE}📊 RESUMO DO MONITORAMENTO${NC}"
echo -e "${BLUE}===========================${NC}"

# Contar serviços ativos
ACTIVE_SERVICES=$(sudo -u $SERVICE_USER pm2 list | grep -c "online" || echo "0")
echo -e "${GREEN}✅ Serviços PM2 ativos: $ACTIVE_SERVICES${NC}"

# Verificar se Apache está rodando
if systemctl is-active --quiet apache2; then
    echo -e "${GREEN}✅ Apache: Funcionando${NC}"
else
    echo -e "${RED}❌ Apache: Com problemas${NC}"
fi

# Verificar se site está acessível
if curl -s -f https://$DOMAIN > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Site: Acessível via HTTPS${NC}"
else
    echo -e "${RED}❌ Site: Não acessível${NC}"
fi

echo -e "${BLUE}🎉 Monitoramento concluído!${NC}"
