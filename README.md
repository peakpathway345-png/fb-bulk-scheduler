# 📅 Facebook Bulk Scheduler

**Multiple Facebook accounts se bulk me pages par posts schedule aur publish karne ka complete solution!**

## ✨ Features

- ✅ **Multiple Facebook Accounts** - Kai accounts ek saath manage karein
- ✅ **Bulk Upload** - Ek bar me 50+ posts upload karein
- ✅ **Manual Scheduling** - Har post ka apna custom schedule time set karein
- ✅ **Auto Publishing** - Background worker automatically posts publish karega
- ✅ **Network Independent** - Ek bar schedule hone ke baad post zarur publish hoga
- ✅ **Real-time Dashboard** - Posts ka status live dekhein
- ✅ **Multi-page Support** - Ek post ko multiple pages par schedule karein
- ✅ **Photo & Video Support** - Images aur videos dono upload karein
- ✅ **Retry Mechanism** - Failed posts automatically retry honge

## 🚀 Quick Start Guide

### 1️⃣ Prerequisites

Ye accounts already bane hone chahiye:
- ✅ GitHub Account
- ✅ Railway Account (GitHub se login)
- ✅ Facebook Developer Account

### 2️⃣ Facebook App Setup

1. **Facebook Developer Console** me jao: https://developers.facebook.com
2. **"Create App"** click karo
3. **App Type**: Business
4. **App Name**: Koi bhi naam (e.g., "My Scheduler")
5. **Contact Email**: Apni email
6. App dashboard me **Settings → Basic** me jao:
   - Copy karo: **App ID**
   - Copy karo: **App Secret**

7. **Facebook Login** add karo:
   - Dashboard me "Add Product" click karo
   - "Facebook Login" select karo
   - Settings me jao aur ye URLs add karo:
     - Valid OAuth Redirect URIs: `https://your-app-name.up.railway.app/auth/facebook/callback`
     - (Pehle `http://localhost:3000/auth/facebook/callback` for testing)

8. **Permissions** request karo:
   - App Review → Permissions and Features
   - Request in permissions:
     - `pages_manage_posts`
     - `pages_read_engagement`
     - `pages_manage_metadata`
     - `pages_show_list`

### 3️⃣ Railway Deployment

#### Method 1: GitHub (Recommended)

1. **GitHub par code push karo**:
   ```bash
   # Apni GitHub username daalo
   git remote add origin https://github.com/YOUR_USERNAME/fb-bulk-scheduler.git
   git branch -M main
   git push -u origin main
   ```

2. **Railway.app** me jao: https://railway.app
3. **"New Project"** click karo
4. **"Deploy from GitHub repo"** select karo
5. **Repository select karo**: fb-bulk-scheduler
6. Railway automatically detect karega aur deploy karega

#### Method 2: Direct Railway CLI

```bash
# Railway CLI install karo
npm install -g @railway/cli

# Login karo
railway login

# Project initialize karo
railway init

# Deploy karo
railway up
```

### 4️⃣ Environment Variables Setup

Railway dashboard me **Variables** tab me jao aur ye add karo:

```env
FACEBOOK_APP_ID=your_app_id_from_step_2
FACEBOOK_APP_SECRET=your_app_secret_from_step_2
CALLBACK_URL=https://your-app-name.up.railway.app/auth/facebook/callback
SESSION_SECRET=any_random_long_string_here
NODE_ENV=production
```

**Important**: `CALLBACK_URL` me apne Railway app ka actual URL daalo!

### 5️⃣ Database Setup

1. Railway dashboard me **"New"** → **"Database"** → **"PostgreSQL"** click karo
2. Automatically `DATABASE_URL` environment variable add ho jayega
3. Database me connect karke schema run karo:
   - Railway dashboard me PostgreSQL service select karo
   - **"Data"** tab me jao
   - **"Query"** option me `config/database.sql` ki contents paste karo aur run karo

**Alternative**: Railway CLI se:
```bash
railway run psql -f config/database.sql
```

### 6️⃣ Testing

1. Railway dashboard me apna app URL open karo: `https://your-app.up.railway.app`
2. **"Facebook se Login करें"** button click karo
3. Facebook permissions approve karo
4. Dashboard me redirect hoga
5. **"Refresh Pages"** click karo - aapke Facebook pages load honge
6. Ab bulk upload kar sakte ho!

## 📖 How to Use

### Step 1: Connect Facebook Account
- Dashboard me "Facebook से Login करें" button click karo
- Facebook permissions approve karo

### Step 2: Load Your Pages
- Dashboard me "Refresh Pages" button click karo
- Aapke sab Facebook pages list me aa jayenge
- Jo pages use karne hain unhe select karo (checkbox)

### Step 3: Bulk Upload Posts
1. **"Add More Post"** button se posts add karo
2. Har post ke liye:
   - 📷 **Photo/Video** upload karo
   - ✍️ **Caption** likho (optional)
   - ⏰ **Schedule Time** set karo
3. Multiple posts add kar sakte ho
4. **"Schedule All Posts"** button click karo

### Step 4: Monitor Status
- Right panel me scheduled posts dikhenge
- Status types:
  - 🟡 **PENDING** - Abhi publish nahi hua
  - 🟢 **PUBLISHED** - Successfully publish ho gaya
  - 🔴 **FAILED** - Publish nahi hua (3x retry ke baad)

### Step 5: Auto Publishing
- Background worker har minute check karega
- Jis post ka time aa gaya, automatically publish ho jayega
- Network down ho to bhi retry karega
- Success hone par status update hoga

## 🛠️ Technical Architecture

```
┌─────────────────────────────────────────┐
│          Frontend (Dashboard)           │
│  - HTML/CSS/JavaScript (Tailwind)       │
│  - Axios for API calls                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Backend (Node.js/Express)        │
│  - Facebook OAuth Authentication        │
│  - File Upload (Multer)                 │
│  - RESTful API Endpoints                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Database (PostgreSQL/Railway)      │
│  - Accounts, Pages, Posts Storage       │
└──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     Background Worker (node-cron)       │
│  - Checks every minute                  │
│  - Publishes scheduled posts            │
│  - Retry mechanism (3 attempts)         │
└──────────────────────────────────────────┘
```

## 📊 Database Schema

### Tables:
1. **facebook_accounts** - Linked Facebook accounts
2. **facebook_pages** - User's Facebook pages
3. **scheduled_posts** - All scheduled posts with status
4. **upload_batches** - Bulk upload tracking

## 🔧 API Endpoints

### Authentication
- `GET /auth/facebook` - Facebook OAuth login
- `GET /auth/facebook/callback` - OAuth callback
- `GET /auth/status` - Check login status
- `GET /auth/logout` - Logout

### Pages
- `GET /api/pages/fetch` - Fetch pages from Facebook
- `GET /api/pages/list` - Get saved pages
- `POST /api/pages/toggle/:id` - Toggle page active status

### Posts
- `POST /api/posts/bulk-upload` - Upload multiple posts
- `GET /api/posts/scheduled` - Get all scheduled posts
- `GET /api/posts/stats` - Get statistics
- `DELETE /api/posts/:id` - Delete scheduled post

## 🎯 Project Structure

```
webapp/
├── config/
│   ├── database.js          # PostgreSQL connection
│   ├── database.sql         # Database schema
│   └── passport.js          # Facebook OAuth config
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── pages.js            # Pages management routes
│   └── posts.js            # Posts upload routes
├── workers/
│   └── publisher.js        # Background publishing worker
├── public/
│   ├── index.html          # Login page
│   ├── dashboard.html      # Main dashboard
│   └── dashboard.js        # Dashboard logic
├── uploads/                # Uploaded media files
├── server.js               # Main Express server
├── package.json            # Dependencies
├── .env.example            # Environment variables template
└── README.md              # This file
```

## 🚨 Troubleshooting

### Problem: "Failed to fetch pages"
**Solution**: 
- Check if Facebook App permissions are approved
- Make sure App ID and Secret are correct
- Try disconnecting and reconnecting Facebook account

### Problem: Posts not publishing
**Solution**:
- Check if schedule time is in the future
- Verify page is marked as "Active"
- Check Railway logs for errors: `railway logs`
- Ensure background worker is running

### Problem: "Database connection error"
**Solution**:
- Make sure PostgreSQL service is running on Railway
- Check if DATABASE_URL environment variable is set
- Run database schema: `railway run psql -f config/database.sql`

### Problem: File upload fails
**Solution**:
- Check file size (max 100MB)
- Only images (jpg, png, gif) and videos (mp4, mov, avi) allowed
- Ensure `uploads/` folder exists and is writable

## 🔐 Security Notes

- ✅ Never commit `.env` file to Git
- ✅ Use strong SESSION_SECRET
- ✅ Facebook tokens are stored securely in database
- ✅ File uploads are validated for type and size
- ✅ Authentication required for all API endpoints

## 💰 Cost

- **100% FREE** with Railway's free tier ($5 credit/month)
- No credit card required to start
- Sufficient for:
  - 10-20 Facebook accounts
  - 500+ scheduled posts per month
  - 100+ posts per day

## 📞 Support

Koi problem ho to:
1. Railway logs check karo: `railway logs`
2. Browser console me errors dekho (F12)
3. Database me data check karo
4. Server health check: `https://your-app.up.railway.app/health`

## 🎉 Ready to Use!

Ab aap apna **Facebook Bulk Scheduler** use kar sakte ho!

**Live URL**: `https://your-app-name.up.railway.app`

---

**Made with ❤️ for easy social media management**

**100% Free • 100% Open Source • 100% Reliable**
