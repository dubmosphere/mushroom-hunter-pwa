import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { findingsAPI } from '../utils/api';
import SwissMap from '../components/SwissMap';
import { getEdibilityMarkerColor } from '../utils/edibilityBadge';
import LoadingSpinner from '../components/LoadingSpinner';

function FindingsMap() {
  const navigate = useNavigate();

  const { data: findings, isLoading } = useQuery({
    queryKey: ['findings', 'map'],
    queryFn: async () => {
      const response = await findingsAPI.getMap();
      return response.data;
    },
  });

  const handleAddFindingClick = (_coordinate, locationInfo) => {
    // Navigate to add finding page with coordinates
    navigate('/findings/new', {
      state: {
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
        fromMap: true,
      }
    });
  };


  if (isLoading) {
    return <LoadingSpinner message="Loading map..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-100">Findings Map</h1>
        <p className="text-gray-600 dark:text-gray-400">
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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 Tip: Click anywhere on the map to add a new finding at that location
          </p>
        </div>
        <div style={{ height: '600px', width: '100%', position: 'relative' }}>
          <SwissMap
            zoom={7}
            onEmptyMapClick={handleAddFindingClick}
            showAddFindingPopup={true}
            markers={findings?.map((finding) => ({
              color: getEdibilityMarkerColor(finding.species?.edibility),
              data: finding,
            })) || []}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      </div>

      {findings && findings.length === 0 && (
        <div className="card text-center py-8 mt-4">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No findings to display on the map yet.</p>
          <Link to="/findings/new" className="btn-primary inline-block">
            Add Your First Finding
          </Link>
        </div>
      )}
    </div>
  );
}

export default FindingsMap;
