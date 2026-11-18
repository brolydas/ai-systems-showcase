import './style.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { NeuralMatrix } from './canvas/neuralMatrix';
import { PrecisionCursor } from './components/cursor';
import { sound } from './components/sound';
import { initPreloader } from './components/preloader';
import { initCnnSimulator } from './components/cnnSimulator';
import { initSemanticPlayground } from './components/semanticPlayground';
import { initMultimodalRadar } from './components/multimodalRadar';
import { CodeModal } from './components/codeModal';

gsap.registerPlugin(ScrollTrigger);

// 1. Lenis Scroll Spine (Unified with GSAP RAF loop)
const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;

if (!isReduced) {
  lenis = new Lenis({
    autoRaf: false,
    duration: 1.15,
    smoothWheel: true,
    syncTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// 2. Initialize Neural Matrix Canvas Background
const canvasEl = document.getElementById('neural-matrix-canvas');
let matrix = null;
if (canvasEl) {
  matrix = new NeuralMatrix(canvasEl);
}

// 3. Audio Toggle
const soundToggleBtn = document.querySelector('[data-sound-toggle]');
const soundLabelEl = document.querySelector('[data-sound-label]');
if (soundToggleBtn && soundLabelEl) {
  soundToggleBtn.addEventListener('click', () => {
    const isUnmuted = sound.toggle();
    soundLabelEl.textContent = isUnmuted ? "AUDIO: ON" : "AUDIO: OFF";
    soundToggleBtn.classList.toggle('is-active', isUnmuted);
  });
}

// 4. Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  // Ignore inside inputs
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.key === '1') {
    document.querySelector('#sector-cnn')?.scrollIntoView({ behavior: 'smooth' });
    sound.playClick();
  } else if (e.key === '2') {
    document.querySelector('#sector-semantic')?.scrollIntoView({ behavior: 'smooth' });
    sound.playClick();
  } else if (e.key === '3') {
    document.querySelector('#sector-multimodal')?.scrollIntoView({ behavior: 'smooth' });
    sound.playClick();
  } else if (e.key.toLowerCase() === 'm') {
    const isUnmuted = sound.toggle();
    if (soundLabelEl) soundLabelEl.textContent = isUnmuted ? "AUDIO: ON" : "AUDIO: OFF";
  }
});

// 5. Sector Observer to trigger Canvas Matrix Mode Morphs & Header Highlights
const sectors = document.querySelectorAll('.sector-section');
const navItems = document.querySelectorAll('.header__nav .nav-item');

const sectorObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const sectorId = entry.target.id;
      if (matrix) {
        if (sectorId === 'sector-cnn') matrix.setSectorMode('01');
        else if (sectorId === 'sector-semantic') matrix.setSectorMode('02');
        else if (sectorId === 'sector-multimodal') matrix.setSectorMode('03');
      }

      // Update nav link active state
      navItems.forEach((nav) => {
        const href = nav.getAttribute('href');
        nav.classList.toggle('is-active', href === `#${sectorId}`);
      });
    }
  });
}, { threshold: 0.35 });

sectors.forEach(s => sectorObserver.observe(s));

// 6. Reveal Animations
function initReveals() {
  if (isReduced) return;

  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true
      }
    });
  });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

// 7. Component Initializations
new PrecisionCursor();
initCnnSimulator();
initSemanticPlayground();
initMultimodalRadar();
new CodeModal();

// Run Preloader then reveals
initPreloader().then(() => {
  initReveals();
});
