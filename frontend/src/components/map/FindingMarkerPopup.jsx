import { Link } from 'react-router-dom';
import { X, Eye, MapPin, Calendar, Plus } from 'lucide-react';
import { toLonLat } from 'ol/proj';
import { getEdibilityBadgeClasses } from '../../utils/edibilityBadge';

/**
 * Popup component for displaying mushroom finding details
 */
function FindingMarkerPopup({
  popupContent,
  onClose,
  showViewDetailsLink = true,
  showAddFindingPopup = false,
  onAddFinding
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 min-w-[200px] max-w-[300px]">
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
          onClick={onClose}
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
            <span className={getEdibilityBadgeClasses(popupContent.species.edibility, 'sm')}>
              {popupContent.species.edibility}
            </span>
          </p>
        )}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        {popupContent.id && showViewDetailsLink && (
          <div className="p-3">
            <Link
              to={`/findings/${popupContent.id}`}
              className="btn-secondary text-xs flex items-center gap-1 justify-center w-full"
            >
              <Eye size={14} />
              View Details
            </Link>
          </div>
        )}
        {showAddFindingPopup && onAddFinding && popupContent.markerCoordinates && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                const [lon, lat] = toLonLat(popupContent.markerCoordinates);
                onAddFinding(popupContent.markerCoordinates, {
                  latitude: lat,
                  longitude: lon,
                });
              }}
              className="btn-primary text-xs flex items-center gap-2 justify-center w-full"
            >
              <Plus size={14} />
              Add Finding at This Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FindingMarkerPopup;
