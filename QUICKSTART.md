# 🚀 Quickstart Guide

Get the Mushroom Hunter PWA running in 2 minutes!

## Prerequisites

✅ Node.js v18+ installed
✅ PostgreSQL running
✅ Database `mushroom_hunter` created and seeded

> **Database not setup?** Run: `npm run seed` in the backend folder (see [SETUP_GUIDE.md](SETUP_GUIDE.md))

## Start the Application

### Option 1: Using Startup Scripts (Recommended)

**Terminal 1 - Backend:**
```bash
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start-frontend.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm install  # First time only
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # First time only
npm run dev
```

## Access the App

Open your browser to: **http://localhost:5173**

## Login

**Test User:**
- Email: `user@mushroomhunter.ch`
- Password: `user123`

**Admin:**
- Email: `admin@mushroomhunter.ch`
- Password: `admin123`

## What to Do First

1. **Explore Species** - Browse the 7 pre-loaded Swiss mushrooms
2. **Add a Finding** - Record your first mushroom discovery
3. **View Map** - See your findings on an interactive map
4. **Filter & Search** - Try the comprehensive filter system

## Troubleshooting

### Port 5000 already in use
```bash
# Kill any process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Database connection error
- Check PostgreSQL is running
- Verify credentials in `backend/.env`
- Ensure database exists: `psql -l | grep mushroom`

### Frontend won't start
- Make sure backend is running first
- Check `npm install` completed successfully
- Try `rm -rf node_modules && npm install`

## Next Steps

- Read the [README.md](README.md) for full documentation
- Check [STATUS.md](STATUS.md) for features overview
- Review the API endpoints in the README

---

**Need help?** Check the full [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions.
