// --- المتغيرات الأساسية ---
let timer;
let seconds = 0;
let prepInterval;
let userData = JSON.parse(localStorage.getItem('youssef_fitness_v4')) || null;
let history = JSON.parse(localStorage.getItem('youssef_history_v4')) || [];

// --- تشغيل النظام ---
window.onload = () => {
    if (userData) {
        showApp();
    } else {
        document.getElementById('onboarding').style.display = 'flex';
    }
    updateHistoryUI();
};

// --- نظام التسجيل (Onboarding) ---
function goToStep(step) {
    if (step === 2) {
        const name = document.getElementById('userNameInput').value;
        if (!name) return alert("من فضلك اكتب اسمك يا بطل!");
        document.getElementById('welcomeMsg').innerText = `يا هلا بيك يا ${name}!`;
    }
    
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
}

function finishOnboarding() {
    const name = document.getElementById('userNameInput').value;
    const weight = document.getElementById('userWeightInput').value;
    const height = document.getElementById('userHeightInput').value;

    if (!weight || !height) return alert("من فضلك كمل بياناتك عشان صحتك!");

    userData = { name, weight, height, rank: 'مبتدئ', streak: 0, lastDate: null };
    localStorage.setItem('youssef_fitness_v4', JSON.stringify(userData));
    showApp();
}

function showApp() {
    document.getElementById('onboarding').style.display = 'none';
    const app = document.getElementById('mainApp');
    app.classList.remove('app-hidden');
    app.classList.add('app-visible');
    
    document.getElementById('displayUserName').innerText = userData.name;
    document.getElementById('weightVal').innerText = userData.weight + " كجم";
    document.getElementById('heightVal').innerText = userData.height + " سم";
    
    updateBMI();
    initChart();
}

// --- نظام التبويبات (Tabs) ---
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// --- مؤقت التمرين (البلانك) ---
document.getElementById('startAction').addEventListener('click', function() {
    this.style.display = 'none';
    const stopBtn = document.getElementById('stopAction');
    const prepCircle = document.getElementById('prepCircle');
    const timerDisplay = document.getElementById('timerDisplay');
    
    let prep = 5;
    prepCircle.style.display = 'block';
    timerDisplay.style.display = 'none';
    
    prepInterval = setInterval(() => {
        prep--;
        prepCircle.innerText = prep < 10 ? "0" + prep : prep;
        if (prep <= 0) {
            clearInterval(prepInterval);
            prepCircle.style.display = 'none';
            timerDisplay.style.display = 'block';
            stopBtn.style.display = 'block';
            startActualTimer();
        }
    }, 1000);
});

function startActualTimer() {
    seconds = 0;
    timer = setInterval(() => {
        seconds++;
        let m = Math.floor(seconds / 60);
        let s = seconds % 60;
        document.getElementById('timerDisplay').innerText = 
            `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    }, 1000);
}

document.getElementById('stopAction').addEventListener('click', function() {
    clearInterval(timer);
    this.style.display = 'none';
    document.getElementById('startAction').style.display = 'block';
    
    if (seconds > 3) {
        saveSession(seconds);
    }
});

// --- تحليل البيانات وحفظها ---
function saveSession(secs) {
    const timeStr = document.getElementById('timerDisplay').innerText;
    const entry = { seconds: secs, time: timeStr, date: new Date().toLocaleDateString('ar-EG') };
    
    history.push(entry);
    if (history.length > 7) history.shift();
    localStorage.setItem('youssef_history_v4', JSON.stringify(history));
    
    analyzePerformance(secs);
    updateHistoryUI();
    updateChart();
}

function analyzePerformance(secs) {
    let advice = "";
    const drBox = document.getElementById('drAdvice');
    
    if (secs < 30) {
        advice = "يا يوسف، الجولة كانت قصيرة. ممكن جسمك مجهد؟ جرب تمارين استطالة دلوقتي وخد راحة 5 دقائق.";
    } else if (secs < 90) {
        advice = "وحش! أداء متوسط ممتاز. عضلاتك بدأت تشد. المرة الجاية حاول تثبت كعب رجلك أكتر عشان توازن أحسن.";
    } else {
        advice = "أداء أسطوري! أنت الآن في مرحلة بناء فورمة حقيقية. اشرب مية كتير وزود بروتين في وجبتك الجاية.";
    }
    drBox.innerText = advice;
}

function updateBMI() {
    const h = userData.height / 100;
    const bmi = (userData.weight / (h * h)).toFixed(1);
    document.getElementById('bmiVal').innerText = bmi;
}

// --- الرسم البياني ---
let myChart;
function initChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    const data = history.map(h => h.seconds);
    const labels = history.map(h => h.date);

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'ثواني البلانك',
                data: data,
                borderColor: '#6366f1',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { display: false }, x: { grid: { display: false } } }
        }
    });
}

function updateChart() {
    myChart.data.labels = history.map(h => h.date);
    myChart.data.datasets[0].data = history.map(h => h.seconds);
    myChart.update();
}

function updateHistoryUI() {
    const list = document.getElementById('achievementList');
    list.innerHTML = "<h4>آخر الإنجازات</h4>";
    history.slice().reverse().forEach(h => {
        list.innerHTML += `<div class="exercise-item" style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:0.8rem; background:rgba(255,255,255,0.05); padding:10px; border-radius:10px;">
            <span>⏱️ ${h.time}</span>
            <span>📅 ${h.date}</span>
        </div>`;
    });
}

function reOpenOnboarding() {
    document.getElementById('mainApp').classList.add('app-hidden');
    document.getElementById('onboarding').style.display = 'flex';
}
