import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { findingsAPI } from '../utils/api';
import SwissMap from '../components/SwissMap';
import { wgs84ToLV95 } from '../utils/projections';

function FindingsMap() {
  const [center] = useState(() => wgs84ToLV95(46.8182, 8.2275)); // Center of Switzerland in LV95

  const { data: findings, isLoading } = useQuery({
    queryKey: ['findings', 'map'],
    queryFn: async () => {
      const response = await findingsAPI.getMap();
      return response.data;
    },
  });


  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    );
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
        <div style={{ height: '600px', width: '100%', position: 'relative' }}>
          <SwissMap
            center={center}
            zoom={3}
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
