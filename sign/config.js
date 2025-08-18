/**
 * Configuration for Sign pages
 * This file contains all configuration settings for authentication pages
 */

// API Configuration
window.API_CONFIG = {
    // API Base URL - will be set by environment variables
    API_BASE_URL: window.ENV && window.ENV.API_BASE_URL || 'https://localhost:8393',
    
    // Notification API Base URL - will be set by environment variables
    NOTIFICATION_API_BASE_URL: window.ENV && window.ENV.NOTIFICATION_API_BASE_URL || 'https://notification.test.api.stroyka.kz',
    
    // Auth endpoints
    AUTH_CALLBACK_ENDPOINT: '/api/v1/aitu/callback',
    
    // Notification endpoints
    SMS_SEND_ENDPOINT: '/api/v1/sms/send',
    
    // Redirect URLs
    SUCCESS_REDIRECT_URL: '/sign/success',
    ERROR_REDIRECT_URL: '/sign/error',
    
    // Timeouts
    REQUEST_TIMEOUT: 30000, // 30 seconds
    REDIRECT_DELAY: 2000,   // 2 seconds
};

// Function to get API base URL with environment variable support
function getApiBaseUrl() {
    console.log('window.ENV:', window.ENV);
    
    // First check ENV configuration
    if (typeof window !== 'undefined' && window.ENV && window.ENV.API_BASE_URL) {
        console.log('Using API_BASE_URL from ENV:', window.ENV.API_BASE_URL);
        if (window.ENV.API_BASE_URL.includes('__API_BASE_URL__')) {
            console.log('Warning: Environment variable not properly replaced');
            return window.API_CONFIG.API_BASE_URL;
        }
        return window.ENV.API_BASE_URL;
    }
    
    // Return default
    console.log('Using default API_BASE_URL:', window.API_CONFIG.API_BASE_URL);
    return window.API_CONFIG.API_BASE_URL;
}

// Function to get full API URL
function getApiUrl(endpoint) {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}${endpoint}`;
}

// Function to get notification API base URL with environment variable support
function getNotificationApiBaseUrl() {
    // First check ENV configuration
    if (typeof window !== 'undefined' && window.ENV && window.ENV.NOTIFICATION_API_BASE_URL) {
        console.log('Using NOTIFICATION_API_BASE_URL from ENV:', window.ENV.NOTIFICATION_API_BASE_URL);
        return window.ENV.NOTIFICATION_API_BASE_URL;
    }
    
    // Return default
    console.log('Using default NOTIFICATION_API_BASE_URL:', window.API_CONFIG.NOTIFICATION_API_BASE_URL);
    return window.API_CONFIG.NOTIFICATION_API_BASE_URL;
}

// Function to get full notification API URL
function getNotificationApiUrl(endpoint) {
    const baseUrl = getNotificationApiBaseUrl();
    return `${baseUrl}${endpoint}`;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getApiBaseUrl,
        getApiUrl,
        getNotificationApiBaseUrl,
        getNotificationApiUrl,
        API_CONFIG: window.API_CONFIG
    };
} 