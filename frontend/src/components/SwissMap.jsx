import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { Layers } from 'lucide-react';
import 'ol/ol.css';

// Define Swiss LV95 projection (EPSG:2056)
proj4.defs('EPSG:2056', '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs');
register(proj4);

const projection = getProjection('EPSG:2056');
projection.setExtent([2420000, 1030000, 2900000, 1350000]);

// Swiss map layers
const SWISS_LAYERS = {
  color: {
    name: 'Color Map',
    layer: 'ch.swisstopo.pixelkarte-farbe',
  },
  grey: {
    name: 'Grey Map',
    layer: 'ch.swisstopo.pixelkarte-grau',
  },
  aerial: {
    name: 'Aerial Imagery',
    layer: 'ch.swisstopo.swissimage',
  },
};

// WMTS resolutions and matrix IDs for Swiss projection
const resolutions = [
  4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250,
  1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5
];

const matrixIds = resolutions.map((_, i) => i.toString());

/**
 * Swiss Map Component using OpenLayers
 * Displays Swiss Federal Geoportal tiles in EPSG:2056 projection
 */
function SwissMap({ center = [2660000, 1190000], zoom = 1, onMapClick, markers = [], style = {} }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [currentLayer, setCurrentLayer] = useState('color');
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create WMTS source
    const createWMTSSource = (layerName) => {
      return new WMTS({
        url: 'https://wmts.geo.admin.ch/1.0.0/' + layerName + '/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg',
        layer: layerName,
        matrixSet: '2056',
        format: 'image/jpeg',
        projection: projection,
        tileGrid: new WMTSTileGrid({
          origin: [2420000, 1350000],
          resolutions: resolutions,
          matrixIds: matrixIds,
        }),
        style: 'default',
        requestEncoding: 'REST',
      });
    };

    // Create tile layer
    const tileLayer = new TileLayer({
      source: createWMTSSource(SWISS_LAYERS[currentLayer].layer),
    });

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [tileLayer],
      view: new View({
        projection: projection,
        center: center,
        zoom: zoom,
        minZoom: 0,
        maxZoom: 26,
      }),
    });

    mapInstance.current = map;

    // Handle map clicks
    if (onMapClick) {
      map.on('click', (event) => {
        const coordinate = event.coordinate;
        onMapClick(coordinate);
      });
    }

    return () => {
      map.setTarget(null);
    };
  }, []);

  // Update layer when changed
  useEffect(() => {
    if (!mapInstance.current) return;

    const map = mapInstance.current;
    const layers = map.getLayers();
    const tileLayer = layers.item(0);

    const createWMTSSource = (layerName) => {
      return new WMTS({
        url: 'https://wmts.geo.admin.ch/1.0.0/' + layerName + '/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg',
        layer: layerName,
        matrixSet: '2056',
        format: 'image/jpeg',
        projection: projection,
        tileGrid: new WMTSTileGrid({
          origin: [2420000, 1350000],
          resolutions: resolutions,
          matrixIds: matrixIds,
        }),
        style: 'default',
        requestEncoding: 'REST',
      });
    };

    tileLayer.setSource(createWMTSSource(SWISS_LAYERS[currentLayer].layer));
  }, [currentLayer]);

  const handleLayerChange = (layerKey) => {
    setCurrentLayer(layerKey);
    setShowLayerPanel(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Layer Control */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
        <button
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded shadow-md border border-gray-300 dark:border-gray-600 transition-colors"
          title="Change map layer"
        >
          <Layers size={20} className="text-gray-700 dark:text-gray-300" />
        </button>

        {showLayerPanel && (
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

export default SwissMap;
