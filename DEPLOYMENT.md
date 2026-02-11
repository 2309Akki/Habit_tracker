# 🚀 Deploy Your Habit Tracker

## Option 1: Vercel (Recommended - Easiest)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

### Step 4: Follow Prompts
- Link to existing Vercel project? **No**
- What's your project's name? **habit-tracker**
- In which directory is your code located? **./**
- Want to override the settings? **No**

### Step 5: Add Environment Variables
Go to your Vercel dashboard → Settings → Environment Variables:
```
MONGODB_URI=your_mongodb_atlas_connection_string
```

## Option 2: Netlify

### Step 1: Build Project
```bash
npm run build
```

### Step 2: Deploy to Netlify
- Drag the `.next` folder to netlify.com
- Add environment variable: `MONGODB_URI`

## Option 3: Railway

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login and Deploy
```bash
railway login
railway init
railway up
```

### Step 3: Add Environment Variable
```bash
railway variables set MONGODB_URI=your_connection_string
```

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Make sure you have these in your `.env` file:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habit-tracker?retryWrites=true&w=majority
```

### 2. Build Configuration
Ensure `next.config.js` has:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
}

module.exports = nextConfig
```

### 3. Package.json Scripts
Make sure you have:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 🔧 MongoDB Atlas Setup

### 1. Create Database
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster (M0 free tier)
3. Create database user
4. Get connection string

### 2. Whitelist IP
- Add `0.0.0.0/0` for all IPs (development)
- Add Vercel's IP ranges for production

## 🌐 Domain Setup (Optional)

### Vercel Custom Domain
1. Go to Vercel dashboard
2. Click "Domains"
3. Add your custom domain
4. Update DNS records

### Netlify Custom Domain
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records

## 📊 Monitoring

### Vercel Analytics
- Built-in analytics dashboard
- Real-time performance metrics

### MongoDB Atlas Monitoring
- Database performance metrics
- Query performance insights

## 🚀 Production Optimizations

### 1. Performance
```javascript
// next.config.js
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}
```

### 2. Security
- Enable HTTPS (automatic on Vercel/Netlify)
- Use environment variables for secrets
- Implement rate limiting

### 3. Database Optimization
- Add indexes to MongoDB
- Use connection pooling
- Monitor query performance

## 🎯 Quick Deploy Commands

### Vercel (Fastest)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Railway
```bash
npm i -g @railway/cli
railway login
railway up
```

## 📱 Mobile App (Future)

### React Native
```bash
npx react-native init HabitTrackerMobile
```

### PWA
```bash
npm install next-pwa
```

## 🔗 Useful Links

- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Railway](https://railway.app)

## 🎉 Success!

Once deployed, your habit tracker will be live at:
- Vercel: `https://your-app.vercel.app`
- Netlify: `https://your-app.netlify.app`
- Railway: `https://your-app.railway.app`

Share your live app and start tracking habits! 🎊
