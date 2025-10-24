import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

// Swiss LV95 projection definition (EPSG:2056)
// This is the official Swiss national coordinate system
const EPSG_2056_DEFINITION = '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs';

// WGS84 projection definition (EPSG:4326)
const EPSG_4326_DEFINITION = '+proj=longlat +datum=WGS84 +no_defs';

// Define projections for proj4
proj4.defs('EPSG:2056', EPSG_2056_DEFINITION);
proj4.defs('EPSG:4326', EPSG_4326_DEFINITION);

// Register proj4 with OpenLayers (for use in map components)
// This ensures both proj4 and OpenLayers use the same projection definitions
register(proj4);

/**
 * Convert WGS84 lat/lon to Swiss LV95 coordinates
 * @param {number} lat - Latitude in WGS84
 * @param {number} lon - Longitude in WGS84
 * @returns {Array} [east, north] in EPSG:2056
 */
export function wgs84ToLV95(lat, lon) {
  return proj4('EPSG:4326', 'EPSG:2056', [lon, lat]);
}

/**
 * Convert Swiss LV95 coordinates to WGS84 lat/lon
 * @param {number} east - Easting in EPSG:2056
 * @param {number} north - Northing in EPSG:2056
 * @returns {Array} [lat, lon] in WGS84
 */
export function lv95ToWGS84(east, north) {
  const [lon, lat] = proj4('EPSG:2056', 'EPSG:4326', [east, north]);
  return [lat, lon];
}

/**
 * Convert Swiss LV95 coordinates to WGS84 lon/lat (for API compatibility)
 * @param {number} east - Easting in EPSG:2056
 * @param {number} north - Northing in EPSG:2056
 * @returns {Array} [lon, lat] in WGS84
 */
export function lv95ToLonLat(east, north) {
  return proj4('EPSG:2056', 'EPSG:4326', [east, north]);
}
