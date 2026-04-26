// --- 1. قاعدة البيانات والتمارين ---
const workoutLibrary = {
    chest: [
        { name: "ضغط صدر مستوي", desc: "لبناء أساس قوي لعضلات الصدر" },
        { name: "تفتيح دمبل", desc: "لتحسين تمدد وعزل ألياف الصدر" },
        { name: "ضغط ضيق (Diamond)", desc: "للصدر الداخلي والتراي" }
    ],
    abs: [
        { name: "بلانك (Plank)", desc: "لتقوية عضلات الكور والثبات" },
        { name: "طحن البطن (Crunches)", desc: "لعضلات البطن العلوية" },
        { name: "رفع الأرجل", desc: "لاستهداف البطن السفلية" }
    ],
    arms: [
        { name: "تبادل دمبل (Biceps)", desc: "لتكوير عضلة الباي" },
        { name: "تراي خلفي", desc: "لضخامة الذراع من الخلف" },
        { name: "مطرقة (Hammer)", desc: "لعرض الساعد والباي" }
    ],
    legs: [
        { name: "سكوات (Squats)", desc: "ملك تمارين الأرجل" },
        { name: "طعنات (Lunges)", desc: "للقوة والتوازن" },
        { name: "جامب سكوات", desc: "لزيادة القوة الانفجارية" }
    ]
};

// --- 2. إدارة الحالة (State Management) ---
let timer;
let seconds = 0;
let activeMuscle = "";
let activeExercise = "";
let userData = JSON.parse(localStorage.getItem('youssef_elite_v8')) || null;
let muscleStats = JSON.parse(localStorage.getItem('youssef_muscle_stats')) || { chest: 0, abs: 0, legs: 0, arms: 0 };

// --- 3. النظام الصوتي ---
function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'ar-SA';
        msg.rate = 0.95;
        window.speechSynthesis.speak(msg);
    }
}

// --- 4. خطوات التسجيل والبداية ---
window.onload = () => {
    if (userData) {
        showApp();
    } else {
        document.getElementById('onboarding').style.display = 'flex';
    }
};

function goToStep(s) {
    const name = document.getElementById('userNameInput').value;
    if (!name) return speak("اكتب اسمك يا بطل");
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step${s}`).classList.add('active');
}

function finishOnboarding() {
    const w = document.getElementById('userWeightInput').value;
    const h = document.getElementById('userHeightInput').value;
    const n = document.getElementById('userNameInput').value;
    if (!w || !h) return speak("كمل بياناتك يا وحش");
    
    userData = { name: n, weight: w, height: h };
    localStorage.setItem('youssef_elite_v8', JSON.stringify(userData));
    showApp();
}

function showApp() {
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('mainApp').classList.remove('app-hidden');
    document.getElementById('displayUserName').innerText = userData.name;
    updateRankUI();
    runNutritionAnalysis();
    speak(`مرحباً بك يا ${userData.name}. نظامك الرياضي جاهز للانطلاق.`);
}

// --- 5. منطق التمارين والتبويبات ---
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('app-hidden'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById(`${tab}Tab`).classList.remove('app-hidden');
    event.currentTarget.classList.add('active');
    
    if (tab === 'analysis') renderAnalysis();
}

function loadMuscleLibrary(id, name) {
    activeMuscle = id;
    document.querySelectorAll('.muscle-part').forEach(p => p.classList.remove('active'));
    if(document.getElementById(id)) document.getElementById(id).classList.add('active');

    document.getElementById('exerciseListContainer').classList.remove('app-hidden');
    document.getElementById('muscleTitle').innerText = `تمارين ${name}`;
    
    let html = "";
    workoutLibrary[id].forEach(ex => {
        html += `
            <div class="ex-item glass-effect" onclick="prepareTimer('${ex.name}')">
                <h4>${ex.name}</h4>
                <p>${ex.desc}</p>
            </div>
        `;
    });
    document.getElementById('exerciseItemsGrid').innerHTML = html;
    speak(`تم عرض تمارين ${name}`);
}

function prepareTimer(name) {
    activeExercise = name;
    document.getElementById('timerCard').classList.remove('app-hidden');
    document.getElementById('currentExerciseName').innerText = name;
    document.getElementById('timerCard').scrollIntoView({ behavior: 'smooth' });
    speak(`جاهز لتمرين ${name}؟`);
}

// --- 6. التايمر ونبض البيانات ---
function startWorkoutSession() {
    document.getElementById('startBtn').classList.add('app-hidden');
    document.getElementById('stopBtn').classList.remove('app-hidden');
    seconds = 0;
    
    speak("ابدأ التمرين الآن.. عاش يا وحش");
    
    timer = setInterval(() => {
        seconds++;
        let m = Math.floor(seconds/60), s = seconds%60;
        document.getElementById('timerDisplay').innerText = `${m<10?'0':''}${m}:${s<10?'0':''}${s}`;
        
        // تحفيز صوتي كل 15 ثانية
        if(seconds % 15 === 0) speak("استمر، أنت تصنع الفرق");
    }, 1000);
}

function stopWorkoutSession() {
    clearInterval(timer);
    document.getElementById('startBtn').classList.remove('app-hidden');
    document.getElementById('stopBtn').classList.add('app-hidden');
    
    // تحديث البيانات
    muscleStats[activeMuscle] += 1;
    localStorage.setItem('youssef_muscle_stats', JSON.stringify(muscleStats));
    
    updateRankUI();
    speak(`انتهى التمرين. تم تسجيل نقطة قوة لعضلات ${activeMuscle}.`);
}

// --- 7. التحليل والرتب وتلوين الجسم ---
function getRankInfo() {
    const total = Object.values(muscleStats).reduce((a, b) => a + b, 0);
    if (total > 100) return { name: "أسطورة ماسية 💎", color: "#00d4ff" };
    if (total > 50) return { name: "نخبة ذهبية 👑", color: "#fbbf24" };
    if (total > 20) return { name: "محارب فضي ⚔️", color: "#e2e8f0" };
    if (total > 5) return { name: "رافع حديد 🦾", color: "#6366f1" };
    return { name: "مستجد", color: "#94a3b8" };
}

function updateRankUI() {
    const rank = getRankInfo();
    const badge = document.getElementById('rankBadge');
    badge.innerText = `الرتبة: ${rank.name}`;
    badge.style.backgroundColor = rank.color;
    badge.style.boxShadow = `0 0 15px ${rank.color}`;
}

function renderAnalysis() {
    const mapDiv = document.getElementById('analysisBodyView');
    mapDiv.innerHTML = document.querySelector('.human-body-svg').outerHTML;
    
    Object.keys(muscleStats).forEach(m => {
        let count = muscleStats[m];
        let color = "#1e293b"; 
        if(count > 0) color = "#6366f1"; // أزرق للبداية
        if(count >= 10) color = "#10b981"; // أخضر للاحتراف
        
        let part = mapDiv.querySelector(`#${m}`);
        if(part) part.style.fill = color;
    });

    const total = Object.values(muscleStats).reduce((a, b) => a + b, 0);
    document.getElementById('statsDetail').innerHTML = `
        <div class="stat-row"><span>إجمالي التمارين:</span> <span>${total}</span></div>
        <div class="stat-row"><span>أقوى عضلة:</span> <span style="color:#10b981">${Object.keys(muscleStats).reduce((a, b) => muscleStats[a] > muscleStats[b] ? a : b)}</span></div>
    `;
}

// --- 8. التغذية ---
function runNutritionAnalysis() {
    const h = userData.height / 100;
    const bmi = (userData.weight / (h * h)).toFixed(1);
    let plan = bmi < 25 ? "تضخيم عضلات" : "حرق دهون وتنشيف";
    
    document.getElementById('goalTag').innerText = plan;
    document.getElementById('nutritionContent').innerHTML = `
        <p>بناءً على قياساتك، هدفك هو <strong>${plan}</strong>.</p>
        <ul style="margin-top:10px; list-style:inside square;">
            <li>بروتين: ${userData.weight * 2} جرام يومياً</li>
            <li>شرب 3 لتر ماء</li>
            <li>نوم 8 ساعات للتعافي</li>
        </ul>
    `;
}

function reOpenSettings() {
    if(confirm("هل تريد إعادة ضبط البيانات؟")) {
        localStorage.clear();
        location.reload();
    }
}
