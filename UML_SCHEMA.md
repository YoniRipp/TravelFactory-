# UML Schema — Vacation Management Interface

---

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        uuid        id          PK
        string      name
        enum        role        "Requester | Validator"
        timestamp   created_at
    }

    VACATION_REQUESTS {
        uuid        id          PK
        uuid        user_id     FK
        date        start_date
        date        end_date
        string      reason
        enum        status      "Pending | Approved | Rejected"
        string      comments
        timestamp   created_at
    }

    USERS ||--o{ VACATION_REQUESTS : "submits"
```

---

## Class Diagram — Backend MVC

```mermaid
classDiagram

    %% ── MODELS (TypeORM Entities) ──────────────────────────────
    class User {
        +UUID id
        +string name
        +UserRole role
        +Date created_at
        +vacationRequests: VacationRequest[]
    }

    class VacationRequest {
        +UUID id
        +UUID user_id
        +Date start_date
        +Date end_date
        +string reason
        +RequestStatus status
        +string comments
        +Date created_at
        +user: User
    }

    class UserRole {
        <<enumeration>>
        Requester
        Validator
    }

    class RequestStatus {
        <<enumeration>>
        Pending
        Approved
        Rejected
    }

    User "1" --> "0..*" VacationRequest : submits
    VacationRequest --> RequestStatus
    User --> UserRole

    %% ── CONTROLLERS ────────────────────────────────────────────
    class VacationRequestController {
        +create(req, res): Promise~void~
        +findByUser(req, res): Promise~void~
        +findAll(req, res): Promise~void~
        +updateStatus(req, res): Promise~void~
    }

    class UserController {
        +findAll(req, res): Promise~void~
    }

    VacationRequestController ..> VacationRequest : uses
    UserController ..> User : uses

    %% ── MIDDLEWARE ─────────────────────────────────────────────
    class validateRequest {
        <<middleware>>
        +validate(schema): RequestHandler
    }

    class errorHandler {
        <<middleware>>
        +handle(err, req, res, next): void
    }

    class corsMiddleware {
        <<middleware>>
        +configure(): CorsOptions
    }

    %% ── ROUTES ─────────────────────────────────────────────────
    class VacationRequestRouter {
        POST   /api/requests
        GET    /api/requests
        GET    /api/requests?userId
        PATCH  /api/requests/:id/status
    }

    class UserRouter {
        GET    /api/users
    }

    VacationRequestRouter --> VacationRequestController : delegates to
    VacationRequestRouter --> validateRequest : passes through
    UserRouter --> UserController : delegates to
```

---

## Request Lifecycle — Submit Vacation Request

```mermaid
sequenceDiagram
    participant FE as Frontend (Vue)
    participant CORS as CORS Middleware
    participant VAL as Validation Middleware
    participant CTRL as VacationRequestController
    participant DB as PostgreSQL (TypeORM)

    FE->>CORS: POST /api/requests
    CORS-->>FE: Allow (or 403 if origin blocked)
    CORS->>VAL: forward
    VAL-->>FE: 400 Bad Request (if invalid fields)
    VAL->>CTRL: forward (valid body)
    CTRL->>DB: INSERT vacation_request
    DB-->>CTRL: saved entity
    CTRL-->>FE: 201 Created { request }
```

---

## Request Lifecycle — Approve / Reject

```mermaid
sequenceDiagram
    participant FE as Frontend (Vue)
    participant VAL as Validation Middleware
    participant CTRL as VacationRequestController
    participant DB as PostgreSQL (TypeORM)

    FE->>VAL: PATCH /api/requests/:id/status
    Note over VAL: Ensure status is valid enum<br/>Require comments if Rejected
    VAL-->>FE: 400 if comment missing on Reject
    VAL->>CTRL: forward
    CTRL->>DB: SELECT request by id
    DB-->>CTRL: existing request
    CTRL->>DB: UPDATE status + comments
    DB-->>CTRL: updated entity
    CTRL-->>FE: 200 OK { updated request }
```

---

## Backend Folder Structure (MVC)

```
backend/
├── src/
│   ├── entities/              # Models (TypeORM)
│   │   ├── User.ts
│   │   └── VacationRequest.ts
│   ├── controllers/           # Business logic
│   │   ├── userController.ts
│   │   └── vacationRequestController.ts
│   ├── routes/                # Express routers (thin layer)
│   │   ├── userRoutes.ts
│   │   └── vacationRequestRoutes.ts
│   ├── middleware/
│   │   ├── cors.ts            # CORS config
│   │   ├── validate.ts        # Joi/Zod schema validation
│   │   └── errorHandler.ts    # Centralized error responses
│   ├── database/
│   │   └── dataSource.ts      # TypeORM DataSource config
│   └── app.ts                 # Express app entry point
├── tests/
│   ├── vacationRequest.test.ts
│   └── user.test.ts
└── package.json
```

---

## Frontend Structure (Vue 3)

```
frontend/
├── src/
│   ├── views/
│   │   ├── RequesterView.vue  # Submit form + own requests list
│   │   └── ValidatorView.vue  # All requests dashboard + filter + actions
│   ├── components/
│   │   ├── RequestForm.vue
│   │   ├── RequestList.vue
│   │   └── StatusBadge.vue
│   ├── services/
│   │   └── api.ts             # Axios instance + typed API calls
│   ├── router/
│   │   └── index.ts           # Vue Router (/ → Requester, /validator → Validator)
│   └── main.ts
└── package.json
```
