# Quick Setup Guide

## Prerequisites
- Node.js v18+ installed
- PostgreSQL 14+ installed and running
- Git (optional)

## Quick Start (5 minutes)

### Step 1: Database Setup
```bash
# Create the database
createdb mushroom_hunter

# Or using psql
psql -U postgres
CREATE DATABASE mushroom_hunter;
\q
```

### Step 2: Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# nano .env  (or use your preferred editor)
# Update: DB_PASSWORD=your_postgres_password

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

Backend should now be running on http://localhost:5000

### Step 3: Frontend Setup (in a new terminal)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the frontend dev server
npm run dev
```

Frontend should now be running on http://localhost:5173

### Step 4: Login
Open your browser to http://localhost:5173

**Test User Credentials:**
- Email: `user@mushroomhunter.ch`
- Password: `user123`

**Admin Credentials:**
- Email: `admin@mushroomhunter.ch`
- Password: `admin123`

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep mushroom`
- Check .env database credentials

### Frontend API errors
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify proxy configuration in vite.config.js

### Database connection failed
- Check PostgreSQL is running
- Verify credentials in .env
- Check if database exists
- Ensure PostgreSQL is accepting local connections

## Default Data

The seed script creates:
- 2 Divisions (Basidiomycota, Ascomycota)
- 2 Classes
- 3 Orders
- 4 Families
- 4 Genera
- 7 Species (including common Swiss mushrooms like Steinpilz, Champignon, Death Cap)
- 2 Users (admin and test user)

## Next Steps

1. **Explore the Species Database**: Browse the pre-loaded Swiss mushroom species
2. **Add a Finding**: Record a mushroom finding with GPS location
3. **View the Map**: See your findings on the interactive map
4. **Customize**: Add more species, customize the UI, add features

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in .env
2. Use a production PostgreSQL database
3. Set a strong JWT_SECRET
4. Enable HTTPS
5. Set up proper CORS origins
6. Consider using PM2 for process management

### Frontend
1. Build the app: `npm run build`
2. Serve the `dist` folder with nginx or similar
3. Enable HTTPS
4. Configure proper API endpoint

## Development Tips

- Use `npm run dev` for hot reload during development
- Backend uses nodemon for auto-restart on changes
- Frontend uses Vite for instant HMR
- Check browser DevTools Application tab to verify PWA installation

## Adding More Species

### Option 1: CSV Import (Recommended)

Import species data from a CSV file:

```bash
cd backend
npm run import
```

The import script:
- **Non-destructive**: Updates existing species and adds new ones
- **Preserves findings**: Your user findings remain intact
- **Safe to re-run**: Can be executed multiple times
- **Provides statistics**: Shows what was inserted vs. updated

Place your CSV file at `/home/dubmosphere/git/aicoding/mushroom-hunter-pwa/idea/import.csv` with the required format.

### Option 2: Admin Panel

As an admin user, you can:
1. Use the API directly to add species
2. Create an admin panel (future enhancement)
3. Modify the seed script to add more Swiss mushrooms

## Support

- Check the main README.md for full documentation
- Review API endpoints documentation
- Check browser console for errors
- Review server logs for backend issues
