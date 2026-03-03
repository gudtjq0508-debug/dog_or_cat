// Teachable Machine model URL
const URL = "https://teachablemachine.withgoogle.com/models/o97un9Pz8/";

let model, maxPredictions;

// Load the image model
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Model loaded successfully");
    } catch (error) {
        console.error("Error loading model:", error);
    }
}

// Initialize the model
init();

// DOM Elements
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const uploadArea = document.getElementById('upload-area');
const imagePreview = document.getElementById('upload-image');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const loadingArea = document.getElementById('loading');
const resultContainer = document.getElementById('result-container');
const retryBtn = document.getElementById('retry-btn');

// Progress bars and percents
const dogBar = document.getElementById('dog-bar');
const catBar = document.getElementById('cat-bar');
const dogPercent = document.getElementById('dog-percent');
const catPercent = document.getElementById('cat-percent');
const resultMessage = document.getElementById('result-message');

// Event Listeners
uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImage(file);
    }
});

// Drag and drop handling
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary-color)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ddd';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImage(file);
    }
});

retryBtn.addEventListener('click', () => {
    location.reload();
});

async function handleImage(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
        
        // Hide upload container and show loading
        uploadArea.style.display = 'none';
        loadingArea.style.display = 'block';
        
        // Give some time for UI to update
        setTimeout(async () => {
            await predict();
        }, 500);
    };
    reader.readAsDataURL(file);
}

async function predict() {
    if (!model) {
        alert("모델이 아직 로드되지 않았습니다. 잠시만 기다려주세요.");
        return;
    }

    const prediction = await model.predict(imagePreview);
    
    // Sort and find dog/cat
    let dogScore = 0;
    let catScore = 0;

    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = prediction[i].probability.toFixed(2);
        
        if (className === "dog") dogScore = probability * 100;
        if (className === "cat") catScore = probability * 100;
    }

    // Update UI
    loadingArea.style.display = 'none';
    resultContainer.style.display = 'block';

    dogBar.style.width = dogScore + "%";
    dogPercent.innerText = Math.round(dogScore) + "%";
    
    catBar.style.width = catScore + "%";
    catPercent.innerText = Math.round(catScore) + "%";

    // Result message
    if (dogScore > catScore) {
        resultMessage.innerText = `당신은 귀여운 "강아지상"입니다! 🐶\n따뜻하고 친근한 인상을 주시네요.`;
    } else if (catScore > dogScore) {
        resultMessage.innerText = `당신은 매력적인 "고양이상"입니다! 🐱\n도도하고 세련된 인상을 주시네요.`;
    } else {
        resultMessage.innerText = `당신은 오묘한 매력을 가진 얼굴이시군요! ✨`;
    }
}
