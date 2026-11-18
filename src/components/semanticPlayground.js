import { sound } from './sound';
import { PROJECTS_DATA } from '../data/projectsData';

export function initSemanticPlayground() {
  const container = document.querySelector('#semantic-playground');
  if (!container) return;

  const project = PROJECTS_DATA.find(p => p.id === 'semantic-retrieval');
  let currentQueryIndex = 0;

  const canvas = container.querySelector('#vector-canvas');
  const ctx = canvas?.getContext('2d');

  function drawVectorSpace(queryItem) {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Center origin (Hypersphere origin)
    const ox = w * 0.45;
    const oy = h * 0.55;

    // Draw unit circles / vector field lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    [60, 110, 160].forEach(r => {
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.beginPath();
    ctx.moveTo(ox - 180, oy);
    ctx.lineTo(ox + 180, oy);
    ctx.moveTo(ox, oy - 160);
    ctx.lineTo(ox, oy + 160);
    ctx.stroke();

    // Query Vector (Electric Indigo)
    const qAngle = -Math.PI * 0.28;
    const qLen = 135;
    const qx = ox + Math.cos(qAngle) * qLen;
    const qy = oy + Math.sin(qAngle) * qLen;

    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(qx, qy);
    ctx.stroke();

    // Query point & label
    ctx.fillStyle = '#818cf8';
    ctx.beginPath();
    ctx.arc(qx, qy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '10px monospace';
    ctx.fillText('Query q (768-D)', qx + 8, qy - 4);

    // Semantic Match Vector (Dense Positive d+) - closely aligned angle
    const semAngle = qAngle + (1 - queryItem.semanticScore) * 0.65;
    const semLen = 140;
    const semX = ox + Math.cos(semAngle) * semLen;
    const semY = oy + Math.sin(semAngle) * semLen;

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(semX, semY);
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(semX, semY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`Semantic d+ (cos=${queryItem.semanticScore})`, semX + 8, semY + 12);

    // Arc between q and sem
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.arc(ox, oy, 70, Math.min(qAngle, semAngle), Math.max(qAngle, semAngle));
    ctx.stroke();
    ctx.setLineDash([]);

    // BM25 Keyword Vector (Misaligned / Lexical Trap) - far away angle
    const lexAngle = qAngle + 1.85;
    const lexLen = 120;
    const lexX = ox + Math.cos(lexAngle) * lexLen;
    const lexY = oy + Math.sin(lexAngle) * lexLen;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(lexX, lexY);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(lexX, lexY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`BM25 Keyword Trap (score=${queryItem.bm25Score})`, lexX - 160, lexY + 15);
  }

  function updateUI() {
    const qData = project.queries[currentQueryIndex];

    const queryDisplayEl = container.querySelector('[data-sem-query]');
    const semScoreEl = container.querySelector('[data-sem-score]');
    const semBarEl = container.querySelector('[data-sem-bar]');
    const semMatchEl = container.querySelector('[data-sem-match]');

    const bm25ScoreEl = container.querySelector('[data-bm25-score]');
    const bm25BarEl = container.querySelector('[data-bm25-bar]');
    const bm25MatchEl = container.querySelector('[data-bm25-match]');

    const analysisEl = container.querySelector('[data-sem-analysis]');

    if (queryDisplayEl) queryDisplayEl.textContent = `"${qData.query}"`;

    if (semScoreEl) semScoreEl.textContent = qData.semanticScore.toFixed(2);
    if (semBarEl) semBarEl.style.width = `${qData.semanticScore * 100}%`;
    if (semMatchEl) semMatchEl.textContent = qData.bestMatch;

    if (bm25ScoreEl) bm25ScoreEl.textContent = qData.bm25Score.toFixed(2);
    if (bm25BarEl) bm25BarEl.style.width = `${qData.bm25Score * 100}%`;
    if (bm25MatchEl) bm25MatchEl.textContent = qData.bm25Match;

    if (analysisEl) analysisEl.textContent = qData.analysis;

    drawVectorSpace(qData);
  }

  // Preset query buttons
  container.querySelectorAll('[data-query-btn]').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('[data-query-btn]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentQueryIndex = idx;
      sound.playClick();
      updateUI();
    });
  });

  // Custom query input
  const inputEl = container.querySelector('#custom-semantic-input');
  const searchBtn = container.querySelector('#custom-semantic-btn');
  if (inputEl && searchBtn) {
    searchBtn.addEventListener('click', () => {
      const txt = inputEl.value.trim();
      if (!txt) return;
      sound.playClick();
      
      // Calculate dynamic pseudo-embedding similarity
      const mockScore = 0.88 + (txt.length % 11) * 0.01;
      const customData = {
        query: txt,
        bm25Score: 0.18,
        semanticScore: Math.min(mockScore, 0.98),
        bestMatch: `Indexed knowledge cluster matching concepts in: "${txt}"`,
        bm25Match: `Lexical keyword stem match for token: "${txt.split(' ')[0] || 'term'}"`,
        analysis: `Neural bi-encoder projects "${txt}" into 768-D unit sphere; FAISS performs Inner Product search across clustered vectors in <0.5ms.`
      };

      const queryDisplayEl = container.querySelector('[data-sem-query]');
      const semScoreEl = container.querySelector('[data-sem-score]');
      const semBarEl = container.querySelector('[data-sem-bar]');
      const semMatchEl = container.querySelector('[data-sem-match]');
      const bm25ScoreEl = container.querySelector('[data-bm25-score]');
      const bm25BarEl = container.querySelector('[data-bm25-bar]');
      const bm25MatchEl = container.querySelector('[data-bm25-match]');
      const analysisEl = container.querySelector('[data-sem-analysis]');

      if (queryDisplayEl) queryDisplayEl.textContent = `"${customData.query}"`;
      if (semScoreEl) semScoreEl.textContent = customData.semanticScore.toFixed(2);
      if (semBarEl) semBarEl.style.width = `${customData.semanticScore * 100}%`;
      if (semMatchEl) semMatchEl.textContent = customData.bestMatch;
      if (bm25ScoreEl) bm25ScoreEl.textContent = customData.bm25Score.toFixed(2);
      if (bm25BarEl) bm25BarEl.style.width = `${customData.bm25Score * 100}%`;
      if (bm25MatchEl) bm25MatchEl.textContent = customData.bm25Match;
      if (analysisEl) analysisEl.textContent = customData.analysis;

      drawVectorSpace(customData);
      sound.playSuccess();
    });
  }

  updateUI();
}
