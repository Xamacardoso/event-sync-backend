# Event Sync Backend

Bem-vindo ao **Event Sync Backend**! Esta é uma API robusta construída com **NestJS** e **Fastify** para alimentar a plataforma de gerenciamento de eventos.

## 🛠️ Tecnologias Principais

- **Framework:** [NestJS](https://nestjs.com/) (adaptador Fastify)
- **Banco de Dados:** PostgreSQL (rodando via Docker)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Validação:** Zod & nestjs-zod
- **Autenticação:** JWT & Passport
- **Documentação:** Swagger/OpenAPI

## 📂 Visão Geral da Estrutura

O projeto segue princípios de arquitetura limpa/modular:

- **`src/`**
  - **`application/`**: Regras de negócio da aplicação.
    - **`services/`**: Contém a lógica de negócios e casos de uso (ex: `AuthService`, `EventsService`).
  - **`presentation/`**: Camada de entrada de dados.
    - **`controllers/`**: Define as rotas (endpoints) e lida com requisições HTTP.
    - **`dtos/`**: Objetos de Transferência de Dados (Data Transfer Objects) para validação de entrada.
  - **`domain/`**: Entidades e interfaces do domínio.
  - **`infra/`**: Implementação de detalhes técnicos.
    - **`database/`**: Configurações do banco, schemas do Drizzle e seeds.
  - **`main.ts`**: Ponto de entrada da aplicação.

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js (v20+)
- Docker e Docker Compose

### 1. Instalação
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e ajuste as variáveis se necessário.
```bash
cp .env.example .env
```

### 3. Subir o Banco de Dados (Docker)
Utilize o Docker Compose para iniciar o container do PostgreSQL.
```bash
docker-compose up -d
```
Isso iniciará o banco na porta definida (ex: 5433).

### 4. Configurar o Banco (Migrate & Seed)
Gere as tabelas e popule com dados iniciais:
```bash
npm run db:reset
```
Isso executa sequencialmente: `drizzle-kit generate`, `migrate` e `seed`.

### 5. Iniciar o Servidor
```bash
# Modo desenvolvimento (com hot-reload)
npm run start:dev
```
A API estará disponível em `http://localhost:3000` (ou porta configurada).

## 📚 Documentação da API
Acesse o Swagger UI para explorar os endpoints:
`http://localhost:3000/docs`

## 🧪 Comandos Úteis
```bash
# Rodar testes
npm run test

# Gerar migrações do Drizzle
npm run db:generate

# Aplicar migrações
npm run db:migrate
```
