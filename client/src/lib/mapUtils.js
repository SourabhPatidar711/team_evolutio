import L from 'leaflet';

/**
 * Get a color for a disaster type
 * @param {string} type - The disaster type
 * @returns {string} A color hex code
 */
export const getDisasterColor = (type) => {
  type = type?.toLowerCase();
  switch (type) {
    case 'fire':
    case 'wildfire':
      return '#DC2626'; // red-600
    case 'flood':
    case 'flooding':
      return '#2563EB'; // blue-600
    case 'storm':
    case 'hurricane':
    case 'tornado':
      return '#7C3AED'; // purple-600
    case 'earthquake':
      return '#EA580C'; // orange-600
    case 'drought':
      return '#CA8A04'; // yellow-600
    case 'landslide':
      return '#65A30D'; // lime-600
    case 'tsunami':
      return '#0891B2'; // cyan-600
    case 'extreme-cold':
    case 'winter-storm':
      return '#A1A1AA'; // zinc-400
    default:
      return '#6B7280'; // gray-500
  }
};

/**
 * Create a Leaflet icon based on disaster type
 * @param {string} type - The disaster type
 * @returns {L.DivIcon} A Leaflet icon
 */
export const createDisasterIcon = (type) => {
  const color = getDisasterColor(type);
  
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24px" height="24px">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });
};

/**
 * Parse coordinates from string or array
 * @param {string|Array} coords - Coordinates in string "lat,lng" format or array format
 * @returns {Array|null} Array of coordinates or null if invalid
 */
export const parseCoordinates = (coords) => {
  if (!coords) return null;
  
  // Handle array of coordinates (for polygons)
  if (Array.isArray(coords)) {
    return coords.map(point => {
      if (Array.isArray(point) && point.length >= 2) {
        return [point[0], point[1]];
      } else if (typeof point === 'string') {
        return parseCoordinates(point);
      }
      return null;
    }).filter(Boolean);
  }
  
  // Handle string format
  if (typeof coords === 'string') {
    // Check if it's a GeoJSON string
    try {
      const geoJson = JSON.parse(coords);
      
      // Handle GeoJSON Polygon
      if (geoJson.type === 'Polygon' && Array.isArray(geoJson.coordinates) && geoJson.coordinates.length > 0) {
        // Convert GeoJSON format [lng, lat] to Leaflet format [lat, lng]
        return geoJson.coordinates[0].map(point => [point[1], point[0]]);
      }
      
      // Handle GeoJSON Point
      if (geoJson.type === 'Point' && Array.isArray(geoJson.coordinates) && geoJson.coordinates.length >= 2) {
        // Convert GeoJSON format [lng, lat] to Leaflet format [lat, lng]
        return [[geoJson.coordinates[1], geoJson.coordinates[0]]];
      }
    } catch (e) {
      // Not valid JSON, try parsing as comma-separated string
    }
    
    // Simple lat,lng format
    const parts = coords.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
    if (parts.length >= 2) {
      return [parts[0], parts[1]];
    }
  }
  
  return null;
};

/**
 * Calculate the bounding box for a set of coordinates
 * @param {Array} coordinates - Array of coordinates
 * @returns {L.LatLngBounds|null} Leaflet bounds object or null if invalid
 */
export const getBoundsFromCoordinates = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return null;
  }
  
  let bounds = L.latLngBounds();
  
  if (Array.isArray(coordinates[0])) {
    // Handle polygon or polyline coordinates
    coordinates.forEach(point => {
      if (Array.isArray(point) && point.length >= 2) {
        bounds.extend(L.latLng(point[0], point[1]));
      }
    });
  } else if (coordinates.length >= 2) {
    // Handle single point
    bounds.extend(L.latLng(coordinates[0], coordinates[1]));
  }
  
  return bounds.isValid() ? bounds : null;
};

/**
 * Create a circle marker with radius based on affected area
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Radius in km
 * @param {string} color - Color for the circle
 * @returns {L.Circle} Leaflet circle
 */
export const createAreaCircle = (lat, lng, radius, color) => {
  return L.circle([lat, lng], {
    radius: radius * 1000, // Convert km to meters
    color: color,
    fillColor: color,
    fillOpacity: 0.2,
    weight: 1
  });
};

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} Formatted coordinates
 */
export const formatCoordinates = (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return 'Unknown location';
  }
  
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
};