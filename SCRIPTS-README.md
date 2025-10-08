# 📜 SCRIPTS DE DEPLOY PARA PRODUÇÃO

## 📋 Resumo dos Scripts

Este projeto contém 3 scripts principais para gerenciar o deploy em produção:

### 1️⃣ `deploy-production.sh` - Deploy Inicial

**Objetivo**: Realizar o deploy inicial completo do sistema em produção.

**O que faz**:
- ✅ Solicita credenciais do MySQL interativamente (seguro)
- ✅ Valida conexão com MySQL no Docker (`mysql57_prod`)
- ✅ Instala PM2 e dependências necessárias
- ✅ Clona repositório do GitHub
- ✅ Configura backend (instala deps, gera Prisma, cria DB)
- ✅ Configura frontend (instala deps, build)
- ✅ Cria serviços PM2 para backend e frontend
- ✅ Configura Apache com SSL (padrão reservejoias.com.br)
- ✅ Obtém certificado Let's Encrypt
- ✅ Verifica status de todos os serviços
- ✅ Testa endpoints

**Uso**:
```bash
sudo ./deploy-production.sh
```

**Credenciais solicitadas**:
- Usuário MySQL (padrão: root)
- Senha MySQL (input oculto)

**Configurações**:
- Container MySQL: `mysql57_prod`
- Database: `work_with_us_db`
- Backend: porta 3001
- Frontend: porta 3002
- Domínio: `trabalhos.reservejoias.com.br` (sem www.)

---

### 2️⃣ `update-production.sh` - Atualização

**Objetivo**: Atualizar o sistema em produção com novas versões do código.

**O que faz**:
- ✅ Cria backup automático da versão atual
- ✅ Atualiza código do GitHub (main branch)
- ✅ Preserva configurações locais (.env)
- ✅ Atualiza dependências do backend
- ✅ Atualiza dependências do frontend
- ✅ Rebuild do frontend
- ✅ Atualiza schema do banco (Prisma)
- ✅ Reinicia serviços PM2
- ✅ Verifica status pós-atualização

**Uso**:
```bash
sudo ./update-production.sh
```

**Backups criados em**:
- `/var/backups/work-with-us-YYYYMMDD-HHMMSS/`

**Rollback**:
```bash
BACKUP_DIR="/var/backups/work-with-us-20250208-120000"
cp -r $BACKUP_DIR/work-with-us-webdb/* /var/www/work-with-us-webdb/
sudo -u www-data pm2 restart all
```

---

### 3️⃣ `monitor-production.sh` - Monitoramento

**Objetivo**: Monitorar o status e saúde do sistema em produção.

**O que faz**:
- ✅ Exibe status dos serviços (Apache, PM2)
- ✅ Verifica saúde dos endpoints (backend, frontend, site)
- ✅ Mostra métricas de performance (CPU, RAM, disco)
- ✅ Exibe logs recentes (Apache, PM2)
- ✅ Mostra informações do sistema
- ✅ Lista comandos de manutenção úteis
- ✅ Resumo geral do status

**Uso**:
```bash
sudo ./monitor-production.sh
```

**Informações exibidas**:
- Status do Apache (ativo/inativo)
- Status dos serviços PM2 (online/stopped)
- Status das portas (80, 443, 3001, 3002)
- Health checks dos endpoints
- Uso de CPU e memória
- Uso de disco
- Logs recentes (últimas 5 linhas)
- Versões do sistema (Node.js, Apache)
- Uptime do servidor

---

## 🔧 Configurações Principais

### Apache Virtual Host

**Arquivo**: `/etc/apache2/sites-available/trabalhos.reservejoias.com.br.conf`

```apache
# HTTP - Redireciona para HTTPS
<VirtualHost *:80>
    ServerName trabalhos.reservejoias.com.br
    Redirect permanent / https://trabalhos.reservejoias.com.br/
</VirtualHost>

# HTTPS - Proxy para frontend
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName trabalhos.reservejoias.com.br
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/trabalhos.reservejoias.com.br/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/trabalhos.reservejoias.com.br/privkey.pem
    
    ProxyPass / http://localhost:3002/
    ProxyPassReverse / http://localhost:3002/
</VirtualHost>
</IfModule>
```

### Serviços PM2

**Backend**:
```json
{
  "name": "work-with-us-backend",
  "script": "src/server.ts",
  "interpreter": "tsx",
  "cwd": "/var/www/work-with-us-webdb/backend",
  "env": {
    "NODE_ENV": "production",
    "PORT": "3001"
  }
}
```

**Frontend**:
```json
{
  "name": "work-with-us-frontend",
  "script": "npm",
  "args": "run preview",
  "cwd": "/var/www/work-with-us-webdb/frontend-web",
  "env": {
    "NODE_ENV": "production",
    "VITE_PORT": "3002"
  }
}
```

### Variáveis de Ambiente

**Backend** (`.env`):
```env
DATABASE_URL="mysql://root:SENHA@localhost:3306/work_with_us_db"
JWT_SECRET="GERADO_AUTOMATICAMENTE"
NODE_ENV=production
PORT=3001
```

**Frontend** (`.env`):
```env
VITE_PORT=3002
VITE_API_URL=http://localhost:3001
VITE_NODE_ENV=production
```

---

## 🚀 Fluxo de Deploy

### Deploy Inicial

```mermaid
graph TD
    A[Upload deploy-production.sh] --> B[chmod +x]
    B --> C[./deploy-production.sh]
    C --> D[Solicitar credenciais MySQL]
    D --> E[Validar conexão]
    E --> F[Instalar dependências]
    F --> G[Clonar repositório]
    G --> H[Configurar backend]
    H --> I[Configurar frontend]
    I --> J[Criar serviços PM2]
    J --> K[Configurar Apache]
    K --> L[Obter SSL]
    L --> M[Verificar status]
    M --> N[✅ Deploy concluído]
```

### Atualização

```mermaid
graph TD
    A[./update-production.sh] --> B[Criar backup]
    B --> C[Atualizar código GitHub]
    C --> D[Preservar .env]
    D --> E[Atualizar deps backend]
    E --> F[Atualizar deps frontend]
    F --> G[Rebuild frontend]
    G --> H[Migrar banco]
    H --> I[Reiniciar PM2]
    I --> J[Verificar status]
    J --> K[✅ Atualização concluída]
```

### Monitoramento

```mermaid
graph TD
    A[./monitor-production.sh] --> B[Status serviços]
    B --> C[Health checks]
    C --> D[Métricas performance]
    D --> E[Logs recentes]
    E --> F[Info sistema]
    F --> G[📊 Relatório completo]
```

---

## 📝 Comandos Rápidos

### Gerenciamento PM2

```bash
# Ver status
sudo -u www-data pm2 status

# Ver logs
sudo -u www-data pm2 logs

# Reiniciar todos
sudo -u www-data pm2 restart all

# Reiniciar backend
sudo -u www-data pm2 restart work-with-us-backend

# Reiniciar frontend
sudo -u www-data pm2 restart work-with-us-frontend

# Parar todos
sudo -u www-data pm2 stop all

# Deletar todos
sudo -u www-data pm2 delete all
```

### Gerenciamento Apache

```bash
# Status
systemctl status apache2

# Reiniciar
systemctl restart apache2

# Testar configuração
apache2ctl configtest

# Ver sites habilitados
ls -l /etc/apache2/sites-enabled/

# Ver logs
tail -f /var/log/apache2/trabalhos_error.log
tail -f /var/log/apache2/trabalhos_access.log
```

### Gerenciamento MySQL

```bash
# Conectar ao MySQL
docker exec -it mysql57_prod mysql -uroot -p

# Ver databases
docker exec mysql57_prod mysql -uroot -p -e "SHOW DATABASES;"

# Ver tabelas
docker exec mysql57_prod mysql -uroot -p work_with_us_db -e "SHOW TABLES;"

# Backup database
docker exec mysql57_prod mysqldump -uroot -p work_with_us_db > backup.sql

# Restore database
docker exec -i mysql57_prod mysql -uroot -p work_with_us_db < backup.sql
```

### Gerenciamento SSL

```bash
# Ver certificados
certbot certificates

# Renovar certificados (dry-run)
certbot renew --dry-run

# Renovar certificados (real)
certbot renew

# Revogar certificado
certbot revoke --cert-path /etc/letsencrypt/live/trabalhos.reservejoias.com.br/cert.pem
```

---

## 🆘 Troubleshooting

### Site não carrega

```bash
# 1. Verificar Apache
systemctl status apache2
apache2ctl configtest

# 2. Verificar PM2
sudo -u www-data pm2 status

# 3. Verificar portas
netstat -tlnp | grep -E ":(80|443|3001|3002)"

# 4. Verificar logs
tail -f /var/log/apache2/trabalhos_error.log
sudo -u www-data pm2 logs
```

### Backend não responde

```bash
# 1. Verificar logs
sudo -u www-data pm2 logs work-with-us-backend

# 2. Verificar .env
cat /var/www/work-with-us-webdb/backend/.env

# 3. Testar conexão DB
docker exec mysql57_prod mysql -uroot -p work_with_us_db -e "SELECT 1;"

# 4. Reiniciar
sudo -u www-data pm2 restart work-with-us-backend
```

### Frontend não responde

```bash
# 1. Verificar logs
sudo -u www-data pm2 logs work-with-us-frontend

# 2. Verificar build
ls -lh /var/www/work-with-us-webdb/frontend-web/dist/

# 3. Rebuild
cd /var/www/work-with-us-webdb/frontend-web
npm run build

# 4. Reiniciar
sudo -u www-data pm2 restart work-with-us-frontend
```

---

## ✅ Checklist Completo

### Antes do Deploy

- [ ] DNS configurado no Cloudflare
- [ ] Container MySQL rodando (`docker ps | grep mysql57_prod`)
- [ ] Apache instalado (`apache2 -v`)
- [ ] Node.js 20+ instalado (`node -v`)
- [ ] Certbot instalado (`certbot --version`)
- [ ] Portas 3001 e 3002 livres
- [ ] Acesso root ao servidor

### Durante o Deploy

- [ ] Script no servidor
- [ ] Permissão de execução (`chmod +x`)
- [ ] Credenciais MySQL corretas
- [ ] Sem erros durante execução
- [ ] Serviços PM2 online
- [ ] Apache rodando
- [ ] SSL obtido com sucesso

### Pós-Deploy

- [ ] Site acessível via HTTPS
- [ ] Backend respondendo
- [ ] Frontend carregando
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Vagas listando
- [ ] Candidaturas funcionando
- [ ] Upload de currículo OK
- [ ] Logs sem erros
- [ ] Monitoramento configurado

---

## 🎯 Resumo

| Script | Propósito | Frequência | Requer Root |
|--------|-----------|------------|-------------|
| `deploy-production.sh` | Deploy inicial | Uma vez | ✅ Sim |
| `update-production.sh` | Atualização | Sempre que houver mudanças no código | ✅ Sim |
| `monitor-production.sh` | Monitoramento | Sempre que quiser verificar status | ✅ Sim |

**Fluxo típico**:
1. Deploy inicial: `./deploy-production.sh` (primeira vez)
2. Desenvolvimento local
3. Push para GitHub
4. Atualização: `./update-production.sh` (após cada push)
5. Monitoramento: `./monitor-production.sh` (sempre que necessário)

---

## 📞 Contato e Suporte

Para problemas ou dúvidas:
- Consultar logs: `sudo -u www-data pm2 logs`
- Ver documentação: `DEPLOY-PRODUCTION.md`
- Verificar status: `./monitor-production.sh`

**Arquivos importantes**:
- `deploy-production.sh` - Script de deploy inicial
- `update-production.sh` - Script de atualização
- `monitor-production.sh` - Script de monitoramento
- `DEPLOY-PRODUCTION.md` - Documentação detalhada
- `SCRIPTS-README.md` - Este arquivo (resumo dos scripts)

