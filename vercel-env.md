# Vercel Environment Variables Configuration

When deploying to Vercel, you'll need to set up the following environment variables in your Vercel dashboard:

## Required Environment Variables

### Database Configuration
```
DATABASE_URL=your_postgresql_connection_string
```
- Get this from your database provider (Neon, Supabase, PlanetScale, etc.)

### Application Configuration
```
NODE_ENV=production
SESSION_SECRET=your_secure_random_session_secret
```

### Optional API Keys (if using these features)
```
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with its corresponding value
4. Select the appropriate environments (Production, Preview, Development)
5. Click **Save**

## Database Setup

For production deployment, you'll need a PostgreSQL database. Recommended providers:
- **Neon** (Recommended for this setup)
- **Supabase**
- **PlanetScale**
- **Railway**

After setting up your database:
1. Copy the connection string
2. Add it as `DATABASE_URL` in Vercel environment variables
3. Run database migrations if needed

## File Storage

Note: Vercel has a 50MB deployment limit and ephemeral file system. For production file uploads, consider:
- **Vercel Blob** for file storage
- **Cloudinary** for image/media processing
- **AWS S3** for general file storage

## Deployment Commands

The project is configured to build automatically on Vercel using:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`