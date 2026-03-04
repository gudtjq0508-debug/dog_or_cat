// JoCoding's Animal Face Model (High accuracy, includes Rabbit, Fox, etc. but we filter for Dog/Cat)
const URL = "https://teachablemachine.withgoogle.com/models/hS948_r8L/";

let model, maxPredictions;

// Load the image model
async function init() {
    try {
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        maxPredictions = model.getTotalClasses();
        console.log("AI Model Ready. Classes:", maxPredictions);
    } catch (e) {
        console.error("Model load failed", e);
        alert("모델 로딩에 실패했습니다. 페이지를 새로고침 해주세요.");
    }
}
init();

// Analysis Data - More detailed for "Completeness"
const analysisResults = {
    dog: {
        title: "친근함의 대명사 '강아지상'",
        desc: "보는 사람을 미소 짓게 만드는 선한 매력의 소유자",
        traits: [
            "눈매가 동그랗고 부드러워 첫인상에서 큰 호감을 얻습니다.",
            "웃을 때 입매가 시원하게 올라가 밝고 긍정적인 에너지를 줍니다.",
            "전체적으로 이목구비의 각이 완만하여 부드러운 인상을 풍깁니다.",
            "타인에게 신뢰감을 주는 안정적인 분위기를 가지고 있습니다."
        ],
        styling: "따뜻한 톤의 니트나 부드러운 캐주얼룩이 잘 어울립니다."
    },
    cat: {
        title: "치명적인 매력의 '고양이상'",
        desc: "한 번 보면 잊혀지지 않는 도도하고 세련된 매력",
        traits: [
            "눈꼬리가 살짝 올라가 있어 세련되고 도회적인 느낌을 줍니다.",
            "자기주관이 뚜렷하고 도도한 분위기를 풍기는 이지적인 얼굴입니다.",
            "턱선과 콧날이 날렵하여 신비롭고 섹시한 매력이 돋보입니다.",
            "차가워 보일 수 있지만, 웃을 때 반전 매력이 가장 큰 타입입니다."
        ],
        styling: "세미 정장이나 시크한 블랙 계열의 코디가 잘 어울립니다."
    },
    mix: {
        title: "오묘한 매력의 '개냥이상'",
        desc: "강아지의 친근함과 고양이의 세련미를 모두 갖춘 유니크 페이스",
        traits: [
            "두 동물의 매력이 조화롭게 섞여 있어 예측 불가능한 매력을 줍니다.",
            "표정에 따라 분위기가 극적으로 변하는 모델 같은 얼굴입니다.",
            "희소성 있는 마스크로 어떤 스타일도 자신만의 개성으로 소화합니다.",
            "정면 사진뿐만 아니라 다양한 각도에서 매력이 터지는 타입입니다."
        ],
        styling: "믹스매치 룩이나 트렌디한 스트릿 패션이 잘 어울립니다."
    }
};

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
    
    const steps = [
        "픽셀 분석 중...", 
        "이목구비 특징 추출 중...", 
        "AI 딥러닝 알고리즘 대조 중...",
        "최종 결과 생성 중..."
    ];
    for (let step of steps) {
        elements.loadingMsg.innerText = step;
        await new Promise(r => setTimeout(r, 800));
    }

    predict();
}

async function predict() {
    if (!model) return alert("모델 로딩 중입니다. 잠시만 기다려주세요.");
    
    const prediction = await model.predict(elements.imagePreview);
    
    // 이 모델에는 여러 동물이 있지만 우리는 강아지와 고양이에 집중
    // 하지만 다른 동물의 점수도 고려하여 상대적인 비율로 계산
    let dogRaw = 0;
    let catRaw = 0;
    let othersRaw = 0;

    prediction.forEach(p => {
        const name = p.className.toLowerCase();
        if (name === 'dog' || name === '강아지') dogRaw = p.probability;
        else if (name === 'cat' || name === '고양이') catRaw = p.probability;
        else othersRaw += p.probability;
    });

    // 강아지와 고양이 중 어느 쪽이 더 강한지 비율 계산
    const total = dogRaw + catRaw + (othersRaw * 0.2); // 기타 점수는 일부만 반영
    let dogProb = (dogRaw / (dogRaw + catRaw)) * 100;
    let catProb = (catRaw / (dogRaw + catRaw)) * 100;

    // UI Update
    elements.loadingSection.style.display = 'none';
    elements.resultSection.style.display = 'block';

    // Reset and Animate Bars
    elements.dogBar.style.width = "0%";
    elements.catBar.style.width = "0%";
    
    setTimeout(() => {
        elements.dogBar.style.width = dogProb + "%";
        elements.catBar.style.width = catProb + "%";
        elements.dogScore.innerText = Math.round(dogProb) + "%";
        elements.catScore.innerText = Math.round(catProb) + "%";
    }, 200);

    // Final Result Logic
    let finalType = 'mix';
    if (Math.abs(dogProb - catProb) > 15) {
        finalType = dogProb > catProb ? 'dog' : 'cat';
    }

    const result = analysisResults[finalType];
    elements.mainTitle.innerText = result.title;
    elements.subDesc.innerText = result.desc;
    elements.traitList.innerHTML = result.traits.map(t => `<li>${t}</li>`).join('') + 
                                  `<li class="styling-tip"><strong>👗 스타일링 팁:</strong> ${result.styling}</li>`;
}

function copyUrl() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert("링크가 복사되었습니다! 친구들에게 공유해보세요.");
    });
}
