/**
 * Configuration for Sign pages
 * This file contains all configuration settings for authentication pages
 */

// API Configuration
window.API_CONFIG = {
    // API Base URL - can be overridden by environment variables
    API_BASE_URL: 'https://adata.test.api.stroyka.kz',
    
    // Auth endpoints
    AUTH_CALLBACK_ENDPOINT: '/api/v1/aitu/callback',
    
    // Redirect URLs
    SUCCESS_REDIRECT_URL: '/sign/success',
    ERROR_REDIRECT_URL: '/sign/error',
    
    // Timeouts
    REQUEST_TIMEOUT: 30000, // 30 seconds
    REDIRECT_DELAY: 2000,   // 2 seconds
};

// Function to get API base URL with environment variable support
function getApiBaseUrl() {
    // Check if API_BASE_URL is set via environment variable
    if (typeof window !== 'undefined' && window.API_BASE_URL) {
        console.log('Using API_BASE_URL from window:', window.API_BASE_URL);
        return window.API_BASE_URL;
    }
    
    // Check if it's set via meta tag
    const metaTag = document.querySelector('meta[name="api-base-url"]');
    if (metaTag && metaTag.content) {
        console.log('Using API_BASE_URL from meta tag:', metaTag.content);
        return metaTag.content;
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

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getApiBaseUrl,
        getApiUrl,
        API_CONFIG: window.API_CONFIG
    };
} 