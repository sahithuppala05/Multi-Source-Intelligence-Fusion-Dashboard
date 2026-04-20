# 🚀 Deploying to Render — Step by Step

This guide deploys:
- **Backend** → Render Web Service (Node.js)
- **Frontend** → Render Static Site (React/Vite)
- **Database** → MongoDB Atlas (free tier)

---

## PART 1 — MongoDB Atlas (Free Cloud Database)

> Skip this if you want to use your local MongoDB (not recommended for production).

1. Go to **https://cloud.mongodb.com** → Sign up free
2. Create a new project → **"intel-dashboard"**
3. Click **"Build a Database"** → Choose **FREE (M0 Sandbox)**
4. Pick a cloud provider (AWS) and region → Click **Create**
5. Set username & password → **Save these!**
6. Under "Where would you like to connect from?" → Choose **"My Local Environment"**
   - Add IP: `0.0.0.0/0` (allow all — needed for Render)
7. Click **Finish and Close**
8. Click **Connect** → **"Connect your application"**
9. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/intel_dashboard
   ```
   Replace `<username>` and `<password>` with yours.

---

## PART 2 — Push Code to GitHub

```bash
# In your project root (intel-fusion-dashboard-mongo folder)
git init
git add .
git commit -m "Initial commit — Multi-Source Intelligence Dashboard"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/intel-dashboard.git
git branch -M main
git push -u origin main
```

---

## PART 3 — Deploy Backend on Render

1. Go to **https://render.com** → Sign up / Log in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account → Select your repo
4. Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `intel-dashboard-backend` |
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

5. Scroll to **"Environment Variables"** → Add these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | *(paste your Atlas connection string)* |

6. Click **"Create Web Service"**
7. Wait ~3 minutes for first deploy
8. Copy your backend URL: `https://intel-dashboard-backend.onrender.com`

---

## PART 4 — Deploy Frontend on Render

1. Click **"New +"** → **"Static Site"**
2. Select the same GitHub repo
3. Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `intel-dashboard-frontend` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. Scroll to **"Environment Variables"** → Add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://intel-dashboard-backend.onrender.com` |

5. Click **"Create Static Site"**
6. Wait ~2 minutes
7. Your app is live at: `https://intel-dashboard-frontend.onrender.com` 🎉

---

## PART 5 — Update Backend CORS (Final Step)

1. Go back to your **backend service** on Render
2. **Environment** tab → Add one more variable:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://intel-dashboard-frontend.onrender.com` |

3. Click **Save Changes** → Render auto-redeploys

---

## PART 6 — Seed the Database (Optional)

To load sample data into your cloud MongoDB:

```bash
# From your local machine, in the backend folder:
MONGODB_URI="mongodb+srv://..." node seed.js
```

---

## ✅ Verify Everything Works

1. Open your frontend URL
2. Check header shows **"CONNECTED"** (not ERROR)
3. Intel points should load on the map
4. Test upload with `sample_data.csv`

---

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| Backend shows "DEMO MODE" | Check `MONGODB_URI` env var in Render backend settings |
| Frontend shows "ERROR" | Check `VITE_API_URL` in Render frontend settings — must be exact backend URL with no trailing slash |
| CORS error in browser console | Add `FRONTEND_URL` to backend env vars |
| Render free tier slow to load | Free tier "spins down" after 15min inactivity — first request takes ~30s to wake up |
| Build fails | Check Render build logs, ensure `rootDir` is set correctly |

---

## 📝 Environment Variables Summary

### Backend (Render Web Service)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/intel_dashboard
FRONTEND_URL=https://intel-dashboard-frontend.onrender.com
```

### Frontend (Render Static Site)
```
VITE_API_URL=https://intel-dashboard-backend.onrender.com
```
