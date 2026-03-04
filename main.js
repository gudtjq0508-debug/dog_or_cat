// Teachable Machine model URL
const URL = "https://teachablemachine.withgoogle.com/models/r2cDICYbm/";

let model, maxPredictions;
let labels = { dog: [], cat: [] };

// Load the image model
async function init() {
    try {
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        maxPredictions = model.getTotalClasses();
        
        // 모델의 실제 라벨 분석 (한글/영문 모두 대응)
        const metadata = await (await fetch(URL + "metadata.json")).json();
        metadata.labels.forEach((label, index) => {
            const l = label.toLowerCase();
            if (l.includes('강아지') || l.includes('dog')) labels.dog.push(label);
            if (l.includes('고양이') || l.includes('cat')) labels.cat.push(label);
        });
        
        console.log("AI Model Ready. Labels mapped:", labels);
    } catch (e) {
        console.error("Model load failed", e);
    }
}
init();

// DOM Elements
const elements = {
    fileInput: document.getElementById('file-input'),
    uploadBtn: document.getElementById('upload-btn'),
    uploadArea: document.getElementById('upload-area'),
    imagePreview: document.getElementById('upload-image'),
    uploadPlaceholder: document.getElementById('upload-placeholder'),
    uploadSection: document.getElementById('upload-section'),
    loadingSection: document.getElementById('loading-section'),
    resultSection: document.getElementById('result-section'),
    dogScore: document.getElementById('dog-score'),
    catScore: document.getElementById('cat-score'),
    dogBar: document.getElementById('dog-bar'),
    catBar: document.getElementById('cat-bar'),
    mainTitle: document.getElementById('main-animal-title'),
    subDesc: document.getElementById('sub-animal-desc'),
    traitList: document.getElementById('trait-list'),
    retryBtn: document.getElementById('retry-btn'),
    loadingMsg: document.getElementById('loading-msg')
};

// Analysis Data
const analysisResults = {
    dog: {
        title: "친근하고 귀여운 '강아지상'",
        desc: "보는 사람을 무장해제 시키는 따뜻한 인상",
        traits: [
            "눈매가 부드럽고 선한 느낌을 줍니다.",
            "웃을 때 입매가 시원하여 호감도가 매우 높습니다.",
            "상대방에게 편안함과 신뢰를 주는 분위기입니다.",
            "다정다감하고 사교적인 성격으로 보일 확률이 높습니다."
        ]
    },
    cat: {
        title: "도도하고 세련된 '고양이상'",
        desc: "신비롭고 날카로운 지적 매력이 돋보이는 얼굴",
        traits: [
            "눈꼬리가 살짝 올라가 있어 세련된 인상을 줍니다.",
            "자기주관이 뚜렷하고 도도한 분위기를 풍깁니다.",
            "이목구비가 뚜렷하여 도시적이고 시크한 느낌입니다.",
            "처음에는 차가워 보일 수 있으나 알수록 깊은 매력이 있습니다."
        ]
    },
    unknown: {
        title: "오묘한 매력의 소유자",
        desc: "어느 한 범주로 정의할 수 없는 유니크한 얼굴",
        traits: [
            "여러 동물의 매력이 섞여있는 개성 넘치는 얼굴입니다.",
            "사진의 각도나 조명에 따라 다양한 분위기를 냅니다.",
            "정면 사진으로 다시 한번 테스트해보시길 권장합니다."
        ]
    }
};

// Event Listeners
elements.uploadBtn.addEventListener('click', () => elements.fileInput.click());

elements.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

elements.uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadArea.style.borderColor = 'var(--primary)';
});

elements.uploadArea.addEventListener('dragleave', () => {
    elements.uploadArea.style.borderColor = '#d1d5db';
});

elements.uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
});

elements.retryBtn.addEventListener('click', () => {
    elements.resultSection.style.display = 'none';
    elements.uploadSection.style.display = 'block';
    elements.imagePreview.style.display = 'none';
    elements.uploadPlaceholder.style.display = 'block';
    elements.fileInput.value = '';
});

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.imagePreview.src = e.target.result;
        elements.imagePreview.style.display = 'block';
        elements.uploadPlaceholder.style.display = 'none';
        startAnalysis();
    };
    reader.readAsDataURL(file);
}

async function startAnalysis() {
    elements.uploadSection.style.display = 'none';
    elements.loadingSection.style.display = 'block';
    
    const steps = ["얼굴 윤곽 스캔 중...", "특징점 추출 중...", "AI 알고리즘 분석 중..."];
    for (let step of steps) {
        elements.loadingMsg.innerText = step;
        await new Promise(r => setTimeout(r, 600));
    }

    predict();
}

async function predict() {
    if (!model) return alert("모델 로딩 중입니다. 잠시만 기다려주세요.");
    
    const prediction = await model.predict(elements.imagePreview);
    
    let dogProb = 0;
    let catProb = 0;

    prediction.forEach(p => {
        if (labels.dog.includes(p.className)) dogProb += p.probability;
        if (labels.cat.includes(p.className)) catProb += p.probability;
    });

    const dog = dogProb * 100;
    const cat = catProb * 100;

    // UI Update
    elements.loadingSection.style.display = 'none';
    elements.resultSection.style.display = 'block';

    // Reset and Animate Bars
    elements.dogBar.style.width = "0%";
    elements.catBar.style.width = "0%";
    
    setTimeout(() => {
        elements.dogBar.style.width = dog + "%";
        elements.catBar.style.width = cat + "%";
        elements.dogScore.innerText = Math.round(dog) + "%";
        elements.catScore.innerText = Math.round(cat) + "%";
    }, 200);

    // Final Result Logic
    let finalType = 'unknown';
    if (Math.abs(dog - cat) < 5) {
        finalType = 'unknown'; // 두 점수 차이가 5% 미만이면 오묘함으로 처리
    } else {
        finalType = dog > cat ? 'dog' : 'cat';
    }

    const result = analysisResults[finalType];
    elements.mainTitle.innerText = finalType === 'unknown' ? result.title : `당신은 ${result.title}!`;
    elements.subDesc.innerText = result.desc;
    elements.traitList.innerHTML = result.traits.map(t => `<li>${t}</li>`).join('');
}
