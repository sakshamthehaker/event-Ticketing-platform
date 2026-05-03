# EventHive Frontend

React + Vite frontend for EventHive.

## Security approach for JWT
- Access token is stored in secure HttpOnly cookie by backend.
- Frontend never reads raw JWT, reducing XSS token theft risk.
- Axios uses `withCredentials: true` so cookie is sent automatically.
- Frontend stores only non-sensitive user profile in localStorage.

## Run
1. Copy `.env.example` to `.env`
2. `npm install`
3. `npm run dev`
