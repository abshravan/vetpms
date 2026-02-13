# VetPMS — Veterinary Practice Management System

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### 1. Start infrastructure
```bash
docker compose up -d
```

### 2. Backend
```bash
cd backend
cp ../.env.example .env
npm install
npm run typeorm -- migration:run -d src/database/data-source.ts
npx ts-node src/database/seed.ts   # creates admin@vetpms.local / admin123!
npm run start:dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and log in with `admin@vetpms.local` / `admin123!`.

## Tech Stack
| Layer       | Technology                        |
|-------------|-----------------------------------|
| Backend     | NestJS + TypeScript               |
| Database    | PostgreSQL 16, TypeORM            |
| Cache/Queue | Redis 7, BullMQ                   |
| Auth        | JWT + Refresh Tokens, RBAC        |
| Frontend    | React 18 + Vite + Material UI     |
| Infra       | Docker Compose                    |

## Project Structure
```
vetpms/
├── docker-compose.yml
├── backend/
│   └── src/
│       ├── auth/         # JWT auth, login, refresh, RBAC guards
│       ├── users/        # User entity & service
│       ├── audit/        # Append-only audit logging
│       ├── database/     # TypeORM config, migrations, seeds
│       └── common/       # Enums, filters, shared utilities
└── frontend/
    └── src/
        ├── api/          # Axios client with token refresh
        ├── auth/         # Auth context, login page, route guard
        ├── layout/       # Sidebar, header, app shell
        ├── pages/        # Dashboard + placeholder pages
        └── theme/        # Material UI theme config
```
