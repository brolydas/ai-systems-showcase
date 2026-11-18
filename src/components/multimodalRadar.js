import { sound } from './sound';
import { PROJECTS_DATA } from '../data/projectsData';

export function initMultimodalRadar() {
  const container = document.querySelector('#multimodal-simulator');
  if (!container) return;

  const project = PROJECTS_DATA.find(p => p.id === 'multimodal-search');
  let currentPromptIndex = 0;

  const canvas = container.querySelector('#clip-radar-canvas');
  const ctx = canvas?.getContext('2d');

  function drawCrossModalRadar(item) {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.min(w, h) * 0.42;

    // Draw radar concentric circles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1.0].forEach(factor => {
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * factor, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Radar spokes (Vision & Text latent axes)
    const axes = 8;
    for (let a = 0; a < axes; a++) {
      const angle = (a / axes) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
      ctx.stroke();
    }

    // Text Embedding Vector (Amber spoke)
    const textAngle = -Math.PI * 0.25;
    const textRadius = maxRadius * 0.92;
    const tx = cx + Math.cos(textAngle) * textRadius;
    const ty = cy + Math.sin(textAngle) * textRadius;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(tx, ty, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '10px monospace';
    ctx.fillText('CLIP Text Prompt (512-D)', tx + 10, ty);

    // Image Embedding Target Vector (Sky Blue spoke)
    const imgAngle = textAngle + (1 - item.topSim) * 0.5;
    const imgRadius = maxRadius * item.topSim;
    const ix = cx + Math.cos(imgAngle) * imgRadius;
    const iy = cy + Math.sin(imgAngle) * imgRadius;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ix, iy);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(ix, iy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`COCO Image Match (${(item.topSim * 100).toFixed(1)}%)`, ix + 10, iy + 14);

    // Latent Distance Chord
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(ix, iy);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function updateUI() {
    const item = project.prompts[currentPromptIndex];

    const promptTextEl = container.querySelector('[data-mm-prompt]');
    const simValEl = container.querySelector('[data-mm-sim]');
    const simBarEl = container.querySelector('[data-mm-bar]');
    const catEl = container.querySelector('[data-mm-category]');
    const descEl = container.querySelector('[data-mm-desc]');
    const tagsContainer = container.querySelector('[data-mm-tags]');

    if (promptTextEl) promptTextEl.textContent = `"${item.prompt}"`;
    if (simValEl) simValEl.textContent = `${(item.topSim * 100).toFixed(1)}%`;
    if (simBarEl) simBarEl.style.width = `${item.topSim * 100}%`;
    if (catEl) catEl.textContent = item.category;
    if (descEl) descEl.textContent = item.description;

    if (tagsContainer) {
      tagsContainer.innerHTML = item.tags.map(t =>
        `<span class="telemetry-badge"><span class="telemetry-dot" style="background:#f59e0b"></span>${t}</span>`
      ).join('');
    }

    drawCrossModalRadar(item);
  }

  // Prompt tabs
  container.querySelectorAll('[data-prompt-btn]').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('[data-prompt-btn]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentPromptIndex = idx;
      sound.playClick();
      updateUI();
    });
  });

  // Custom prompt input
  const inputEl = container.querySelector('#custom-mm-input');
  const searchBtn = container.querySelector('#custom-mm-btn');
  if (inputEl && searchBtn) {
    searchBtn.addEventListener('click', () => {
      const txt = inputEl.value.trim();
      if (!txt) return;
      sound.playClick();

      const dynamicSim = 0.82 + (txt.length % 13) * 0.01;
      const customItem = {
        prompt: txt,
        topSim: Math.min(dynamicSim, 0.95),
        category: "Zero-Shot Latent Synthesis",
        description: `Cross-modal projection of "${txt}" matched against pre-indexed COCO 512-D tensor bank.`,
        tags: ["ViT-B/32", "FAISS-GPU", "Cosine Metric", "Zero-Shot"]
      };

      const promptTextEl = container.querySelector('[data-mm-prompt]');
      const simValEl = container.querySelector('[data-mm-sim]');
      const simBarEl = container.querySelector('[data-mm-bar]');
      const catEl = container.querySelector('[data-mm-category]');
      const descEl = container.querySelector('[data-mm-desc]');
      const tagsContainer = container.querySelector('[data-mm-tags]');

      if (promptTextEl) promptTextEl.textContent = `"${customItem.prompt}"`;
      if (simValEl) simValEl.textContent = `${(customItem.topSim * 100).toFixed(1)}%`;
      if (simBarEl) simBarEl.style.width = `${customItem.topSim * 100}%`;
      if (catEl) catEl.textContent = customItem.category;
      if (descEl) descEl.textContent = customItem.description;

      if (tagsContainer) {
        tagsContainer.innerHTML = customItem.tags.map(t =>
          `<span class="telemetry-badge"><span class="telemetry-dot" style="background:#f59e0b"></span>${t}</span>`
        ).join('');
      }

      drawCrossModalRadar(customItem);
      sound.playSuccess();
    });
  }

  updateUI();
}
