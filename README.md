# Vacation Manager

A full-stack vacation request management application built with Vue 3, Node.js/Express, TypeORM, and PostgreSQL.

## Features

- **Requester Interface** — submit vacation requests and track their status
- **Validator Interface** — dashboard with status filtering, approve/reject with required comments
- Role-based user switching (no auth required — users are pre-seeded)

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Vue 3 + Vite + Vue Router + Axios   |
| Backend  | Node.js + Express + TypeScript (MVC)|
| ORM      | TypeORM                             |
| Database | PostgreSQL 15                       |
| Tests    | Jest + ts-jest                      |

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (for PostgreSQL)

## Setup & Run

### 1. Start the database

```bash
docker-compose up -d
```

This starts a PostgreSQL 15 instance on port `5432` with:
- User: `postgres`
- Password: `postgres`
- Database: `vacation_manager`

### 2. Backend

```bash
cd backend
npm install
npm run seed      # Creates 2 requesters + 1 validator
npm run dev       # Starts on http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev       # Starts on http://localhost:5173
```

Open http://localhost:5173 in your browser.

### Run tests

```bash
cd backend
npm test
```

## Project Structure

```
TravelFactory-/
├── backend/
│   └── src/
│       ├── entities/       # TypeORM models (User, VacationRequest)
│       ├── controllers/    # Business logic
│       ├── routes/         # Express routers
│       ├── middleware/     # CORS, validation (Joi), error handler
│       └── database/       # DataSource + seed script
├── frontend/
│   └── src/
│       ├── views/          # RequesterView, ValidatorView
│       ├── components/     # StatusBadge, RequestList
│       ├── services/       # Axios API wrapper
│       └── router/         # Vue Router
├── docker-compose.yml
└── UML_SCHEMA.md           # ER diagram + class diagram + sequence diagrams
```

## API Endpoints

| Method  | Path                          | Description                        |
|---------|-------------------------------|------------------------------------|
| GET     | `/api/users`                  | List all users                     |
| POST    | `/api/requests`               | Submit a vacation request          |
| GET     | `/api/requests?userId=<id>`   | Get requests for a specific user   |
| GET     | `/api/requests?status=Pending`| Get all requests (validator view)  |
| PATCH   | `/api/requests/:id/status`    | Approve or reject a request        |

## Technical Decisions

**MVC backend** — controllers hold all business logic, routes are thin wiring layers, entities are pure TypeORM models. This keeps each layer independently testable.

**Three middleware only** — CORS (cross-origin for dev), Joi schema validation (rejects bad input before it reaches controllers), and a centralized error handler (single place for all error responses). No over-engineering.

**No authentication** — role switching is done via a dropdown seeded with real users. This keeps setup to one command and scope within the 4-hour estimate.

**TypeORM `synchronize: true`** — schema is auto-synced from entities in dev. In production this would be disabled in favour of migrations.

**Joi for validation** — colocates validation schemas with the routes that use them, making the constraints immediately readable.

## Known Limitations

- No authentication — user identity is selected from a dropdown (demo only)
- `synchronize: true` is not safe for production use; migrations would be needed
- No pagination on the validator dashboard
- Comments on approved requests are optional (the spec only requires them on rejection)
