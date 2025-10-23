import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Circle, Fill, Stroke, Icon } from 'ol/style';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { get as getProjection } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import Overlay from 'ol/Overlay';
import proj4 from 'proj4';
import { Layers, X, Eye, MapPin, Calendar } from 'lucide-react';
import { wgs84ToLV95 } from '../utils/projections';
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
function SwissMap({ center = [2660000, 1190000], zoom = 1, onMapClick, markers = [], style = {}, onMarkerClick, showLocationControl = true }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const popupRef = useRef(null);
  const overlayRef = useRef(null);
  const locationLayerRef = useRef(null);
  const watchIdRef = useRef(null);
  const [currentLayer, setCurrentLayer] = useState('color');
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [popupContent, setPopupContent] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

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

    // Create vector source for markers
    const vectorSource = new VectorSource();

    // Create vector layer for markers
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const color = feature.get('color') || '#3b82f6';
        return new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({ color: color }),
            stroke: new Stroke({ color: '#ffffff', width: 2 }),
          }),
        });
      },
    });

    // Create location layer for user position
    const locationSource = new VectorSource();
    const locationLayer = new VectorLayer({
      source: locationSource,
      zIndex: 1000,
    });
    locationLayerRef.current = locationLayer;

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [tileLayer, vectorLayer, locationLayer],
      view: new View({
        projection: projection,
        center: center,
        zoom: zoom,
        minZoom: 0,
        maxZoom: 26,
      }),
    });

    mapInstance.current = map;

    // Create popup overlay
    if (popupRef.current) {
      const overlay = new Overlay({
        element: popupRef.current,
        autoPan: {
          animation: {
            duration: 250,
          },
        },
        positioning: 'bottom-center',
        offset: [0, -20],
      });
      map.addOverlay(overlay);
      overlayRef.current = overlay;
    }

    // Handle map clicks
    map.on('click', (event) => {
      // Check if clicked on a feature (marker)
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);

      if (feature) {
        // Check if it's the user location marker
        const isUserLocation = feature.get('isUserLocation');
        if (isUserLocation) {
          // Show popup for user location
          const geometry = feature.getGeometry();
          const markerCoordinate = geometry.getCoordinates();
          const latitude = feature.get('latitude');
          const longitude = feature.get('longitude');
          const accuracy = feature.get('accuracy');

          setPopupContent({
            isUserLocation: true,
            latitude: latitude,
            longitude: longitude,
            accuracy: accuracy,
          });
          overlayRef.current?.setPosition(markerCoordinate);
        } else {
          // Clicked on a regular marker
          const data = feature.get('data');
          if (data && !onMapClick) {
            // Show popup with marker data at the marker's position
            const geometry = feature.getGeometry();
            const markerCoordinate = geometry.getCoordinates();
            setPopupContent(data);
            overlayRef.current?.setPosition(markerCoordinate);

            // Call optional marker click handler
            if (onMarkerClick) {
              onMarkerClick(data);
            }
          }
        }
      } else {
        // Clicked on empty map area
        if (onMapClick) {
          onMapClick(event.coordinate);
        } else {
          // Close popup if clicking on empty area
          setPopupContent(null);
          overlayRef.current?.setPosition(undefined);
        }
      }
    });

    // Change cursor on hover
    map.on('pointermove', (event) => {
      const pixel = map.getEventPixel(event.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    return () => {
      // Cleanup geolocation watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.setTarget(null);
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstance.current) return;

    const map = mapInstance.current;
    const layers = map.getLayers();
    const vectorLayer = layers.item(1); // Vector layer is second
    const vectorSource = vectorLayer.getSource();

    // Clear existing markers
    vectorSource.clear();

    // Add new markers
    if (markers && markers.length > 0) {
      markers.forEach((marker) => {
        const feature = new Feature({
          geometry: new Point(marker.coordinates),
          color: marker.color || '#3b82f6',
          data: marker.data,
        });
        vectorSource.addFeature(feature);
      });
    }
  }, [markers]);

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

  const closePopup = () => {
    setPopupContent(null);
    overlayRef.current?.setPosition(undefined);
  };

  const toggleLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    if (isTrackingLocation) {
      // Stop tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      // Clear location marker
      const locationSource = locationLayerRef.current?.getSource();
      locationSource?.clear();
      setIsTrackingLocation(false);
      setLocationError(null);
    } else {
      // Start tracking
      setLocationError(null);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          // Convert WGS84 to LV95
          const lv95Coords = wgs84ToLV95(latitude, longitude);

          // Update location marker
          const locationSource = locationLayerRef.current?.getSource();
          if (locationSource) {
            locationSource.clear();

            // Add position marker
            const positionFeature = new Feature({
              geometry: new Point(lv95Coords),
              isUserLocation: true,
              latitude: latitude,
              longitude: longitude,
              accuracy: accuracy,
            });

            // Create a position marker using Lucide MapPin icon as SVG
            const styles = [];

            // Add accuracy circle if accuracy is reasonable
            if (accuracy < 1000) {
              styles.push(
                new Style({
                  image: new Circle({
                    radius: Math.min(accuracy / 2, 50),
                    fill: new Fill({ color: 'rgba(59, 130, 246, 0.1)' }),
                    stroke: new Stroke({ color: 'rgba(59, 130, 246, 0.3)', width: 1 }),
                  }),
                })
              );
            }

            // Create SVG for MapPin icon (Lucide MapPin)
            const svg = `
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="#3b82f6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
              </svg>
            `;
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

            // Add position icon
            styles.push(
              new Style({
                image: new Icon({
                  src: svgDataUrl,
                  scale: 1,
                  anchor: [0.5, 1],
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'fraction',
                }),
              })
            );

            positionFeature.setStyle(styles);
            locationSource.addFeature(positionFeature);
          }

          setIsTrackingLocation(true);
          setLocationError(null);
        },
        (error) => {
          setLocationError(error.message);
          setIsTrackingLocation(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 10000,
        }
      );
    }
  };

  const centerOnLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const lv95Coords = wgs84ToLV95(latitude, longitude);

        // Center map on location
        const view = mapInstance.current?.getView();
        if (view) {
          view.animate({
            center: lv95Coords,
            zoom: 10,
            duration: 500,
          });
        }
      },
      (error) => {
        setLocationError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Popup Overlay */}
      <div ref={popupRef} className={`ol-popup ${popupContent?.isUserLocation ? 'ol-popup-user-location' : ''}`}>
        {popupContent && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 min-w-[200px] max-w-[300px]">
            {popupContent.isUserLocation ? (
              // User Location Popup
              <>
                <div className="flex items-start justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      My Position
                    </h3>
                  </div>
                  <button
                    onClick={closePopup}
                    className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-3 space-y-2 text-xs">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Latitude:</span> {popupContent.latitude.toFixed(6)}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Longitude:</span> {popupContent.longitude.toFixed(6)}
                  </p>
                  {popupContent.accuracy && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Accuracy:</span> ±{Math.round(popupContent.accuracy)}m
                    </p>
                  )}
                </div>
              </>
            ) : (
              // Finding Marker Popup
              <>
                <div className="flex items-start justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    {popupContent.species?.id ? (
                      <Link
                        to={`/species/${popupContent.species.id}`}
                        className="font-bold text-sm italic text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                      >
                        {popupContent.species.scientificName}
                      </Link>
                    ) : (
                      <h3 className="font-bold text-sm italic text-gray-900 dark:text-gray-100">
                        {popupContent.species?.scientificName || 'Unknown Species'}
                      </h3>
                    )}
                    {popupContent.species?.commonName && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {popupContent.species.commonName}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={closePopup}
                    className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-3 space-y-2 text-xs">
                  {popupContent.location && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{popupContent.location}</span>
                    </div>
                  )}
                  {popupContent.foundAt && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{new Date(popupContent.foundAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {popupContent.quantity && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Quantity:</span> {popupContent.quantity}
                    </p>
                  )}
                  {popupContent.species?.edibility && (
                    <p>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        popupContent.species.edibility === 'edible' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        popupContent.species.edibility === 'poisonous' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                        popupContent.species.edibility === 'medicinal' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        popupContent.species.edibility === 'psychoactive' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {popupContent.species.edibility}
                      </span>
                    </p>
                  )}
                </div>
                {popupContent.id && (
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to={`/findings/${popupContent.id}`}
                      className="btn-secondary text-xs flex items-center gap-1 justify-center w-full"
                    >
                      <Eye size={14} />
                      View Details
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
        <div className="flex flex-col gap-2">
          {/* Layer Control */}
          <button
            type="button"
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className="map-control-button layer-switch-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded shadow-md border border-gray-300 dark:border-gray-600 transition-colors"
            title="Change map layer"
          >
            <Layers size={20} className="text-gray-700 dark:text-gray-300" />
          </button>

          {/* Location Control */}
          {showLocationControl && (
            <button
              type="button"
              onClick={isTrackingLocation ? centerOnLocation : toggleLocationTracking}
              className={`map-control-button location-tracking-button bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded shadow-md border transition-colors ${
                isTrackingLocation
                  ? 'border-primary-500 dark:border-primary-600'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              title={isTrackingLocation ? 'Center on my location' : 'Show my location'}
            >
              <MapPin
                size={20}
                className={isTrackingLocation ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}
              />
            </button>
          )}

          {showLayerPanel && (
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-300 dark:border-gray-600 overflow-hidden min-w-[140px]">
              {Object.entries(SWISS_LAYERS).map(([key, layer]) => (
                <button
                  key={key}
                  type="button"
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

      {/* Location Error Toast */}
      {locationError && (
        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-2 rounded shadow-lg text-sm max-w-xs">
            {locationError}
          </div>
        </div>
      )}
    </div>
  );
}

export default SwissMap;
