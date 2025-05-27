const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");

let A1 = 50, A2 = 50;
let freq = 2;
let phase = 0;
let wavelength = 100;
let time = 0;
let isStationary = false;
let showOnlyResult = false;
let viewMode = 'classic';

let animationId = null;
let isPaused = false;

// Obtener referencias a los elementos del panel de estadísticas
const statFreq = document.getElementById("statFreq");
const statA1 = document.getElementById("statA1");
const statA2 = document.getElementById("statA2");
const statPhase = document.getElementById("statPhase");
const statMax = document.getElementById("statMax");
const statMin = document.getElementById("statMin");
const statCenter = document.getElementById("statCenter");

document.getElementById("amplitude1").addEventListener("input", e => A1 = +e.target.value);
document.getElementById("amplitude2").addEventListener("input", e => A2 = +e.target.value);
document.getElementById("frequency").addEventListener("input", e => freq = +e.target.value);
document.getElementById("phase").addEventListener("input", e => phase = +e.target.value);
document.getElementById("stationary").addEventListener("change", e => isStationary = e.target.checked);
document.getElementById("showOnlyResult").addEventListener("change", e => showOnlyResult = e.target.checked);

document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => viewMode = btn.dataset.view);
});

document.getElementById("togglePause").addEventListener("click", () => {
  isPaused = !isPaused;
  const btn = document.getElementById("togglePause");
  btn.textContent = isPaused ? "▶ Reanudar" : "⏸ Pausar";

  if (!isPaused) {
    draw(); // Reanudar
  } else {
    cancelAnimationFrame(animationId); // Pausar
  }
});

function drawWave(data, color, offsetY = 0, transform = null) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  // Mover al primer punto antes de empezar a dibujar
  if (data.length > 0) {
      let px = 0;
      let py = data[0];
      if (transform === 'oscilloscope') {
          [px, py] = [canvas.width / 2 + data[0], 0 - canvas.height / 2]; // Ajuste inicial para osciloscopio
      } else if (transform === 'perspective') {
          px = 0;
          py = data[0] * 0.6 + 0.002 * 0 * data[0];
      }
      ctx.moveTo(px, py + offsetY);
  }

  data.forEach((value, x) => {
    let px = x;
    let py = value;

    if (transform === 'oscilloscope') {
      [px, py] = [canvas.width / 2 + value, x - canvas.height / 2];
    } else if (transform === 'perspective') {
      px = x;
      py = value * 0.6 + 0.002 * x * value;
    }

    ctx.lineTo(px, py + offsetY);
  });
  ctx.stroke();
}

function updateStats(resultWave) {
    let maxVal = -Infinity;
    let minVal = Infinity;
    let centerVal = 0; // Valor en el centro del canvas

    // Calcular max y min
    if (resultWave.length > 0) {
        maxVal = Math.max(...resultWave);
        minVal = Math.min(...resultWave);
        // El valor en el centro del canvas (x = canvas.width / 2)
        centerVal = resultWave[Math.floor(canvas.width / 2)];
    }

    // Actualizar el HTML
    statFreq.textContent = freq.toFixed(2);
    statA1.textContent = A1;
    statA2.textContent = A2;
    statPhase.textContent = phase.toFixed(2);
    statMax.textContent = maxVal.toFixed(2);
    statMin.textContent = minVal.toFixed(2);
    statCenter.textContent = centerVal.toFixed(2);
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const wave1 = [], wave2 = [], result = [];

  for (let x = 0; x < canvas.width; x++) {
    let k = (2 * Math.PI / wavelength) * x;
    let omega = time * freq;

    let y1 = A1 * Math.sin(k - omega);
    let y2 = isStationary
      ? A2 * Math.sin(k + omega + phase)
      : A2 * Math.sin(k - omega + phase);

    let yResult = y1 + y2;

    wave1.push(y1);
    wave2.push(y2);
    result.push(yResult);
    
  }

  if (!showOnlyResult) {
    drawWave(wave1, "blue", canvas.height / 2, viewMode);
    drawWave(wave2, "red", canvas.height / 2, viewMode);
  }

  drawWave(result, "black", canvas.height / 2, viewMode);
  time += 0.05;

  // Actualizar las estadísticas en cada frame
  updateStats(result);

  if (!isPaused) {
    animationId = requestAnimationFrame(draw);
  }
}

draw();