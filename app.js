const ITEMS = [
    { id: 'fwwk', label: '📖 四五快读' },
    { id: 'math', label: '🔢 数学' },
    { id: 'eatwell', label: '🍔 好好吃饭' },
    { id: 'sleepself', label: '💤 自己睡觉' },
];

const THEMES = {
    hellokitty: { icon: '🐱', banner: '💖 🎀 🐱 🎀 💖', deco: ['🐱', '💖', '🎀', '🎈', '✨'], burger: '🍔' },
    demonhunter: { icon: '⚔️', banner: '🗡️ 🛡️ 🏹 🛡️ 🗡️', deco: ['⚔️', '🏹', '🛡️', '💀', '🔥'], burger: '🍱' },
    spiderman: { icon: '🕷️', banner: '🕸️ 🕸️ 🕷️ 🕸️ 🕸️', deco: ['🕷️', '🕸️', '🏙️', '🦸', '💥'], burger: '🍕' },
    labubu: { icon: '🐰', banner: '🧸 🐰 🧚 🐰 🧸', deco: ['🐰', '🦷', '🧚', '🌲', '🍄'], burger: '🍦' },
    kuromi: { icon: '💀', banner: '🖤 💀 😈 💀 🖤', deco: ['😈', '🖤', '💀', '⚡', '💣'], burger: '🍮' }
};

const START_DATE = new Date(2026, 1, 23); // Monday, Feb 23, 2026
const BURGER_GOAL = 50;

let currentTheme = 'hellokitty';
let currentWeekOffset = 0;
let pendingChanges = {};

// ===== Theme Logic =====
function setTheme(themeId) {
    document.documentElement.setAttribute('data-theme', themeId);
    currentTheme = themeId;
    localStorage.setItem('lora_theme', themeId);

    const theme = THEMES[themeId];
    document.getElementById('currentThemeIcon').textContent = theme.icon;
    document.getElementById('themeBanner').textContent = theme.banner;

    // Update floating decos
    const decoContainer = document.getElementById('floatingDecos');
    decoContainer.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const d = document.createElement('div');
        d.className = 'floating-deco';
        d.textContent = theme.deco[i % theme.deco.length];
        d.style.left = (Math.random() * 90) + '%';
        d.style.top = (Math.random() * 90) + '%';
        d.style.animationDelay = (Math.random() * 5) + 's';
        decoContainer.appendChild(d);
    }
}

// ===== Core Logic (Simplified from Freya for Lora) =====
function getWeekKey(offset) {
    const d = new Date(START_DATE);
    d.setDate(d.getDate() + offset * 7);
    return `lora_week_${d.toISOString().split('T')[0]}`;
}

function loadWeekData(offset) {
    const stored = localStorage.getItem(getWeekKey(offset));
    if (stored) return JSON.parse(stored);
    const data = {};
    for (let d = 0; d < 7; d++) {
        data[d] = {};
        ITEMS.forEach(it => data[d][it.id] = false);
    }
    return data;
}

function saveWeekData(offset, data) {
    localStorage.setItem(getWeekKey(offset), JSON.stringify(data));
}

function calcTotalScore() {
    let total = 0;
    const today = new Date();
    // Simplified: 1 point per checkbox checked
    for (let w = 0; w <= 52; w++) {
        const stored = localStorage.getItem(getWeekKey(w));
        if (!stored) continue;
        const weekData = JSON.parse(stored);
        for (let d = 0; d < 7; d++) {
            Object.values(weekData[d]).forEach(val => { if (val) total++; });
        }
    }
    return total;
}

// ===== Burger Animation (10s sequence) =====
function showBurgerAnimation() {
    const overlay = document.getElementById('burgerModal');
    const assembly = document.getElementById('burgerAssembly');
    overlay.classList.add('active');
    assembly.innerHTML = '';

    const parts = [
        { char: '🍞', y: '230px', delay: 0 },    // Bottom bun
        { char: '🥩', y: '180px', delay: 1.5 },  // Meat
        { char: '🧀', y: '160px', delay: 3.0 },  // Cheese
        { char: '🥗', y: '140px', delay: 4.5 },  // Lettuce
        { char: '🍅', y: '110px', delay: 6.0 },  // Tomato
        { char: '🍞', y: '60px', delay: 7.5 },   // Top bun
        { char: '✨', y: '0px', delay: 9.0 }     // Sparkle
    ];

    parts.forEach(p => {
        const el = document.createElement('div');
        el.className = 'burger-part';
        el.textContent = p.char;
        el.style.setProperty('--target-y', p.y);
        assembly.appendChild(el);

        setTimeout(() => {
            el.classList.add('landed');
        }, p.delay * 1000);
    });

    // Fire confetti at the end
    setTimeout(() => {
        fireConfetti();
        document.getElementById('celebrationText').style.opacity = '1';
    }, 9000);

    // Auto-close
    setTimeout(() => {
        overlay.classList.remove('active');
        document.getElementById('celebrationText').style.opacity = '0';
    }, 13000);
}

function fireConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + '%';
        c.style.backgroundColor = ['#FFD700', '#FF69B4', '#FFF', '#87CEEB'][Math.floor(Math.random() * 4)];
        c.style.width = '10px';
        c.style.height = '10px';
        c.style.position = 'fixed';
        c.style.top = '-10px';
        c.style.animation = `fall ${2 + Math.random() * 3}s linear forwards`;
        container.appendChild(c);
    }
}

// Inject tailwind-like keyframe for confetti
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    .confetti { z-index: 3000; }
`;
document.head.appendChild(style);

// ===== UI Rendering =====
function renderTracker() {
    const weekKey = getWeekKey(currentWeekOffset);
    const weekData = loadWeekData(currentWeekOffset);

    const d = new Date(START_DATE);
    d.setDate(d.getDate() + currentWeekOffset * 7);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(d);
        date.setDate(date.getDate() + i);
        return date;
    });

    document.getElementById('weekLabel').textContent = `📅 Week ${currentWeekOffset + 1} (${weekDates[0].getMonth() + 1}/${weekDates[0].getDate()} - ${weekDates[6].getMonth() + 1}/${weekDates[6].getDate()})`;

    const tbody = document.getElementById('trackerBody');
    tbody.innerHTML = '';

    ITEMS.forEach(item => {
        const tr = document.createElement('tr');
        const tdName = document.createElement('td');
        tdName.className = 'item-name';
        tdName.textContent = item.label;
        tr.appendChild(tdName);

        for (let day = 0; day < 7; day++) {
            const td = document.createElement('td');
            const label = document.createElement('label');
            label.className = 'checkbox-wrapper';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = weekData[day][item.id] || false;
            cb.dataset.day = day;
            cb.dataset.item = item.id;
            cb.onchange = (e) => {
                pendingChanges[`${day}|${item.id}`] = e.target.checked;
            };

            const span = document.createElement('span');
            span.className = 'checkmark';

            label.appendChild(cb);
            label.appendChild(span);
            td.appendChild(label);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });

    // Update Header Score
    const total = calcTotalScore();
    document.getElementById('totalScore').textContent = total;
    document.getElementById('burgerCount').textContent = total;
    document.getElementById('goalFill').style.width = Math.min((total / BURGER_GOAL) * 100, 100) + '%';

    // Headers
    const headers = document.querySelectorAll('.day-date');
    weekDates.forEach((date, i) => {
        headers[i].textContent = `${date.getMonth() + 1}/${date.getDate()}`;
    });
}

function performSave() {
    const weekData = loadWeekData(currentWeekOffset);
    let changed = false;
    for (const key in pendingChanges) {
        const [day, itemId] = key.split('|');
        if (weekData[day][itemId] !== pendingChanges[key]) {
            weekData[day][itemId] = pendingChanges[key];
            changed = true;
        }
    }

    if (changed) {
        saveWeekData(currentWeekOffset, weekData);
        showBurgerAnimation();
    }

    pendingChanges = {};
    renderTracker();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    // Theme Init
    const savedTheme = localStorage.getItem('lora_theme') || 'hellokitty';
    setTheme(savedTheme);

    // Theme Switcher Events
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.onclick = () => setTheme(btn.dataset.theme);
    });

    // Nav Events
    document.getElementById('prevWeek').onclick = () => { currentWeekOffset--; renderTracker(); };
    document.getElementById('nextWeek').onclick = () => { currentWeekOffset++; renderTracker(); };

    // Save Event
    document.getElementById('confirmBtn').onclick = performSave;

    renderTracker();
});
