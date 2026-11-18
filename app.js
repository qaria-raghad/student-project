// ==================== 1. الساعة الحية والوضع الليلي (Dark Mode & Clock) ====================
function updateClock() {
    const clockElem = document.getElementById('live-clock');
    if (clockElem) {
        const now = new Date();
        clockElem.textContent = now.toLocaleTimeString('ar-EG');
    }
}

setInterval(updateClock, 1000);

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('studiom_theme', newTheme);
}

// تطبيق الثيم المحفوظ عند التحميل
const savedTheme = localStorage.getItem('studiom_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);


// ==================== 2. زر العودة للأعلى و Slider النصائح ====================
window.onscroll = function() {
    const btn = document.getElementById('back-to-top');
    if (btn) {
        btn.style.display = (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) ? 'block' : 'none';
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

let currentSlide = 0;

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// تغيير النصيحة تلقائياً كل 5 ثوانٍ
setInterval(() => {
    nextSlide();
}, 5000);


// ==================== 3. المؤقت والآلة الحاسبة ====================
let timer;
let timeLeft = 25 * 60;
let isRunning = false;
let timerMode = 'work';

function setTimerMode(mode) {
    clearInterval(timer);
    isRunning = false;
    timerMode = mode;
    timeLeft = mode === 'work' ? 25 * 60 : 5 * 60;

    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.textContent = 'ابدأ الجلسة';

    updateTimerDisplay();
}

function updateTimerDisplay() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');

    const elem = document.getElementById('timer');
    if (elem) elem.textContent = `${m}:${s}`;
}

function toggleTimer() {
    const startBtn = document.getElementById('start-btn');

    if (isRunning) {
        clearInterval(timer);

        if (startBtn) startBtn.textContent = 'استكمال الجلسة';

        isRunning = false;
    } else {
        isRunning = true;

        if (startBtn) startBtn.textContent = 'إيقاف مؤقت';

        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timer);
                alert('انتهت الجلسة بنجاح!');
                setTimerMode(timerMode === 'work' ? 'break' : 'work');
            }
        }, 1000);
    }
}

function resetTimer() {
    setTimerMode(timerMode);
}

function calculateTotalHours() {
    const daysElem = document.getElementById('calc-days');
    const hoursElem = document.getElementById('calc-hours');
    const resElem = document.getElementById('calc-result');

    if (!daysElem || !hoursElem || !resElem) return;

    const days = parseFloat(daysElem.value);
    const hours = parseFloat(hoursElem.value);

    if (!days || !hours || days <= 0 || hours <= 0) {
        resElem.textContent = 'يرجى إدخال أرقام صحيحة.';
        return;
    }

    resElem.textContent = `إجمالي ساعات المذاكرة المتوقعة: ${days * hours} ساعة.`;
}


// ==================== 4. إدارة المهام (Tasks) ====================
let tasks = JSON.parse(localStorage.getItem('student_study_tasks')) || [
    { id: 1, text: "دراسة شابتر إدارة الذاكرة وتلخيصه", priority: "high", completed: false },
    { id: 2, text: "حل شيت تراكيب البيانات", priority: "medium", completed: true }
];

let currentFilter = 'all';

function renderTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;

    container.innerHTML = '';

    const filtered = tasks.filter(t => {
        if (currentFilter === 'completed') return t.completed;
        if (currentFilter === 'pending') return !t.completed;
        return true;
    });

    updateProgress();

    if (filtered.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-secondary);">لا توجد مهام حالياً</p>`;
        return;
    }

    filtered.forEach(task => {
        const item = document.createElement('div');

        item.className = 'card';
        item.style.padding = '10px 15px';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.marginBottom = '10px';

        item.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus(${task.id})">
                <span style="${task.completed ? 'text-decoration:line-through; opacity:0.5;' : ''}">${task.text}</span>
            </div>
            <button onclick="deleteTask(${task.id})" style="background:none; border:none; cursor:pointer; color:var(--danger);">🗑️</button>
        `;

        container.appendChild(item);
    });

    localStorage.setItem('student_study_tasks', JSON.stringify(tasks));
}

function updateProgress() {
    const fill = document.getElementById('task-progress-fill');
    const text = document.getElementById('task-progress-text');

    if (!fill || !text) return;

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    fill.style.width = `${percent}%`;
    text.textContent = `نسبة الإنجاز: ${percent}% (${completed}/${total})`;
}

function addNewTask() {
    const input = document.getElementById('task-input');
    const priorityElem = document.getElementById('task-priority');

    if (!input || !priorityElem) return;

    const text = input.value.trim();
    const priority = priorityElem.value;

    if (!text) return;

    tasks.push({
        id: Date.now(),
        text,
        priority,
        completed: false
    });

    input.value = '';
    renderTasks();
}

function toggleTaskStatus(id) {
    tasks = tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
    );

    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
}

function filterTasks(val, btn) {
    currentFilter = val;
    renderTasks();
}


// ==================== 5. بطاقات المراجعة (Flashcards & Modal) ====================
let flashcards = JSON.parse(localStorage.getItem('student_study_flashcards')) || [
    {
        id: 1,
        question: "ما هو الـ DOM في الويب؟",
        answer: "هو تمثيل لهيكل الصفحة كشجرة من الكائنات تمكن JS من تعديل العناصر."
    }
];

function renderFlashcards() {
    const container = document.getElementById('flashcards-container');
    if (!container) return;

    container.innerHTML = '';

    flashcards.forEach(fc => {
        const cardWrapper = document.createElement('div');

        cardWrapper.className = 'flashcard-3d';

        cardWrapper.onclick = (e) => {
            if (!e.target.classList.contains('fc-del')) {
                cardWrapper.classList.toggle('flipped');
            }
        };

        cardWrapper.innerHTML = `
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <button class="fc-del" onclick="deleteFlashcard(${fc.id})" style="position:absolute; top:8px; left:8px; background:none; border:none; color:var(--danger); cursor:pointer;">❌</button>
                    <span>❓ ${fc.question}</span>
                </div>

                <div class="flashcard-back">
                    <span>💡 ${fc.answer}</span>
                </div>
            </div>
        `;

        container.appendChild(cardWrapper);
    });

    localStorage.setItem('student_study_flashcards', JSON.stringify(flashcards));
}

function addNewFlashcard() {
    const qElem = document.getElementById('fc-question');
    const aElem = document.getElementById('fc-answer');

    if (!qElem || !aElem) return;

    const q = qElem.value.trim();
    const a = aElem.value.trim();

    if (!q || !a) return;

    flashcards.push({
        id: Date.now(),
        question: q,
        answer: a
    });

    qElem.value = '';
    aElem.value = '';

    renderFlashcards();
    showModal('تمت إضافة البطاقة بنجاح!');
}

function deleteFlashcard(id) {
    flashcards = flashcards.filter(fc => fc.id !== id);
    renderFlashcards();
}

function showModal(msg) {
    const modal = document.getElementById('info-modal');
    const text = document.getElementById('modal-text');

    if (modal && text) {
        text.textContent = msg;
        modal.style.display = 'flex';
    } else {
        alert(msg);
    }
}

function closeModal() {
    const modal = document.getElementById('info-modal');

    if (modal) modal.style.display = 'none';
}


// ==================== 6. المستودع والبحث (Resources & Search) ====================
let resources = JSON.parse(localStorage.getItem('student_study_resources')) || [
    {
        id: 1,
        name: "ملزمة أنظمة التشغيل",
        type: "pdf",
        link: "https://example.com"
    },
    {
        id: 2,
        name: "فيديو مراجعة الخوارزميات",
        type: "video",
        link: "https://youtube.com"
    }
];

function renderResources(data = resources) {
    const container = document.getElementById('resources-container');

    if (!container) return;

    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = `<p style="color:var(--text-secondary);">لا توجد نتائج للعرض.</p>`;
        return;
    }

    data.forEach(res => {
        const item = document.createElement('div');

        item.className = 'card';
        item.style.padding = '15px';
        item.style.marginBottom = '10px';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        item.innerHTML = `
            <div>
                <strong>${res.name}</strong> <small>(${res.type})</small>
            </div>

            <div>
                ${res.link ? `<a href="${res.link}" target="_blank" class="btn" style="text-decoration:none; font-size:0.8rem; padding:5px 10px;">فتح</a>` : ''}
                <button onclick="deleteResource(${res.id})" style="background:none; border:none; cursor:pointer; color:var(--danger); margin-right:10px;">🗑️</button>
            </div>
        `;

        container.appendChild(item);
    });

    localStorage.setItem('student_study_resources', JSON.stringify(resources));
}

function addNewResource() {
    const nameElem = document.getElementById('res-name');
    const typeElem = document.getElementById('res-type');
    const linkElem = document.getElementById('res-link');

    if (!nameElem || !typeElem) return;

    const name = nameElem.value.trim();
    const type = typeElem.value;
    const link = linkElem ? linkElem.value.trim() : '';

    if (!name) return;

    resources.push({
        id: Date.now(),
        name,
        type,
        link
    });

    nameElem.value = '';

    if (linkElem) linkElem.value = '';

    renderResources();
}

function deleteResource(id) {
    resources = resources.filter(r => r.id !== id);
    renderResources();
}

function searchResources() {
    const input = document.getElementById('search-input');

    if (!input) return;

    const query = input.value.toLowerCase();

    const filtered = resources.filter(r =>
        r.name.toLowerCase().includes(query)
    );

    renderResources(filtered);
}


// ==================== 7. تسجيل الدخول وإظهار كلمة المرور (Form Validation) ====================
function togglePasswordVisibility() {
    const input = document.getElementById('login-password');

    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

function handleLogin(e) {
    e.preventDefault();

    const nameElem = document.getElementById('login-name');
    const emailElem = document.getElementById('login-email');
    const passElem = document.getElementById('login-password');
    const err = document.getElementById('form-error');

    if (!nameElem || !emailElem || !passElem) return;

    const name = nameElem.value.trim();
    const email = emailElem.value.trim();
    const pass = passElem.value.trim();

    if (!name || !email || !pass) {
        if (err) {
            err.textContent = 'يرجى ملء جميع الحقول المطلوبة.';
            err.style.display = 'block';
        }

        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        if (err) {
            err.textContent = 'يرجى إدخال بريد إلكتروني صحيح.';
            err.style.display = 'block';
        }

        return;
    }

    if (pass.length < 6) {
        if (err) {
            err.textContent = 'كلمة المرور يجب ألا تقل عن 6 أحرف.';
            err.style.display = 'block';
        }

        return;
    }

    if (err) err.style.display = 'none';

    alert(`مرحباً بك يا ${name}! تم تسجيل الدخول بنجاح.`);
}


// ==================== التهيئة عند تحميل أي صفحة ====================
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    updateTimerDisplay();
    renderTasks();
    renderFlashcards();
    renderResources();
});