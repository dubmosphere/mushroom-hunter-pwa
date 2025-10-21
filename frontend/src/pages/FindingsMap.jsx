import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { findingsAPI } from '../utils/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker colors based on edibility
const getMarkerIcon = (edibility) => {
  const colors = {
    edible: '#10b981',
    poisonous: '#ef4444',
    inedible: '#6b7280',
    medicinal: '#3b82f6',
    psychoactive: '#a855f7',
    unknown: '#9ca3af',
  };

  const color = colors[edibility] || colors.unknown;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

function FindingsMap() {
  const [center, setCenter] = useState([46.8182, 8.2275]); // Center of Switzerland
  const [userLocation, setUserLocation] = useState(null);

  const { data: findings, isLoading } = useQuery({
    queryKey: ['findings', 'map'],
    queryFn: async () => {
      const response = await findingsAPI.getMap();
      return response.data;
    },
  });

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          setCenter(location);
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Findings Map</h1>
        <p className="text-gray-600">
          View all your mushroom findings on the map
        </p>
      </div>

      {/* Legend */}
      <div className="card mb-4">
        <h3 className="font-semibold mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
            <span>Edible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
            <span>Poisonous</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow"></div>
            <span>Inedible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
            <span>Medicinal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow"></div>
            <span>Psychoactive</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="card p-0 overflow-hidden">
        <div style={{ height: '600px', width: '100%' }}>
          <MapContainer
            center={center}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User's current location */}
            {userLocation && (
              <Marker position={userLocation}>
                <Popup>
                  <strong>Your current location</strong>
                </Popup>
              </Marker>
            )}

            {/* Findings markers */}
            {findings?.map((finding) => (
              <Marker
                key={finding.id}
                position={[parseFloat(finding.latitude), parseFloat(finding.longitude)]}
                icon={getMarkerIcon(finding.species?.edibility)}
              >
                <Popup>
                  <div className="p-2">
                    <Link
                      to={`/species/${finding.species.id}`}
                      className="font-semibold text-primary-700 hover:text-primary-800 italic block mb-1"
                    >
                      {finding.species.scientificName}
                    </Link>
                    {finding.species.commonName && (
                      <p className="text-sm text-gray-600 mb-2">
                        {finding.species.commonName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {format(new Date(finding.foundAt), 'PPP')}
                    </p>
                    {finding.location && (
                      <p className="text-xs text-gray-500 mt-1">{finding.location}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        finding.species.edibility === 'edible' ? 'bg-green-100 text-green-800' :
                        finding.species.edibility === 'poisonous' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {finding.species.edibility}
                      </span>
                      <Link
                        to={`/findings/${finding.id}`}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {findings && findings.length === 0 && (
        <div className="card text-center py-8 mt-4">
          <p className="text-gray-600 mb-4">No findings to display on the map yet.</p>
          <Link to="/findings/new" className="btn-primary inline-block">
            Add Your First Finding
          </Link>
        </div>
      )}
    </div>
  );
}

export default FindingsMap;
