# 🔧 Configuração de Variáveis de Ambiente

## 📋 Arquivo `.env`

Crie um arquivo `.env` na raiz do diretório `backend/` com as seguintes variáveis:

```env
# ==============================================
# DATABASE CONFIGURATION
# ==============================================

# IMPORTANTE: As credenciais variam por ambiente!

# Para MAMP/XAMPP (padrão em desenvolvimento local):
DATABASE_URL="mysql://root:root@localhost:3306/work_with_us_db"

# Para MySQL instalação padrão:
# DATABASE_URL="mysql://root:password@localhost:3306/work_with_us_db"

# Para MySQL sem senha:
# DATABASE_URL="mysql://root@localhost:3306/work_with_us_db"

# Para produção (use credenciais seguras):
# DATABASE_URL="mysql://username:strong_password@host:3306/work_with_us_db"


# ==============================================
# JWT CONFIGURATION
# ==============================================

# Chave secreta para geração de tokens JWT
# ⚠️ IMPORTANTE: Mude isso em produção!
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"


# ==============================================
# SERVER CONFIGURATION
# ==============================================

# Porta do servidor (padrão: 3001)
PORT=3001

# Ambiente de execução
NODE_ENV=development


# ==============================================
# ADMIN USER (criado no seed)
# ==============================================

# Credenciais do usuário administrador padrão
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=admin123

# ⚠️ IMPORTANTE: Altere essas credenciais após o primeiro login!


# ==============================================
# FILE UPLOAD CONFIGURATION
# ==============================================

# Diretório para armazenar arquivos enviados
UPLOAD_DIR=./uploads

# Tamanho máximo de arquivo em bytes (5MB = 5242880)
MAX_FILE_SIZE=5242880


# ==============================================
# CORS CONFIGURATION (opcional)
# ==============================================

# Origem permitida para CORS (frontend)
# CORS_ORIGIN=http://localhost:3000
```

---

## 🔐 Credenciais MySQL por Ambiente

| Ambiente | Usuário | Senha | DATABASE_URL |
|----------|---------|-------|--------------|
| **MAMP/XAMPP** | `root` | `root` | `mysql://root:root@localhost:3306/work_with_us_db` |
| **MySQL Padrão** | `root` | `password` ou vazio | `mysql://root:password@localhost:3306/work_with_us_db` |
| **GitHub Actions CI** | `root` | `password` | `mysql://root:password@localhost:3306/work_with_us_test_db` |
| **Produção** | personalizado | forte | `mysql://user:pass@host:3306/db_name` |

---

## 🚀 Passos para Configuração

### 1. Criar arquivo `.env`

```bash
# Na raiz do diretório backend/
touch .env
```

### 2. Copiar configurações

Copie o conteúdo acima e ajuste as credenciais do MySQL conforme seu ambiente.

### 3. Verificar conexão

```bash
# Testar se o banco está acessível
npm run db:generate
```

### 4. Aplicar schema

```bash
# Criar as tabelas no banco
npm run db:push
```

### 5. Popular dados iniciais

```bash
# Criar usuário admin e dados de exemplo
npm run db:seed
```

---

## ⚠️ Segurança

### Desenvolvimento Local

- ✅ Pode usar credenciais simples (`root:root`)
- ✅ Pode usar `JWT_SECRET` simples
- ✅ Pode usar `ADMIN_PASSWORD` simples

### Produção

- ❌ **NUNCA** use `root` como usuário do banco
- ❌ **NUNCA** use senhas simples
- ❌ **NUNCA** commite o arquivo `.env`
- ✅ Use credenciais fortes e únicas
- ✅ Use `JWT_SECRET` gerado aleatoriamente (mínimo 32 caracteres)
- ✅ Altere `ADMIN_PASSWORD` após primeiro login
- ✅ Use variáveis de ambiente do servidor/cloud

### Gerar JWT_SECRET seguro

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

---

## 🐛 Troubleshooting

### Erro: "Can't connect to MySQL server"

**Causa**: Credenciais incorretas ou MySQL não está rodando.

**Solução**:
1. Verifique se o MySQL está rodando
2. Confirme usuário e senha no seu ambiente
3. Teste conexão manualmente:
   ```bash
   mysql -u root -p
   ```

### Erro: "Unknown database 'work_with_us_db'"

**Causa**: Banco de dados não existe.

**Solução**:
```sql
CREATE DATABASE work_with_us_db;
```

### Erro: "Access denied for user"

**Causa**: Senha incorreta no `DATABASE_URL`.

**Solução**:
- MAMP/XAMPP: use `root:root`
- MySQL padrão: use `root:password` ou `root:` (sem senha)

---

## 📚 Referências

- [Prisma Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [MySQL User Management](https://dev.mysql.com/doc/refman/8.0/en/user-management.html)
- [Environment Variables Best Practices](https://12factor.net/config)
