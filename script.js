// --- 1. إدارة البيانات والتخزين ---
let timer;
let seconds = 0;
let isCountMode = false;
let lastRecord = localStorage.getItem('youssef_last_record') || 0;
let userData = JSON.parse(localStorage.getItem('youssef_elite_data')) || null;

// --- 2. نظام المساعد الصوتي (Voice Assistant) ---
function speak(text) {
    if ('speechSynthesis' in window) {
        // إلغاء أي كلام شغال عشان ميبقاش في تداخل
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'ar-SA'; // لغة عربية
        utter.rate = 0.9;     // سرعة طبيعية وهادية
        utter.pitch = 1.1;    // نبرة صوت حماسية
        window.speechSynthesis.speak(utter);
    }
}

// --- 3. تهيئة التطبيق عند الفتح ---
window.onload = () => {
    if (userData) {
        showApp();
    } else {
        document.getElementById('onboarding').style.display = 'flex';
    }
};

// --- 4. خطوات التسجيل (Onboarding) ---
function goToStep(step) {
    const name = document.getElementById('userNameInput').value;
    if (!name) {
        speak("من فضلك اكتب اسمك يا بطل");
        return alert("اكتب اسمك أولاً!");
    }
    document.getElementById('welcomeMsg').innerText = `أهلاً يا ${name}`;
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
}

function finishOnboarding() {
    const weight = parseFloat(document.getElementById('userWeightInput').value);
    const height = parseFloat(document.getElementById('userHeightInput').value);
    const name = document.getElementById('userNameInput').value;

    if (!weight || !height) return alert("البيانات ناقصة!");

    userData = { name, weight, height };
    localStorage.setItem('youssef_elite_data', JSON.stringify(userData));
    showApp();
}

function showApp() {
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('mainApp').classList.remove('app-hidden');
    document.getElementById('displayUserName').innerText = userData.name;
    runHealthAnalysis();
    speak(`أهلاً بك يا ${userData.name} في تطبيقك الخاص. اختر عضلة لنبدأ.`);
}

// --- 5. تحليل الجسم (التضخيم والتنشيف) ---
function runHealthAnalysis() {
    const h = userData.height / 100;
    const bmi = (userData.weight / (h * h)).toFixed(1);
    const goalTag = document.getElementById('goalTag');
    const advice = document.getElementById('adviceContent');
    
    if (bmi < 24.9) {
        goalTag.innerText = "تضخيم (Bulking)";
        advice.innerHTML = "<strong>نصيحة يوسف:</strong> وزنك مثالي للتضخيم. ركز على الكربوهيدرات النظيفة مثل الشوفان والأرز البسمتي مع بروتين عالي لبناء كتلة عضلية.";
    } else {
        goalTag.innerText = "تنشيف (Cutting)";
        advice.innerHTML = "<strong>نصيحة يوسف:</strong> تحتاج لحرق الدهون مع الحفاظ على العضل. قلل السكريات والخبز الأبيض، واعتمد على البروتين والخضروات الورقية.";
    }
}

// --- 6. اختيار العضلة والتفاعل ---
function selectMuscle(id, name) {
    // إزالة التحديد القديم
    document.querySelectorAll('.muscle-part').forEach(m => m.classList.remove('active'));
    // تحديد العضلة الجديدة
    document.getElementById(id).classList.add('active');
    document.getElementById('targetText').innerText = name;
    
    speak(`تم اختيار ${name}. استعد لبدء الجولة.`);
}

// --- 7. منطق التايمر والعد ---
function updateMode() {
    isCountMode = document.getElementById('countToggle').checked;
    document.getElementById('modeLabel').innerText = isCountMode ? "نظام العدّات (2ث)" : "نظام الثواني";
}

function startWorkout() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'block';
    seconds = 0;
    
    speak("ابدأ الآن.. واحد.. اثنان.. عاش يا وحش!");
    
    timer = setInterval(() => {
        seconds++;
        updateDisplay();
    }, 1000);
}

function updateDisplay() {
    const display = document.getElementById('timerDisplay');
    if (isCountMode) {
        // يحسب عدة واحدة كل ثانيتين
        display.innerText = Math.floor(seconds / 2);
    } else {
        let m = Math.floor(seconds / 60);
        let s = seconds % 60;
        display.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
}

function stopWorkout() {
    clearInterval(timer);
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('stopBtn').style.display = 'none';
    
    let currentScore = isCountMode ? Math.floor(seconds / 2) : seconds;
    let arrowContainer = document.getElementById('performanceArrow');
    
    // مقارنة الأداء بالمرة السابقة
    if (currentScore > lastRecord) {
        arrowContainer.innerHTML = `<span style="color:#10b981">🔼 تحسن أسطوري! (الرقم السابق: ${lastRecord})</span>`;
        speak(`عاش يا ${userData.name}! لقد كطسرت رقمك القياسي السابق.`);
    } else if (currentScore < lastRecord) {
        arrowContainer.innerHTML = `<span style="color:#ef4444">🔽 حاول شد حيلك المرة الجاية (الرقم السابق: ${lastRecord})</span>`;
        speak("أداء جيد، ولكنك تستطيع فعل الأفضل في المرة القادمة.");
    } else {
        arrowContainer.innerHTML = `<span>⏺️ ثبات في المستوى. استمر!</span>`;
    }

    lastRecord = currentScore;
    localStorage.setItem('youssef_last_record', lastRecord);
}

// إعادة فتح الإعدادات لتغيير البيانات
function reOpenSettings() {
    if(confirm("هل تريد تغيير بيانات الوزن والطول؟")) {
        localStorage.removeItem('youssef_elite_data');
        location.reload();
    }
}
