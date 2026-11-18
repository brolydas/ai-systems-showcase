# Tharun Rongala — Neural Systems & AI Infrastructure

An **Awwwards-standard (Site of the Day / Developer Award)** engineering showcase highlighting Tharun Rongala's premier production deep learning systems:

1. **High-Performance CNN for Histopathology** (`PyTorch`, `CUDA`, `EfficientNet-B0`, `AMP FP16`)
2. **Transformer-Based Semantic Retrieval** (`PyTorch`, `Sentence-Transformers`, `FAISS`)
3. **Multimodal Image-Text Search Engine** (`PyTorch`, `CLIP ViT-B/32`, `FAISS-GPU`, `Streamlit`)

---

## ✦ Awwwards Design & Architectural Highlights

- **Signature Moment**: Dynamic Canvas-powered **Neural Telemetry Lattice & Vector Space HUD** that morphs smoothly between:
  - *Sector 01 (CNN)*: Convolutional tensor activation matrix with FP16 pulses
  - *Sector 02 (Transformer)*: 768-D hyperspherical vector Voronoi clusters
  - *Sector 03 (Multimodal)*: Bipartite dual-hemisphere cross-modal projection
- **Interactive In-Browser Simulators**:
  - **Live Histopathology Slide Inspector**: Toggle between FP16 (AMP) and FP32 to observe real-time latency speedup (1.84ms vs 6.92ms, 3.8x faster) and VRAM occupancy with Grad-CAM activation overlays.
  - **Semantic vs Lexical Vector Playground**: Side-by-side comparison proving why BM25 keyword matching fails on semantic synonyms, coupled with a 2D vector cosine similarity canvas.
  - **Cross-Modal Latent Radar**: Zero-shot natural language prompt projection into a 512-D joint vision-text unit sphere.
- **Architectural Drawer**: Instant modal drawer to inspect hyperparameters, PyTorch training snippets, and direct links to GitHub repositories.
- **Micro-Interactions & Telemetry**:
  - Authentic `000` to `100` telemetry initialization preloader
  - Magnetic precision cursor with live coordinate telemetry
  - Synthesized Web Audio API acoustic feedback (starts muted by default, toggleable via `[M]` or the audio button)
  - Keyboard shortcuts (`[1]` CNN, `[2]` Semantic, `[3]` Multimodal, `[M]` Audio)
  - Full adherence to `prefers-reduced-motion` and WCAG AA accessibility standards.

---

## ✦ Deploying to Vercel

This repository is optimized for zero-config, edge-cached deployment on Vercel.

### Method 1: Deploy via Vercel Web Dashboard (Recommended)

1. Create a new repository on your GitHub account ([github.com/brolydas](https://github.com/brolydas)):
   ```bash
   git init
   git add .
   git commit -m "feat: Awwwards AI systems showcase deployable to Vercel"
   git branch -M main
   git remote add origin https://github.com/brolydas/ai-systems-showcase.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `ai-systems-showcase` repository.
4. Vercel automatically detects the **Vite** framework from `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Your site will be live at `https://ai-systems-showcase.vercel.app` in under 30 seconds!

### Method 2: Deploy via Vercel CLI

```bash
npx vercel
```
Follow the interactive prompts to link and deploy directly from your local terminal.

---

## ✦ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview
```

---

## ✦ System Architecture & Verified GitHub Repositories

| # | Architecture | GitHub Repository | Dataset / Benchmark | Key Result |
|---|---|---|---|---|
| **01** | High-Performance CNN | [`brolydas/High-Performance-CNN`](https://github.com/brolydas/High-Performance-CNN) | LC25000 (25k images) | **99.42% accuracy**, 3.8x training speedup via AMP FP16 |
| **02** | Transformer Semantic Retrieval | [`brolydas/Transformer-Based-Semantic-Retrieval-System`](https://github.com/brolydas/Transformer-Based-Semantic-Retrieval-System) | Quora Question Pairs | **92.1% Recall@5**, 0.842 MRR, <0.42ms FAISS latency |
| **03** | Multimodal Search Engine | [`brolydas/Multimodal-Search-Engine`](https://github.com/brolydas/Multimodal-Search-Engine) | MS-COCO (5k to 118k+) | **88.6% zero-shot accuracy**, OOM-safe 64-image batching |

---

## ✦ Author

**Tharun Rongala**
- GitHub: [@brolydas](https://github.com/brolydas)
- Portfolio: [brolydas.github.io/TharunRongalaPortfolio](https://brolydas.github.io/TharunRongalaPortfolio/)
- Email: `tharunr8533@gmail.com`
