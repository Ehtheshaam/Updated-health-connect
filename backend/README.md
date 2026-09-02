# HealthConnect Backend

Minimal Node.js + Express + TypeScript API with Prisma ORM, JWT auth, and Zod validation.

## Quick Start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Copy env and configure (SQLite works out of the box)
cp .env.example .env

# 3. Run Prisma migration (creates the database + tables)
npx prisma migrate dev --name init

# 4. Seed sample providers
npm run seed

# 5. Start the dev server
npm run dev
```

The API will be running at `http://localhost:3001`.

## Environment Variables

| Variable       | Description                                    | Default                    |
| -------------- | ---------------------------------------------- | -------------------------- |
| `DATABASE_URL` | Prisma database connection string              | `file:./dev.db` (SQLite)   |
| `JWT_SECRET`   | Secret key for signing JWTs                    | (set in .env)              |
| `PORT`         | Port the server listens on                     | `3001`                     |

### Using PostgreSQL instead of SQLite

1. Update `DATABASE_URL` in `.env` to your Postgres connection string
2. Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`
3. Run `npx prisma migrate dev --name init`

## API Endpoints

### Public
- `POST /auth/register` — Create account (name, phone, password)
- `POST /auth/login` — Login (phone, password) → returns JWT

### Protected (requires `Authorization: Bearer <token>`)
- `GET /users/me` — Get current user profile
- `PUT /users/me` — Update profile fields
- `POST /symptoms` — Submit symptoms → server-side analysis + persist
- `GET /symptoms` — Get symptom report history
- `GET /records` — Get health records
- `POST /records` — Create health record
- `GET /prescriptions` — Get prescriptions
- `POST /prescriptions` — Create prescription
- `GET /providers` — List all providers
- `GET /bookings` — Get user's consult bookings
- `POST /bookings` — Create a consult booking

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script for sample providers
├── src/
│   ├── index.ts         # Express app entry point
│   ├── lib/
│   │   └── symptomEngine.ts  # Keyword-based symptom rule engine
│   ├── middleware/
│   │   ├── auth.ts      # JWT verification middleware
│   │   ├── errorHandler.ts  # Centralized error handler
│   │   └── validate.ts  # Zod validation middleware factory
│   └── routes/
│       ├── auth.ts      # Register + Login
│       ├── users.ts     # GET/PUT /users/me
│       ├── symptoms.ts  # POST/GET /symptoms
│       ├── records.ts   # GET/POST /records
│       ├── prescriptions.ts  # GET/POST /prescriptions
│       ├── providers.ts # GET /providers
│       └── bookings.ts  # GET/POST /bookings
├── .env.example
├── package.json
└── tsconfig.json
```
