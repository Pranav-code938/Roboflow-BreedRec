// ============================================
// 🔧 CONFIGURATION - PASTE YOUR API DETAILS HERE
// ============================================
const API_URL = "https://serverless.roboflow.com/breedrecognition-1albo/1"; // Example: "https://serverless.roboflow.com/your-project/1"
const API_KEY = "bxfNUAG0fFZGcEggBdve"; // Example: "your-api-key-from-roboflow"
// ============================================

// Application state
let currentImage = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

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
    hideLoading();
    hideError();
    hideResults();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
