# 🚀 Railway Deployment Guide (Step-by-Step Hindi)

## पूरी Process - Start से End तक

### 📋 Step 1: GitHub Setup (5 minutes)

#### 1.1 GitHub Authentication Setup
```bash
# Railway ke liye GitHub access chahiye
# Pehle check karo git configured hai ya nahi
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### 1.2 GitHub Repository Banao

**Option A: GitHub Website se** (Easy)
1. https://github.com par jao
2. "+" icon → "New repository" click karo
3. Repository name: `fb-bulk-scheduler`
4. Description: "Facebook bulk post scheduler"
5. Keep it **Public**
6. **"Create repository"** click karo
7. Repository URL copy karo (e.g., `https://github.com/username/fb-bulk-scheduler.git`)

**Option B: GitHub CLI se** (Advanced)
```bash
gh repo create fb-bulk-scheduler --public --source=. --remote=origin
```

#### 1.3 Code Push Karo
```bash
cd /home/user/webapp

# Remote add karo (apna username daalo)
git remote add origin https://github.com/YOUR_USERNAME/fb-bulk-scheduler.git

# Push karo
git branch -M main
git push -u origin main
```

---

### 🚂 Step 2: Railway Setup (10 minutes)

#### 2.1 Railway Account Login
1. https://railway.app par jao
2. **"Login with GitHub"** click karo
3. GitHub authorization approve karo
4. Railway dashboard open hoga

#### 2.2 New Project Banao

**Method 1: From GitHub Repo** (Recommended)
1. Railway dashboard me **"New Project"** click karo
2. **"Deploy from GitHub repo"** select karo
3. Repository list me apna `fb-bulk-scheduler` dhundo
4. Select karo aur **"Deploy Now"** click karo
5. Railway automatically build aur deploy karega!

**Method 2: From Template**
1. **"New Project"** click karo
2. **"Empty Project"** select karo
3. Project name set karo: `fb-bulk-scheduler`
4. GitHub repo connect karo

#### 2.3 Database Add Karo
1. Project dashboard me **"New"** button click karo
2. **"Database"** → **"Add PostgreSQL"** select karo
3. Automatically provision hoga
4. `DATABASE_URL` environment variable automatically add ho jayega

---

### 🔧 Step 3: Environment Variables (5 minutes)

#### 3.1 Facebook App Credentials

Pehle Facebook Developer Console se ye details lao:
- App ID
- App Secret

#### 3.2 Railway me Variables Add Karo

1. Railway dashboard me apni service select karo
2. **"Variables"** tab click karo
3. **"New Variable"** click karo aur ye add karo:

```env
FACEBOOK_APP_ID=688013685624226
FACEBOOK_APP_SECRET=your_actual_app_secret_here
```

4. Railway app URL get karo:
   - "Settings" tab me jao
   - "Domains" section me generated URL dekho
   - Example: `fb-bulk-scheduler-production.up.railway.app`

5. Callback URL add karo:
```env
CALLBACK_URL=https://fb-bulk-scheduler-production.up.railway.app/auth/facebook/callback
```

6. Session secret add karo (random string):
```env
SESSION_SECRET=my-super-secret-random-string-12345
NODE_ENV=production
```

7. **"Add"** button click karo

#### 3.3 Save Karo
- Sab variables add hone ke baad Railway automatically redeploy karega
- 2-3 minutes wait karo

---

### 💾 Step 4: Database Schema Setup (3 minutes)

Database tables banane ke liye:

**Method 1: Railway Dashboard se**
1. PostgreSQL service select karo
2. **"Data"** tab me jao
3. **"Query"** option click karo
4. `config/database.sql` file ka content copy-paste karo
5. **"Run"** click karo

**Method 2: Railway CLI se** (Advanced)
```bash
# Railway CLI install karo (agar nahi hai)
npm install -g @railway/cli

# Login karo
railway login

# Project link karo
railway link

# Database schema run karo
railway run psql < config/database.sql
```

**Method 3: Manual Connection**
1. PostgreSQL service me **"Connect"** tab me jao
2. Connection details copy karo
3. Kisi PostgreSQL client (pgAdmin, DBeaver) me connect karo
4. `config/database.sql` run karo

---

### 🎯 Step 5: Facebook App Configuration (5 minutes)

#### 5.1 Valid OAuth Redirect URI Add Karo

1. https://developers.facebook.com par jao
2. Apna app select karo
3. Left sidebar me **"Facebook Login"** → **"Settings"** click karo
4. **"Valid OAuth Redirect URIs"** me ye add karo:
   ```
   https://your-app-name.up.railway.app/auth/facebook/callback
   ```
5. **"Save Changes"** click karo

#### 5.2 App Permissions Request Karo

1. Left sidebar me **"App Review"** → **"Permissions and Features"** jao
2. In permissions ko request karo:
   - ✅ `pages_manage_posts`
   - ✅ `pages_read_engagement`
   - ✅ `pages_manage_metadata`
   - ✅ `pages_show_list`
3. Har permission ke samne **"Request"** button click karo
4. Purpose explain karo: "To schedule and publish posts on user's Facebook pages"

**Note**: Testing ke liye ye permissions immediately available hain. Production ke liye Facebook approval chahiye (2-3 days).

#### 5.3 Test Users Add Karo (Optional for Testing)

1. **"Roles"** → **"Test Users"** me jao
2. **"Add"** click karo
3. Test user create karo
4. Is test user se login karke app test kar sakte ho

---

### ✅ Step 6: Verification & Testing

#### 6.1 Health Check
Browser me open karo:
```
https://your-app-name.up.railway.app/health
```

Response aana chahiye:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Facebook Bulk Scheduler"
}
```

#### 6.2 Home Page Check
```
https://your-app-name.up.railway.app/
```
Login page dikhna chahiye.

#### 6.3 Facebook Login Test
1. **"Facebook से Login करें"** button click karo
2. Facebook permissions approve karo
3. Dashboard me redirect hona chahiye
4. User info top-right me dikhna chahiye

#### 6.4 Pages Fetch Test
1. Dashboard me **"Refresh Pages"** click karo
2. Aapke Facebook pages list me aane chahiye
3. Agar error aaye to Railway logs check karo:
   ```bash
   railway logs
   ```

#### 6.5 Post Upload Test
1. Koi page select karo (checkbox)
2. **"Add More Post"** click karo
3. Ek test photo upload karo
4. Caption likho: "Test post"
5. Future time select karo (e.g., 5 minutes baad)
6. **"Schedule All Posts"** click karo
7. Success message aana chahiye
8. Right panel me post pending status me dikhni chahiye

#### 6.6 Auto Publishing Test
1. Scheduled post ka time aane ka wait karo
2. Page refresh karo
3. Status "PENDING" se "PUBLISHED" me change hona chahiye
4. Facebook page check karo - post publish honi chahiye

---

### 🔍 Troubleshooting

#### Problem 1: Build Failed
**Check**:
```bash
railway logs --deployment
```
**Solution**: 
- `package.json` me sab dependencies hain check karo
- Node.js version compatible hai check karo

#### Problem 2: Database Connection Error
**Check**:
```bash
railway logs | grep "database"
```
**Solution**:
- PostgreSQL service running hai check karo
- `DATABASE_URL` environment variable set hai check karo
- Database schema run hua hai check karo

#### Problem 3: Facebook Login Failed
**Check Railway logs**:
```bash
railway logs | grep "passport"
```
**Solutions**:
- Facebook App ID aur Secret correct hain check karo
- Callback URL exactly match karta hai check karo
- Facebook App me Valid OAuth Redirect URI add hai check karo

#### Problem 4: Posts Not Publishing
**Check**:
```bash
railway logs | grep "publisher"
```
**Solutions**:
- Background worker running hai check karo
- Schedule time future me hai check karo
- Page "Active" status me hai check karo
- Facebook page access token valid hai check karo

#### Problem 5: File Upload Errors
**Check**:
```bash
railway logs | grep "multer"
```
**Solutions**:
- File size 100MB se kam hai check karo
- File type supported hai (jpg, png, gif, mp4, mov, avi) check karo
- Railway me sufficient disk space hai check karo

---

### 📊 Monitoring

#### Railway Dashboard
1. **"Metrics"** tab me jao
2. Dekho:
   - CPU usage
   - Memory usage
   - Network traffic
   - Response times

#### Logs Monitoring
Real-time logs dekhne ke liye:
```bash
railway logs --follow
```

Specific service logs:
```bash
railway logs --service=fb-bulk-scheduler
```

---

### 🎉 Deployment Complete!

**Aapka app live hai!** 🚀

**Live URL**: `https://your-app-name.up.railway.app`

### Next Steps:
1. ✅ Test all features
2. ✅ Invite team members
3. ✅ Start scheduling posts
4. ✅ Monitor performance
5. ✅ Share with others!

---

## 💰 Railway Free Tier Limits

- **$5 free credit** per month
- Approximately **500 hours** of runtime
- **1GB RAM** per service
- **1GB storage** for database
- **100GB bandwidth**

**Enough for**:
- 10-20 Facebook accounts
- 500+ scheduled posts per month
- 24/7 uptime

---

## 🔄 Updates & Maintenance

### Code Update Kaise Kare

1. Local changes karo
2. Git commit karo:
   ```bash
   git add .
   git commit -m "Updated features"
   ```
3. GitHub pe push karo:
   ```bash
   git push origin main
   ```
4. Railway automatically redeploy karega!

### Database Backup

Railway dashboard se:
1. PostgreSQL service select karo
2. **"Data"** tab me jao
3. **"Export"** option use karo

---

**Deployment Success!** 🎊

Koi problem ho to Railway logs check karo ya troubleshooting section dekho.
