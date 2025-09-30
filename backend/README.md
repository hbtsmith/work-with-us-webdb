# Work With Us - Backend API

Sistema de pré-entrevista de emprego desenvolvido com Node.js, Fastify, TypeScript e Prisma.

## �� Tecnologias

- **Node.js** 20+
- **Fastify** - Framework web rápido e eficiente
- **TypeScript** - Tipagem estática
- **Prisma** - ORM moderno
- **MySQL** 5.7 - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Zod** - Validação de dados
- **Vitest** - Testes unitários
- **Docker** - Containerização

## 📋 Pré-requisitos

- Node.js 20+
- MySQL 5.7+
- Docker (opcional)

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

4. Configure o banco de dados no arquivo `.env`:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/work_with_us_db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   ```

5. Execute as migrações do banco:
   ```bash
   npm run db:push
   ```

6. Popule o banco com dados iniciais:
   ```bash
   npm run db:seed
   ```

## �� Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Com Docker
```bash
docker-compose up -d
```

## 📚 API Documentation

Acesse a documentação interativa da API em:
- **Desenvolvimento**: http://localhost:3000/docs
- **Produção**: https://yourdomain.com/docs

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:coverage

# Executar testes E2E
npm run test:e2e
```

## 📁 Estrutura do Projeto

```
src/
├── controllers/     # Controladores das rotas
├── services/        # Lógica de negócio
├── middlewares/     # Middlewares personalizados
├── routes/          # Definição das rotas
├── schemas/         # Schemas de validação (Zod)
├── types/           # Tipos TypeScript
├── utils/           # Utilitários
├── database/        # Configuração do banco
└── server.ts        # Arquivo principal
```

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. Para acessar rotas protegidas, inclua o token no header:

```
Authorization: Bearer <token>
```

### Credenciais padrão do admin:
- **Email**: admin@company.com
- **Senha**: admin123

⚠️ **Importante**: Altere essas credenciais no primeiro acesso!

##  Endpoints Principais

### Públicos
- `GET /api/jobs/public/:slug` - Obter vaga por slug
- `POST /api/applications/submit/:slug` - Enviar candidatura

### Protegidos (requer autenticação)
- `POST /api/auth/login` - Login
- `GET /api/admin/dashboard` - Dashboard administrativo
- `GET /api/positions` - Listar cargos
- `POST /api/positions` - Criar cargo
- `GET /api/jobs` - Listar vagas
- `POST /api/jobs` - Criar vaga
- `GET /api/applications` - Listar candidaturas

##  Docker

### Desenvolvimento
```bash
docker-compose -f docker-compose.dev.yml up
```

### Produção
```bash
docker-compose up -d
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executar em modo desenvolvimento
- `npm run build` - Compilar TypeScript
- `npm start` - Executar em produção
- `npm test` - Executar testes
- `npm run lint` - Verificar código
- `npm run format` - Formatar código
- `npm run db:generate` - Gerar cliente Prisma
- `npm run db:push` - Sincronizar schema
- `npm run db:migrate` - Executar migrações
- `npm run db:seed` - Popular banco

## 📝 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão do MySQL | - |
| `JWT_SECRET` | Chave secreta do JWT | - |
| `PORT` | Porta do servidor | 3000 |
| `NODE_ENV` | Ambiente de execução | development |
| `ADMIN_EMAIL` | Email do admin padrão | admin@company.com |
| `ADMIN_PASSWORD` | Senha do admin padrão | admin123 |
| `UPLOAD_DIR` | Diretório de uploads | ./uploads |
| `MAX_FILE_SIZE` | Tamanho máximo de arquivo | 5242880 |

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

##  Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

##  Backend Completo!

O backend está agora completamente configurado com:

✅ **Estrutura completa** seguindo os requisitos não funcionais
✅ **Fastify + TypeScript + Prisma + Zod** conforme suas preferências
✅ **Autenticação JWT** com bcrypt para senhas
✅ **Validação robusta** com Zod
✅ **Documentação Swagger** automática
✅ **Testes configurados** com Vitest
✅ **Docker** para containerização
✅ **Linting e formatação** com ESLint + Prettier
✅ **Seed** com dados iniciais
✅ **Estrutura modular** e escalável

### Próximos passos:

1. **Instalar dependências**: `npm install`
2. **Configurar .env** com suas credenciais do banco
3. **Executar migrações**: `npm run db:push`
4. **Popular banco**: `npm run db:seed`
5. **Executar em desenvolvimento**: `npm run dev`

Quer que eu continue com o frontend agora ou tem alguma dúvida sobre o backend?
```

