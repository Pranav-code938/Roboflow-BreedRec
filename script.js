// ============================================
// 🔧 CONFIGURATION - PASTE YOUR API DETAILS HERE
// ============================================
const API_URL = "https://serverless.roboflow.com/breedrecognition-1albo/1"; 
const API_KEY = "bxfNUAG0fFZGcEggBdve"; 
// ============================================

// Application state
let currentImage = null;

// Translation dictionary
const translations = {
    "instructions-title": {
        "hi": "📋 अच्छी तस्वीर कैसे लें",
        "bn": "📋 কিভাবে একটি ভাল ছবি তুলতে হয়",
        "ta": "📋 நல்ல புகைப்படம் எப்படி எடுக்கலாம்",
        "te": "📋 మంచి ఫోటో ఎలా తీయాలి",
        "mr": "📋 चांगला फोटो कसा काढावा",
        "gu": "📋 સારો ફોટો કેવી રીતે લેવો",
        "kn": "📋 ಉತ್ತಮ ಫೋಟೋ ಹೇಗೆ ತೆಗೆಯುವುದು",
        "ml": "📋 നല്ല ഫോട്ടോ എങ്ങനെ എടുക്കാം",
        "pa": "📋 ਚੰਗੀ ਫੋਟੋ ਕਿਵੇਂ ਲਵੋ",
        "ur": "📋 اچھی تصویر کیسے لیں"
    },
    "instruction-1": {
        "hi": "3-5 फीट दूरी से फोटो लें",
        "bn": "৩-৫ ফুট দূরত্ব থেকে ফটো তুলুন",
        "ta": "3-5 அடி தூரத்திலிருந்து புகைப்படம் எடுக்கவும்",
        "te": "3-5 అడుగుల దూరం నుండి ఫోటో తీయండి",
        "mr": "3-5 फूट अंतरावरून फोटो काढा",
        "gu": "3-5 ફૂટ દૂરથી ફોટો લો",
        "kn": "3-5 ಅಡಿ ದೂರದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ",
        "ml": "3-5 അടി അകലത്തിൽ നിന്ന് ഫോട്ടോ എടുക്കുക",
        "pa": "3-5 ਫੁੱਟ ਦੂਰੀ ਤੋਂ ਫੋਟੋ ਲਵੋ",
        "ur": "3-5 فٹ کی دوری سے تصویر لیں"
    },
    "instruction-2": {
        "hi": "अच्छी रोशनी का इस्तेमाल करें",
        "bn": "ভাল আলো ব্যবহার করুন",
        "ta": "நல்ல வெளிச்சத்தைப் பயன்படுத்தவும்",
        "te": "మంచి వెలుతురును ఉపయోగించండి",
        "mr": "चांगला प्रकाश वापरा",
        "gu": "સારી પ્રકાશનો ઉપયોગ કરો",
        "kn": "ಉತ್ತಮ ಬೆಳಕನ್ನು ಬಳಸಿ",
        "ml": "നല്ല വെളിച്ചം ഉപയോഗിക്കുക",
        "pa": "ਚੰਗੀ ਰੌਸ਼ਨੀ ਵਰਤੋ",
        "ur": "اچھی روشنی استعمال کریں"
    },
    "camera-btn": {
        "hi": "📷 फोटो खींचें",
        "bn": "📷 ছবি তুলুন",
        "ta": "📷 புகைப்படம் எடுங்கள்",
        "te": "📷 ఫోటో తీయండి",
        "mr": "📷 फोटो काढा",
        "gu": "📷 ફોટો લો",
        "kn": "📷 ಫೋಟೋ ತೆಗೆಯಿರಿ",
        "ml": "📷 ഫോട്ടോ എടുക്കുക",
        "pa": "📷 ਫੋਟੋ ਲਵੋ",
        "ur": "📷 تصویر لیں"
    }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadSavedLanguage();
});

// Change language function
function changeLanguage() {
    const select = document.getElementById('language-select');
    const selectedLang = select.value;
    
    // Translate elements
    for (const elementId in translations) {
        const element = document.getElementById(elementId);
        if (element && translations[elementId][selectedLang]) {
            element.textContent = translations[elementId][selectedLang];
        }
    }
    
    // Save language preference
    localStorage.setItem('preferred_language', selectedLang);
}

// Load saved language
function loadSavedLanguage() {
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang && savedLang !== 'en') {
        document.getElementById('language-select').value = savedLang;
        changeLanguage();
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Camera and gallery buttons
    document.getElementById('camera-btn').addEventListener('click', () => {
        document.getElementById('camera-input').click();
    });
    
    document.getElementById('gallery-btn').addEventListener('click', () => {
        document.getElementById('gallery-input').click();
    });
    
    // File input handlers
    document.getElementById('camera-input').addEventListener('change', handleFileSelect);
    document.getElementById('gallery-input').addEventListener('change', handleFileSelect);
    
    // Action buttons
    document.getElementById('scan-btn').addEventListener('click', scanImage);
    document.getElementById('retake-btn').addEventListener('click', resetToUpload);
    document.getElementById('new-scan-btn').addEventListener('click', resetToUpload);
    document.getElementById('retry-btn').addEventListener('click', hideError);
}

// Handle file selection from camera or gallery
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        currentImage = file;
        showImagePreview(file);
    } else {
        showError('Please select a valid image file.');
    }
}

// Show image preview
function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImage = document.getElementById('preview-image');
        const previewArea = document.getElementById('preview-area');
        
        previewImage.src = e.target.result;
        previewArea.style.display = 'block';
        
        // Hide other sections
        hideError();
        hideResults();
    };
    reader.readAsDataURL(file);
}

// Scan the image using Roboflow API
async function scanImage() {
    if (!currentImage) {
        showError('No image selected. Please take a photo or upload an image first.');
        return;
    }
    
    // Validate API configuration
    if (!API_URL || API_URL.includes('YOUR_') || !API_KEY || API_KEY.includes('YOUR_')) {
        showError('API configuration missing. Please check the script.js file and add your Roboflow API details.');
        return;
    }
    
    showLoading(true);
    
    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('file', currentImage);
        
        // Call Roboflow API
        const response = await fetch(`${API_URL}?api_key=${API_KEY}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Process predictions
        if (data.predictions && data.predictions.length > 0) {
            displayResults(data.predictions);
        } else {
            showError('No breed could be identified. Please try with a clearer image of the animal.');
        }
        
    } catch (error) {
        console.error('Scan error:', error);
        showError(`Failed to identify breed: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Display prediction results
function displayResults(predictions) {
    // Sort predictions by confidence and get top 3
    const sortedPredictions = predictions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
    
    const predictionsContainer = document.getElementById('predictions');
    predictionsContainer.innerHTML = '';
    
    sortedPredictions.forEach((prediction, index) => {
        const confidence = Math.round(prediction.confidence * 100);
        const predictionElement = createPredictionElement(
            prediction.class, 
            confidence, 
            index + 1,
            getBreedType(prediction.class)
        );
        predictionsContainer.appendChild(predictionElement);
    });
    
    // Show results section
    document.getElementById('results-section').style.display = 'block';
    
    // Scroll to results
    document.getElementById('results-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Create a prediction result element
function createPredictionElement(breedName, confidence, rank, breedType) {
    const element = document.createElement('div');
    element.className = `prediction-item rank-${rank}`;
    
    element.innerHTML = `
        <div class="rank-badge">${rank}</div>
        <div class="breed-info">
            <div class="breed-name">${breedName}</div>
            <div class="breed-type">${breedType}</div>
        </div>
        <div class="confidence">${confidence}%</div>
    `;
    
    return element;
}

// Get breed type (cattle or buffalo)
function getBreedType(breedName) {
    const buffaloBreeds = [
        'Murrah', 'Nili Ravi', 'Mehsana', 'Jaffrabadi', 
        'Bhadawari', 'Surti', 'Nagpuri'
    ];
    
    return buffaloBreeds.includes(breedName) ? 'Buffalo' : 'Cattle';
}

// Show/hide loading state
function showLoading(show) {
    const loading = document.getElementById('loading');
    const previewArea = document.getElementById('preview-area');
    
    if (show) {
        loading.style.display = 'block';
        previewArea.style.display = 'none';
        hideError();
        hideResults();
    } else {
        loading.style.display = 'none';
        previewArea.style.display = 'block';
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    errorText.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide other sections
    hideResults();
    showLoading(false);
}

// Hide error message
function hideError() {
    document.getElementById('error-message').style.display = 'none';
}

// Hide results section
function hideResults() {
    document.getElementById('results-section').style.display = 'none';
}

// Reset to upload state
function resetToUpload() {
    currentImage = null;
    
    // Reset file inputs
    document.getElementById('camera-input').value = '';
    document.getElementById('gallery-input').value = '';
    
    // Hide all sections except upload
    document.getElementById('preview-area').style.display = 'none';
    showLoading(false);
    hideError();
    hideResults();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
