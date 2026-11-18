import { sound } from './sound';
import { PROJECTS_DATA } from '../data/projectsData';

export class CodeModal {
  constructor() {
    this.modalEl = document.querySelector('[data-code-modal]');
    this.backdropEl = document.querySelector('[data-modal-backdrop]');
    this.closeBtn = document.querySelector('[data-modal-close]');
    this.titleEl = document.querySelector('[data-modal-title]');
    this.taglineEl = document.querySelector('[data-modal-tagline]');
    this.techEl = document.querySelector('[data-modal-tech]');
    this.archEl = document.querySelector('[data-modal-arch]');
    this.codeEl = document.querySelector('[data-modal-code]');
    this.githubLinkEl = document.querySelector('[data-modal-github]');

    this.isOpen = false;
    this.init();
  }

  init() {
    if (!this.modalEl) return;

    this.closeBtn?.addEventListener('click', () => this.close());
    this.backdropEl?.addEventListener('click', () => this.close());

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    document.querySelectorAll('[data-open-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const projectId = btn.getAttribute('data-open-modal');
        this.open(projectId);
      });
    });
  }

  open(projectId) {
    const project = PROJECTS_DATA.find(p => p.id === projectId);
    if (!project) return;

    if (this.titleEl) this.titleEl.textContent = project.title;
    if (this.taglineEl) this.taglineEl.textContent = project.tagline;

    if (this.techEl) {
      this.techEl.innerHTML = project.techStack.map(t =>
        `<span class="telemetry-badge">${t}</span>`
      ).join('');
    }

    if (this.archEl) {
      const archKeys = Object.keys(project.architecture);
      this.archEl.innerHTML = archKeys.map(k => `
        <div class="arch-item">
          <span class="arch-key">${k.toUpperCase()}:</span>
          <span class="arch-val">${project.architecture[k]}</span>
        </div>
      `).join('');
    }

    if (this.codeEl) {
      this.codeEl.textContent = project.codeSnippet;
    }

    if (this.githubLinkEl) {
      this.githubLinkEl.href = project.repoUrl;
      this.githubLinkEl.textContent = `VIEW REPOSITORY ON GITHUB ↗`;
    }

    this.modalEl.classList.add('is-open');
    this.isOpen = true;
    sound.playClick();
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modalEl.classList.remove('is-open');
    this.isOpen = false;
    sound.playClick();
    document.body.style.overflow = '';
  }
}
