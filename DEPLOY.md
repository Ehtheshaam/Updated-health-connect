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

6. **Security Note - Important!**
   - Before distributing the app, change the `JWT_SECRET` in Render to a strong, random, secure string. Using a default or placeholder secret like "healthconnect-demo-secret-change-me" is a major security vulnerability for a public app.

## Distributing the Frontend App (Android APK)

The frontend of this application is distributed as an Android APK, built using Expo Application Services (EAS). We are not deploying a static web version.

1. **Prerequisites:**
   - You must have an Expo account.
   - Run `eas login` to authenticate the CLI.

2. **Configure Backend URL:**
   - Ensure the `EXPO_PUBLIC_API_URL` environment variable is pointing to your live Render backend URL. This is configured in the `eas.json` file under the `preview` build profile, or in a local `.env` file during the build process.

3. **Build the APK:**
   - Run the following command to build the Android APK:
     ```bash
     eas build --platform android --profile preview
     ```
   - This command will package the app and generate a downloadable `.apk` link.

4. **Distribution:**
   - Download the generated `.apk` file from the Expo dashboard.
   - You can upload this file to GitHub Releases or distribute it directly to users.
   - Users will need to allow "Install from Unknown Sources" on their Android devices to sideload the app.
