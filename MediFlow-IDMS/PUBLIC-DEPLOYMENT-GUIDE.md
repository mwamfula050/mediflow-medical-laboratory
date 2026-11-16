# MediFlow public sharing and deployment guide

## What is new in this package

- Login page now has a rotating healthcare image showcase, manual slide controls, motion effects and a video preview panel.
- Added a public workflow tour at `/demo`. It explains the configured Reception → Doctor → Cashier → Laboratory → Doctor process without exposing patient records.
- Added exact-origin CORS configuration through `APP_CORS_ALLOWED_ORIGINS`.
- Existing React/Vite frontend and Spring Boot/MySQL backend are retained.

## Important: the public link is not live yet

This ZIP is the deployable source project. It does not contain a hosted domain, a cloud database, or deployed server credentials. A real public URL can only be issued after you deploy the frontend and backend and connect a database.

After deployment, share both:
- `https://YOUR-FRONTEND-DOMAIN/demo` — public workflow explanation, no login required.
- `https://YOUR-FRONTEND-DOMAIN/login` — staff login page.

The public tour is intentionally informational. It does not create demo users or show real patient information. Do not publish a live clinical system with real patient records as an unrestricted public demo.

## Frontend deployment (Netlify)

1. Push the `MediFlow-IDMS` folder to a private or public Git repository.
2. Create a Netlify site from that repository.
3. Set the base directory to `frontend`.
4. Build command: `npm ci && npm run build`
5. Publish directory: `frontend/dist`
6. Add the environment variable `VITE_API_URL` with the deployed backend API base URL, for example `https://YOUR-BACKEND-DOMAIN/api`.
7. Deploy. The `netlify.toml` file in this folder provides the SPA fallback rule.

Netlify free-tier limits and policies can change; confirm current limits before relying on a free deployment for a business.

## Backend deployment

Deploy the Spring Boot project to a Java 17 hosting service that supports persistent environment variables and HTTPS. Configure:

- `SERVER_PORT` — use the port provided by the hosting platform.
- `DB_URL` — JDBC URL for a managed MySQL database, including required TLS parameters.
- `DB_USERNAME` and `DB_PASSWORD` — database credentials.
- `APP_JWT_SECRET` — private random secret with at least 32 characters.
- `APP_BOOTSTRAP_ENABLED=true` temporarily for the first administrator only.
- `APP_BOOTSTRAP_USERNAME`, `APP_BOOTSTRAP_PASSWORD`, `APP_BOOTSTRAP_FULL_NAME` — one-time first administrator credentials.
- `APP_CORS_ALLOWED_ORIGINS` — exact deployed frontend origin, e.g. `https://YOUR-SITE.netlify.app` (no path and no trailing slash).

Build from the repository root with:
`cd backend && mvn clean package -DskipTests`

Start with:
`java -jar backend/target/mediflow-api-1.0.0.jar`

After creating the first administrator, set `APP_BOOTSTRAP_ENABLED=false` and restart the service. Never share the bootstrap password or JWT secret.

## Before sharing the link

- Use a separate demo database populated only with fictional sample records.
- Create limited demo accounts for each role if visitors need to sign in; never share an administrator account.
- Add rate limiting, HTTPS, database backups and monitoring at the hosting layer.
- Confirm the deployed frontend origin is the only CORS origin.
- Test login, refresh, all roles, patient privacy, payment-gated laboratory release and doctor result review.
- Check the hosting provider's data location, backup, retention and privacy terms. Do not use a free hobby tier for real clinical data without an appropriate security, privacy and availability review.

## Images and video

The login showcase uses remote illustrative stock photographs. An internet connection is required for those images. The video preview embeds the Cleveland Clinic film “Empathy” (external YouTube video ID `cDDWvj_q-o8`) and may be unavailable if the provider removes or restricts it. Replace the embed ID in `frontend/src/pages/LoginPage.tsx` with a video you own or are licensed to display. Never use identifiable patient footage without documented consent.
