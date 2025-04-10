# Deploying to Vercel

This document provides detailed steps to deploy the Wuxia Cultivation Game to Vercel.

## 1. Create a Vercel Account

If you don't already have one, sign up for a Vercel account at [https://vercel.com/signup](https://vercel.com/signup).

## 2. Set Up a PostgreSQL Database

For this application, you need a PostgreSQL database. We recommend using either:

- [Neon](https://neon.tech) - Serverless Postgres with a free tier
- [Supabase](https://supabase.com) - Open source Firebase alternative with Postgres
- [Railway](https://railway.app) - Development platform with Postgres support

After setting up your database, make note of the connection string. It will look something like:
```
postgres://username:password@hostname:port/database
```

## 3. Deploy to Vercel

### Option 1: Deploy via GitHub

1. Push your code to a GitHub repository
2. Go to [https://vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Configure the project:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `.` (or leave blank)
5. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: A long, random string for session encryption
   - `NODE_ENV`: Set to `production`
6. Deploy!

### Option 2: Deploy via Vercel CLI

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. From your project directory, run:
   ```
   vercel
   ```

4. Follow the prompts, and make sure to add the required environment variables

## 4. Run Database Migrations

After deploying, you need to run the database migrations:

1. In the Vercel dashboard, go to your project
2. Click on "Settings" → "General" → "Deploy Hooks"
3. Create a new hook named "Run Migrations"
4. This will give you a URL - use it to run migrations:
   ```
   curl -X POST https://api.vercel.com/v1/integrations/deploy/prj_xxxxx/yyyyyyy
   ```

Alternatively, you can run migrations locally pointing to your production database:
```
DATABASE_URL=your_production_db_url npx drizzle-kit push
```

## 5. Verify Your Deployment

1. Visit your deployed application at the URL provided by Vercel
2. Test key features:
   - User registration/login
   - Game state saving
   - Combat functionality
   - Map exploration

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:
1. Double-check your `DATABASE_URL` in Vercel's environment variables
2. Ensure your database provider allows connections from Vercel's IP addresses
3. Check if you need to enable SSL for the database connection

### Build Failures

If your build fails:
1. Check the build logs in Vercel
2. Ensure all dependencies are properly listed in package.json
3. Verify that your build script works locally: `npm run build`

### API Routes Not Working

If your API routes return 404 errors:
1. Check your vercel.json configuration
2. Ensure your routes are correctly defined
3. Check server logs in the Vercel dashboard