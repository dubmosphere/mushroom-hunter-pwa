import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Calendar, Thermometer, Cloud, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fromLonLat } from 'ol/proj';
import { findingsAPI } from '../utils/api';
import SwissMap from '../components/SwissMap';
import { getEdibilityBadgeClasses, getEdibilityMarkerColor } from '../utils/edibilityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSmartNavigation } from '../hooks/useSmartNavigation';

function FindingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { handleBackClick, getLinkTo } = useSmartNavigation('/findings');

  const handleAddFindingClick = (_coordinate, locationInfo) => {
    // Navigate to add finding page with coordinates and species pre-filled
    navigate('/findings/new', {
      state: {
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
        speciesId: finding.species.id,
        fromMap: true,
      }
    });
  };

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
      <div className="max-w-4xl mx-auto">
        <LoadingSpinner message="Loading finding..." />
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to={getLinkTo()}
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          <ArrowLeft size={20} />
          Back
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
              <span className={getEdibilityBadgeClasses(finding.species.edibility, 'lg')}>
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
            <SwissMap
              center={fromLonLat([parseFloat(finding.longitude), parseFloat(finding.latitude)])}
              zoom={14}
              markers={[{
                color: getEdibilityMarkerColor(finding.species.edibility),
                data: finding,
              }]}
              showViewDetailsLink={false}
              onEmptyMapClick={handleAddFindingClick}
              showAddFindingPopup={true}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindingDetail;
