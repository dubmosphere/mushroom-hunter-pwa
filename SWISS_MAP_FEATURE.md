# Swiss Map Integration

## Overview

The Mushroom Hunter PWA features a fully integrated **Swiss Federal Geoportal** map system using OpenLayers, providing accurate and detailed mapping for Switzerland.

## Key Features

### Swiss Coordinate System (EPSG:2056)
- **Official Swiss projection**: LV95 (Landesvermessung 1995)
- **Accurate for Switzerland**: Minimizes distortion across Swiss territory
- **Automatic conversion**: WGS84 (GPS) coordinates are converted to LV95
- **Bounds enforcement**: Map restricted to Swiss territory

### Multiple Base Layers

1. **Color Map** (`ch.swisstopo.pixelkarte-farbe`)
   - Standard topographic map in color
   - Maximum zoom level: 20
   - Best for general orientation

2. **Grayscale Map** (`ch.swisstopo.pixelkarte-grau`)
   - Black and white topographic map
   - Maximum zoom level: 20
   - Better for printing or low-bandwidth

3. **Aerial Imagery** (`ch.swisstopo.swissimage`)
   - High-resolution satellite/aerial photos
   - Maximum zoom level: 19
   - Best for identifying terrain features

### Interactive Features

#### Color-Coded Markers
Mushroom findings are displayed with color-coded markers based on edibility:
- 🟢 Green: Edible mushrooms
- 🔴 Red: Poisonous mushrooms
- 🔵 Blue: Medicinal mushrooms
- 🟣 Purple: Psychoactive mushrooms
- ⚫ Gray: Inedible or unknown

#### Information Popups
Click any marker to see:
- Scientific and common name (clickable links to species detail)
- Location name
- Date found
- Quantity
- Edibility status
- Link to full finding details

#### Real-Time Location Tracking
- **Live GPS tracking**: Shows your current position on the map
- **Accuracy indicator**: Visual circle showing GPS accuracy
- **Location popup**: Click your position to see coordinates and accuracy
- **Center on location**: Automatically centers map on your position
- **Persistent tracking**: Continues updating as you move

### Technical Implementation

#### Tile System
- **WMTS protocol**: Web Map Tile Service
- **Swiss tiles**: Served from geo.admin.ch
- **Zoom-level optimization**: Only loads tiles for available zoom levels
- **Bounds checking**: Prevents loading tiles outside Switzerland

#### Map Controls
- **Layer switcher**: Toggle between color, grayscale, and aerial imagery
- **Location button**: Activate/deactivate GPS tracking
- **Zoom controls**: Built-in OpenLayers zoom controls
- **Dark mode support**: Map controls adapt to light/dark theme

## Usage

### Viewing Findings Map
1. Navigate to "Findings Map" from the main navigation
2. All your findings appear as colored markers
3. Click markers to see details
4. Switch layers using the layer control button
5. Use the location button to show your current position

### Adding Findings with Map
1. Go to "Add Finding"
2. Click on the map to select a location
3. Use "Current Location" for automatic GPS coordinates
4. Location name is auto-filled via reverse geocoding

### Species-Specific Maps
1. Navigate to any species detail page
2. Scroll to the "Your Findings" section
3. View all findings for that species on the map
4. Centered on the first finding location

## Performance Optimizations

### Tile Loading
- Only requests tiles within Swiss bounds
- Respects zoom level limits per layer
- Caches tiles in browser

### Coordinate Transformations
- Efficient proj4js transformations
- LV95 coordinates cached per finding
- Minimal overhead for marker rendering

### Map Interactions
- Smooth pan and zoom
- Instant popup display
- Optimized vector rendering for markers

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (desktop and iOS)
- ✅ Mobile browsers

### Required Features
- WebGL for smooth rendering
- Geolocation API for position tracking
- Modern JavaScript (ES2020+)

## Privacy & Permissions

### Location Permission
- Required for "Current Location" feature
- Browser prompts for permission
- Can be denied (manual coordinate entry still works)
- Location data only stored for your findings

### Data Usage
- Map tiles loaded from geo.admin.ch
- No tracking or analytics on map usage
- Findings data only sent to your backend server

## Code Locations

### Main Map Component
- **File**: `frontend/src/components/SwissMap.jsx`
- **Purpose**: Reusable OpenLayers map component
- **Features**: Layer switching, location tracking, marker display

### Map Usage Examples
- `frontend/src/pages/FindingsMap.jsx` - All findings map
- `frontend/src/pages/AddFinding.jsx` - Interactive location picker
- `frontend/src/pages/FindingDetail.jsx` - Single finding location
- `frontend/src/pages/SpeciesDetail.jsx` - Species-specific findings

### Coordinate Utilities
- **File**: `frontend/src/utils/projections.js`
- **Functions**: `wgs84ToLV95()`, `lv95ToWGS84()`

## Troubleshooting

### Map not loading
- Check internet connection (tiles loaded from geo.admin.ch)
- Verify browser JavaScript is enabled
- Check browser console for errors

### Location tracking not working
- Grant location permission when prompted
- Ensure device has GPS/location services enabled
- Try refreshing the page

### Markers not appearing
- Verify findings exist in database
- Check coordinate values are within Switzerland
- Ensure species has edibility value set

### Tiles appear blurry
- Switch to a different layer
- Check zoom level (max zoom varies by layer)
- Wait for high-resolution tiles to load

## Future Enhancements

- [ ] Offline map tiles caching
- [ ] Custom marker icons for different species
- [ ] Clustering for dense finding areas
- [ ] Drawing tools for marking areas
- [ ] Export map as image
- [ ] Heat map visualization
- [ ] Route planning between findings
- [ ] Elevation profile display
- [ ] Weather overlay

## References

- [Swiss Federal Geoportal](https://www.geo.admin.ch/)
- [OpenLayers Documentation](https://openlayers.org/)
- [EPSG:2056 Reference](https://epsg.io/2056)
- [Proj4js Documentation](http://proj4js.org/)

---

**Note**: Map tiles are provided by the Swiss Federal Office of Topography (swisstopo). Please respect their terms of service and usage policies.
