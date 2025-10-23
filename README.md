# Mushroom Hunter PWA

A comprehensive Progressive Web App for mushroom hunters in Switzerland. Track your mushroom findings, explore a detailed species database organized by taxonomy, and visualize your discoveries on an interactive map.

## Features

### Backend Features
- **Authentication System**: Secure user registration and login with JWT tokens
- **Mushroom Taxonomy Database**: Complete taxonomic hierarchy (Division → Class → Order → Family → Genus → Species)
- **Species Management**: CRUD operations for mushroom species (Admin only)
- **User Findings**: Track personal mushroom discoveries with GPS coordinates
- **RESTful API**: Well-structured API endpoints with authentication middleware

### Frontend Features
- **Progressive Web App**: Installable, works offline, responsive design
- **User Authentication**: Login/Register with form validation
- **Species Explorer**:
  - Comprehensive filtering system (edibility, occurrence, season, taxonomy)
  - Search by scientific or common name
  - Multi-language support (German, French, Italian)
  - **Infinite scroll** for seamless browsing
  - Full taxonomy breadcrumb display (Division → Class → Order → Family → Genus)
- **Findings Management**:
  - Record findings with GPS location (auto-detect or manual entry)
  - **Reverse geocoding**: Automatically fetch location names from coordinates
  - Track date, weather, quantity, and notes
  - View personal finding history
  - Detailed finding pages with complete taxonomy information
- **Interactive Swiss Map** (OpenLayers):
  - **Swiss Federal Geoportal** integration (EPSG:2056 projection)
  - Multiple base layers: Color map, grayscale map, and aerial imagery
  - Color-coded markers by edibility
  - Click markers for detailed popups with species information
  - **Real-time location tracking** with accuracy indicator
  - Zoom level restrictions per layer (aerial: 19, maps: 20)
  - Swiss territory bounds enforcement
- **Dashboard**: Quick stats and recent findings overview

## Technology Stack

### Backend
- **Node.js + Express**: RESTful API server
- **PostgreSQL**: Relational database for taxonomic data
- **Sequelize**: ORM for database operations
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Express Validator**: Input validation
- **CSV Parser**: Non-destructive species data import

### Frontend
- **React 18**: UI framework
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **TanStack Query**: Data fetching and caching (with infinite query support)
- **Zustand**: State management
- **React Hook Form**: Form handling
- **OpenLayers**: Swiss map integration with WMTS tiles
- **Proj4js**: Coordinate system transformations
- **Tailwind CSS**: Utility-first styling
- **Workbox**: Service worker for PWA

## Project Structure

```
mushroom-hunter-pwa/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Division.js
│   │   │   ├── Class.js
│   │   │   ├── Order.js
│   │   │   ├── Family.js
│   │   │   ├── Genus.js
│   │   │   ├── Species.js
│   │   │   ├── Finding.js
│   │   │   └── index.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── speciesController.js
│   │   │   └── findingController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── species.js
│   │   │   ├── findings.js
│   │   │   └── taxonomy.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── SpeciesExplorer.jsx
    │   │   ├── SpeciesDetail.jsx
    │   │   ├── MyFindings.jsx
    │   │   ├── AddFinding.jsx
    │   │   └── FindingsMap.jsx
    │   ├── store/
    │   │   └── authStore.js
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── registerSW.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=mushroom_hunter
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

ALLOWED_ORIGINS=http://localhost:5173
```

5. Create the PostgreSQL database:
```bash
createdb mushroom_hunter
```

6. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Species
- `GET /api/species` - Get all species (with filters)
- `GET /api/species/:id` - Get species by ID
- `POST /api/species` - Create species (admin only)
- `PUT /api/species/:id` - Update species (admin only)
- `DELETE /api/species/:id` - Delete species (admin only)

### Findings
- `GET /api/findings` - Get user's findings
- `GET /api/findings/map` - Get findings for map view
- `GET /api/findings/:id` - Get finding by ID
- `POST /api/findings` - Create new finding
- `PUT /api/findings/:id` - Update finding
- `DELETE /api/findings/:id` - Delete finding

### Taxonomy
- `GET /api/taxonomy/divisions` - Get all divisions
- `GET /api/taxonomy/classes` - Get all classes
- `GET /api/taxonomy/orders` - Get all orders
- `GET /api/taxonomy/families` - Get all families
- `GET /api/taxonomy/genera` - Get all genera

## Database Schema

### Taxonomic Hierarchy
- **Division** (Basidiomycota, Ascomycota, etc.)
  - **Class** (Agaricomycetes, etc.)
    - **Order** (Agaricales, Boletales, etc.)
      - **Family** (Agaricaceae, Boletaceae, etc.)
        - **Genus** (Agaricus, Boletus, etc.)
          - **Species** (Full mushroom details)

### Species Fields
- Scientific name, common names (EN, DE, FR, IT)
- Edibility, toxicity information
- Physical characteristics (cap, gills, spores)
- Habitat, occurrence, seasonality
- Images

### Findings Fields
- User reference
- Species reference
- GPS coordinates (latitude, longitude)
- Date/time found
- Location name
- Quantity, weather, temperature
- Notes and photos

## Usage

1. **Register/Login**: Create an account or login
2. **Explore Species**: Browse the mushroom database with advanced filters
3. **Record Findings**:
   - Add a new finding with GPS location
   - Use current location or enter manually
   - Add notes, weather conditions, etc.
4. **View Map**: See all your findings on an interactive map
5. **Manage Findings**: View, edit, or delete your findings

## Development

### Building for Production

Backend:
```bash
npm start
```

Frontend:
```bash
npm run build
npm run preview
```

### PWA Configuration

The app is configured as a PWA with:
- Service worker for offline functionality
- Web app manifest for installability
- Runtime caching for API calls and images
- Offline-first strategy for static assets

## Data Import

The project includes a non-destructive species import script that allows you to update the species database without losing user findings:

```bash
cd backend
npm run import
```

Features:
- Updates existing species with new information
- Adds new species from CSV data
- Preserves all user findings and relationships
- Provides detailed import statistics
- Safe to run multiple times

## Future Enhancements

- [ ] Image upload for species and findings
- [ ] Advanced search with AI-powered identification
- [ ] Community features (share findings, comments)
- [ ] Export findings to CSV/PDF
- [ ] Push notifications for new species in area
- [ ] Weather integration API
- [ ] Multi-language UI support
- [ ] Admin dashboard for database management
- [x] ~~Species import from external databases~~ (Implemented)

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests.

## License

MIT License

## Security Notes

- Always use HTTPS in production
- Keep JWT secrets secure
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
- Use environment variables for sensitive data
- Regular security audits and dependency updates

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
