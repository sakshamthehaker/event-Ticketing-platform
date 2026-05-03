# EventHive - Event & Ticket Booking System

## Repository Split (No Monorepo)
- `eventhive-backend`
- `eventhive-frontend`

## Architecture Decisions
- Backend follows strict MVC + Service Layer.
- Routes only map endpoints and middleware.
- Controllers orchestrate request/response only.
- Services contain business logic and DB operations.
- MongoDB transactions are used for booking/cancellation seat consistency.
- JWT auth is cookie-based (HttpOnly) with RBAC for `admin` and `user`.

## ER Diagram (Logical)
- `User (1) ---- (N) Booking`
- `Event (1) ---- (N) Booking`
- `Admin(User role=admin) (1) ---- (N) Event(createdBy)`

Entities:
1. User
- name, email(unique), password(hashed), role(admin/user), createdAt

2. Event
- title, description, date, location, totalSeats, availableSeats, price, createdBy(User), createdAt

3. Booking
- user(User), event(Event), seatsBooked, bookingStatus(confirmed/cancelled), paymentStatus(mock), createdAt

## Security Controls Implemented
- Helmet
- CORS allow-list from env
- Rate limiting
- NoSQL injection sanitization (`express-mongo-sanitize`)
- Input sanitization (`xss-clean`, `hpp`)
- JWT expiration
- Secure cookie setup for production
- Centralized error handling without stack traces in production

## Booking Business Logic
- Atomic seat deduction via `findOneAndUpdate` with `availableSeats >= seatsBooked` inside transaction.
- Overbooking blocked at query level.
- Duplicate active booking per user/event blocked.
- Cancelling booking restores seats in same transaction.
- Payment flow is mock-only (no external gateway required).

## API Modules
- Auth: register/login/logout
- Events: create/update/delete(admin), list/get(all)
- Bookings: create/cancel/me(user)
- Profile: current user profile

## Deployment Steps
1. MongoDB Atlas
- Create cluster and DB user.
- Add network access for Render IPs or temporary `0.0.0.0/0`.
- Copy connection string to backend `MONGO_URI`.

2. Backend (Render)
- Create Web Service from `eventhive-backend` repository.
- Build command: `npm install`
- Start command: `npm start`
- Set env vars from backend `.env.example`.
- Keep `NODE_ENV=production`.

3. Frontend (Vercel)
- Create project from `eventhive-frontend` repository.
- Framework preset: Vite.
- Set `VITE_API_BASE_URL` to Render backend URL + `/api/v1`.
- Redeploy after env update.

4. CORS + Cookies
- Add Vercel domain(s) in backend `CLIENT_URLS`.
- In production, backend uses secure cookie + `sameSite=none`.

## Environment Variables

Backend (`eventhive-backend/.env`)
- `NODE_ENV`
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `COOKIE_EXPIRES_IN_DAYS`
- `CLIENT_URLS`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`

Frontend (`eventhive-frontend/.env`)
- `VITE_API_BASE_URL`

## Postman Documentation Structure
Collection: `postman/EventHive.postman_collection.json`
Folders:
- Auth
  - POST `/auth/register`
  - POST `/auth/login`
  - POST `/auth/logout`
- Events
  - GET `/events`
  - GET `/events/:eventId`
  - POST `/events` (admin)
  - PATCH `/events/:eventId` (admin)
  - DELETE `/events/:eventId` (admin)
- Bookings
  - POST `/bookings`
  - PATCH `/bookings/:bookingId/cancel`
  - GET `/bookings/me`
  - GET `/bookings` (admin)
- Users
  - GET `/users/me`

## Git Workflow
Branches:
- `main`
- `dev`
- `feature/auth`
- `feature/events`
- `feature/bookings`
- `feature/frontend-auth`
- `feature/frontend-ui`

Commit format:
- `feat: add atomic booking cancellation`
- `fix: handle jwt verification errors in auth middleware`
- `refactor: split auth handlers into service layer`

## Bonus Implemented
- Pagination (events, bookings)
- Search/filter (events)
- Seat selection UI
- Basic integration test scaffold (`eventhive-backend/tests/health.test.js`)

## Run Locally
Backend:
1. `cd eventhive-backend`
2. `cp .env.example .env` (fill values)
3. `npm install`
4. `npm run dev`

Frontend:
1. `cd eventhive-frontend`
2. `cp .env.example .env`
3. `npm install`
4. `npm run dev`
