import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { MapContainer, Marker, useMapEvents } from 'react-leaflet';
import { ArrowLeft, MapPin, Map as MapIcon } from 'lucide-react';
import { findingsAPI, speciesAPI } from '../utils/api';
import MapLayerControl, { SwissTileLayer, SWISS_BOUNDS, SWISS_MIN_ZOOM, SWISS_MAX_ZOOM } from '../components/MapLayerControl';

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

function AddFinding() {
  const navigate = useNavigate();
  const location = useLocation();
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState([46.8182, 8.2275]); // Switzerland center
  const [mapLayer, setMapLayer] = useState('color');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      speciesId: location.state?.speciesId || '',
      foundAt: new Date().toISOString().slice(0, 16),
      latitude: '',
      longitude: '',
      location: '',
      notes: '',
      quantity: 1,
      weather: '',
      temperature: '',
    },
  });

  const speciesId = watch('speciesId');

  // Search species
  const { data: speciesData } = useQuery({
    queryKey: ['species', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return null;
      const response = await speciesAPI.getAll({ search: searchTerm, limit: 10 });
      return response.data;
    },
    enabled: searchTerm.length >= 2,
  });

  // Get selected species info
  const { data: selectedSpecies } = useQuery({
    queryKey: ['species', speciesId],
    queryFn: async () => {
      const response = await speciesAPI.getById(speciesId);
      return response.data;
    },
    enabled: !!speciesId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => findingsAPI.create(data),
    onSuccess: () => {
      navigate('/findings');
    },
  });

  // Reverse geocoding function using Nominatim (OpenStreetMap)
  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MushroomHunterPWA/1.0'
          }
        }
      );
      const data = await response.json();

      if (data && data.display_name) {
        // Try to extract a meaningful location name
        const address = data.address;
        let locationName = '';

        if (address.village || address.town || address.city) {
          locationName = address.village || address.town || address.city;
          if (address.municipality && address.municipality !== locationName) {
            locationName += `, ${address.municipality}`;
          }
        } else if (address.county) {
          locationName = address.county;
        } else if (address.state) {
          locationName = address.state;
        } else {
          // Use a shortened version of display_name
          const parts = data.display_name.split(',');
          locationName = parts.slice(0, 2).join(',');
        }

        return locationName;
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  const handleMapLocationSelect = async (lat, lng) => {
    const latFixed = lat.toFixed(8);
    const lonFixed = lng.toFixed(8);

    setValue('latitude', latFixed);
    setValue('longitude', lonFixed);
    setMapPosition([lat, lng]);

    // Try to get location name
    const locationName = await reverseGeocode(lat, lng);
    if (locationName) {
      setValue('location', locationName);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(8);
        const lon = position.coords.longitude.toFixed(8);

        setValue('latitude', lat);
        setValue('longitude', lon);
        setMapPosition([position.coords.latitude, position.coords.longitude]);

        // Try to get location name
        const locationName = await reverseGeocode(lat, lon);
        if (locationName) {
          setValue('location', locationName);
        }

        setGettingLocation(false);
      },
      (error) => {
        alert(`Error getting location: ${error.message}`);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const onSubmit = (data) => {
    const findingData = {
      ...data,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      quantity: parseInt(data.quantity),
      temperature: data.temperature ? parseFloat(data.temperature) : null,
    };
    createMutation.mutate(findingData);
  };

  // Auto-select species if passed from species detail page
  useEffect(() => {
    if (location.state?.speciesId) {
      setValue('speciesId', location.state.speciesId);
    }
  }, [location.state, setValue]);

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/findings" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-6">
        <ArrowLeft size={20} />
        Back to My Findings
      </Link>

      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Record a New Finding</h1>

        {createMutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            Failed to create finding. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Species Selection */}
          <div>
            <label className="label">Species *</label>
            {selectedSpecies ? (
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg">
                <p className="font-semibold italic text-gray-900 dark:text-gray-100">{selectedSpecies.scientificName}</p>
                {selectedSpecies.commonName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSpecies.commonName}</p>
                )}
                <button
                  type="button"
                  onClick={() => setValue('speciesId', '')}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mt-2"
                >
                  Change species
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search for species..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input mb-2"
                />
                {speciesData?.species && speciesData.species.length > 0 && (
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 max-h-48 overflow-y-auto">
                    {speciesData.species.map((species) => (
                      <button
                        key={species.id}
                        type="button"
                        onClick={() => {
                          setValue('speciesId', species.id);
                          setSearchTerm('');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <p className="font-medium italic text-gray-900 dark:text-gray-100">{species.scientificName}</p>
                        {species.commonName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{species.commonName}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            <input type="hidden" {...register('speciesId', { required: 'Species is required' })} />
            {errors.speciesId && (
              <p className="text-red-500 text-sm mt-1">{errors.speciesId.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div>
            <label className="label">Date & Time *</label>
            <input
              type="datetime-local"
              className="input"
              {...register('foundAt', { required: 'Date is required' })}
            />
            {errors.foundAt && (
              <p className="text-red-500 text-sm mt-1">{errors.foundAt.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="label">Location Coordinates *</label>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                step="0.00000001"
                placeholder="Latitude"
                className="input flex-1"
                {...register('latitude', {
                  required: 'Latitude is required',
                  min: { value: -90, message: 'Invalid latitude' },
                  max: { value: 90, message: 'Invalid latitude' },
                })}
              />
              <input
                type="number"
                step="0.00000001"
                placeholder="Longitude"
                className="input flex-1"
                {...register('longitude', {
                  required: 'Longitude is required',
                  min: { value: -180, message: 'Invalid longitude' },
                  max: { value: 180, message: 'Invalid longitude' },
                })}
              />
            </div>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <MapPin size={16} />
                {gettingLocation ? 'Getting location...' : 'Use current location'}
              </button>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <MapIcon size={16} />
                {showMap ? 'Hide map' : 'Pick on map'}
              </button>
            </div>
            {(errors.latitude || errors.longitude) && (
              <p className="text-red-500 text-sm mt-1">
                {errors.latitude?.message || errors.longitude?.message}
              </p>
            )}

            {/* Interactive Map */}
            {showMap && (
              <div className="mt-3 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="bg-primary-50 dark:bg-primary-900/20 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600">
                  Click on the map to set the location
                </div>
                <div style={{ height: '400px', position: 'relative' }}>
                  <MapContainer
                    center={mapPosition}
                    zoom={13}
                    minZoom={SWISS_MIN_ZOOM}
                    maxZoom={SWISS_MAX_ZOOM}
                    maxBounds={SWISS_BOUNDS}
                    maxBoundsViscosity={1.0}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <SwissTileLayer layer={mapLayer} />
                    <MapLayerControl onLayerChange={setMapLayer} defaultLayer="color" />
                    <MapClickHandler onLocationSelect={handleMapLocationSelect} />
                    {watch('latitude') && watch('longitude') && (
                      <Marker
                        position={[
                          parseFloat(watch('latitude')) || mapPosition[0],
                          parseFloat(watch('longitude')) || mapPosition[1]
                        ]}
                      />
                    )}
                  </MapContainer>
                </div>
              </div>
            )}
          </div>

          {/* Location Name */}
          <div>
            <label className="label">Location Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Near the old oak tree"
                className="input flex-1"
                {...register('location')}
              />
              <button
                type="button"
                onClick={async () => {
                  const lat = watch('latitude');
                  const lon = watch('longitude');
                  if (lat && lon) {
                    const locationName = await reverseGeocode(lat, lon);
                    if (locationName) {
                      setValue('location', locationName);
                    } else {
                      alert('Could not fetch location name');
                    }
                  } else {
                    alert('Please enter coordinates first');
                  }
                }}
                className="btn-secondary text-sm whitespace-nowrap"
              >
                Get Location
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Auto-filled when using current location, or click "Get Location" button
            </p>
          </div>

          {/* Quantity */}
          <div>
            <label className="label">Quantity</label>
            <input
              type="number"
              min="1"
              className="input"
              {...register('quantity', { min: 1 })}
            />
          </div>

          {/* Weather */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Weather</label>
              <select className="input" {...register('weather')}>
                <option value="">Select weather</option>
                <option value="sunny">Sunny</option>
                <option value="cloudy">Cloudy</option>
                <option value="rainy">Rainy</option>
                <option value="foggy">Foggy</option>
                <option value="snowy">Snowy</option>
              </select>
            </div>

            <div>
              <label className="label">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                placeholder="15.5"
                className="input"
                {...register('temperature')}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              rows="4"
              placeholder="Additional observations..."
              className="input"
              {...register('notes')}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary flex-1"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Finding'}
            </button>
            <Link to="/findings" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFinding;
