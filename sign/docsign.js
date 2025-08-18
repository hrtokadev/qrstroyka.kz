/**
 * Document Signing Logic
 * This file contains all the logic for the document signing page
 */

// API Configuration
window.DOCSIGN_CONFIG = {
    // API Base URL - can be overridden by environment variables
    //API_BASE_URL: 'http://localhost:8080',
    API_BASE_URL: 'https://cmr.test.api.stroyka.kz',
    
    // Endpoints
    SIGNATORY_ENDPOINT: '/rest/api/v1/aitu/sign-applications/by-signatory/',
    SIGNING_ENDPOINT: '/rest/api/v1/aitu/signable-pdf/',
    
    // Timeouts
    REQUEST_TIMEOUT: 30000, // 30 seconds
};

// Function to get API base URL with environment variable support
function getDocSignApiBaseUrl() {
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
    console.log('Using default API_BASE_URL:', window.DOCSIGN_CONFIG.API_BASE_URL);
    return window.DOCSIGN_CONFIG.API_BASE_URL;
}

// Function to get full API URL
function getDocSignApiUrl(endpoint) {
    const baseUrl = getDocSignApiBaseUrl();
    return `${baseUrl}${endpoint}`;
}

// Function to extract UUID from URL path
function getSignatoryIdFromPath() {
    const path = window.location.pathname;
    const match = path.match(/\/sign\/document\/([^\/]+)$/);
    return match ? match[1] : null;
}

// Function to fetch signatory data
async function fetchSignatoryData(signatoryId) {
    try {
        const url = getDocSignApiUrl(window.DOCSIGN_CONFIG.SIGNATORY_ENDPOINT + signatoryId);
        console.log('Fetching signatory data from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: window.DOCSIGN_CONFIG.REQUEST_TIMEOUT
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Signatory data received:', data);
        return data;
    } catch (error) {
        console.error('Error fetching signatory data:', error);
        throw error;
    }
}

// Function to format date
function formatDate(dateString) {
    if (!dateString) return 'Не указано';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Не указано';
    }
}

// Language translations
const translations = {
    ru: {
        LLP: 'Юр. лицо',
        Person: 'Физ. лицо',
        iinBin: 'ИИН/БИН',
        iin: 'ИИН',
        notSpecified: 'Не указано',
        phone: 'Телефон',
        signedAt: 'Подписано',
        signButton: 'Подписать документ',
        signers: 'Подписанты',
        documentToSign: 'Документ для подписи',
        created: 'Создан',
        useApp: 'Для подписания документа используйте приложение Stroyka.kz',
        loading: 'Загрузка документа...',
        error: 'Ошибка',
        retry: 'Повторить',
        preparingSignature: 'Подготовка подписи...',
        downloadDoc: 'Скачать документ',
        openInNewWindow: 'Открыть документ в новом окне',
        signLinkNotReceived: 'Ссылка для подписи не получена',
        signingError: 'Ошибка при инициации подписи. Пожалуйста, попробуйте позже.',
        loadError: 'Не удалось загрузить документ. Пожалуйста, попробуйте позже.',
        signStates: {
            SIGNED: 'Подписано',
            PENDING: 'Ожидает подписи',
            REJECTED: 'Отклонено',
            EXPIRED: 'Истекло'
        }
    },
    kk: {
        LLP: 'Заңды тұлға',
        Person: 'Жеке тұлға',
        iinBin: 'ЖСН/БСН',
        iin: 'ЖСН',
        notSpecified: 'Көрсетілмеген',
        phone: 'Телефон',
        signedAt: 'Қол қойылды',
        signButton: 'Құжатқа қол қою',
        signers: 'Қол қоюшылар',
        documentToSign: 'Қол қою үшін құжат',
        created: 'Құрылған',
        useApp: 'Құжатқа қол қою үшін Stroyka.kz қосымшасын пайдаланыңыз',
        loading: 'Құжат жүктелуде...',
        error: 'Қате',
        retry: 'Қайталау',
        preparingSignature: 'Қолтаңба дайындалуда...',
        downloadDoc: 'Құжатты жүктеу',
        openInNewWindow: 'Құжатты жаңа терезеде ашу',
        signLinkNotReceived: 'Қол қою сілтемесі алынбады',
        signingError: 'Қол қою кезінде қате орын алды. Кейінірек қайталап көріңіз.',
        loadError: 'Құжатты жүктеу мүмкін болмады. Кейінірек қайталап көріңіз.',
        signStates: {
            SIGNED: 'Қол қойылды',
            PENDING: 'Қол қою күтілуде',
            REJECTED: 'Қабылданбады',
            EXPIRED: 'Мерзімі өтті'
        }
    }
};

let currentLanguage = 'ru';

// Function to get translation
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Function to switch language
function switchLanguage(lang) {
    currentLanguage = lang;
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    // Re-render the page with new language
    initializeDocumentSigning();
}

// Function to get signer type and info
function getSignerInfo(signer) {
    if (signer.bin && signer.bin.trim() !== '') {
        return {
            type: t('LLP'),
            info: `${t('iinBin')}: ${signer.bin}`,
            name: signer.name || t('notSpecified')
        };
    } else {
        return {
            type: t('Person'),
            info: `${t('iin')}: ${signer.iin || t('notSpecified')}`,
            name: signer.name || t('notSpecified')
        };
    }
}

// Function to get sign state text
function getSignStateText(signState) {
    return translations[currentLanguage].signStates[signState] || signState;
}

// Function to get sign state class
function getSignStateClass(signState) {
    const classMap = {
        'SIGNED': 'signed',
        'PENDING': 'pending',
        'REJECTED': 'rejected',
        'EXPIRED': 'expired'
    };
    return classMap[signState] || 'pending';
}

// Function to render the document signing page
function renderDocumentSigningPage(data) {
    const container = document.getElementById('documentContainer');
    let signatoryId = getSignatoryIdFromPath();

    if (!signatoryId) {
        signatoryId = "0198990b-c489-70b5-bba0-4bf6058bb068";
    }
    
    // Find current signer - the one whose ID matches the signatoryId in URL
    const currentSigner = data.signers.find(signer => signer.id === signatoryId);
    const isCurrentUserSigning = currentSigner !== undefined;
    
    // Get file info
    const fileInfo = data.signApplicationFile;
    
    // Sort signers - main signer first, then others
    const sortedSigners = [...data.signers].sort((a, b) => {
        if (a.isMainSigner && !b.isMainSigner) return -1;
        if (!a.isMainSigner && b.isMainSigner) return 1;
        return 0;
    });
    
    // Create HTML content
    let html = `
        <div class="signers-section">
            <h3>${t('signers')}</h3>
            <div class="signers-list">
    `;
    
    sortedSigners.forEach(signer => {
        const signerInfo = getSignerInfo(signer);
        const isCurrentSigner = signer.id === signatoryId;
        const signStateClass = getSignStateClass(signer.signState);
        const signStateText = getSignStateText(signer.signState);
        
        html += `
            <div class="signer-item ${isCurrentSigner ? 'current-signer' : ''} ${signStateClass}">
                <div class="signer-header">
                    <div class="signer-type">${signerInfo.type}</div>
                    <div class="sign-state ${signStateClass}">${signStateText}</div>
                </div>
                <div class="signer-details">
                    <div class="signer-name">${signerInfo.name}</div>
                    <div class="signer-id">${signerInfo.info}</div>
                    <div class="signer-phone">${t('phone')}: ${signer.phone || t('notSpecified')}</div>
                    ${signer.signedTime ? `<div class="signed-time">${t('signedAt')}: ${formatDate(signer.signedTime)}</div>` : ''}
                </div>
                ${isCurrentSigner && signer.signState === 'PENDING' ? `
                    <div class="sign-button-container">
                        <button onclick="initiateSigning('${signatoryId}')" class="sign-button">
                            ${t('signButton')}
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <div class="document-info">
            <h2>${t('documentToSign')}</h2>
            <div class="file-details">
                <div class="file-name">${fileInfo.fileName || t('notSpecified')}</div>
                <div class="file-date">${t('created')}: ${formatDate(data.createdDate)}</div>
            </div>
            <div class="pdf-viewer">
                <object data="${fileInfo.fileRefWithQr}" type="application/pdf" width="100%" height="600">
                    <p>${t('downloadDoc')} <a href="${fileInfo.fileRefWithQr}" target="_blank">${t('downloadDoc')}</a></p>
                </object>
                <div class="pdf-fallback">
                    <a href="${fileInfo.fileRefWithQr}" target="_blank" class="download-link">${t('openInNewWindow')}</a>
                </div>
            </div>
        </div>
        
        <div class="action-section">
            ${isCurrentUserSigning && currentSigner.signState === 'PENDING' ? `
                <div class="sign-action">
                    <p>${t('useApp')}</p>
                    <div class="app-buttons">
                        <a href="https://apps.apple.com/us/app/stroyka-kz/id6742178994" class="app-button app-store">
                            <svg class="store-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                            App Store
                        </a>
                        <a href="https://play.google.com/store/apps/details?id=kz.cmrhub" class="app-button play-store">
                            <svg class="store-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                            </svg>
                            Google Play
                        </a>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    container.innerHTML = html;
}

// Function to show error
function showError(message) {
    const container = document.getElementById('documentContainer');
    container.innerHTML = `
        <div class="error-container">
            <h2>${t('error')}</h2>
            <p>${message}</p>
            <button onclick="window.location.reload()" class="retry-button">${t('retry')}</button>
        </div>
    `;
}

// Function to show loading
function showLoading() {
    const container = document.getElementById('documentContainer');
    container.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>${t('loading')}</p>
        </div>
    `;
}

// Function to initiate signing process
async function initiateSigning(signatoryId) {
    try {
        // Show loading state
        const signButton = document.querySelector('.sign-button');
        if (signButton) {
            signButton.disabled = true;
            signButton.textContent = t('preparingSignature');
        }
        
        // Call the signing endpoint
        const url = getDocSignApiUrl(window.DOCSIGN_CONFIG.SIGNING_ENDPOINT + signatoryId + '/process');
        console.log('Initiating signing process:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: window.DOCSIGN_CONFIG.REQUEST_TIMEOUT
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Signing response received:', data);
        
        // Redirect to the sign link
        if (data.signLink) {
            window.location.href = data.signLink;
        } else {
            throw new Error(t('signLinkNotReceived'));
        }
        
    } catch (error) {
        console.error('Error initiating signing:', error);
        alert(t('signingError'));
        
        // Reset button state
        const signButton = document.querySelector('.sign-button');
        if (signButton) {
            signButton.disabled = false;
            signButton.textContent = t('signButton');
        }
    }
}

// Function to initialize language buttons
function initializeLanguageButtons() {
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchLanguage(btn.dataset.lang);
        });
    });
    
    // Set initial active state
    const activeButton = document.querySelector(`[data-lang="${currentLanguage}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Main initialization function
async function initializeDocumentSigning() {
    try {
        showLoading();
        
        let signatoryId = getSignatoryIdFromPath();
        if (!signatoryId) {
            signatoryId = "0198990b-c489-70b5-bba0-4bf6058bb068";
        }
        
        const data = await fetchSignatoryData(signatoryId);
        renderDocumentSigningPage(data);
        initializeLanguageButtons();
        
    } catch (error) {
        console.error('Error initializing document signing:', error);
        showError(t('loadError'));
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getDocSignApiBaseUrl,
        getDocSignApiUrl,
        getSignatoryIdFromPath,
        fetchSignatoryData,
        renderDocumentSigningPage,
        initializeDocumentSigning,
        initiateSigning
    };
}
