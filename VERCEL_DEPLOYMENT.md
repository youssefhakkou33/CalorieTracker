# Vercel Deployment Guide

## Environment Variables

Before deploying to Vercel, you need to set up the following environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

### Required Environment Variables:

```
MONGODB_URI=your_mongodb_connection_string_here
USDA_API_KEY=vvl80RnbUt0rAcaAIJBb4724meJEZze7hLFUdkTw
```

## Deployment Steps:

1. **Push to GitHub**: Make sure all your changes are committed and pushed to your GitHub repository.

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Import your CalorieTracker repository

3. **Configure Environment Variables**:
   - In the Vercel project settings, add the environment variables listed above
   - Make sure both `MONGODB_URI` and `USDA_API_KEY` are set

4. **Deploy**:
   - Vercel will automatically deploy your app
   - The serverless functions will be available at `/api/*` endpoints

## How it Works:

- **Static Files**: Your HTML, CSS, and JS files are served as static assets
- **API Routes**: The `/api/*` endpoints are handled by Vercel serverless functions
- **Database**: MongoDB connection is maintained through serverless functions
- **USDA API**: Still works through the serverless search function

## Testing:

After deployment, test the search functionality:
1. Go to your deployed URL
2. Try searching for foods (e.g., "apple", "chicken")
3. The search should work with both local and USDA database results

## Local Development:

For local development, you can still use:
```bash
npm start
```

This will run the original Express server for local testing.
