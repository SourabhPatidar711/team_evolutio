/**
 * @typedef {Object} User
 * @property {number} id - User ID
 * @property {string} username - Username
 * @property {string} email - Email address
 * @property {string} role - User role
 * @property {Date} createdAt - Creation date
 */

/**
 * @typedef {Object} Disaster
 * @property {number} id - Disaster ID
 * @property {string} name - Disaster name
 * @property {string} type - Disaster type (fire, flood, earthquake, etc.)
 * @property {string} description - Disaster description
 * @property {string} status - Disaster status (active, resolved, monitoring)
 * @property {string} severity - Severity level (critical, high, moderate, low)
 * @property {number} latitude - Latitude coordinate
 * @property {number} longitude - Longitude coordinate
 * @property {string} location - Human-readable location description
 * @property {Date} startDate - Disaster start date
 * @property {Date|null} endDate - Disaster end date
 * @property {Date} createdAt - Record creation date
 * @property {Date|null} updatedAt - Record update date
 */

/**
 * @typedef {Object} Prediction
 * @property {number} id - Prediction ID
 * @property {string} disasterType - Predicted disaster type
 * @property {string} location - Predicted location
 * @property {number} latitude - Latitude coordinate
 * @property {number} longitude - Longitude coordinate
 * @property {string} severity - Predicted severity
 * @property {number} probability - Probability percentage
 * @property {string} details - Prediction details
 * @property {Date} predictedTime - Predicted occurrence time
 * @property {Date} createdAt - Prediction creation date
 */

/**
 * @typedef {Object} Report
 * @property {number} id - Report ID
 * @property {string} title - Report title
 * @property {string} description - Report description
 * @property {string} location - Report location
 * @property {number} latitude - Latitude coordinate
 * @property {number} longitude - Longitude coordinate
 * @property {number} disasterId - Related disaster ID
 * @property {string} status - Report status (verified, unverified, rejected)
 * @property {string} source - Report source (citizen, responder, agency, media)
 * @property {string|null} image - Base64 encoded image or image URL
 * @property {Date} createdAt - Report creation date
 * @property {Date|null} updatedAt - Report update date
 */

/**
 * @typedef {Object} Alert
 * @property {number} id - Alert ID
 * @property {string} title - Alert title
 * @property {string} message - Alert message
 * @property {string} area - Affected area description
 * @property {string} severity - Alert severity (critical, warning, info)
 * @property {boolean} active - Alert active status
 * @property {number} disasterId - Related disaster ID
 * @property {Date} createdAt - Alert creation date
 * @property {Date|null} updatedAt - Alert update date
 */

/**
 * @typedef {Object} EvacuationZone
 * @property {number} id - Evacuation zone ID
 * @property {string} name - Zone name
 * @property {string} description - Zone description
 * @property {string} location - Coordinates as string "lat,lng"
 * @property {number} disasterId - Related disaster ID
 * @property {string} priority - Evacuation priority (critical, warning, advisory)
 * @property {boolean} active - Zone active status
 * @property {Date} createdAt - Zone creation date
 * @property {Date|null} updatedAt - Zone update date
 */

/**
 * @typedef {Object} Resource
 * @property {number} id - Resource ID
 * @property {string} name - Resource name
 * @property {string} type - Resource type (medical, shelter, transport, supplies)
 * @property {string} description - Resource description
 * @property {string} location - Resource location
 * @property {number|null} disasterId - Related disaster ID
 * @property {string} status - Resource status (available, en-route, depleted)
 * @property {number} quantity - Resource quantity
 * @property {string|null} contact - Contact information
 * @property {Date} createdAt - Resource creation date
 * @property {Date|null} updatedAt - Resource update date
 */