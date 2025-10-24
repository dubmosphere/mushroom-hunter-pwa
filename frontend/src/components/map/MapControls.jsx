import { Layers, MapPin } from 'lucide-react';

// Swiss map layers with their maximum zoom levels (EPSG:3857)
const SWISS_LAYERS = {
  color: {
    name: 'Color Map',
    layer: 'ch.swisstopo.pixelkarte-farbe',
    maxZoom: 19,
  },
  grey: {
    name: 'Grey Map',
    layer: 'ch.swisstopo.pixelkarte-grau',
    maxZoom: 19,
  },
  aerial: {
    name: 'Aerial Imagery',
    layer: 'ch.swisstopo.swissimage',
    maxZoom: 20,
  },
};

/**
 * Map controls component for layer switching and location tracking
 */
function MapControls({
  currentLayer,
  showLayerPanel,
  onToggleLayerPanel,
  onLayerChange,
  showLocationControl = true,
  isTrackingLocation,
  onToggleLocationTracking,
  onCenterOnLocation,
}) {
  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
      <div className="flex flex-col gap-2">
        {/* Layer Control */}
        <button
          type="button"
          onClick={onToggleLayerPanel}
          className="map-control-button layer-switch-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded shadow-md border border-gray-300 dark:border-gray-600 transition-colors"
          title="Change map layer"
        >
          <Layers size={20} className="text-gray-700 dark:text-gray-300" />
        </button>

        {/* Location Control */}
        {showLocationControl && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onToggleLocationTracking}
              className={`map-control-button location-tracking-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded shadow-md border transition-colors ${
                isTrackingLocation
                  ? 'border-primary-500 dark:border-primary-600'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              title={isTrackingLocation ? 'Stop tracking location' : 'Track my location'}
            >
              <MapPin
                size={20}
                className={isTrackingLocation ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}
              />
            </button>
            {isTrackingLocation && (
              <button
                type="button"
                onClick={onCenterOnLocation}
                className="map-control-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded shadow-md border border-gray-300 dark:border-gray-600 transition-colors"
                title="Center on my location"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 dark:text-gray-300">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            )}
          </div>
        )}

        {showLayerPanel && (
          <div className="bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-300 dark:border-gray-600 overflow-hidden min-w-[140px]">
            {Object.entries(SWISS_LAYERS).map(([key, layer]) => (
              <button
                key={key}
                type="button"
                onClick={() => onLayerChange(key)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  currentLayer === key
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-900 dark:text-primary-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {layer.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MapControls;
