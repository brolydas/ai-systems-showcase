/**
 * Neural Telemetry Matrix & Vector Space Canvas
 * Signature interactive background morphing between:
 * - Sector 01: CNN Tensor Activation Matrix (Convolutional feature flow)
 * - Sector 02: 768-D Hyperspherical Vector Voronoi Lattice (Semantic clusters)
 * - Sector 03: Bipartite Vision-Language Cross-Attention Graph (CLIP Latent Space)
 */

export class NeuralMatrix {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    this.mode = 'cnn'; // 'cnn' | 'semantic' | 'multimodal'
    this.targetMode = 'cnn';
    this.modeTransition = 1;
    
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;
    this.targetMouseX = this.width / 2;
    this.targetMouseY = this.height / 2;
    
    this.nodes = [];
    this.numNodes = Math.min(Math.floor((this.width * this.height) / 14000), 75);
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.animationFrameId = null;
    this.time = 0;
    
    this.init();
  }

  init() {
    this.resize();
    this.createNodes();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = e.clientX;
      this.targetMouseY = e.clientY;
    });

    if (!this.reducedMotion) {
      this.loop();
    } else {
      this.renderStatic();
    }
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.numNodes = Math.min(Math.floor((this.width * this.height) / 14000), 75);
    this.createNodes();
  }

  createNodes() {
    this.nodes = [];
    for (let i = 0; i < this.numNodes; i++) {
      this.nodes.push({
        // General position
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.2,
        
        // Mode 1: CNN Grid Target
        cnnX: (i % 10) * (this.width / 11) + (this.width / 11) * 0.9,
        cnnY: Math.floor(i / 10) * (this.height / 8) + (this.height / 8) * 0.8,
        activation: Math.random(),
        pulseSpeed: 0.02 + Math.random() * 0.04,
        
        // Mode 2: Semantic Voronoi Cluster Target
        cluster: i % 4,
        clusterAngle: Math.random() * Math.PI * 2,
        clusterDist: 40 + Math.random() * (Math.min(this.width, this.height) * 0.32),
        
        // Mode 3: Multimodal Dual-Hemisphere Target (Left = Vision, Right = Text)
        isVision: i % 2 === 0,
        hemisphereX: (i % 2 === 0) ? this.width * 0.28 + (Math.random() - 0.5) * (this.width * 0.2) : this.width * 0.72 + (Math.random() - 0.5) * (this.width * 0.2),
        hemisphereY: this.height * 0.25 + Math.random() * (this.height * 0.55),
        
        // Interpolated current positions
        curX: Math.random() * this.width,
        curY: Math.random() * this.height,
      });
    }
  }

  setSectorMode(sectorId) {
    if (sectorId === 'histopathology-cnn' || sectorId === '01') {
      this.targetMode = 'cnn';
    } else if (sectorId === 'semantic-retrieval' || sectorId === '02') {
      this.targetMode = 'semantic';
    } else if (sectorId === 'multimodal-search' || sectorId === '03') {
      this.targetMode = 'multimodal';
    } else {
      this.targetMode = 'cnn';
    }
  }

  loop() {
    this.time += 0.015;
    
    // Smooth mouse lerp
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.06;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.06;
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Subtle architectural grid backdrop
    this.drawBackgroundGrid();

    // Node updates & drawing based on active sector mode
    const clusterCenters = [
      { x: this.width * 0.3, y: this.height * 0.35 },
      { x: this.width * 0.7, y: this.height * 0.35 },
      { x: this.width * 0.4, y: this.height * 0.7 },
      { x: this.width * 0.65, y: this.height * 0.72 }
    ];

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      let targetX = node.x;
      let targetY = node.y;

      if (this.targetMode === 'cnn') {
        targetX = node.cnnX + Math.sin(this.time * 2 + i) * 6;
        targetY = node.cnnY + Math.cos(this.time * 2 + i) * 6;
      } else if (this.targetMode === 'semantic') {
        const center = clusterCenters[node.cluster];
        node.clusterAngle += 0.003;
        targetX = center.x + Math.cos(node.clusterAngle) * node.clusterDist;
        targetY = center.y + Math.sin(node.clusterAngle) * node.clusterDist;
      } else if (this.targetMode === 'multimodal') {
        targetX = node.hemisphereX + Math.sin(this.time + i) * 10;
        targetY = node.hemisphereY + Math.cos(this.time + i) * 10;
      }

      // Cursor repulsion field
      const dx = targetX - this.mouseX;
      const dy = targetY - this.mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        const force = (140 - dist) / 140;
        targetX += (dx / dist) * force * 35;
        targetY += (dy / dist) * force * 35;
      }

      // Smooth step to target
      node.curX += (targetX - node.curX) * 0.05;
      node.curY += (targetY - node.curY) * 0.05;

      // Draw connection lines
      for (let j = i + 1; j < this.nodes.length; j++) {
        const other = this.nodes[j];
        const cdx = node.curX - other.curX;
        const cdy = node.curY - other.curY;
        const cDist = Math.sqrt(cdx * cdx + cdy * cdy);

        let maxDist = 120;
        let lineAlpha = 0;

        if (this.targetMode === 'cnn') {
          maxDist = 95;
          if (cDist < maxDist) {
            lineAlpha = (1 - cDist / maxDist) * 0.16;
            this.ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`; // Emerald tensor pulse
          }
        } else if (this.targetMode === 'semantic') {
          maxDist = 135;
          if (node.cluster === other.cluster && cDist < maxDist) {
            lineAlpha = (1 - cDist / maxDist) * 0.22;
            this.ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`; // Indigo semantic line
          }
        } else if (this.targetMode === 'multimodal') {
          // Cross-modal attention beams between vision and text nodes
          if (node.isVision !== other.isVision && cDist < 260) {
            lineAlpha = (1 - cDist / 260) * 0.15;
            this.ctx.strokeStyle = `rgba(245, 158, 11, ${lineAlpha})`; // Amber multimodal cross-attention
          }
        }

        if (lineAlpha > 0) {
          this.ctx.lineWidth = 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(node.curX, node.curY);
          this.ctx.lineTo(other.curX, other.curY);
          this.ctx.stroke();
        }
      }

      // Draw node point
      this.ctx.beginPath();
      this.ctx.arc(node.curX, node.curY, node.radius, 0, Math.PI * 2);

      if (this.targetMode === 'cnn') {
        const glow = (Math.sin(this.time * 4 + i) + 1) * 0.5;
        this.ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + glow * 0.5})`;
      } else if (this.targetMode === 'semantic') {
        this.ctx.fillStyle = `rgba(129, 140, 248, 0.75)`;
      } else {
        this.ctx.fillStyle = node.isVision ? 'rgba(56, 189, 248, 0.85)' : 'rgba(251, 191, 36, 0.85)';
      }
      this.ctx.fill();
    }

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  drawBackgroundGrid() {
    const step = 64;
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.022)';
    this.ctx.lineWidth = 1;
    
    for (let x = 0; x < this.width; x += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Cross markers at grid intersections
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    for (let x = step * 2; x < this.width; x += step * 4) {
      for (let y = step * 2; y < this.height; y += step * 4) {
        this.ctx.fillRect(x - 2, y, 5, 1);
        this.ctx.fillRect(x, y - 2, 1, 5);
      }
    }

    this.ctx.restore();
  }

  renderStatic() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackgroundGrid();
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
