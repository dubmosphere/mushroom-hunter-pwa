import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import { ArrowLeft, MapPin, Calendar, Thermometer, Cloud, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { findingsAPI } from '../utils/api';
import MapLayerControl, { SwissTileLayer, SWISS_BOUNDS, SWISS_MIN_ZOOM, SWISS_MAX_ZOOM } from '../components/MapLayerControl';
import L from 'leaflet';

// Custom marker icon
const createMarkerIcon = (edibility) => {
  const colors = {
    edible: '#10b981',
    poisonous: '#ef4444',
    inedible: '#6b7280',
    medicinal: '#3b82f6',
    psychoactive: '#8b5cf6',
    unknown: '#f59e0b',
  };

  const color = colors[edibility] || colors.unknown;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

function FindingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mapLayer, setMapLayer] = useState('color');

  const { data: finding, isLoading, error } = useQuery({
    queryKey: ['finding', id],
    queryFn: async () => {
      const response = await findingsAPI.getById(id);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => findingsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['findings']);
      navigate('/findings');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this finding?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading finding...</p>
      </div>
    );
  }

  if (error || !finding) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-400">Failed to load finding. It may not exist or you don't have permission to view it.</p>
          <Link to="/findings" className="btn-primary mt-4 inline-block">
            Back to My Findings
          </Link>
        </div>
      </div>
    );
  }

  const edibilityColors = {
    edible: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    poisonous: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    inedible: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    medicinal: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    psychoactive: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    unknown: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/findings" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
          <ArrowLeft size={20} />
          Back to My Findings
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="btn-danger flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Species Info Card */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Link
                to={`/species/${finding.species.id}`}
                className="text-2xl font-bold text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 italic"
              >
                {finding.species.scientificName}
              </Link>
              {finding.species.commonName && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{finding.species.commonName}</p>
              )}
            </div>
            {finding.species.edibility && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${edibilityColors[finding.species.edibility] || edibilityColors.unknown}`}>
                {finding.species.edibility}
              </span>
            )}
          </div>

          {/* Taxonomy */}
          {finding.species.genus && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <p>
                <span className="font-medium">Taxonomy:</span>{' '}
                {finding.species.genus.family?.order?.class?.division?.name} → {' '}
                {finding.species.genus.family?.order?.class?.name} → {' '}
                {finding.species.genus.family?.order?.name} → {' '}
                {finding.species.genus.family?.name} → {' '}
                {finding.species.genus.name}
              </p>
            </div>
          )}
        </div>

        {/* Finding Details Card */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Finding Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                <p className="font-medium">{format(new Date(finding.foundAt), 'PPPp')}</p>
              </div>
            </div>

            {/* Location */}
            {finding.location && (
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium">{finding.location}</p>
                </div>
              </div>
            )}

            {/* Coordinates */}
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Coordinates</p>
                <p className="font-medium font-mono text-sm">
                  {parseFloat(finding.latitude).toFixed(6)}, {parseFloat(finding.longitude).toFixed(6)}
                </p>
              </div>
            </div>

            {/* Quantity */}
            {finding.quantity && (
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                  <p className="font-medium">{finding.quantity}</p>
                </div>
              </div>
            )}

            {/* Weather */}
            {finding.weather && (
              <div className="flex items-start gap-3">
                <Cloud size={20} className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Weather</p>
                  <p className="font-medium capitalize">{finding.weather}</p>
                </div>
              </div>
            )}

            {/* Temperature */}
            {finding.temperature !== null && finding.temperature !== undefined && (
              <div className="flex items-start gap-3">
                <Thermometer size={20} className="text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Temperature</p>
                  <p className="font-medium">{finding.temperature}°C</p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {finding.notes && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Notes</p>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{finding.notes}</p>
            </div>
          )}
        </div>

        {/* Map Card */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Location on Map</h2>
          </div>
          <div style={{ height: '400px', position: 'relative' }}>
            <MapContainer
              center={[parseFloat(finding.latitude), parseFloat(finding.longitude)]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <SwissTileLayer layer={mapLayer} />
              <MapLayerControl onLayerChange={setMapLayer} defaultLayer="color" />
              <Marker
                position={[parseFloat(finding.latitude), parseFloat(finding.longitude)]}
                icon={createMarkerIcon(finding.species.edibility)}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold italic">{finding.species.scientificName}</p>
                    {finding.species.commonName && (
                      <p className="text-gray-600 dark:text-gray-400">{finding.species.commonName}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format(new Date(finding.foundAt), 'PPP')}
                    </p>
                    {finding.location && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{finding.location}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindingDetail;
