const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

const monthCanvas = document.getElementById('month-wheel');
const dayCanvas = document.getElementById('day-wheel');
const monthWrapper = document.getElementById('month-wrapper');
const dayWrapper = document.getElementById('day-wrapper');
const spinButton = document.getElementById('spin-button');
const statusLabel = document.getElementById('status-label');
const dateResult = document.getElementById('date-result');

const monthCtx = monthCanvas.getContext('2d');
const dayCtx = dayCanvas.getContext('2d');

let monthAngle = 0;
let dayAngle = 0;
let isSpinning = false;

function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
}

setupCanvas(monthCanvas);
setupCanvas(dayCanvas);

function drawWheel(ctx, items, currentAngle) {
    const size = 150;
    ctx.clearRect(0, 0, size * 2, size * 2);
    
    ctx.save();
    ctx.translate(size, size);
    ctx.rotate(currentAngle);
    
    const totalItems = items.length;
    const arcSize = (Math.PI * 2) / totalItems;
    
    for (let i = 0; i < totalItems; i++) {
        const angle = i * arcSize;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, size - 5, angle, angle + arcSize);
        ctx.closePath();
        
        ctx.fillStyle = i % 2 === 0 ? '#1b2838' : '#2a475e';
        ctx.fill();
        ctx.strokeStyle = '#3a424a';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.save();
        ctx.rotate(angle + arcSize / 2);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(items[i], size - 20, 0);
        ctx.restore();
    }
    
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#101216';
    ctx.fill();
    ctx.strokeStyle = '#3a424a';
    ctx.stroke();
    
    ctx.restore();
}

drawWheel(monthCtx, months, monthAngle);
drawWheel(dayCtx, days, dayAngle);

function spinSequence() {
    isSpinning = true;
    spinButton.disabled = true;
    spinButton.style.opacity = "0.5";
    
    // Ensure view starts on Month wheel if playing again
    monthWrapper.classList.remove('hidden');
    dayWrapper.classList.add('hidden');
    
    const targetMonthIndex = Math.floor(Math.random() * months.length);
    const targetDayIndex = Math.floor(Math.random() * days.length);
    
    const monthArc = (Math.PI * 2) / months.length;
    const finalMonthAngle = (Math.PI * 2 * 5) - (targetMonthIndex * monthArc) - (monthArc / 2) - (Math.PI / 2);
    
    const dayArc = (Math.PI * 2) / days.length;
    const finalDayAngle = (Math.PI * 2 * 8) - (targetDayIndex * dayArc) - (dayArc / 2) - (Math.PI / 2);
    
    let currentMonthAngle = monthAngle % (Math.PI * 2);
    let currentDayAngle = dayAngle % (Math.PI * 2);
    
    let startTime = null;
    const monthDuration = 3000; 
    const dayDuration = 3000;   
    
    statusLabel.innerHTML = "SYSTEM STATUS: LOCKING MONTH...";
    dateResult.innerHTML = "CALCULATING...";

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        if (elapsed < monthDuration) {
            // Phase 1: Spin Month
            const progress = elapsed / monthDuration;
            const easeOut = 1 - Math.pow(1 - progress, 3); 
            monthAngle = currentMonthAngle + (finalMonthAngle - currentMonthAngle) * easeOut;
            
            drawWheel(monthCtx, months, monthAngle);
            requestAnimationFrame(animate);
        } 
        else if (elapsed < monthDuration + dayDuration) {
            // Phase 2: Switch to Day Wheel & Spin it
            if (dayWrapper.classList.contains('hidden')) {
                monthWrapper.classList.add('hidden'); // Hide Month
                dayWrapper.classList.remove('hidden'); // Show Day
                statusLabel.innerHTML = "SYSTEM STATUS: LOCKING DAY...";
                
                // Finalize month position behind the scenes
                monthAngle = finalMonthAngle;
                drawWheel(monthCtx, months, monthAngle);
            }
            
            const dayElapsed = elapsed - monthDuration;
            const progress = dayElapsed / dayDuration;
            const easeOut = 1 - Math.pow(1 - progress, 3);
            dayAngle = currentDayAngle + (finalDayAngle - currentDayAngle) * easeOut;
            
            drawWheel(dayCtx, days, dayAngle);
            requestAnimationFrame(animate);
        } 
        else {
            // Phase 3: Done!
            dayAngle = finalDayAngle;
            drawWheel(dayCtx, days, dayAngle);
            
            statusLabel.innerHTML = "SYSTEM STATUS: ALLOCATION READY";
            
            const finalMonth = months[targetMonthIndex];
            const finalDay = days[targetDayIndex];
            dateResult.innerHTML = `${finalMonth} ${finalDay}, 2026`;
            
            isSpinning = false;
            spinButton.disabled = false;
            spinButton.style.opacity = "1";
        }
    }
    
    requestAnimationFrame(animate);
}

spinButton.addEventListener('click', () => {
    if (!isSpinning) spinSequence();
});
