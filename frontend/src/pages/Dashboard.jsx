import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, MapPin, List, Plus, Eye } from 'lucide-react';
import { findingsAPI, speciesAPI } from '../utils/api';
import useAuthStore from '../store/authStore';

function Dashboard() {
  const user = useAuthStore((state) => state.user);

  const { data: recentFindings } = useQuery({
    queryKey: ['findings', 'recent'],
    queryFn: async () => {
      const response = await findingsAPI.getAll({ myFindings: true, limit: 5 });
      return response.data;
    },
  });

  const { data: speciesCount } = useQuery({
    queryKey: ['species', 'count'],
    queryFn: async () => {
      const response = await speciesAPI.getAll({ limit: 1 });
      return response.data.pagination?.total || 0;
    },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600">
          Track your mushroom findings across Switzerland
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-700 font-medium">Total Findings</p>
              <p className="text-3xl font-bold text-primary-900 mt-1">
                {recentFindings?.pagination?.total || 0}
              </p>
            </div>
            <div className="p-3 bg-primary-600 rounded-lg">
              <List size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Species Database</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {speciesCount}
              </p>
            </div>
            <div className="p-3 bg-green-600 rounded-lg">
              <Search size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Locations Visited</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {recentFindings?.findings?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-600 rounded-lg">
              <MapPin size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/findings/new"
            className="card hover:shadow-lg transition-shadow bg-primary-50 border-2 border-primary-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <Plus size={20} className="text-white" />
              </div>
              <span className="font-semibold text-primary-900">Add Finding</span>
            </div>
          </Link>

          <Link
            to="/species"
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-600 rounded-lg">
                <Search size={20} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900">Browse Species</span>
            </div>
          </Link>

          <Link
            to="/map"
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-600 rounded-lg">
                <MapPin size={20} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900">View Map</span>
            </div>
          </Link>

          <Link
            to="/findings"
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-600 rounded-lg">
                <List size={20} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900">My Findings</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Findings */}
      {recentFindings?.findings && recentFindings.findings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Findings</h2>
            <Link to="/findings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentFindings.findings.slice(0, 5).map((finding) => (
              <div key={finding.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Link
                        to={`/species/${finding.species.id}`}
                        className="font-semibold text-primary-700 hover:text-primary-800 italic"
                      >
                        {finding.species.scientificName}
                      </Link>
                      <Link
                        to={`/findings/${finding.id}`}
                        className="btn-secondary text-xs flex items-center gap-1 px-2 py-1"
                        title="View details"
                      >
                        <Eye size={12} />
                        Details
                      </Link>
                    </div>
                    {finding.species.commonName && (
                      <p className="text-sm text-gray-600">{finding.species.commonName}</p>
                    )}
                    {finding.location && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin size={12} />
                        {finding.location}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    finding.species.edibility === 'edible' ? 'bg-green-100 text-green-800' :
                    finding.species.edibility === 'poisonous' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {finding.species.edibility}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started */}
      {(!recentFindings?.findings || recentFindings.findings.length === 0) && (
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
          <h2 className="text-xl font-bold text-primary-900 mb-3">Getting Started</h2>
          <p className="text-primary-800 mb-4">
            Start tracking your mushroom findings today! Explore the species database and record your discoveries.
          </p>
          <div className="space-y-2 text-sm text-primary-800">
            <p>✓ Browse the comprehensive mushroom database</p>
            <p>✓ Record your findings with GPS location</p>
            <p>✓ Track your discoveries on an interactive map</p>
            <p>✓ Build your personal mushroom journal</p>
          </div>
          <Link
            to="/findings/new"
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Record Your First Finding
          </Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
