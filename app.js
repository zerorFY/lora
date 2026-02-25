const ITEMS = [
    { id: 'fwwk', label: '📖 四五快读' },
    { id: 'math', label: '🔢 数学' },
    { id: 'eatwell', label: '🍔 好好吃饭' },
    { id: 'sleepself', label: '💤 自己睡觉' },
];

const THEMES = {
    hellokitty: { icon: '🐱', banner: '💖 🎀 🐱 🎀 💖', deco: ['🐱', '💖', '🎀', '🎈', '🍼'] },
    demonhunter: { icon: '⚔️', banner: '🗡️ 🛡️ 🏹 🛡️ 🗡️', deco: ['⚔️', '🏹', '🛡️', '💀', '🔥'] },
    spiderman: { icon: '🕷️', banner: '🕸️ 🕸️ 🕷️ 🕸️ 🕸️', deco: ['🕷️', '🕸️', '🏙️', '🦸', '💥'] },
    labubu: { icon: '🐰', banner: '🧸 🐰 🧚 🐰 🧸', deco: ['🐰', '🦷', '🧚', '🌲', '🍄'] },
    kuromi: { icon: '💀', banner: '🖤 💀 😈 💀 🖤', deco: ['😈', '🖤', '💀', '⚡', '💣'] }
};

const BURGER_PARTS = [
    { char: '🍞', y: 350, delay: 0 },    // Bottom Bun
    { char: '🥣', y: 320, delay: 0.8 },  // Sauce (Mayo/Ketchup)
    { char: '🥩', y: 290, delay: 1.6 },  // Meat Patty
    { char: '🧀', y: 260, delay: 2.4 },  // Cheese Slice
    { char: '🥓', y: 240, delay: 3.2 },  // Bacon / Extra Meat
    { char: '🥗', y: 210, delay: 4.0 },  // Lettuce
    { char: '🧅', y: 195, delay: 4.8 },  // Onion
    { char: '🍅', y: 170, delay: 5.6 },  // Tomato
    { char: '🥒', y: 150, delay: 6.4 },  // Cucumber / Pickle
    { char: '🥣', y: 130, delay: 7.2 },  // More Sauce
    { char: '🍞', y: 80, delay: 8.5 }    // Top Bun
];

const START_DATE = new Date(2026, 1, 23);
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
    for (let i = 0; i < 12; i++) {
        const d = document.createElement('div');
        d.className = 'floating-deco';
        d.textContent = theme.deco[i % theme.deco.length];
        d.style.left = (Math.random() * 95) + '%';
        d.style.top = (Math.random() * 95) + '%';
        d.style.animationDelay = (Math.random() * 10) + 's';
        d.style.fontSize = (40 + Math.random() * 40) + 'px';
        decoContainer.appendChild(d);
    }
}

// ===== Data Logic =====
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
    // Walk through stored weeks (limit to 52 for perf)
    for (let w = -10; w <= 52; w++) {
        const stored = localStorage.getItem(getWeekKey(w));
        if (stored) {
            const weekData = JSON.parse(stored);
            for (let d = 0; d < 7; d++) {
                Object.values(weekData[d]).forEach(val => { if (val) total++; });
            }
        }
    }
    return total;
}

// ===== Burger Animation (Real Burger, 10-15 seconds) =====
function showBurgerAnimation() {
    const overlay = document.getElementById('burgerModal');
    const assembly = document.getElementById('burgerAssembly');
    const celebText = document.getElementById('celebrationText');

    overlay.classList.add('active');
    assembly.innerHTML = '';
    celebText.style.opacity = '0';

    BURGER_PARTS.forEach(p => {
        const el = document.createElement('div');
        el.className = 'burger-part';
        el.textContent = p.char;
        el.style.setProperty('--target-y', p.y + 'px');
        assembly.appendChild(el);

        setTimeout(() => {
            el.classList.add('landed');
            // Add a small shake/bounce impact
            setTimeout(() => el.classList.add('bounce'), 600);
        }, p.delay * 1000);
    });

    // Fire confetti at the very end
    setTimeout(() => {
        fireConfetti();
        celebText.style.opacity = '1';
    }, (BURGER_PARTS[BURGER_PARTS.length - 1].delay + 1) * 1000);

    // Auto-close after everything
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 15000);
}

function fireConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = '';
    const colors = ['#FFD700', '#FF69B4', '#EE82EE', '#87CEEB', '#FF4500'];
    for (let i = 0; i < 100; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + '%';
        c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        c.style.width = (8 + Math.random() * 12) + 'px';
        c.style.height = c.style.width;
        c.style.position = 'fixed';
        c.style.top = '-20px';
        c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        c.style.animation = `fallDown ${2 + Math.random() * 4}s linear forwards`;
        container.appendChild(c);
    }
}

// Confetti animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes fallDown {
        to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);

// ===== UI Rendering =====
function renderTracker() {
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

    // Update Scores
    const total = calcTotalScore();
    document.getElementById('totalScore').textContent = total;
    document.getElementById('burgerCount').textContent = total;
    document.getElementById('goalFill').style.width = Math.min((total / BURGER_GOAL) * 100, 100) + '%';

    // Day Headers
    const dateHeaders = document.querySelectorAll('.day-date');
    weekDates.forEach((date, i) => {
        dateHeaders[i].textContent = `${date.getMonth() + 1}/${date.getDate()}`;
    });
}

function performSave() {
    const weekData = loadWeekData(currentWeekOffset);
    let hasChanges = false;
    for (const key in pendingChanges) {
        const [day, itemId] = key.split('|');
        if (weekData[day][itemId] !== pendingChanges[key]) {
            weekData[day][itemId] = pendingChanges[key];
            hasChanges = true;
        }
    }

    if (hasChanges) {
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

    // Theme Switcher
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.onclick = () => setTheme(btn.dataset.theme);
    });

    // Week Nav
    document.getElementById('prevWeek').onclick = () => { currentWeekOffset--; renderTracker(); };
    document.getElementById('nextWeek').onclick = () => { currentWeekOffset++; renderTracker(); };

    // Save
    document.getElementById('confirmBtn').onclick = performSave;

    // Initial Render
    renderTracker();
});
