import { gsap } from 'gsap';
import { sound } from './sound';

export function initPreloader() {
  return new Promise((resolve) => {
    const preloader = document.querySelector('[data-preloader]');
    const numEl = document.querySelector('[data-preload-num]');
    const barEl = document.querySelector('[data-preload-bar]');
    const logEl = document.querySelector('[data-preload-log]');
    
    if (!preloader || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (preloader) preloader.style.display = 'none';
      resolve();
      return;
    }

    const logs = [
      "INITIALIZING NEURAL TELEMETRY KERNEL",
      "LOADING LC25000 HISTOPATHOLOGY TENSOR ATLAS",
      "INITIALIZING PYTORCH FP16 AUTOMATIC MIXED PRECISION",
      "MOUNTING FAISS INDEXFLATIP 768-D DENSE VECTORS",
      "SYNCHRONIZING CLIP VIT-B/32 MULTIMODAL MANIFOLD",
      "SYSTEM CORES OPERATIONAL"
    ];

    let progress = { value: 0 };
    let logIndex = 0;

    const tl = gsap.timeline({
      onComplete: () => {
        sound.playSuccess();
        gsap.to(preloader, {
          yPercent: -100,
          duration: 0.85,
          ease: "power4.inOut",
          onComplete: () => {
            preloader.style.display = 'none';
            resolve();
          }
        });
      }
    });

    tl.to(progress, {
      value: 100,
      duration: 1.6,
      ease: "power2.inOut",
      onUpdate: () => {
        const val = Math.floor(progress.value);
        if (numEl) numEl.textContent = val.toString().padStart(3, '0');
        if (barEl) barEl.style.width = `${val}%`;

        // Update log line
        const targetLog = Math.min(Math.floor((val / 100) * logs.length), logs.length - 1);
        if (targetLog !== logIndex) {
          logIndex = targetLog;
          if (logEl) logEl.textContent = logs[logIndex];
          sound.playClick();
        }
      }
    });

    // Allow user to click to bypass immediately
    preloader.addEventListener('click', () => {
      tl.progress(1);
    });
  });
}
