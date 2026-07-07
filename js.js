const mCanvas = document.getElementById('month-wheel');
const dCanvas = document.getElementById('day-wheel');
const mCtx = mCanvas.getContext('2d');
const dCtx = dCanvas.getContext('2d');
const spinButton = document.getElementById('spin-button');
const statusLabel = document.getElementById('status-label');
const dateResult = document.getElementById('date-result');

// 2026 Schedule parameters
const months = ['JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const days = Array.from({length: 31}, (_, i) => i + 1);

const colors = ['#17202d', '#1e2b38'];

function drawWheel(ctx, segments, radius) {
  const numSegs = segments.length;
  const angle = (2 * Math.PI) / numSegs;
  ctx.clearRect(0, 0, radius * 2, radius * 2);
  
  segments.forEach((val, i) => {
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius - 5, i * angle, (i + 1) * angle);
    ctx.fillStyle = colors[i % 2];
    ctx.fill();
    ctx.strokeStyle = '#2a475e';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Text
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(i * angle + angle / 2);
    ctx.fillStyle = '#9099a1';
    ctx.font = numSegs > 12 ? 'bold 9px Arial' : 'bold 12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(val, radius - 20, 4);
    ctx.restore();
  });
  
  // Valve Hub Center Cap
  ctx.beginPath();
  ctx.arc(radius, radius, 25, 0, 2 * Math.PI);
  ctx.fillStyle = '#101822';
  ctx.fill();
  ctx.strokeStyle = '#3a5a74';
  ctx.stroke();
}

let currentMonthRot = 0;
let currentDayRot = 0;

function calculateSpin(currentRot, targetIndex, totalSegments) {
  const degPerSeg = 360 / totalSegments;
  const targetCenterDeg = (targetIndex * degPerSeg) + (degPerSeg / 2);
  
  let degToPointer = 270 - targetCenterDeg;
  if (degToPointer < 0) degToPointer += 360;
  
  const currentModulo = currentRot % 360;
  let diff = degToPointer - currentModulo;
  if (diff <= 0) diff += 360;
  
  // 5 base spins + precise alignment adjustment
  return currentRot + 1800 + diff;
}

spinButton.onclick = () => {
  spinButton.disabled = true;
  statusLabel.innerText = "SYNCHRONIZING RECONCILIATION THREADS...";
  dateResult.innerText = "CALCULATING MATRICES...";

  // 1. Generate a valid target timestamp from July 6, 2026 to Dec 31, 2026
  const start = new Date(2026, 6, 6); 
  const end = new Date(2026, 11, 31);
  const randomTimestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const targetDate = new Date(randomTimestamp);
  
  // 2. Map target date to our array indices
  const monthIndex = targetDate.getMonth() - 6; // July is index 0
  const dayIndex = targetDate.getDate() - 1;    // Day 1 is index 0

  // 3. Compute continuous execution angles
  currentMonthRot = calculateSpin(currentMonthRot, monthIndex, months.length);
  currentDayRot = calculateSpin(currentDayRot, dayIndex, days.length);
  
  // 4. Trigger physics animations via hardware transitions
  mCanvas.style.transition = 'transform 4.5s cubic-bezier(0.1, 0.8, 0.2, 1)';
  dCanvas.style.transition = 'transform 5s cubic-bezier(0.1, 0.8, 0.2, 1)';
  
  mCanvas.style.transform = `rotate(${currentMonthRot}deg)`;
  dCanvas.style.transform = `rotate(${currentDayRot}deg)`;
  
  // 5. Present result upon engine deceleration
  setTimeout(() => {
    statusLabel.innerText = "HARDWARE ALLOCATION DATE:";
    dateResult.innerText = targetDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    spinButton.disabled = false;
  }, 5200);
};

// Initial Build
drawWheel(mCtx, months, 150);
drawWheel(dCtx, days, 150);
