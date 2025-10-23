import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { speciesAPI, findingsAPI } from '../utils/api';
import SwissMap from '../components/SwissMap';
import { wgs84ToLV95 } from '../utils/projections';

function SpeciesDetail() {
  const { id } = useParams();

  const { data: species, isLoading } = useQuery({
    queryKey: ['species', id],
    queryFn: async () => {
      const response = await speciesAPI.getById(id);
      return response.data;
    },
  });

  const { data: findingsData } = useQuery({
    queryKey: ['findings', 'species', id],
    queryFn: async () => {
      const response = await findingsAPI.getAll({ speciesId: id, myFindings: true });
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!species) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Species not found</p>
      </div>
    );
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/species" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-6">
        <ArrowLeft size={20} />
        Back to Species Explorer
      </Link>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold italic mb-2">{species.scientificName}</h1>
            {species.commonName && (
              <p className="text-xl text-gray-600 dark:text-gray-400">{species.commonName}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
            species.edibility === 'edible' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
            species.edibility === 'poisonous' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
          }`}>
            {species.edibility?.toUpperCase()}
          </span>
        </div>

        {/* Multi-language common names */}
        {(species.commonNameDE || species.commonNameFR || species.commonNameIT) && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h3 className="font-semibold mb-2">Common Names</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              {species.commonNameDE && <p><strong>DE:</strong> {species.commonNameDE}</p>}
              {species.commonNameFR && <p><strong>FR:</strong> {species.commonNameFR}</p>}
              {species.commonNameIT && <p><strong>IT:</strong> {species.commonNameIT}</p>}
            </div>
          </div>
        )}

        {/* Taxonomy */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Taxonomy</h3>
          <div className="space-y-2">
            <p><strong>Division:</strong> {species.genus?.family?.order?.class?.division?.name}</p>
            <p><strong>Class:</strong> {species.genus?.family?.order?.class?.name}</p>
            <p><strong>Order:</strong> {species.genus?.family?.order?.name}</p>
            <p><strong>Family:</strong> {species.genus?.family?.name}</p>
            <p><strong>Genus:</strong> {species.genus?.name}</p>
          </div>
        </div>

        {/* Description */}
        {species.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{species.description}</p>
          </div>
        )}

        {/* Characteristics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {species.capShape && (
            <div>
              <h4 className="font-semibold mb-1">Cap Shape</h4>
              <p className="text-gray-700 dark:text-gray-300">{species.capShape}</p>
            </div>
          )}
          {species.capColor && (
            <div>
              <h4 className="font-semibold mb-1">Cap Color</h4>
              <p className="text-gray-700 dark:text-gray-300">{species.capColor}</p>
            </div>
          )}
          {species.gillAttachment && (
            <div>
              <h4 className="font-semibold mb-1">Gill Attachment</h4>
              <p className="text-gray-700 dark:text-gray-300">{species.gillAttachment}</p>
            </div>
          )}
          {species.sporePrintColor && (
            <div>
              <h4 className="font-semibold mb-1">Spore Print Color</h4>
              <p className="text-gray-700 dark:text-gray-300">{species.sporePrintColor}</p>
            </div>
          )}
        </div>

        {/* Habitat & Occurrence */}
        <div className="mb-6">
          {species.habitat && (
            <>
              <h3 className="text-lg font-semibold mb-3">Habitat</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{species.habitat}</p>
            </>
          )}
          {species.occurrence && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Occurrence:</strong> {species.occurrence.replace('_', ' ').charAt(0).toUpperCase() + species.occurrence.replace('_', ' ').slice(1)}
            </p>
          )}
        </div>

        {/* Season */}
        {(species.seasonStart || species.seasonEnd) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Season</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {months[species.seasonStart - 1]} - {months[species.seasonEnd - 1]}
            </p>
          </div>
        )}

        {/* Toxicity Warning */}
        {species.toxicity && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Toxicity Warning</h3>
            <p className="text-red-700 dark:text-red-400">{species.toxicity}</p>
          </div>
        )}

        {/* Action Button */}
        <Link
          to="/findings/new"
          state={{ speciesId: species.id, speciesName: species.scientificName }}
          className="btn-primary inline-flex items-center gap-2"
        >
          <MapPin size={20} />
          Record a Finding
        </Link>
      </div>

      {/* My Findings Section */}
      {findingsData && findingsData.findings && findingsData.findings.length > 0 && (
        <>
          {/* Findings List */}
          <div className="card mt-6">
            <h2 className="text-2xl font-bold mb-4">My Findings ({findingsData.findings.length})</h2>
            <div className="space-y-3">
              {findingsData.findings.map((finding) => (
                <div key={finding.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">{format(new Date(finding.foundAt), 'PPP')}</span>
                        <Link
                          to={`/findings/${finding.id}`}
                          className="btn-secondary text-xs flex items-center gap-1 px-2 py-1"
                          title="View details"
                        >
                          <Eye size={12} />
                          Details
                        </Link>
                      </div>
                      {finding.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <MapPin size={14} />
                          <span>{finding.location}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {finding.quantity && <p>Quantity: {finding.quantity}</p>}
                        {finding.weather && <p>Weather: {finding.weather}</p>}
                        {finding.temperature !== null && finding.temperature !== undefined && (
                          <p>Temperature: {finding.temperature}°C</p>
                        )}
                      </div>
                      {finding.notes && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">"{finding.notes}"</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings Map */}
          <div className="card mt-6 p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold">Findings Map</h2>
            </div>
            <div style={{ height: '400px', position: 'relative' }}>
              <SwissMap
                center={wgs84ToLV95(
                  parseFloat(findingsData.findings[0].latitude),
                  parseFloat(findingsData.findings[0].longitude)
                )}
                zoom={8}
                markers={findingsData.findings.map((finding) => ({
                  coordinates: wgs84ToLV95(parseFloat(finding.latitude), parseFloat(finding.longitude)),
                  color: species.edibility === 'edible' ? '#10b981' :
                         species.edibility === 'poisonous' ? '#ef4444' :
                         species.edibility === 'medicinal' ? '#3b82f6' :
                         species.edibility === 'psychoactive' ? '#a855f7' :
                         '#6b7280',
                  data: finding,
                }))}
                style={{ height: '100%', width: '100%' }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SpeciesDetail;
