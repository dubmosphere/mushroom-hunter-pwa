/**
 * Toast component for displaying location errors
 */
function LocationErrorToast({ error }) {
  if (!error) return null;

  return (
    <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-2 rounded shadow-lg text-sm max-w-xs">
        {error}
      </div>
    </div>
  );
}

export default LocationErrorToast;
