# Event Sync Backend

Welcome to the **Event Sync Backend**! This is a robust API built with **NestJS** and **Fastify** to power the event management platform. It leverages modern tools for type safety, database management, and authentication.

## 🛠️ Main Technologies & Libraries

- **Framework:** [NestJS](https://nestjs.com/) (using Fastify adapter for performance)
- **Language:** TypeScript
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** PostgreSQL
- **Validation:** [Zod](https://zod.dev/) & `nestjs-zod`
- **Authentication:** Passport & JWT (`@nestjs/passport`, `@nestjs/jwt`)
- **Documentation:** Swagger/OpenAPI (`@nestjs/swagger`)
- **Hashing:** Bcrypt

## 📂 Project Structure Overview

The project follows a modular architecture typical of NestJS applications.

- **`src/`**: Source code root.
  - **`infra/`**: Infrastructure layer, including database configuration (`database/`), schemas, and seed scripts.
  - **`modules/`**: Feature modules containing Controllers, Services, and business logic.
  - **`app.module.ts`**: The root module that orchestrates all feature modules.
  - **`main.ts`**: The entry point of the application.
- **`test/`**: End-to-end (E2E) tests.
- **`drizzle.config.ts`**: Configuration for Drizzle Kit (migrations and studio).

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- PostgreSQL installed and running
- `.env` file configured (see `.env.example`)

### Installation

```bash
npm install
```

### Database Setup

Run the following command to generate migrations, migrate the database, and seed initial data:

```bash
npm run db:reset
```

Or run them individually:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Running the Server

**Development Mode:**
```bash
npm run start:dev
```

**Production Mode:**
```bash
npm run start:prod
```

### API Documentation

Once running, access the Swagger UI documentation at:
`http://localhost:3000/api` (or your configured port/path)

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
