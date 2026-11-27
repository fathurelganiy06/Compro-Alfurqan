import React, { useCallback, useEffect, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Compass,
  ExternalLink,
  Layers,
  MapPin,
  Navigation,
  Search,
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';

const MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '';

// Initial viewport center for Daya, Biringkanaya, Makassar
const MAKASSAR_DAYA_DEFAULT = { lat: -5.1142, lng: 119.5122 };

interface CampusFacility {
  id: string;
  name: string;
  category: string;
  hours: string;
  description: string;
  offsetLat: number;
  offsetLng: number;
}

const CAMPUS_FACILITIES: CampusFacility[] = [
  {
    id: 'rectorate',
    name: 'Rectorate & Admissions Bureau (PMB)',
    category: 'Administration',
    hours: 'Mon–Fri · 08:00–16:00 WITA',
    description:
      'Main administrative hub for admissions counseling, academic records, and university leadership offices.',
    offsetLat: 0,
    offsetLng: 0,
  },
  {
    id: 'mosque',
    name: 'Al-Furqan Campus Mosque & Tahfidz Center',
    category: 'Qur’anic Studies',
    hours: 'Daily · 04:30–21:00 WITA',
    description:
      'Center for congregational prayer, daily Tilawah halaqah, and student Tahfidzul Qur’an examinations.',
    offsetLat: 0.00055,
    offsetLng: 0.00045,
  },
  {
    id: 'library',
    name: 'Central Library & Tarbiyah Lecture Wing',
    category: 'Academic',
    hours: 'Mon–Sat · 08:00–17:00 WITA',
    description:
      'Houses classical Islamic manuscripts, educational research journals, and undergraduate Tarbiyah classrooms.',
    offsetLat: -0.00045,
    offsetLng: 0.00055,
  },
  {
    id: 'postgrad',
    name: 'Postgraduate Hall & Main Auditorium',
    category: 'Pascasarjana',
    hours: 'Mon–Sat · 08:00–18:00 WITA',
    description:
      'Dedicated S2 PAI seminar rooms, Syariah mediation lab, and the 500-seat institutional symposium hall.',
    offsetLat: 0.00035,
    offsetLng: -0.0005,
  },
];

interface PlaceResultItem {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: { lat: number; lng: number };
  googleMapsURI?: string;
}

interface FacilityMarkerProps {
  facility: CampusFacility;
  position: { lat: number; lng: number };
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
}

const FacilityMarker: React.FC<FacilityMarkerProps> = ({
  facility,
  position,
  isSelected,
  onSelect,
  onClose,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        title={facility.name}
        onClick={onSelect}
      >
        <Pin
          background={isSelected ? '#0E5A36' : '#1E3A2B'}
          borderColor={isSelected ? '#C49A2C' : '#093E25'}
          glyphColor="#FFFFFF"
          scale={isSelected ? 1.25 : 1.0}
        />
      </AdvancedMarker>
      {isSelected && marker && (
        <InfoWindow anchor={marker} maxWidth={260} onCloseClick={onClose}>
          <div className="p-1 text-[#0F1F18]">
            <div className="text-[11px] font-medium text-[#0E5A36] mb-0.5">
              {facility.category}
            </div>
            <div className="text-sm font-semibold leading-snug mb-1">
              {facility.name}
            </div>
            <p className="text-xs text-[#4A5D54] leading-relaxed mb-1.5">
              {facility.description}
            </p>
            <div className="text-[11px] font-mono text-[#4A5D54]">{facility.hours}</div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

interface PlaceMarkerProps {
  place: PlaceResultItem;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
}

const PlaceSearchMarker: React.FC<PlaceMarkerProps> = ({
  place,
  isSelected,
  onSelect,
  onClose,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={place.location}
        title={place.displayName}
        onClick={onSelect}
      >
        <Pin
          background="#C49A2C"
          borderColor="#8A6914"
          glyphColor="#FFFFFF"
          scale={isSelected ? 1.2 : 0.95}
        />
      </AdvancedMarker>
      {isSelected && marker && (
        <InfoWindow anchor={marker} maxWidth={260} onCloseClick={onClose}>
          <div className="p-1 text-[#0F1F18]">
            <div className="text-[11px] font-medium text-[#8A6914] mb-0.5">
              Google Maps Place
            </div>
            <div className="text-sm font-semibold leading-snug mb-1">
              {place.displayName}
            </div>
            {place.formattedAddress && (
              <p className="text-xs text-[#4A5D54] leading-relaxed mb-2">
                {place.formattedAddress}
              </p>
            )}
            {place.googleMapsURI && (
              <a
                href={place.googleMapsURI}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#0E5A36] hover:underline"
              >
                Open in Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

interface MapWorkspaceProps {
  address: string;
}

const CampusMapWorkspace: React.FC<MapWorkspaceProps> = ({ address }) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const { trackInteraction } = useCampus();

  const [campusAnchor, setCampusAnchor] = useState<{ lat: number; lng: number }>(
    MAKASSAR_DAYA_DEFAULT,
  );
  const [campusPlaceMeta, setCampusPlaceMeta] = useState<PlaceResultItem | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>('rectorate');
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'hybrid'>('roadmap');

  const [nearbyQuery, setNearbyQuery] = useState('');
  const [nearbyResults, setNearbyResults] = useState<PlaceResultItem[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Locate STAI Al-Furqan Makassar dynamically via Places API (New)
  useEffect(() => {
    if (!placesLib) return;
    let cancelled = false;

    const locateCampus = async () => {
      try {
        const { Place } = placesLib;
        const response = await Place.searchByText({
          textQuery: 'STAI Al-Furqan Makassar',
          fields: ['id', 'displayName', 'formattedAddress', 'location', 'googleMapsURI'],
          maxResultCount: 1,
          region: 'ID',
        });

        const first = response?.places?.[0];
        if (!cancelled && first?.location) {
          const lat = first.location.lat();
          const lng = first.location.lng();
          setCampusAnchor({ lat, lng });
          setCampusPlaceMeta({
            id: first.id || 'stai-al-furqan',
            displayName: first.displayName || 'STAI Al-Furqan Makassar',
            formattedAddress: first.formattedAddress || address,
            location: { lat, lng },
            googleMapsURI: first.googleMapsURI || undefined,
          });
          if (map) {
            map.panTo({ lat, lng });
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    };

    void locateCampus();
    return () => {
      cancelled = true;
    };
  }, [placesLib, map, address]);

  const handleSelectFacility = useCallback(
    (facility: CampusFacility) => {
      setSelectedPlaceId(null);
      setSelectedFacilityId(facility.id);
      const pos = {
        lat: campusAnchor.lat + facility.offsetLat,
        lng: campusAnchor.lng + facility.offsetLng,
      };
      if (map) {
        map.panTo(pos);
        map.setZoom(17);
      }
      trackInteraction('map_interact', `Facility: ${facility.name}`);
    },
    [campusAnchor, map, trackInteraction],
  );

  const runNearbySearch = useCallback(
    async (queryText: string) => {
      const cleaned = queryText.trim();
      if (!cleaned || !placesLib) return;
      setSearchingPlaces(true);
      setSearchFeedback(null);
      setSelectedFacilityId(null);
      trackInteraction('map_interact', `Places search: ${cleaned}`);

      try {
        const { Place } = placesLib;
        const response = await Place.searchByText({
          textQuery: `${cleaned} Makassar`,
          fields: ['id', 'displayName', 'formattedAddress', 'location', 'googleMapsURI'],
          locationBias: {
            center: campusAnchor,
            radius: 10000,
          },
          maxResultCount: 5,
          region: 'ID',
        });

        interface RawPlaceResult {
          id?: string;
          displayName?: string | null;
          formattedAddress?: string | null;
          location?: { lat: () => number; lng: () => number } | null;
          googleMapsURI?: string | null;
        }

        const rawPlaces = (response?.places ?? []) as RawPlaceResult[];
        const items: PlaceResultItem[] = rawPlaces
          .filter((p): p is RawPlaceResult & { location: { lat: () => number; lng: () => number } } =>
            Boolean(p.location),
          )
          .map((p, idx: number) => ({
            id: p.id || `place-${idx}`,
            displayName: p.displayName || 'Unnamed Place',
            formattedAddress: p.formattedAddress || '',
            location: {
              lat: p.location.lat(),
              lng: p.location.lng(),
            },
            googleMapsURI: p.googleMapsURI || undefined,
          }));

        setNearbyResults(items);
        if (items.length === 0) {
          setSearchFeedback('No places found near Daya Campus for that query.');
        } else {
          setSelectedPlaceId(items[0].id);
          if (map) {
            map.panTo(items[0].location);
            map.setZoom(15);
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          setSearchFeedback('Map search quota temporarily reached.');
        } else {
          setSearchFeedback('Unable to complete nearby place search right now.');
        }
      } finally {
        setSearchingPlaces(false);
      }
    },
    [placesLib, campusAnchor, map, trackInteraction],
  );

  const handleResetToCampus = () => {
    setNearbyResults([]);
    setSelectedPlaceId(null);
    setSelectedFacilityId('rectorate');
    setSearchFeedback(null);
    if (map) {
      map.panTo(campusAnchor);
      map.setZoom(16);
    }
  };

  const directionsUrl =
    campusPlaceMeta?.googleMapsURI ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('STAI Al-Furqan Makassar')}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#E2E8E2] rounded-xl overflow-hidden bg-white">
      {/* Left Campus Directory & Live Places Search */}
      <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#E2E8E2] p-5 sm:p-6 flex flex-col justify-between bg-[#FAFBF9]">
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-lg font-semibold text-[#0F1F18]">Campus Directory</h3>
            <button
              type="button"
              onClick={handleResetToCampus}
              className="text-xs font-medium text-[#0E5A36] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Center Campus
            </button>
          </div>

          {/* Live Google Places (New) Search around Campus */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void runNearbySearch(nearbyQuery);
            }}
            className="mb-4"
          >
            <label htmlFor="campus-places-search" className="sr-only">
              Search nearby Makassar landmarks or transit
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#4A5D54] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="campus-places-search"
                  type="text"
                  value={nearbyQuery}
                  onChange={(e) => setNearbyQuery(e.target.value)}
                  placeholder="Find nearby transit, mosque, hotel..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D4DDD6] rounded-lg text-[#0F1F18] placeholder:text-[#76877E] focus:outline-none focus:border-[#0E5A36]"
                />
              </div>
              <button
                type="submit"
                disabled={searchingPlaces || !nearbyQuery.trim()}
                className="px-3 py-2 text-xs font-medium text-white bg-[#0E5A36] hover:bg-[#093E25] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {searchingPlaces ? 'Finding...' : 'Search'}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
              {['Masjid Daya', 'Terminal Daya', 'Bandara Hasanuddin'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setNearbyQuery(preset);
                    void runNearbySearch(preset);
                  }}
                  className="text-[11px] font-medium text-[#4A5D54] hover:text-[#0E5A36] bg-white border border-[#E2E8E2] rounded-md px-2 py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </form>

          {searchFeedback && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
              {searchFeedback}
            </p>
          )}

          {nearbyResults.length > 0 && (
            <div className="mb-5 pb-4 border-b border-[#E2E8E2]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#8A6914]">
                  Nearby Search Results ({nearbyResults.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNearbyResults([]);
                    setSelectedPlaceId(null);
                  }}
                  className="text-[11px] text-[#4A5D54] hover:text-[#0F1F18] cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {nearbyResults.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => {
                      setSelectedFacilityId(null);
                      setSelectedPlaceId(place.id);
                      if (map) {
                        map.panTo(place.location);
                        map.setZoom(16);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                      selectedPlaceId === place.id
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-white border-[#E2E8E2] hover:border-[#C49A2C]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#0F1F18] truncate">
                      {place.displayName}
                    </div>
                    {place.formattedAddress && (
                      <div className="text-[11px] text-[#4A5D54] truncate mt-0.5">
                        {place.formattedAddress}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Institutional Campus Facilities */}
          <div className="space-y-2">
            {CAMPUS_FACILITIES.map((facility) => {
              const active = selectedFacilityId === facility.id;
              return (
                <button
                  key={facility.id}
                  type="button"
                  onClick={() => handleSelectFacility(facility)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                    active
                      ? 'bg-white border-[#0E5A36] shadow-xs'
                      : 'bg-transparent border-transparent hover:bg-white hover:border-[#E2E8E2]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-[#0F1F18] leading-snug">
                      {facility.name}
                    </span>
                    <MapPin
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        active ? 'text-[#0E5A36]' : 'text-[#899B90]'
                      }`}
                    />
                  </div>
                  <div className="text-xs text-[#4A5D54] mt-1">
                    {facility.category} · {facility.hours}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E2E8E2]">
          <div className="text-xs text-[#4A5D54] leading-relaxed mb-3">
            {campusPlaceMeta?.formattedAddress || address}
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackInteraction('map_interact', 'External Google Maps Directions')}
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-semibold text-white bg-[#0E5A36] hover:bg-[#093E25] rounded-lg transition-colors whitespace-nowrap"
          >
            <Navigation className="w-3.5 h-3.5" />
            Get Directions in Google Maps
          </a>
        </div>
      </div>

      {/* Right Interactive Google Map */}
      <div className="lg:col-span-8 relative h-[460px] lg:h-[560px] w-full bg-[#EAEFE9]">
        {/* Layer toggle */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 p-1 bg-white/95 backdrop-blur-xs border border-[#D4DDD6] rounded-lg shadow-xs">
          <button
            type="button"
            onClick={() => setMapTypeId('roadmap')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mapTypeId === 'roadmap'
                ? 'bg-[#0E5A36] text-white'
                : 'text-[#4A5D54] hover:text-[#0F1F18]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Street Map
          </button>
          <button
            type="button"
            onClick={() => setMapTypeId('hybrid')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              mapTypeId === 'hybrid'
                ? 'bg-[#0E5A36] text-white'
                : 'text-[#4A5D54] hover:text-[#0F1F18]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Satellite
          </button>
        </div>

        <GoogleMap
          mapId="DEMO_MAP_ID"
          defaultZoom={16}
          defaultCenter={MAKASSAR_DAYA_DEFAULT}
          mapTypeId={mapTypeId}
          gestureHandling="cooperative"
          streetViewControl={true}
          fullscreenControl={true}
          mapTypeControl={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {CAMPUS_FACILITIES.map((facility) => (
            <FacilityMarker
              key={facility.id}
              facility={facility}
              position={{
                lat: campusAnchor.lat + facility.offsetLat,
                lng: campusAnchor.lng + facility.offsetLng,
              }}
              isSelected={selectedFacilityId === facility.id}
              onSelect={() => handleSelectFacility(facility)}
              onClose={() => setSelectedFacilityId(null)}
            />
          ))}

          {nearbyResults.map((place) => (
            <PlaceSearchMarker
              key={place.id}
              place={place}
              isSelected={selectedPlaceId === place.id}
              onSelect={() => {
                setSelectedFacilityId(null);
                setSelectedPlaceId(place.id);
              }}
              onClose={() => setSelectedPlaceId(null)}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
};

export const InteractiveCampusMap: React.FC = () => {
  const { siteSettings } = useCampus();

  if (!MAPS_API_KEY) {
    return (
      <div className="border border-[#E2E8E2] rounded-xl p-8 bg-white text-center">
        <MapPin className="w-8 h-8 text-[#0E5A36] mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-[#0F1F18] mb-2">
          Interactive Campus Map Configuration Pending
        </h3>
        <p className="text-sm text-[#4A5D54] max-w-md mx-auto mb-4">
          {siteSettings.address}
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('STAI Al-Furqan Makassar')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0E5A36] rounded-lg hover:bg-[#093E25]"
        >
          Open Campus Location in Google Maps
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={MAPS_API_KEY}
      libraries={['marker', 'places']}
      language="en"
      region="ID"
    >
      <CampusMapWorkspace address={siteSettings.address} />
    </APIProvider>
  );
};
