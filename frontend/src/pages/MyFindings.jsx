import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Trash2, MapPin, Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { findingsAPI } from '../utils/api';

function MyFindings() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data: findingsData, isLoading } = useQuery({
    queryKey: ['findings', 'my', page],
    queryFn: async () => {
      const response = await findingsAPI.getAll({ myFindings: true, page, limit: 20 });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => findingsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['findings']);
    },
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this finding?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Findings</h1>
        <Link to="/findings/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Finding
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading findings...</p>
        </div>
      ) : findingsData?.findings?.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't recorded any findings yet.</p>
          <Link to="/findings/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={20} />
            Record Your First Finding
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {findingsData?.findings?.map((finding) => (
              <div key={finding.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/species/${finding.species.id}`}
                        className="text-xl font-semibold text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 italic"
                      >
                        {finding.species.scientificName}
                      </Link>
                      <Link
                        to={`/findings/${finding.id}`}
                        className="btn-secondary text-xs flex items-center gap-1 px-2 py-1"
                        title="View details"
                      >
                        <Eye size={14} />
                        Details
                      </Link>
                    </div>
                    {finding.species.commonName && (
                      <p className="text-gray-600 dark:text-gray-400">{finding.species.commonName}</p>
                    )}

                    <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{format(new Date(finding.foundAt), 'PPP')}</span>
                      </div>
                      {finding.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span>{finding.location}</span>
                        </div>
                      )}
                      {finding.quantity && (
                        <p>Quantity: {finding.quantity}</p>
                      )}
                      {finding.weather && (
                        <p>Weather: {finding.weather}</p>
                      )}
                      {finding.temperature !== null && finding.temperature !== undefined && (
                        <p>Temperature: {finding.temperature}°C</p>
                      )}
                    </div>

                    {finding.notes && (
                      <p className="mt-3 text-gray-700 dark:text-gray-300 whitespace-pre-line">{finding.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(finding.id)}
                    className="btn-danger ml-4"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {findingsData?.pagination && findingsData.pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                Page {page} of {findingsData.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= findingsData.pagination.totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyFindings;
