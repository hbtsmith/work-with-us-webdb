# 🚀 GUIA DE DEPLOY PARA PRODUÇÃO

## 📋 Pré-requisitos

Antes de executar o script de deploy, certifique-se de que o servidor possui:

### ✅ Software Instalado

- **Ubuntu Server 20.04+** (ou Debian)
- **Apache 2.4+** com módulos: `ssl`, `proxy`, `proxy_http`, `headers`, `rewrite`
- **Node.js 20.x+** e **npm**
- **Docker** com container MySQL rodando (`mysql57_prod`)
- **Certbot** (Let's Encrypt) instalado e configurado
- **Git** instalado
- **PM2** será instalado automaticamente pelo script

### ✅ Configurações Prévias

- **DNS configurado** no Cloudflare apontando para o servidor:
  - `trabalhos.reservejoias.com.br` → IP do servidor
  - **Nota**: Não usar `www.` (seguindo padrão dos outros domínios)
- **Container MySQL** rodando:
  ```bash
  docker ps | grep mysql57_prod
  ```
- **Portas disponíveis**: 3001 (backend) e 3002 (frontend)
- **Acesso root** ao servidor

---

## 🚀 Instalação Inicial

### 1️⃣ Fazer Upload do Script

Faça upload do script `deploy-production.sh` para o servidor:

```bash
scp deploy-production.sh root@seu-servidor:/root/
```

### 2️⃣ Dar Permissão de Execução

```bash
ssh root@seu-servidor
chmod +x /root/deploy-production.sh
```

### 3️⃣ Executar o Script

```bash
cd /root
./deploy-production.sh
```

### 4️⃣ Fornecer Credenciais

O script solicitará as credenciais do MySQL:

```
Digite o usuário do MySQL [root]: root
Digite a senha do MySQL: ********
```

---

## 📂 Estrutura de Arquivos

Após o deploy, a estrutura será:

```
/var/www/work-with-us-webdb/
├── backend/
│   ├── src/
│   ├── node_modules/
│   ├── .env
│   └── package.json
├── frontend-web/
│   ├── src/
│   ├── dist/
│   ├── node_modules/
│   ├── .env
│   └── package.json
└── ...
```

---

## 🔧 Configurações Criadas

### Apache Virtual Host

**Arquivo**: `/etc/apache2/sites-available/trabalhos.reservejoias.com.br.conf`

- **HTTP (porta 80)**: Redireciona para HTTPS
- **HTTPS (porta 443)**: Proxy para frontend na porta 3002
- **SSL**: Certificado Let's Encrypt

### Serviços PM2

- **work-with-us-backend**: Backend Node.js na porta 3001
- **work-with-us-frontend**: Frontend Vite/React na porta 3002

### Banco de Dados

- **Database**: `work_with_us_db`
- **Container**: `mysql57_prod` (Docker)
- **Charset**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

---

## 🔍 Verificação Pós-Deploy

### Verificar Serviços PM2

```bash
sudo -u www-data pm2 status
```

Deve mostrar:

```
┌─────┬────────────────────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name                   │ mode    │ ↺       │ status  │ cpu      │
├─────┼────────────────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ work-with-us-backend   │ fork    │ 0       │ online  │ 0%       │
│ 1   │ work-with-us-frontend  │ fork    │ 0       │ online  │ 0%       │
└─────┴────────────────────────┴─────────┴─────────┴─────────┴──────────┘
```

### Verificar Apache

```bash
systemctl status apache2
apache2ctl configtest
```

### Verificar SSL

```bash
certbot certificates
```

### Testar Site

```bash
curl -I https://trabalhos.reservejoias.com.br
```

Deve retornar `HTTP/2 200`

---

## 🔄 Atualização do Sistema

Para atualizar o sistema após alterações no código:

### 1️⃣ Fazer Upload do Script de Atualização

```bash
scp update-production.sh root@seu-servidor:/root/
chmod +x /root/update-production.sh
```

### 2️⃣ Executar Atualização

```bash
./update-production.sh
```

O script irá:
- ✅ Fazer backup da versão atual
- ✅ Baixar código atualizado do GitHub
- ✅ Atualizar dependências
- ✅ Rebuild do frontend
- ✅ Atualizar banco de dados (migrations)
- ✅ Reiniciar serviços

---

## 📊 Monitoramento

### Script de Monitoramento

```bash
scp monitor-production.sh root@seu-servidor:/root/
chmod +x /root/monitor-production.sh
./monitor-production.sh
```

### Comandos Úteis

#### Ver Logs em Tempo Real

```bash
# Logs do PM2
sudo -u www-data pm2 logs

# Logs do Backend
sudo -u www-data pm2 logs work-with-us-backend

# Logs do Frontend
sudo -u www-data pm2 logs work-with-us-frontend

# Logs do Apache
tail -f /var/log/apache2/trabalhos_error.log
tail -f /var/log/apache2/trabalhos_access.log
```

#### Reiniciar Serviços

```bash
# Reiniciar todos os serviços PM2
sudo -u www-data pm2 restart all

# Reiniciar apenas o backend
sudo -u www-data pm2 restart work-with-us-backend

# Reiniciar apenas o frontend
sudo -u www-data pm2 restart work-with-us-frontend

# Reiniciar Apache
systemctl restart apache2
```

#### Verificar Status

```bash
# Status dos serviços PM2
sudo -u www-data pm2 status

# Status do Apache
systemctl status apache2

# Portas em uso
netstat -tlnp | grep -E ":(80|443|3001|3002)"
```

---

## 🔒 Segurança

### Renovação do Certificado SSL

O certbot renova automaticamente, mas você pode testar:

```bash
certbot renew --dry-run
```

### Variáveis de Ambiente

As credenciais são armazenadas em:
- `/var/www/work-with-us-webdb/backend/.env`
- `/var/www/work-with-us-webdb/frontend-web/.env`

**⚠️ IMPORTANTE**: Nunca commitar esses arquivos no Git!

### Backup

Backups automáticos são criados em:
- `/var/backups/work-with-us-YYYYMMDD-HHMMSS/`

---

## ❌ Rollback (Em Caso de Erro)

Se algo der errado após uma atualização:

```bash
# Localizar backup mais recente
ls -ltr /var/backups/work-with-us-*

# Restaurar backup
BACKUP_DIR="/var/backups/work-with-us-20250208-120000"
cp -r $BACKUP_DIR/work-with-us-webdb/* /var/www/work-with-us-webdb/

# Restaurar variáveis de ambiente
cp $BACKUP_DIR/backend.env /var/www/work-with-us-webdb/backend/.env
cp $BACKUP_DIR/frontend.env /var/www/work-with-us-webdb/frontend-web/.env

# Reiniciar serviços
sudo -u www-data pm2 restart all
```

---

## 🆘 Troubleshooting

### Problema: Site não carrega

**Verificar:**
1. Apache está rodando? `systemctl status apache2`
2. Serviços PM2 estão online? `sudo -u www-data pm2 status`
3. Firewall está bloqueando? `ufw status`
4. SSL está válido? `certbot certificates`

### Problema: Backend não responde

```bash
# Verificar logs
sudo -u www-data pm2 logs work-with-us-backend --lines 50

# Verificar porta
netstat -tlnp | grep 3001

# Reiniciar
sudo -u www-data pm2 restart work-with-us-backend
```

### Problema: Frontend não responde

```bash
# Verificar logs
sudo -u www-data pm2 logs work-with-us-frontend --lines 50

# Verificar porta
netstat -tlnp | grep 3002

# Reiniciar
sudo -u www-data pm2 restart work-with-us-frontend
```

### Problema: Erro de banco de dados

```bash
# Verificar conexão
docker exec mysql57_prod mysql -uroot -p -e "SHOW DATABASES;"

# Verificar database
docker exec mysql57_prod mysql -uroot -p -e "USE work_with_us_db; SHOW TABLES;"

# Recriar schema
cd /var/www/work-with-us-webdb/backend
npx prisma db push --force-reset
```

---

## 📞 Suporte

Para problemas ou dúvidas:
- **Logs**: Sempre verificar logs antes de qualquer ação
- **Backup**: Sempre fazer backup antes de alterações críticas
- **Documentação**: Consultar documentação do Apache, PM2 e Prisma

---

## ✅ Checklist de Deploy

- [ ] DNS configurado no Cloudflare
- [ ] Container MySQL rodando (`mysql57_prod`)
- [ ] Apache, Node.js, Docker e Certbot instalados
- [ ] Script `deploy-production.sh` no servidor
- [ ] Permissão de execução no script (`chmod +x`)
- [ ] Executar script como root
- [ ] Fornecer credenciais do MySQL
- [ ] Verificar serviços PM2 (`pm2 status`)
- [ ] Verificar Apache (`systemctl status apache2`)
- [ ] Verificar SSL (`certbot certificates`)
- [ ] Testar site (https://trabalhos.reservejoias.com.br)
- [ ] Configurar monitoramento
- [ ] Documentar credenciais em local seguro

---

## 🎉 Conclusão

Após seguir este guia, seu sistema Work With Us estará:
- ✅ Online em produção
- ✅ Com SSL válido
- ✅ Monitorado por PM2
- ✅ Com backup automático
- ✅ Pronto para receber candidatos!

**URL Final**: https://trabalhos.reservejoias.com.br

