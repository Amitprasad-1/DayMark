# DayMark Database Layer

This directory contains the database definitions, Prisma ORM schema, and migration scripts.

## Database Configurations
- **Default (Local)**: SQLite (`file:./dev.db`) for rapid local development.
- **Production**: Easily switch to PostgreSQL by setting:
  ```env
  DATABASE_URL="postgresql://user:password@localhost:5432/daymark?schema=public"
  ```
  and updating `provider = "postgresql"` in `prisma/schema.prisma`.

## Commands
```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Open Prisma Studio visual browser
npx prisma studio
```
