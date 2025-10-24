/**
 * Get consistent edibility badge classes
 * @param {string} edibility - The edibility value (edible, poisonous, medicinal, psychoactive, inedible, unknown)
 * @param {string} size - Badge size: 'sm' (default) or 'lg'
 * @returns {string} Tailwind CSS classes for the badge
 */
export function getEdibilityBadgeClasses(edibility, size = 'sm') {
  // Base classes - consistent rounded-full and spacing
  const baseClasses = size === 'lg'
    ? 'px-3 py-1 rounded-full text-sm font-medium'
    : 'px-2.5 py-0.5 rounded-full text-xs font-medium';

  // Color classes based on edibility
  const colorClasses = {
    edible: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    poisonous: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    medicinal: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    psychoactive: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    inedible: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    unknown: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
  };

  const color = colorClasses[edibility] || colorClasses.unknown;

  return `${baseClasses} ${color}`;
}

/**
 * Get edibility badge colors object for use in inline styling
 * @returns {Object} Object with edibility keys and color class values
 */
export const edibilityColors = {
  edible: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  poisonous: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  medicinal: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  psychoactive: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  inedible: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
  unknown: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
};
