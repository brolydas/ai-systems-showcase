import { sound } from './sound';
import { PROJECTS_DATA } from '../data/projectsData';

export function initCnnSimulator() {
  const container = document.querySelector('#cnn-simulator');
  if (!container) return;

  const project = PROJECTS_DATA.find(p => p.id === 'histopathology-cnn');
  let currentSampleIndex = 0;
  let isFP16 = true;
  let isInferring = false;

  const canvas = container.querySelector('#histology-canvas');
  const ctx = canvas?.getContext('2d');

  function drawHistologySlide(sample) {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    // Base tissue background (hematoxylin & eosin color spectrum)
    ctx.clearRect(0, 0, w, h);
    
    // Eosin pinkish background
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.7);
    bgGrad.addColorStop(0, '#381628');
    bgGrad.addColorStop(1, '#1a0d16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Render cellular nuclei (Hematoxylin deep purple/blue)
    const seed = sample.id.length * 42;
    for (let i = 0; i < 90; i++) {
      const cx = (Math.sin(seed + i * 1.7) * 0.45 + 0.5) * w;
      const cy = (Math.cos(seed + i * 2.3) * 0.45 + 0.5) * h;
      const r = 3 + (Math.sin(i * 3) * 2 + 3);

      // Nucleus
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(110, 40, 160, 0.75)' : 'rgba(75, 25, 110, 0.65)';
      ctx.fill();

      // Nuclear membrane
      ctx.strokeStyle = 'rgba(180, 80, 220, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Heatmap Activation Overlay (Grad-CAM feature response)
    const heatGrad = ctx.createRadialGradient(w * 0.52, h * 0.48, 10, w * 0.52, h * 0.48, w * 0.45);
    heatGrad.addColorStop(0, 'rgba(16, 185, 129, 0.65)'); // Emerald activation
    heatGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.35)'); // Amber transition
    heatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = heatGrad;
    ctx.fillRect(0, 0, w, h);

    // Crosshair target
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(w * 0.52 - 20, h * 0.48);
    ctx.lineTo(w * 0.52 + 20, h * 0.48);
    ctx.moveTo(w * 0.52, h * 0.48 - 20);
    ctx.lineTo(w * 0.52, h * 0.48 + 20);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function updateUI() {
    const sample = project.samples[currentSampleIndex];
    
    // Update sample title & meta
    const titleEl = container.querySelector('[data-cnn-title]');
    const typeEl = container.querySelector('[data-cnn-type]');
    const latencyValEl = container.querySelector('[data-cnn-latency]');
    const vramValEl = container.querySelector('[data-cnn-vram]');
    const confValEl = container.querySelector('[data-cnn-conf]');
    const confBarEl = container.querySelector('[data-cnn-conf-bar]');
    const patternEl = container.querySelector('[data-cnn-pattern]');
    const featuresListEl = container.querySelector('[data-cnn-features]');

    if (titleEl) titleEl.textContent = sample.tissue;
    if (typeEl) typeEl.textContent = sample.tissueType;
    if (patternEl) patternEl.textContent = sample.cellularPattern;

    const latency = isFP16 ? sample.latencyMsFP16 : sample.latencyMsFP32;
    const vram = isFP16 ? "1.82 GB" : "3.51 GB";
    
    if (latencyValEl) latencyValEl.textContent = `${latency.toFixed(2)} ms`;
    if (vramValEl) vramValEl.textContent = vram;
    if (confValEl) confValEl.textContent = `${sample.confidence.toFixed(1)}%`;
    if (confBarEl) confBarEl.style.width = `${sample.confidence}%`;

    if (featuresListEl) {
      featuresListEl.innerHTML = sample.features.map(f => 
        `<span class="telemetry-badge"><span class="telemetry-dot"></span>${f}</span>`
      ).join('');
    }

    drawHistologySlide(sample);
  }

  // Sample tab clicks
  container.querySelectorAll('[data-sample-btn]').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('[data-sample-btn]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentSampleIndex = idx;
      sound.playClick();
      updateUI();
    });
  });

  // Precision mode toggle
  const precisionBtn = container.querySelector('[data-precision-toggle]');
  if (precisionBtn) {
    precisionBtn.addEventListener('click', () => {
      isFP16 = !isFP16;
      precisionBtn.textContent = isFP16 ? "MODE: FP16 (AMP ACCELERATED)" : "MODE: FP32 (FULL PRECISION)";
      precisionBtn.classList.toggle('is-fp16', isFP16);
      sound.playModeShift();
      updateUI();
    });
  }

  // Run Benchmark Button
  const runBtn = container.querySelector('[data-run-cnn]');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      if (isInferring) return;
      isInferring = true;
      runBtn.textContent = "COMPUTING TENSOR PASS...";
      runBtn.classList.add('is-running');
      sound.playClick();

      setTimeout(() => {
        isInferring = false;
        runBtn.textContent = "RUN INFERENCE BENCHMARK";
        runBtn.classList.remove('is-running');
        sound.playSuccess();
        updateUI();
      }, 350);
    });
  }

  updateUI();
}
