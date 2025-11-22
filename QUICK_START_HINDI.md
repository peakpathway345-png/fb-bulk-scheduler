# 🚀 Facebook Bulk Scheduler - Quick Start (Hindi)

## क्या है यह Application?

यह application आपको multiple Facebook accounts से bulk me posts schedule और publish करने देता है। एक बार schedule होने के बाद post automatically publish हो जाएगा, चाहे आपका internet down हो या app बंद हो।

---

## 📋 तीन आसान Steps में Setup

### Step 1: Accounts Banao (5 minutes)

#### A) GitHub Account ✅
1. https://github.com जाओ
2. "Sign up" करो
3. Email verify करो

#### B) Railway Account ✅
1. https://railway.app जाओ
2. "Login with GitHub" क्लिक करो (automatic login)

#### C) Facebook Developer ✅
1. https://developers.facebook.com जाओ
2. अपने Facebook से login करो
3. "Get Started" करो
4. "Create App" करो:
   - Type: Business
   - Name: कुछ भी (e.g., "My Scheduler")
5. **App ID** और **App Secret** copy करके save करो

---

### Step 2: Deploy Karo Railway Par (10 minutes)

#### A) Code GitHub Par Push Karo

```bash
# 1. GitHub repository banao (website se):
#    - Repository name: fb-bulk-scheduler
#    - Public rakho
#    - Create करो

# 2. Terminal me ye commands chalaao:
cd /home/user/webapp

git remote add origin https://github.com/YOUR_USERNAME/fb-bulk-scheduler.git
git branch -M main
git push -u origin main
```

#### B) Railway Me Deploy Karo

1. **Railway.app** dashboard me jao
2. **"New Project"** क्लिक करो
3. **"Deploy from GitHub repo"** चुनो
4. **fb-bulk-scheduler** repository select करो
5. **"Deploy"** क्लिक करो - automatic deploy hoga!

#### C) Database Add Karo

1. Project me **"New"** → **"Database"** → **"PostgreSQL"**
2. Automatic add ho jayega

#### D) Environment Variables Set Karo

Railway dashboard me **"Variables"** tab:

```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
CALLBACK_URL=https://your-app.up.railway.app/auth/facebook/callback
SESSION_SECRET=koi-bhi-random-string-123456
NODE_ENV=production
```

**Important**: `CALLBACK_URL` me apna Railway app ka URL daalo!

#### E) Database Schema Setup

Railway dashboard me PostgreSQL service select karo → "Data" tab → "Query":

```sql
-- config/database.sql ka pura content yaha paste karo aur run karo
```

---

### Step 3: Facebook App Configure Karo (5 minutes)

#### A) Redirect URI Add Karo

1. Facebook Developer dashboard me jao
2. App select karo
3. **"Facebook Login"** → **"Settings"**
4. **"Valid OAuth Redirect URIs"** me add karo:
   ```
   https://your-app.up.railway.app/auth/facebook/callback
   ```
5. Save करो

#### B) Permissions Add Karo

1. **"App Review"** → **"Permissions and Features"**
2. Ye request karo:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_manage_metadata`
   - `pages_show_list`

---

## 🎉 Ready! Ab Use Karo

### 1. App Open Karo
```
https://your-app-name.up.railway.app
```

### 2. Login Karo
- "Facebook से Login करें" button क्लिक करो
- Permissions approve करो

### 3. Pages Load Karo
- Dashboard me "Refresh Pages" क्लिक करो
- आपके Facebook pages list me आ जाएंगे
- जिन pages पर post करना है उन्हें select करो

### 4. Posts Schedule Karo

**एक Post Schedule करने के लिए:**
1. "Add More Post" क्लिक करो
2. Photo/video upload करो
3. Caption लिखो
4. Schedule time चुनो (future time)
5. "Schedule All Posts" क्लिक करो

**Bulk Upload (कई posts एक साथ):**
1. "Add More Post" बार-बार क्लिक करो (50 posts तक)
2. हर post का media, caption, time set करो
3. Multiple pages select करो
4. "Schedule All Posts" एक बार क्लिक करो
5. सब posts schedule हो जाएंगे!

### 5. Auto Publishing
- Background worker हर minute check करता है
- Time आने पर automatic publish होता है
- Status "PENDING" से "PUBLISHED" में बदल जाता है
- Facebook page पर post दिख जाता है

---

## 📊 Dashboard Samjho

### Top Cards (Statistics):
- 🟡 **Pending**: जो posts अभी publish नहीं हुए
- 🟢 **Published**: Successfully publish हो गए
- 🔴 **Failed**: Publish नहीं हो पाए (3 retries के बाद)
- 🔵 **Total**: कुल posts

### Left Panel:
- **Facebook Pages**: आपके pages की list
- **Bulk Upload**: Posts schedule करने का form

### Right Panel:
- **Scheduled Posts**: सभी scheduled posts का status
- Real-time updates हर 30 seconds में

---

## ❓ Common Problems & Solutions

### Problem: "Failed to fetch pages"
**Solution**: 
- Facebook App permissions approve हैं check करो
- Logout करके फिर login करो
- App ID/Secret correct हैं verify करो

### Problem: Posts publish नहीं हो रहे
**Solution**:
- Schedule time future में है check करो
- Page "Active" है check करो
- Railway logs देखो errors के लिए

### Problem: File upload fail हो रही
**Solution**:
- File size 100MB से कम होनी चाहिए
- Sirf images (jpg, png) aur videos (mp4, mov) allowed हैं
- Internet connection stable है check करो

### Problem: Database error
**Solution**:
- Railway me PostgreSQL service running है check करो
- Database schema run hua है check करो
- `DATABASE_URL` environment variable set है check करो

---

## 💡 Pro Tips

### Multiple Accounts Use Karne Ke Liye:
1. Browser incognito window खोलो
2. Dusre account se login करो
3. Pages select करो
4. Posts schedule करो
5. Repeat for more accounts!

### Bulk Scheduling Tips:
- पहले सभी media files prepare कर लो
- Captions Excel/Notepad में ready रखो
- Schedule times plan कर लो
- Ek hi time में सब posts add करो
- Ek click में सब schedule हो जाएंगे!

### Best Practices:
- ✅ Schedule time कम से कम 5-10 minutes future में रखो
- ✅ File names simple रखो (special characters avoid करो)
- ✅ Regular intervals पर posts schedule करो (spam avoid करने के लिए)
- ✅ हर page के लिए different captions use करो
- ✅ Dashboard regularly check करो failed posts के लिए

---

## 🎯 Use Cases

### 1. Social Media Marketing
- Brand posts scheduled करो
- Product launches plan करो
- Regular content calendar maintain करो

### 2. Content Creators
- Multiple pages एक साथ manage करो
- Content batch में upload करो
- Consistent posting schedule maintain करो

### 3. Business Owners
- Offers aur promotions schedule करो
- Customer engagement posts plan करो
- Time save करो automation से

### 4. Agencies
- Multiple clients के accounts manage करो
- Bulk content delivery करो
- Scheduled campaigns run करो

---

## 📞 Help & Support

### Railway Logs Check Karo:
```bash
railway logs
```

### Health Check:
```
https://your-app.up.railway.app/health
```

### Browser Console Check Karo:
- Browser me F12 press करो
- "Console" tab देखो errors के लिए

---

## 🎊 Congratulations!

**आपका Facebook Bulk Scheduler ready है!** 🚀

अब आप:
- ✅ Multiple accounts manage कर सकते हो
- ✅ Bulk में posts schedule कर सकते हो
- ✅ Automatic publishing का benefit ले सकते हो
- ✅ Time aur effort save कर सकते हो

**100% Free • 100% Reliable • 100% Automatic**

---

## 🔄 Next Steps

1. ✅ App test करो different scenarios में
2. ✅ Team members को access दो
3. ✅ Content calendar plan करो
4. ✅ Regular posts schedule करते रहो
5. ✅ Analytics track करो (Facebook Insights में)

**Happy Scheduling!** 📅✨
