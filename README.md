# 🛰️ Multi-Source Intelligence Fusion Dashboard

A production-grade geospatial intelligence dashboard for visualizing OSINT, HUMINT, and IMINT data points on an interactive dark-mode map.

---

## 📁 Project Structure

```
intel-dashboard/
├── backend/
│   ├── models/
│   │   └── Intel.js          # MongoDB schema
│   ├── routes/
│   │   ├── data.js           # GET /data, POST /data, DELETE /data/:id
│   │   └── upload.js         # POST /upload-data, POST /upload-image
│   ├── uploads/              # Auto-created: stores images & data files
│   ├── .env                  # Environment config
│   ├── server.js             # Express entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Top bar: logo, stats, status
│   │   │   ├── FilterBar.jsx     # OSINT/HUMINT/IMINT filter tabs
│   │   │   ├── Sidebar.jsx       # Intel list, file upload, manual add
│   │   │   ├── IntelMap.jsx      # Leaflet map with custom markers
│   │   │   ├── LoadingOverlay.jsx
│   │   │   └── ErrorBanner.jsx
│   │   ├── hooks/
│   │   │   └── useIntelData.js   # Data fetching hook
│   │   ├── utils/
│   │   │   └── api.js            # Axios API helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── sample_data.csv           # Test dataset (12 intel points)
├── sample_data.json          # Test dataset (5 intel points)
└── README.md
```

---

## ⚡ Quick Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas) — **optional**, app works in demo mode without it
- npm

---

### Step 1 — Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (open new terminal)
cd frontend
npm install
```

---

### Step 2 — Configure Backend

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intel_dashboard
```

> 💡 **No MongoDB?** The app runs in demo mode with pre-loaded sample data. No config needed.

---

### Step 3 — Start Backend

```bash
cd backend
npm run dev       # Development (with nodemon auto-reload)
# OR
npm start         # Production
```

You should see:
```
✅ MongoDB connected  (or "💡 Starting server without DB (demo mode)...")
🚀 Server running on http://localhost:5000
```

---

### Step 4 — Start Frontend

```bash
cd frontend
npm run dev
```

Open: **http://localhost:3000**

---

## 🔌 REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data` | Fetch all intel points |
| GET | `/api/data?type=OSINT` | Filter by type |
| GET | `/api/data/:id` | Get single intel point |
| POST | `/api/data` | Create intel point (JSON body) |
| DELETE | `/api/data/:id` | Delete intel point |
| POST | `/api/upload-data` | Upload CSV or JSON file |
| POST | `/api/upload-image` | Upload image (JPG/PNG/WEBP) |
| GET | `/health` | Health check |

### POST /api/data — Body Schema
```json
{
  "title": "Signal Intercept Alpha",
  "description": "Unusual activity detected near port.",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "type": "OSINT",
  "confidence": 75,
  "imageUrl": "/uploads/images/photo.jpg"
}
```

---

## 📊 Data Formats

### CSV Format
```csv
title,description,latitude,longitude,type,confidence
Signal Alpha,Radio intercept detected,34.05,-118.24,OSINT,72
Field Report,Convoy movement confirmed,40.71,-74.00,HUMINT,88
Satellite Delta,New construction observed,51.50,-0.12,IMINT,95
```

### JSON Format
```json
[
  {
    "title": "Signal Alpha",
    "description": "Radio intercept detected",
    "latitude": 34.05,
    "longitude": -118.24,
    "type": "OSINT",
    "confidence": 72
  }
]
```

**Accepted field aliases:**
- `latitude` or `lat`
- `longitude` or `lng` or `lon`
- `title` or `name`
- `description` or `desc`
- `imageUrl` or `image_url`

---

## 🗄️ MongoDB Schema

```js
{
  title:       String (required),
  description: String,
  latitude:    Number (required, -90 to 90),
  longitude:   Number (required, -180 to 180),
  type:        "OSINT" | "HUMINT" | "IMINT" (required),
  imageUrl:    String | null,
  confidence:  Number (0-100, default 50),
  source:      String (default "manual"),
  createdAt:   Date (auto),
  updatedAt:   Date (auto)
}
```

---

## 🎨 Features

- **Interactive Map** — Dark-mode Leaflet map with CARTO tiles
- **Color-coded Markers** — Diamond markers: 🔵 OSINT / 🟠 HUMINT / 🟣 IMINT
- **Popups** — Click marker to see title, description, coordinates, confidence bar, image
- **Filter Bar** — Filter by intel type instantly
- **Intel Sidebar** — Scrollable list with confidence bars; click to fly-to marker
- **CSV/JSON Upload** — Drag & drop or click to upload with progress indicator
- **Image Upload** — Upload images attached to intel points
- **Manual Add** — Form to add intel points with all fields
- **Delete** — Hover any list item and click trash icon
- **Demo Mode** — 5 pre-loaded demo points when MongoDB is unavailable
- **Connection Status** — Live/Error indicator in header

---

## 🧪 Testing with Sample Data

1. Start both backend and frontend
2. Open http://localhost:3000
3. Click **UPLOAD** tab in sidebar
4. Upload `sample_data.csv` or `sample_data.json`
5. 12 (CSV) or 5 (JSON) intel points will appear on the map

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Map not loading | Check internet connection (map tiles from CARTO CDN) |
| CORS error | Ensure backend is running on port 5000 |
| MongoDB error | App falls back to demo mode automatically |
| Upload fails | Check file format (CSV must have header row) |
| Port conflict | Edit `PORT` in backend `.env` and `vite.config.js` proxy |

---

## 🚀 Production Build

```bash
# Build frontend
cd frontend && npm run build

# Serve frontend from backend (add to server.js):
app.use(express.static(path.join(__dirname, '../frontend/dist')));
```
