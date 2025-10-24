import { X, Plus } from 'lucide-react';

/**
 * Popup component for displaying user's current location
 */
function UserLocationPopup({ popupContent, onClose, onAddFinding }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 min-w-[200px] max-w-[300px]">
      <div className="flex items-start justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
            My Position
          </h3>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={16} />
        </button>
      </div>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-2 text-xs">
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Latitude:</span> {popupContent.latitude.toFixed(6)}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-medium">Longitude:</span> {popupContent.longitude.toFixed(6)}
        </p>
        {popupContent.accuracy && (
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Accuracy:</span> ±{Math.round(popupContent.accuracy)}m
          </p>
        )}
      </div>
      <div className="p-3">
        <button
          onClick={() => {
            if (onAddFinding) {
              onAddFinding(popupContent.coordinates, {
                latitude: popupContent.latitude,
                longitude: popupContent.longitude,
              });
            }
          }}
          className="btn-primary text-xs flex items-center gap-2 justify-center w-full"
        >
          <Plus size={14} />
          Add Finding at This Location
        </button>
      </div>
    </div>
  );
}

export default UserLocationPopup;
