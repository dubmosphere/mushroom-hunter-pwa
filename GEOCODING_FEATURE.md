# Reverse Geocoding Feature

## Overview

The Mushroom Hunter PWA now includes **reverse geocoding** functionality that automatically converts GPS coordinates into human-readable location names.

## How It Works

### Automatic Location Name Fetching

When you click "Use current location" button:
1. GPS coordinates are obtained from your device
2. Coordinates are automatically sent to OpenStreetMap's Nominatim service
3. A location name is fetched and auto-filled in the "Location Name" field
4. Examples: "Zürich, Switzerland" or "Lucerne, Canton of Lucerne"

### Manual Location Name Fetching

If you manually enter GPS coordinates:
1. Enter latitude and longitude values
2. Click the "Get Location" button next to the Location Name field
3. The location name will be fetched and filled automatically

## Technical Details

### API Used
- **Service**: OpenStreetMap Nominatim API
- **Endpoint**: `https://nominatim.openstreetmap.org/reverse`
- **Method**: Free, no API key required
- **Rate Limit**: 1 request per second (suitable for individual use)

### Location Name Priority

The system intelligently extracts location names in this order:
1. Village/Town/City name (+ Municipality if different)
2. County name
3. State/Canton name
4. Shortened display name (first 2 parts)

This ensures you get the most relevant location name for Swiss locations.

### Privacy & Usage

- **Privacy**: Coordinates are sent to OpenStreetMap only when you explicitly:
  - Click "Use current location", or
  - Click "Get Location" button
- **No tracking**: No data is stored by the geocoding service
- **Optional**: You can always manually enter or edit the location name

## Examples for Switzerland

| Coordinates | Location Name |
|-------------|---------------|
| 47.3769, 8.5417 | Zürich |
| 46.9480, 7.4474 | Bern |
| 46.2044, 6.1432 | Geneva, Genève |
| 47.0502, 8.3093 | Lucerne, Canton of Lucerne |

## Usage Tips

1. **For best results**: Enable high-accuracy location on your device
2. **Manual override**: You can always edit the auto-filled location name
3. **Offline**: Geocoding requires internet connection; works offline if you enter location name manually
4. **Custom descriptions**: Add specific details like "Near the oak tree by the river"

## Code Location

The reverse geocoding functionality is implemented in:
- **File**: `frontend/src/pages/AddFinding.jsx`
- **Function**: `reverseGeocode(lat, lon)`

## Future Enhancements

Potential improvements:
- Cache frequently used coordinates
- Support for multiple geocoding services (fallback)
- Display location preview on map before saving
- Offline geocoding using local database of Swiss locations

---

**Note**: This feature uses free OpenStreetMap services. Please use responsibly and respect their usage policies.
