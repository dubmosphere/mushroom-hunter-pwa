import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromExtent } from 'ol/geom/Polygon';
import { Style, Circle, Fill, Stroke, Icon } from 'ol/style';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, toLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { getCenter } from 'ol/extent';
import UserLocationPopup from './map/UserLocationPopup';
import AddFindingPopup from './map/AddFindingPopup';
import FindingMarkerPopup from './map/FindingMarkerPopup';
import MapControls from './map/MapControls';
import LocationErrorToast from './map/LocationErrorToast';
import 'ol/ol.css';

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

// Calculate Swiss extent exactly like the working example
const extent = fromLonLat([5.140242, 45.398181]).concat(fromLonLat([11.47757, 48.230651]));
const extentPolygon = fromExtent(extent);
extentPolygon.scale(1.5);
const swissExtent = extentPolygon.getExtent();
const swissCenterCoords = getCenter(swissExtent);

/**
 * Swiss Map Component using OpenLayers
 * Displays Swiss Federal Geoportal tiles in EPSG:3857 projection (Web Mercator)
 */
function SwissMap({ center, zoom = 8, onMapClick, onEmptyMapClick, markers = [], style = {}, onMarkerClick, showLocationControl = true, showViewDetailsLink = true, showAddFindingPopup = false }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const popupRef = useRef(null);
  const overlayRef = useRef(null);
  const locationLayerRef = useRef(null);
  const tempMarkerLayerRef = useRef(null);
  const watchIdRef = useRef(null);
  const [currentLayer, setCurrentLayer] = useState('color');
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [popupContent, setPopupContent] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Default center if not provided - use calculated center from extent
  const mapCenter = center || swissCenterCoords;

  useEffect(() => {
    if (!mapRef.current) return;

    // Create XYZ source for swisstopo tiles (EPSG:3857)
    const createXYZSource = (layerName) => {
      return new XYZ({
        url: `https://wmts.geo.admin.ch/1.0.0/${layerName}/default/current/3857/{z}/{x}/{y}.jpeg`,
        attributions: '© <a href="https://www.swisstopo.admin.ch/" target="_blank">swisstopo</a>',
        maxZoom: SWISS_LAYERS[currentLayer].maxZoom,
      });
    };

    // Create tile layer - matching working example configuration
    const tileLayer = new TileLayer({
      source: createXYZSource(SWISS_LAYERS[currentLayer].layer),
      extent: extent,
      preload: 1, // Preload one level for smoother rendering
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

    // Create temporary marker layer for "Add Finding" popup
    const tempMarkerSource = new VectorSource();
    const tempMarkerLayer = new VectorLayer({
      source: tempMarkerSource,
      zIndex: 999,
    });
    tempMarkerLayerRef.current = tempMarkerLayer;

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [tileLayer, vectorLayer, locationLayer, tempMarkerLayer],
      view: new View({
        center: mapCenter,
        zoom: zoom,
        extent: swissExtent,
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
            coordinates: markerCoordinate,
          });
          overlayRef.current?.setPosition(markerCoordinate);
        } else {
          // Clicked on a regular marker
          const data = feature.get('data');
          if (data && !onMapClick) {
            // Show popup with marker data at the marker's position
            const geometry = feature.getGeometry();
            const markerCoordinate = geometry.getCoordinates();
            // Include coordinates in popup content for "Add Finding" button
            setPopupContent({
              ...data,
              markerCoordinates: markerCoordinate,
            });
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
        } else if (showAddFindingPopup && onEmptyMapClick) {
          // Show "Add Finding" popup at clicked location
          const [lon, lat] = toLonLat(event.coordinate);

          setPopupContent({
            isAddFinding: true,
            latitude: lat,
            longitude: lon,
            coordinates: event.coordinate,
          });
          overlayRef.current?.setPosition(event.coordinate);

          // Add temporary marker at clicked location
          const tempMarkerSource = tempMarkerLayerRef.current?.getSource();
          if (tempMarkerSource) {
            tempMarkerSource.clear();

            const tempFeature = new Feature({
              geometry: new Point(event.coordinate),
            });

            // Create a gray dashed circle marker
            tempFeature.setStyle(new Style({
              image: new Circle({
                radius: 8,
                stroke: new Stroke({
                  color: '#fa0000',
                  width: 2,
                  lineDash: [4, 4],
                }),
                fill: new Fill({
                  color: 'rgba(156, 163, 175, 0.5)',
                }),
              }),
            }));

            tempMarkerSource.addFeature(tempFeature);
          }
        } else {
          // Close popup if clicking on empty area
          setPopupContent(null);
          overlayRef.current?.setPosition(undefined);
          // Clear temporary marker
          const tempMarkerSource = tempMarkerLayerRef.current?.getSource();
          if (tempMarkerSource) {
            tempMarkerSource.clear();
          }
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
  }, [mapCenter, zoom, showAddFindingPopup, onEmptyMapClick, currentLayer]);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstance.current) return;

    const map = mapInstance.current;
    const layers = map.getLayers();
    const vectorLayer = layers.item(1); // Vector layer is second
    const vectorSource = vectorLayer.getSource();

    // Clear existing markers
    vectorSource.clear();

    // Add new markers (convert from WGS84 to EPSG:3857 if needed)
    if (markers && markers.length > 0) {
      markers.forEach((marker) => {
        // Check if coordinates are in lon/lat or already in Web Mercator
        let coords = marker.coordinates;

        // If marker has latitude/longitude, use those and convert
        if (marker.data?.latitude && marker.data?.longitude) {
          coords = fromLonLat([marker.data.longitude, marker.data.latitude]);
        }

        const feature = new Feature({
          geometry: new Point(coords),
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

    const createXYZSource = (layerName) => {
      return new XYZ({
        url: `https://wmts.geo.admin.ch/1.0.0/${layerName}/default/current/3857/{z}/{x}/{y}.jpeg`,
        attributions: '© <a href="https://www.swisstopo.admin.ch/" target="_blank">swisstopo</a>',
        maxZoom: SWISS_LAYERS[currentLayer].maxZoom,
      });
    };

    tileLayer.setSource(createXYZSource(SWISS_LAYERS[currentLayer].layer));
    tileLayer.setExtent(extent);
  }, [currentLayer]);

  const handleLayerChange = (layerKey) => {
    setCurrentLayer(layerKey);
    setShowLayerPanel(false);
  };

  const toggleLayerPanel = () => {
    setShowLayerPanel(!showLayerPanel);
  };

  const closePopup = () => {
    setPopupContent(null);
    overlayRef.current?.setPosition(undefined);
    // Clear temporary marker when closing popup
    const tempMarkerSource = tempMarkerLayerRef.current?.getSource();
    if (tempMarkerSource) {
      tempMarkerSource.clear();
    }
  };

  // Helper function to center map on coordinates with animation
  const animateToLocation = (coords3857, zoomLevel = 15) => {
    const view = mapInstance.current?.getView();
    if (view) {
      view.animate({
        center: coords3857,
        zoom: zoomLevel,
        duration: 500,
      });
    }
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

      // Center on location when starting tracking
      centerOnLocation();

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          // Convert WGS84 to EPSG:3857
          const coords3857 = fromLonLat([longitude, latitude]);

          // Update location marker
          const locationSource = locationLayerRef.current?.getSource();
          if (locationSource) {
            locationSource.clear();

            // Add position marker
            const positionFeature = new Feature({
              geometry: new Point(coords3857),
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
        const coords3857 = fromLonLat([longitude, latitude]);
        animateToLocation(coords3857, 15);
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
          <>
            {popupContent.isUserLocation ? (
              <UserLocationPopup
                popupContent={popupContent}
                onClose={closePopup}
                onAddFinding={onEmptyMapClick}
              />
            ) : popupContent.isAddFinding ? (
              <AddFindingPopup
                popupContent={popupContent}
                onClose={closePopup}
                onAddFinding={onEmptyMapClick}
              />
            ) : (
              <FindingMarkerPopup
                popupContent={popupContent}
                onClose={closePopup}
                showViewDetailsLink={showViewDetailsLink}
                showAddFindingPopup={showAddFindingPopup}
                onAddFinding={onEmptyMapClick}
              />
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <MapControls
        currentLayer={currentLayer}
        showLayerPanel={showLayerPanel}
        onToggleLayerPanel={toggleLayerPanel}
        onLayerChange={handleLayerChange}
        showLocationControl={showLocationControl}
        isTrackingLocation={isTrackingLocation}
        onToggleLocationTracking={toggleLocationTracking}
        onCenterOnLocation={centerOnLocation}
      />

      {/* Location Error Toast */}
      <LocationErrorToast error={locationError} />
    </div>
  );
}

export default SwissMap;
