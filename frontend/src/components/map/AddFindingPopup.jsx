import { X, Plus } from 'lucide-react';

/**
 * Popup component for adding a new finding at a clicked location
 */
function AddFindingPopup({ popupContent, onClose, onAddFinding }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 min-w-[200px] max-w-[300px]">
      <div className="flex items-start justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
            Add Finding Here
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {popupContent.latitude.toFixed(6)}, {popupContent.longitude.toFixed(6)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={16} />
        </button>
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

export default AddFindingPopup;
