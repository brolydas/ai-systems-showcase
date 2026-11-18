/**
 * Precision Telemetry Cursor HUD
 * Follows mouse with smooth lerp physics, displays live coordinate telemetry,
 * snaps magnetically to interactive triggers, and hides on touch/coarse pointers.
 */

export class PrecisionCursor {
  constructor() {
    this.cursorEl = document.querySelector('[data-cursor]');
    this.dotEl = document.querySelector('[data-cursor-dot]');
    this.coordsEl = document.querySelector('[data-cursor-coords]');
    this.labelEl = document.querySelector('[data-cursor-label]');
    
    this.x = -100;
    this.y = -100;
    this.targetX = -100;
    this.targetY = -100;
    
    this.isHovering = false;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    
    if (!this.isTouch && this.cursorEl) {
      this.init();
    } else if (this.cursorEl) {
      this.cursorEl.style.display = 'none';
    }
  }

  init() {
    window.addEventListener('mousemove', (e) => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;
      if (this.coordsEl) {
        this.coordsEl.textContent = `${Math.round(this.targetX).toString().padStart(4, '0')} : ${Math.round(this.targetY).toString().padStart(4, '0')}`;
      }
    });

    // Magnetic triggers & state hover listeners
    this.attachListeners();
    this.loop();
  }

  attachListeners() {
    document.querySelectorAll('a, button, [data-magnetic], [data-interactive]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        this.cursorEl?.classList.add('is-hovering');
        const customLabel = el.getAttribute('data-cursor-text');
        if (customLabel && this.labelEl) {
          this.labelEl.textContent = customLabel;
          this.labelEl.style.display = 'block';
        }
      });

      el.addEventListener('mouseleave', () => {
        this.cursorEl?.classList.remove('is-hovering');
        if (this.labelEl) {
          this.labelEl.style.display = 'none';
          this.labelEl.textContent = '';
        }
      });
    });
  }

  loop() {
    this.x += (this.targetX - this.x) * 0.18;
    this.y += (this.targetY - this.y) * 0.18;

    if (this.cursorEl) {
      this.cursorEl.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    }

    requestAnimationFrame(() => this.loop());
  }
}
