'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Search, X, LocateFixed } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Define the global google object type for TypeScript
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface GoogleMapServiceProps {
  apiKey?: string;
  defaultCenter?: MapLocation;
  defaultZoom?: number;
  onLocationSelect?: (location: MapLocation) => void;
  searchPlaceholder?: string;
  initialSearchTerm?: string;
}

const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
const DEFAULT_CENTER: MapLocation = { lat: 34.052235, lng: -118.243683, address: 'Los Angeles, CA' }; // Default to Los Angeles
const DEFAULT_ZOOM = 12;

export function GoogleMapService({
  apiKey = DEFAULT_API_KEY,
  defaultCenter = DEFAULT_CENTER,
  defaultZoom = DEFAULT_ZOOM,
  onLocationSelect = () => {},
  searchPlaceholder = 'Search for a location...',
  initialSearchTerm = '',
}: GoogleMapServiceProps = {}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoadingScript, setIsLoadingScript] = useState(true);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(null);

  const loadGoogleMapsScript = useCallback(() => {
    if (window.google && window.google.maps) {
      setIsLoadingScript(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setError('Failed to load Google Maps script. Please check your API key and network connection.');
      setIsLoadingScript(false);
    };
    document.head.appendChild(script);

    window.initMap = () => {
      setIsLoadingScript(false);
    };
  }, [apiKey]);

  useEffect(() => {
    loadGoogleMapsScript();
  }, [loadGoogleMapsScript]);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google || !window.google.maps) return;

    setIsMapLoading(true);
    geocoder.current = new window.google.maps.Geocoder();
    autocompleteService.current = new window.google.maps.places.AutocompleteService();
    placesService.current = new window.google.maps.places.PlacesService(mapRef.current);

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'greedy',
    });

    markerInstance.current = new window.google.maps.Marker({
      map: mapInstance.current,
      position: defaultCenter,
      draggable: true,
      title: 'Selected Location',
    });

    markerInstance.current.addListener('dragend', () => {
      if (markerInstance.current) {
        const newPosition = markerInstance.current.getPosition();
        if (newPosition) {
          const lat = newPosition.lat();
          const lng = newPosition.lng();
          reverseGeocode({ lat, lng });
        }
      }
    });

    mapInstance.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        if (markerInstance.current) {
          markerInstance.current.setPosition(e.latLng);
        }
        reverseGeocode({ lat, lng });
      }
    });

    setIsMapLoading(false);
    // Set initial location
    setCurrentLocation(defaultCenter);
    onLocationSelect(defaultCenter);
  }, [defaultCenter, defaultZoom, onLocationSelect]);

  useEffect(() => {
    if (!isLoadingScript && !mapInstance.current) {
      initMap();
    }
  }, [isLoadingScript, initMap]);

  const reverseGeocode = useCallback((coords: { lat: number; lng: number }) => {
    if (!geocoder.current) return;

    geocoder.current.geocode({ location: coords }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const newLocation: MapLocation = {
          lat: coords.lat,
          lng: coords.lng,
          address: results[0].formatted_address,
        };
        setCurrentLocation(newLocation);
        onLocationSelect(newLocation);
      } else {
        console.error('Geocoder failed due to: ' + status);
        const newLocation: MapLocation = {
          lat: coords.lat,
          lng: coords.lng,
          address: 'Unknown location',
        };
        setCurrentLocation(newLocation);
        onLocationSelect(newLocation);
      }
    });
  }, [onLocationSelect]);

  const handleSearchChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 2 && autocompleteService.current) {
      try {
        const { predictions } = await autocompleteService.current.getPlacePredictions({ input: value });
        setSuggestions(predictions);
      } catch (err) {
        console.error('Autocomplete error:', err);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, []);

  const handleSuggestionClick = useCallback((prediction: google.maps.places.AutocompletePrediction) => {
    setSearchTerm(prediction.description);
    setSuggestions([]);

    if (placesService.current) {
      placesService.current.getDetails({ placeId: prediction.place_id }, (place, status) => {
        if (status === 'OK' && place && place.geometry && place.geometry.location) {
          const newCenter = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address,
          };
          if (mapInstance.current) {
            mapInstance.current.setCenter(newCenter);
            mapInstance.current.setZoom(15);
          }
          if (markerInstance.current) {
            markerInstance.current.setPosition(newCenter);
          }
          setCurrentLocation(newCenter);
          onLocationSelect(newCenter);
        } else {
          console.error('Places service failed due to: ' + status);
        }
      });
    }
  }, [onLocationSelect]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setSuggestions([]);
  }, []);

  const handleLocateMe = useCallback(() => {
    if (navigator.geolocation && mapInstance.current && markerInstance.current) {
      setIsMapLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstance.current?.setCenter(userLocation);
          mapInstance.current?.setZoom(15);
          markerInstance.current?.setPosition(userLocation);
          reverseGeocode(userLocation);
          setIsMapLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Could not retrieve your current location. Please ensure location services are enabled.');
          setIsMapLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by your browser or map is not initialized.');
    }
  }, [reverseGeocode]);

  if (isLoadingScript) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-center justify-center min-h-[300px] bg-surface dark:bg-surface rounded-lg border border-border dark:border-border text-muted-foreground dark:text-muted-foreground"
        aria-live="polite"
        aria-busy="true"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <svg className="animate-spin h-5 w-5 text-[#3B82F6] mr-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading Map...
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col items-center justify-center min-h-[300px] bg-destructive dark:bg-destructive/20 rounded-lg border border-destructive dark:border-destructive text-destructive dark:text-destructive p-4"
        role="alert"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <X className="h-8 w-8 mb-2" />
        <p className="font-medium text-lg">Map Error</p>
        <p className="text-sm text-center">{error}</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setError(null);
            setIsLoadingScript(true);
            loadGoogleMapsScript();
          }}
          className="mt-4 px-4 py-2 bg-[#3B82F6] text-foreground rounded-lg hover:bg-primary transition-colors duration-150 font-medium text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2"
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-lg border border-border dark:border-border bg-background dark:bg-surface"
      aria-label="Interactive map for location selection"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {isMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 dark:bg-surface/80 z-10" aria-live="polite" aria-busy="true">
          <svg className="animate-spin h-8 w-8 text-[#3B82F6]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" role="application" aria-label="Google Map"></div>

      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="relative">
          <div className="flex items-center bg-background dark:bg-surface rounded-lg shadow-md border border-border dark:border-border focus-within:ring-2 focus-within:ring-[#3B82F6] focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-gray-900">
            <Search className="h-5 w-5 text-muted-foreground dark:text-muted-foreground ml-3" aria-hidden="true" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="flex-grow px-3 py-2.5 bg-transparent text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-sm"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label={searchPlaceholder}
              aria-autocomplete="list"
              aria-controls="location-suggestions"
              autoComplete="off"
            />
            {searchTerm && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearSearch}
                className="p-2 text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-foreground transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 rounded-full"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </div>
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.ul
                id="location-suggestions"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 bg-background dark:bg-surface border border-border dark:border-border rounded-lg shadow-lg mt-2 max-h-60 overflow-y-auto z-20"
                role="listbox"
              >
                {suggestions.map((prediction) => (
                  <motion.li
                    key={prediction.place_id}
                    whileHover={{ backgroundColor: 'var(--gray-100)', x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSuggestionClick(prediction)}
                    className="px-4 py-3 text-muted-foreground dark:text-foreground text-sm cursor-pointer border-b border-border dark:border-border last:border-b-0 hover:bg-surface dark:hover:bg-surface transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                    role="option"
                    aria-selected={currentLocation?.address === prediction.description}
                    tabIndex={0}
                  >
                    {prediction.description}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLocateMe}
        className="absolute bottom-4 right-4 z-10 p-3 bg-background dark:bg-surface rounded-full shadow-md border border-border dark:border-border text-muted-foreground dark:text-foreground hover:bg-surface dark:hover:bg-surface transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
        aria-label="Locate me"
      >
        <LocateFixed className="h-5 w-5" />
      </motion.button>

      {currentLocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-4 left-4 right-16 z-10 bg-background dark:bg-surface rounded-lg shadow-md border border-border dark:border-border p-3 flex items-center gap-2 text-sm text-muted-foreground dark:text-foreground"
          aria-live="polite"
        >
          <MapPin className="h-4 w-4 text-[#3B82F6] flex-shrink-0" />
          <span className="truncate" aria-label={`Selected location: ${currentLocation.address || 'Unknown'}`}>
            {currentLocation.address || `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}`}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

// Mock data for demo
const DEFAULT_DEMO_CENTER: MapLocation = { lat: 34.052235, lng: -118.243683, address: 'Los Angeles, CA' };

// Demo component for page.tsx
export default function GoogleMapServiceDemo() {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
    console.log('Location selected:', location);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-surface text-muted-foreground dark:text-foreground font-sans p-4 sm:p-6 lg:p-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <h1 className="text-3xl font-bold text-muted-foreground dark:text-foreground text-center leading-tight tracking-tight">Select Your Charging Station Location</h1>
        <p className="text-center text-muted-foreground dark:text-muted-foreground mb-8 leading-relaxed">
          Pinpoint your home charging station on the map to make it available for other EV owners.
        </p>

        <GoogleMapService
          apiKey={DEFAULT_API_KEY} // Ensure this is set in your .env.local
          defaultCenter={DEFAULT_DEMO_CENTER}
          onLocationSelect={handleLocationSelect}
          searchPlaceholder="Search for your address or drag the pin"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="bg-surface dark:bg-surface border border-border dark:border-border rounded-xl p-4 shadow-sm text-sm"
        >
          <h2 className="font-medium text-muted-foreground dark:text-foreground mb-2">Current Selected Location:</h2>
          {selectedLocation ? (
            <div className="space-y-1 text-muted-foreground dark:text-muted-foreground">
              <p><strong>Address:</strong> {selectedLocation.address || 'N/A'}</p>
              <p><strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}</p>
              <p><strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}</p>
            </div>
          ) : (
            <p className="text-muted-foreground dark:text-muted-foreground">No location selected yet. Drag the marker or search for an address.</p>
          )}
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-3 bg-[#3B82F6] text-foreground rounded-lg hover:bg-primary transition-colors duration-150 font-medium text-base shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedLocation}
          aria-label="Confirm selected location"
        >
          Confirm Location
        </motion.button>
      </motion.div>
    </div>
  );
}