import { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { speciesAPI, taxonomyAPI } from '../utils/api';

function SpeciesExplorer() {
  const [filters, setFilters] = useState({
    search: '',
    edibility: '',
    occurrence: '',
    divisionId: '',
    classId: '',
    orderId: '',
    familyId: '',
    genusId: '',
    season: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['species', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { ...filters, page: pageParam, limit: 20 };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      const response = await speciesAPI.getAll(params);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const response = await taxonomyAPI.getDivisions();
      return response.data;
    },
  });

  const { data: genera } = useQuery({
    queryKey: ['genera'],
    queryFn: async () => {
      const response = await taxonomyAPI.getGenera();
      return response.data;
    },
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      edibility: '',
      occurrence: '',
      divisionId: '',
      classId: '',
      orderId: '',
      familyId: '',
      genusId: '',
      season: '',
    });
  };

  // Flatten all pages into a single array
  const allSpecies = data?.pages.flatMap(page => page.species) || [];
  const totalSpecies = data?.pages[0]?.pagination?.total || 0;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Species Explorer</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center gap-2"
        >
          <Filter size={20} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by scientific or common name..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 flex items-center gap-1"
            >
              <X size={16} />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Edibility</label>
              <select
                value={filters.edibility}
                onChange={(e) => handleFilterChange('edibility', e.target.value)}
                className="input"
              >
                <option value="">All</option>
                <option value="edible">Edible</option>
                <option value="poisonous">Poisonous</option>
                <option value="inedible">Inedible</option>
                <option value="medicinal">Medicinal</option>
                <option value="psychoactive">Psychoactive</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="label">Occurrence</label>
              <select
                value={filters.occurrence}
                onChange={(e) => handleFilterChange('occurrence', e.target.value)}
                className="input"
              >
                <option value="">All</option>
                <option value="common">Common</option>
                <option value="frequent">Frequent</option>
                <option value="occasional">Occasional</option>
                <option value="rare">Rare</option>
                <option value="very_rare">Very Rare</option>
              </select>
            </div>

            <div>
              <label className="label">Season</label>
              <select
                value={filters.season}
                onChange={(e) => handleFilterChange('season', e.target.value)}
                className="input"
              >
                <option value="">All Year</option>
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Division</label>
              <select
                value={filters.divisionId}
                onChange={(e) => handleFilterChange('divisionId', e.target.value)}
                className="input"
              >
                <option value="">All Divisions</option>
                {divisions?.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Genus</label>
              <select
                value={filters.genusId}
                onChange={(e) => handleFilterChange('genusId', e.target.value)}
                className="input"
              >
                <option value="">All Genera</option>
                {genera?.map((genus) => (
                  <option key={genus.id} value={genus.id}>
                    {genus.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading species...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {allSpecies.length} of {totalSpecies} species
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allSpecies.map((species) => (
              <Link
                key={species.id}
                to={`/species/${species.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg italic">{species.scientificName}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    species.edibility === 'edible' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    species.edibility === 'poisonous' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {species.edibility}
                  </span>
                </div>
                {species.commonName && (
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{species.commonName}</p>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>Genus: {species.genus?.name}</p>
                  <p>Family: {species.genus?.family?.name}</p>
                  {species.occurrence && (
                    <p className="capitalize">Occurrence: {species.occurrence.replace('_', ' ')}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="mt-6 py-4 text-center">
            {isFetchingNextPage && (
              <div className="flex flex-col items-center gap-2">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading more species...</p>
              </div>
            )}
            {!hasNextPage && allSpecies.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No more species to load
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SpeciesExplorer;
