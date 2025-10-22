import { useState } from 'react';
import { useMapEvents, TileLayer } from 'react-leaflet';
import { Layers } from 'lucide-react';

// Switzerland bounds (southwest corner, northeast corner)
export const SWISS_BOUNDS = [
  [45.398181, 5.140242],  // Southwest
  [48.230651, 11.47757]   // Northeast
];

// Restrict zoom levels for Switzerland
export const SWISS_MIN_ZOOM = 7;
export const SWISS_MAX_ZOOM = 19;

// Swiss Federal Geoportal tile layers
export const SWISS_LAYERS = {
  color: {
    name: 'Color Map',
    url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
    attribution: '&copy; <a href="https://www.swisstopo.admin.ch">swisstopo</a>',
  },
  grey: {
    name: 'Grey Map',
    url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg',
    attribution: '&copy; <a href="https://www.swisstopo.admin.ch">swisstopo</a>',
  },
  aerial: {
    name: 'Aerial Imagery',
    url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg',
    attribution: '&copy; <a href="https://www.swisstopo.admin.ch">swisstopo</a>',
  },
};

/**
 * Map Layer Control Component
 * Provides a UI to switch between different Swiss map tile layers
 */
function MapLayerControl({ onLayerChange, defaultLayer = 'color' }) {
  const [currentLayer, setCurrentLayer] = useState(defaultLayer);
  const [showPanel, setShowPanel] = useState(false);

  const handleLayerChange = (layerKey) => {
    setCurrentLayer(layerKey);
    setShowPanel(false);
    if (onLayerChange) {
      onLayerChange(layerKey);
    }
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded shadow-md border border-gray-300 dark:border-gray-600 transition-colors"
          title="Change map layer"
        >
          <Layers size={20} className="text-gray-700 dark:text-gray-300" />
        </button>

        {showPanel && (
          <div className="mt-2 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-300 dark:border-gray-600 overflow-hidden min-w-[140px]">
            {Object.entries(SWISS_LAYERS).map(([key, layer]) => (
              <button
                key={key}
                onClick={() => handleLayerChange(key)}
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

/**
 * Swiss Tile Layer Component
 * Wrapper for TileLayer that uses Swiss Federal Geoportal tiles
 */
export function SwissTileLayer({ layer = 'color' }) {
  const layerConfig = SWISS_LAYERS[layer] || SWISS_LAYERS.color;

  return (
    <TileLayer
      url={layerConfig.url}
      attribution={layerConfig.attribution}
      maxZoom={SWISS_MAX_ZOOM}
      minZoom={SWISS_MIN_ZOOM}
    />
  );
}

export default MapLayerControl;
