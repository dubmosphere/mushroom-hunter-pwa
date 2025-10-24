/**
 * Query key factory for React Query
 *
 * This centralizes all query keys to make them:
 * - Easy to maintain
 * - Type-safe (when migrating to TypeScript)
 * - Consistent across the app
 * - Easy to invalidate related queries
 *
 * Usage:
 *   useQuery({ queryKey: queryKeys.findings.list({ page: 1 }), ... })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.findings.all })
 */

export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'],
    currentUser: () => [...queryKeys.auth.all, 'current-user'],
  },

  // Species queries
  species: {
    all: ['species'],
    lists: () => [...queryKeys.species.all, 'list'],
    list: (filters) => [...queryKeys.species.lists(), filters],
    details: () => [...queryKeys.species.all, 'detail'],
    detail: (id) => [...queryKeys.species.details(), id],
  },

  // Findings queries
  findings: {
    all: ['findings'],
    lists: () => [...queryKeys.findings.all, 'list'],
    list: (filters) => [...queryKeys.findings.lists(), filters],
    myLists: () => [...queryKeys.findings.all, 'my', 'list'],
    myList: (filters) => [...queryKeys.findings.myLists(), filters],
    details: () => [...queryKeys.findings.all, 'detail'],
    detail: (id) => [...queryKeys.findings.details(), id],
    map: () => [...queryKeys.findings.all, 'map'],
  },

  // Taxonomy queries
  taxonomy: {
    all: ['taxonomy'],
    divisions: () => [...queryKeys.taxonomy.all, 'divisions'],
    classes: () => [...queryKeys.taxonomy.all, 'classes'],
    orders: () => [...queryKeys.taxonomy.all, 'orders'],
    families: () => [...queryKeys.taxonomy.all, 'families'],
    genera: () => [...queryKeys.taxonomy.all, 'genera'],
  },
};

/**
 * Helper function to invalidate all queries for a resource
 *
 * Example:
 *   await invalidateResource(queryClient, 'findings')
 */
export const invalidateResource = (queryClient, resourceKey) => {
  if (!queryKeys[resourceKey]) {
    console.warn(`Unknown resource key: ${resourceKey}`);
    return;
  }

  return queryClient.invalidateQueries({
    queryKey: queryKeys[resourceKey].all
  });
};

/**
 * Helper to invalidate lists only (preserve detail caches)
 *
 * Example:
 *   await invalidateResourceLists(queryClient, 'species')
 */
export const invalidateResourceLists = (queryClient, resourceKey) => {
  if (!queryKeys[resourceKey] || !queryKeys[resourceKey].lists) {
    console.warn(`Unknown resource key or no lists: ${resourceKey}`);
    return;
  }

  return queryClient.invalidateQueries({
    queryKey: queryKeys[resourceKey].lists()
  });
};
