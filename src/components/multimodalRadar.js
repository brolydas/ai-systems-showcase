import { sound } from './sound';
import { PROJECTS_DATA } from '../data/projectsData';

export function initMultimodalRadar() {
  const container = document.querySelector('#multimodal-simulator');
  if (!container) return;

  const project = PROJECTS_DATA.find(p => p.id === 'multimodal-search');
  const gallery = project.gallery;
  let currentPrompt = "a person with an umbrella in the rain";

  const canvas = container.querySelector('#clip-radar-canvas');
  const ctx = canvas?.getContext('2d');

  function calculateCLIPSimilarity(prompt, item) {
    const pLower = prompt.toLowerCase();
    let score = 0.65; // Base latent cross-modal alignment

    // Keyword match boosts representing CLIP token-patch attention
    for (const kw of item.keywords) {
      if (pLower.includes(kw)) {
        score += 0.085;
      }
    }

    // Contextual semantic synonyms
    if (pLower.includes('dog') || pLower.includes('puppy') || pLower.includes('pet')) {
      if (item.id === 'dog_frisbee') score += 0.16;
    }
    if (pLower.includes('kitchen') || pLower.includes('cooking') || pLower.includes('refrigerator') || pLower.includes('food')) {
      if (item.id === 'kitchen') score += 0.16;
    }
    if (pLower.includes('umbrella') || pLower.includes('rain') || pLower.includes('walking') || pLower.includes('weather')) {
      if (item.id === 'umbrella') score += 0.16;
    }
    if (pLower.includes('plane') || pLower.includes('flight') || pLower.includes('sky') || pLower.includes('airport')) {
      if (item.id === 'airplane') score += 0.16;
    }
    if (pLower.includes('bike') || pLower.includes('motorcycle') || pLower.includes('vehicle') || pLower.includes('ride')) {
      if (item.id === 'motorcycle') score += 0.16;
    }
    if (pLower.includes('sofa') || pLower.includes('room') || pLower.includes('couch') || pLower.includes('living')) {
      if (item.id === 'living_room') score += 0.16;
    }

    return Math.min(Math.max(score, 0.62), 0.96);
  }

  function drawRadar(itemSim) {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.min(w, h) * 0.42;

    // Radar concentric circles (512-D unit hypersphere rings)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1.0].forEach(factor => {
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * factor, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 8 Spoke latent axes
    const axes = 8;
    for (let a = 0; a < axes; a++) {
      const angle = (a / axes) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
      ctx.stroke();
    }

    // Text Prompt Vector (Amber spoke)
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

    // Top Image Vector (Sky blue spoke)
    const imgAngle = textAngle + (1 - itemSim) * 0.5;
    const imgRadius = maxRadius * itemSim;
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
    ctx.fillText(`Top COCO Match (${(itemSim * 100).toFixed(1)}%)`, ix + 10, iy + 14);

    // Latent cross-modal distance chord
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(ix, iy);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function searchMultimodal(prompt) {
    currentPrompt = prompt;

    // Rank all COCO images in the gallery
    const ranked = gallery.map(item => {
      const sim = calculateCLIPSimilarity(prompt, item);
      return { ...item, sim };
    }).sort((a, b) => b.sim - a.sim);

    const topItem = ranked[0];

    const promptTextEl = container.querySelector('[data-mm-prompt]');
    const simValEl = container.querySelector('[data-mm-sim]');
    const simBarEl = container.querySelector('[data-mm-bar]');
    const catEl = container.querySelector('[data-mm-category]');
    const descEl = container.querySelector('[data-mm-desc]');
    const tagsContainer = container.querySelector('[data-mm-tags]');
    const galleryContainer = container.querySelector('[data-mm-gallery]');

    if (promptTextEl) promptTextEl.textContent = `"${prompt}"`;
    if (simValEl) simValEl.textContent = `${(topItem.sim * 100).toFixed(1)}%`;
    if (simBarEl) simBarEl.style.width = `${topItem.sim * 100}%`;
    if (catEl) catEl.textContent = topItem.category;
    if (descEl) descEl.textContent = topItem.caption;

    if (tagsContainer) {
      tagsContainer.innerHTML = topItem.tags.map(t =>
        `<span class="telemetry-badge"><span class="telemetry-dot" style="background:#f59e0b"></span>${t}</span>`
      ).join('');
    }

    // Render ranked gallery cards with authentic COCO photos
    if (galleryContainer) {
      galleryContainer.innerHTML = ranked.map((item, idx) => `
        <div class="coco-card ${idx === 0 ? 'is-top' : ''}">
          <div class="coco-img-wrap">
            <img src="${item.imageSrc}" alt="${item.caption}" loading="lazy" />
            <span class="coco-rank-badge ${idx === 0 ? 'bg-amber' : 'bg-dim'}">RANK #${idx + 1}</span>
            <span class="coco-sim-badge text-amber">${(item.sim * 100).toFixed(1)}%</span>
          </div>
          <div class="coco-card-info">
            <p class="coco-caption">${item.caption}</p>
            <span class="coco-category">${item.category}</span>
          </div>
        </div>
      `).join('');
    }

    drawRadar(topItem.sim);
  }

  // Preset query buttons
  container.querySelectorAll('[data-prompt-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('[data-prompt-btn]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const q = btn.textContent.trim();
      const inputEl = container.querySelector('#custom-mm-input');
      if (inputEl) inputEl.value = q;
      sound.playClick();
      searchMultimodal(q);
    });
  });

  // Custom prompt input
  const inputEl = container.querySelector('#custom-mm-input');
  const searchBtn = container.querySelector('#custom-mm-btn');

  function handleCustomSearch() {
    const val = inputEl?.value.trim();
    if (!val) return;
    sound.playClick();
    searchMultimodal(val);
    sound.playSuccess();
  }

  searchBtn?.addEventListener('click', handleCustomSearch);
  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCustomSearch();
  });

  searchMultimodal(currentPrompt);
}
