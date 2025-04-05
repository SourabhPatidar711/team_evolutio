import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge classes with tailwind-merge
 * @param {Array} inputs - The classes to merge
 * @returns {string} The merged classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date with Intl.DateTimeFormat
 * @param {string|Date} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} The formatted date
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  };

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    ...options
  }).format(dateObj);
}

/**
 * Format a number with Intl.NumberFormat
 * @param {number} number - The number to format
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} The formatted number
 */
export function formatNumber(number, options = {}) {
  return new Intl.NumberFormat('en-US', options).format(number);
}

/**
 * Get a color for a severity level
 * @param {string} severity - The severity level (critical, high, moderate, low)
 * @returns {string} The color for the severity
 */
export function getSeverityColor(severity) {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return '#DC2626'; // red-600
    case 'high':
      return '#EA580C'; // orange-600
    case 'warning':
    case 'moderate':
      return '#D97706'; // amber-600
    case 'low':
      return '#059669'; // emerald-600
    case 'info':
      return '#2563EB'; // blue-600
    default:
      return '#6B7280'; // gray-500
  }
}

/**
 * Truncate a string to a maximum length
 * @param {string} str - The string to truncate
 * @param {number} length - The maximum length
 * @returns {string} The truncated string
 */
export function truncate(str, length = 100) {
  if (!str) return '';
  
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

/**
 * Debounce a function
 * @param {Function} fn - The function to debounce
 * @param {number} ms - The debounce delay in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(fn, ms = 300) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, ms);
  };
}

/**
 * Throttle a function
 * @param {Function} fn - The function to throttle
 * @param {number} ms - The throttle delay in milliseconds
 * @returns {Function} The throttled function
 */
export function throttle(fn, ms = 300) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastTime >= ms) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

/**
 * Generate a random ID
 * @param {number} length - The ID length
 * @returns {string} The random ID
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Calculate distance between two coordinates in kilometers
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
function deg2rad(deg) {
  return deg * (Math.PI/180);
}

/**
 * Sort an array of objects by a key
 * @param {Array} array - The array to sort
 * @param {string} key - The key to sort by
 * @param {string} direction - The sort direction (asc or desc)
 * @returns {Array} The sorted array
 */
export function sortArrayByKey(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Group an array of objects by a key
 * @param {Array} array - The array to group
 * @param {string} key - The key to group by
 * @returns {Object} The grouped object
 */
export function groupArrayByKey(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}