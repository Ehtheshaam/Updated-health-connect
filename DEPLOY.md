# Deployment Guide

This project is configured for deployment on Render with a Neon PostgreSQL database.

Follow these exact steps to deploy the backend manually:

1. **Create the Database:**
   - Go to [neon.tech](https://neon.tech), sign up or log in, and create a new free Postgres database.
   - Copy the provided connection string (it should look like `postgresql://user:password@endpoint/dbname?sslmode=require`).

2. **Initialize Local Database:**
   - Paste that connection string into `backend/.env` locally (replace the existing `DATABASE_URL`).
   - Run `npx prisma migrate dev --name init_postgres` from the `backend/` directory to run migrations against your Neon database.
   - Run `npm run seed` from the `backend/` directory to set up and seed the real Postgres database.

3. **Push to GitHub:**
   - Commit all these changes and push your repository to GitHub.

4. **Deploy on Render:**
   - Go to [render.com](https://render.com), log in, and click "New Web Service".
   - Connect it to your GitHub repository.
   - Render should automatically detect the `render.yaml` configuration in the root directory.

5. **Configure Render Environment Variables:**
   - During setup on Render, fill in the environment variables that are missing (`DATABASE_URL`, `JWT_SECRET`).
   - Paste the exact same Neon connection string into `DATABASE_URL`.
   - Set a strong string for `JWT_SECRET`.

6. **Connect the Frontend:**
   - Once the deployment is successful and Render provides a public URL (e.g., `https://healthconnect-backend.onrender.com`), copy it.
   - Open your frontend configuration (e.g., Expo settings or directly replacing the `SET_YOUR_RENDER_URL_HERE` placeholder locally, or setting `EXPO_PUBLIC_API_URL` environment variable) and paste the Render public URL.

Your app is now connected to the live backend!
