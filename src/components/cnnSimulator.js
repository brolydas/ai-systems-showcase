import { sound } from './sound';
import { PROJECTS_DATA } from '../data/projectsData';

export function initCnnSimulator() {
  const container = document.querySelector('#cnn-simulator');
  if (!container) return;

  const project = PROJECTS_DATA.find(p => p.id === 'histopathology-cnn');
  let currentSampleIndex = 0;
  let isFP16 = true;
  let showGradCam = true;
  let isInferring = false;
  let customImage = null;

  const canvas = container.querySelector('#histology-canvas');
  const ctx = canvas?.getContext('2d');

  function renderSlide(sample) {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const img = customImage || new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw base histological slide
      ctx.drawImage(img, 0, 0, w, h);

      // Render Grad-CAM attention heatmap overlay if enabled
      if (showGradCam) {
        const cx = sample.id.includes('colon') ? w * 0.48 : w * 0.55;
        const cy = sample.id.includes('bnt') ? h * 0.5 : h * 0.45;
        const gradRadius = sample.id.includes('bnt') ? w * 0.35 : w * 0.42;

        const heatGrad = ctx.createRadialGradient(cx, cy, 15, cx, cy, gradRadius);
        if (sample.id.includes('aca') || sample.id.includes('scc')) {
          heatGrad.addColorStop(0, 'rgba(239, 68, 68, 0.72)'); // High malignant activation (Red)
          heatGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.45)'); // Mid transition (Amber)
          heatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          heatGrad.addColorStop(0, 'rgba(16, 185, 129, 0.65)'); // Benign normal pattern (Emerald)
          heatGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
          heatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

        ctx.fillStyle = heatGrad;
        ctx.fillRect(0, 0, w, h);

        // Feature focal crosshair
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx - 24, cy);
        ctx.lineTo(cx + 24, cy);
        ctx.moveTo(cx, cy - 24);
        ctx.lineTo(cx, cy + 24);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    if (customImage) {
      img.onload();
    } else {
      img.src = sample.imageSrc;
    }
  }

  function updateUI() {
    const sample = project.samples[currentSampleIndex];

    const titleEl = container.querySelector('[data-cnn-title]');
    const typeEl = container.querySelector('[data-cnn-type]');
    const sourceEl = container.querySelector('[data-cnn-source]');
    const latencyValEl = container.querySelector('[data-cnn-latency]');
    const vramValEl = container.querySelector('[data-cnn-vram]');
    const confValEl = container.querySelector('[data-cnn-conf]');
    const patternEl = container.querySelector('[data-cnn-pattern]');
    const featuresListEl = container.querySelector('[data-cnn-features]');
    const probListEl = container.querySelector('[data-cnn-probabilities]');

    if (titleEl) titleEl.textContent = sample.tissue;
    if (typeEl) typeEl.textContent = sample.tissueType;
    if (sourceEl) sourceEl.textContent = sample.datasetSource;
    if (patternEl) patternEl.textContent = sample.cellularPattern;

    const latency = isFP16 ? sample.latencyMsFP16 : sample.latencyMsFP32;
    const vram = isFP16 ? "1.82 GB (AMP FP16)" : "3.51 GB (FP32)";

    if (latencyValEl) latencyValEl.textContent = `${latency.toFixed(2)} ms`;
    if (vramValEl) vramValEl.textContent = vram;
    if (confValEl) confValEl.textContent = `${sample.confidence.toFixed(1)}%`;

    if (featuresListEl) {
      featuresListEl.innerHTML = sample.features.map(f =>
        `<span class="telemetry-badge"><span class="telemetry-dot"></span>${f}</span>`
      ).join('');
    }

    if (probListEl) {
      probListEl.innerHTML = sample.probabilities.map((prob, i) => `
        <div class="prob-row">
          <span class="prob-name">${prob.name}:</span>
          <div class="prob-bar-track">
            <div class="prob-bar-fill ${i === 0 ? 'bg-emerald' : 'bg-dim'}" style="width: ${prob.p}%"></div>
          </div>
          <span class="prob-val">${prob.p.toFixed(1)}%</span>
        </div>
      `).join('');
    }

    renderSlide(sample);
  }

  // 5 Class Tab Buttons
  container.querySelectorAll('[data-sample-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('[data-sample-btn]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentSampleIndex = parseInt(btn.getAttribute('data-sample-btn'), 10);
      customImage = null;
      sound.playClick();
      updateUI();
    });
  });

  // Toggle Grad-CAM Heatmap
  const gradCamBtn = container.querySelector('[data-gradcam-toggle]');
  if (gradCamBtn) {
    gradCamBtn.addEventListener('click', () => {
      showGradCam = !showGradCam;
      gradCamBtn.textContent = showGradCam ? "GRAD-CAM: ACTIVE" : "GRAD-CAM: OFF";
      gradCamBtn.classList.toggle('is-active', showGradCam);
      sound.playClick();
      renderSlide(project.samples[currentSampleIndex]);
    });
  }

  // Precision mode toggle (FP16 vs FP32)
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

  // User Slide Upload handler
  const uploadInput = container.querySelector('#histology-file-upload');
  if (uploadInput) {
    uploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          customImage = img;
          sound.playSuccess();
          updateUI();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Run Inference Benchmark Button
  const runBtn = container.querySelector('[data-run-cnn]');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      if (isInferring) return;
      isInferring = true;
      runBtn.textContent = "COMPUTING FORWARD PASS & GRAD-CAM...";
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
