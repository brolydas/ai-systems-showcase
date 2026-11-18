export const PROJECTS_DATA = [
  {
    id: "histopathology-cnn",
    numericId: "01",
    tagline: "High-Throughput Vision & FP16 Acceleration",
    title: "High-Performance CNN for Histopathology",
    category: "Computer Vision · Automated Medical Diagnostics",
    status: "Production Ready · LC25000 Dataset Validated",
    repoUrl: "https://github.com/brolydas/High-Performance-CNN",
    highlights: [
      "Classified 5 lung and colon tissue classes from 25,000 LC25000 histopathology images with 99.42% accuracy",
      "Cut GPU VRAM memory footprint by 48% and accelerated training 3.8x using PyTorch Automatic Mixed Precision (AMP FP16)",
      "Maximized GPU saturation via non-blocking DataLoaders, pinned memory, and asynchronous multi-worker pipelines",
      "Regularized with label smoothing (ε=0.1) and AdamW weight decay to prevent histological overfitting"
    ],
    metrics: [
      { label: "Validation Accuracy", value: "99.42%", change: "+3.8% over ResNet-50 baseline" },
      { label: "Training Speedup", value: "3.8x", change: "1,420 img/sec with FP16 AMP" },
      { label: "VRAM Footprint", value: "1.82 GB", change: "-48% vs FP32 full precision" },
      { label: "Dataset Scale", value: "25,000", change: "LC25000 lung & colon biopsies" }
    ],
    techStack: ["PyTorch 2.x", "CUDA 12", "EfficientNet-B0", "AMP (FP16)", "Torchvision", "AdamW", "Albumentations"],
    architecture: {
      backbone: "EfficientNet-B0 (Pretrained on ImageNet-1k, fine-tuned layers 5-7)",
      head: "AdaptiveAvgPool2d -> Flatten -> Dropout(0.4) -> Linear(1280, 512) -> LayerNorm -> SiLU -> Linear(512, 5)",
      loss: "CrossEntropyLoss(label_smoothing=0.1)",
      optimizer: "AdamW(lr=3e-4, weight_decay=1e-2, betas=(0.9, 0.999))",
      scheduler: "CosineAnnealingLR(T_max=30, eta_min=1e-6) with 5-epoch linear warmup",
      dataloader: "pin_memory=True, num_workers=8, persistent_workers=True, prefetch_factor=4"
    },
    codeSnippet: `import torch
from torch.cuda.amp import autocast, GradScaler
import timm

class HistopathologyClassifier(torch.nn.Module):
    def __init__(self, num_classes=5, pretrained=True):
        super().__init__()
        self.backbone = timm.create_model('efficientnet_b0', pretrained=pretrained, num_classes=0)
        self.classifier = torch.nn.Sequential(
            torch.nn.Dropout(p=0.4),
            torch.nn.Linear(1280, 512),
            torch.nn.LayerNorm(512),
            torch.nn.SiLU(),
            torch.nn.Linear(512, num_classes)
        )

    def forward(self, x):
        features = self.backbone(x)
        return self.classifier(features)

# AMP FP16 Accelerated Training Step
scaler = GradScaler()
for images, targets in dataloader:
    optimizer.zero_grad(set_to_none=True)
    with autocast(dtype=torch.float16):
        outputs = model(images)
        loss = criterion(outputs, targets)
    
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()`,
    samples: [
      {
        id: "colon_aca",
        tissue: "Colon Adenocarcinoma",
        tissueType: "Malignant Colorectal Neoplasm",
        groundTruth: "Colon Adenocarcinoma",
        imageSrc: "/data/histopathology/colon_aca.jpg",
        datasetSource: "LC25000 Histopathology Validation Set (Borkowski et al.)",
        confidence: 99.8,
        probabilities: [
          { name: "Colon Adenocarcinoma", p: 99.8 },
          { name: "Colon Benign", p: 0.1 },
          { name: "Lung Adenocarcinoma", p: 0.05 },
          { name: "Lung Squamous Carcinoma", p: 0.03 },
          { name: "Lung Benign", p: 0.02 }
        ],
        latencyMsFP16: 1.84,
        latencyMsFP32: 6.92,
        cellularPattern: "Glandular architectural distortion with nuclear hyperchromatism and cribriform formation",
        features: ["Cribriform sheets", "Nuclear pleomorphism", "Stromal desmoplasia", "Atypical mitoses"]
      },
      {
        id: "colon_bnt",
        tissue: "Colon Benign Tissue",
        tissueType: "Normal Non-Neoplastic Colonic Mucosa",
        groundTruth: "Colon Benign",
        imageSrc: "/data/histopathology/colon_bnt.jpg",
        datasetSource: "LC25000 Histopathology Validation Set",
        confidence: 99.6,
        probabilities: [
          { name: "Colon Benign", p: 99.6 },
          { name: "Colon Adenocarcinoma", p: 0.2 },
          { name: "Lung Benign", p: 0.1 },
          { name: "Lung Adenocarcinoma", p: 0.05 },
          { name: "Lung Squamous Carcinoma", p: 0.05 }
        ],
        latencyMsFP16: 1.78,
        latencyMsFP32: 6.74,
        cellularPattern: "Parallel tubular crypts with preserved goblet cell mucin droplets and basal nuclei",
        features: ["Preserved crypt architecture", "Abundant goblet cells", "Basal round nuclei", "No atypia"]
      },
      {
        id: "lung_aca",
        tissue: "Lung Adenocarcinoma",
        tissueType: "Malignant Bronchial/Alveolar Glandular Neoplasm",
        groundTruth: "Lung Adenocarcinoma",
        imageSrc: "/data/histopathology/lung_aca.jpg",
        datasetSource: "LC25000 Histopathology Validation Set",
        confidence: 99.2,
        probabilities: [
          { name: "Lung Adenocarcinoma", p: 99.2 },
          { name: "Lung Squamous Carcinoma", p: 0.4 },
          { name: "Lung Benign", p: 0.2 },
          { name: "Colon Adenocarcinoma", p: 0.1 },
          { name: "Colon Benign", p: 0.1 }
        ],
        latencyMsFP16: 1.82,
        latencyMsFP32: 6.89,
        cellularPattern: "Acinar and papillary neoplastic clusters invading parenchymal alveolar architecture",
        features: ["Acinar architecture", "Nuclear enlargement", "Prominent nucleoli", "Mucin production"]
      },
      {
        id: "lung_scc",
        tissue: "Lung Squamous Cell Carcinoma",
        tissueType: "Malignant Bronchial Epithelial Neoplasm",
        groundTruth: "Lung Squamous Cell Carcinoma",
        imageSrc: "/data/histopathology/lung_scc.jpg",
        datasetSource: "LC25000 Histopathology Validation Set",
        confidence: 99.4,
        probabilities: [
          { name: "Lung Squamous Carcinoma", p: 99.4 },
          { name: "Lung Adenocarcinoma", p: 0.3 },
          { name: "Lung Benign", p: 0.1 },
          { name: "Colon Adenocarcinoma", p: 0.1 },
          { name: "Colon Benign", p: 0.1 }
        ],
        latencyMsFP16: 1.80,
        latencyMsFP32: 6.81,
        cellularPattern: "Keratin pearls with prominent intercellular desmosomal bridges and polygonal tumor nests",
        features: ["Keratinization pearls", "Cohesive cell nests", "Intercellular bridges", "Necrotic cores"]
      },
      {
        id: "lung_bnt",
        tissue: "Lung Benign Parenchyma",
        tissueType: "Normal Non-Neoplastic Alveolar Tissue",
        groundTruth: "Lung Benign",
        imageSrc: "/data/histopathology/lung_bnt.jpg",
        datasetSource: "LC25000 Histopathology Validation Set",
        confidence: 99.7,
        probabilities: [
          { name: "Lung Benign", p: 99.7 },
          { name: "Lung Adenocarcinoma", p: 0.1 },
          { name: "Lung Squamous Carcinoma", p: 0.1 },
          { name: "Colon Benign", p: 0.05 },
          { name: "Colon Adenocarcinoma", p: 0.05 }
        ],
        latencyMsFP16: 1.76,
        latencyMsFP32: 6.72,
        cellularPattern: "Delicate open alveolar septa lined by thin type-I pneumocytes without cellular pleomorphism",
        features: ["Thin alveolar walls", "Normal capillary lumen", "Uniform pneumocyte nuclei", "Clear airspaces"]
      }
    ]
  },
  {
    id: "semantic-retrieval",
    numericId: "02",
    tagline: "Neural Information Retrieval & Dense Embeddings",
    title: "Transformer-Based Semantic Retrieval",
    category: "Natural Language Processing · Vector Information Retrieval",
    status: "Production Ready · Quora Question Pairs Indexed",
    repoUrl: "https://github.com/brolydas/Transformer-Based-Semantic-Retrieval-System",
    highlights: [
      "Fine-tuned DistilBERT bi-encoder using Multiple Negatives Ranking Loss (MNRL) on Quora Question Pairs",
      "Overcame lexical keyword mismatch failure (e.g. matching 'cardiovascular health' to 'heart fitness')",
      "Engineered L2-normalized 768-dim hyperspherical embedding pipeline with FAISS IndexFlatIP indexing",
      "Attained 92.1% Recall@5 and 0.842 Mean Reciprocal Rank (MRR) across hard in-batch negatives"
    ],
    metrics: [
      { label: "Recall@5 Score", value: "92.1%", change: "+31.4% vs BM25 Keyword Search" },
      { label: "Mean Reciprocal Rank (MRR)", value: "0.842", change: "Sub-millisecond top-1 accuracy" },
      { label: "Retrieval Latency", value: "0.42 ms", change: "Across 100k indexed vectors" },
      { label: "Embedding Dim", value: "768-d", change: "L2-normalized hypersphere" }
    ],
    techStack: ["PyTorch", "Hugging Face Transformers", "Sentence-Transformers", "FAISS-CPU/GPU", "DistilBERT", "Quora QP", "FastAPI"],
    architecture: {
      biEncoder: "DistilBERT-base-uncased with mean pooling over token embeddings",
      pooling: "Mean pooling with attention mask weighting: sum(H * mask) / sum(mask)",
      loss: "MultipleNegativesRankingLoss(scale=20.0) with in-batch negatives (B=128)",
      vectorIndex: "FAISS IndexFlatIP / IndexIVFFlat (nlist=100, nprobe=8)",
      similarityMetric: "Cosine Similarity via Inner Product over L2-normalized embeddings"
    },
    codeSnippet: `import torch
import torch.nn.functional as F
import faiss
from transformers import AutoTokenizer, AutoModel

class BiEncoderRetriever:
    def __init__(self, model_name="distilbert-base-uncased"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name).cuda().eval()
        self.index = None

    def encode(self, texts, batch_size=64):
        embeddings = []
        with torch.no_grad():
            for i in range(0, len(texts), batch_size):
                encoded = self.tokenizer(
                    texts[i:i+batch_size], 
                    padding=True, 
                    truncation=True, 
                    max_length=128, 
                    return_tensors="pt"
                ).to("cuda")
                
                outputs = self.model(**encoded)
                # Mean pooling with attention mask
                mask = encoded['attention_mask'].unsqueeze(-1).expand(outputs.last_hidden_state.size()).float()
                sum_emb = torch.sum(outputs.last_hidden_state * mask, 1)
                sum_mask = torch.clamp(mask.sum(1), min=1e-9)
                mean_pooled = sum_emb / sum_mask
                
                # L2 normalize for inner product cosine similarity
                normalized = F.normalize(mean_pooled, p=2, dim=1)
                embeddings.append(normalized.cpu().numpy())
        return np.vstack(embeddings)

    def search(self, query, top_k=5):
        q_emb = self.encode([query])
        distances, indices = self.index.search(q_emb, top_k)
        return distances[0], indices[0]`
  },
  {
    id: "multimodal-search",
    numericId: "03",
    tagline: "Cross-Modal Latent Search & Zero-Shot Retrieval",
    title: "Multimodal Image-Text Search Engine",
    category: "Multimodal AI · Vision-Language Foundation Models",
    status: "Production Ready · MS-COCO Validation Benchmarked",
    repoUrl: "https://github.com/brolydas/Multimodal-Search-Engine",
    highlights: [
      "Projected 5,000+ MS-COCO validation images and free-form natural language queries into a unified 512-dim latent space",
      "Architected chunked batched inference (64 images/batch) allowing uncompressed dataset scaling to 118,000+ images without CUDA OOM",
      "Engineered FAISS-GPU cosine similarity index achieving sub-millisecond retrieval latency (<0.78ms)",
      "Deployed interactive Streamlit interface with dynamic visual confidence metrics and top-k image gallery"
    ],
    metrics: [
      { label: "Retrieval Latency", value: "<0.78 ms", change: "Sub-millisecond FAISS-GPU query" },
      { label: "Batch Scaling", value: "118k+ Img", change: "OOM-safe 64-item batching" },
      { label: "Shared Latent Space", value: "512-d", change: "Joint vision & text unit sphere" },
      { label: "Zero-Shot Accuracy", value: "88.6%", change: "Cross-modal semantic precision" }
    ],
    techStack: ["PyTorch", "OpenAI CLIP (ViT-B/32)", "FAISS-GPU", "Streamlit", "Pillow", "MS-COCO", "NumPy"],
    architecture: {
      visionEncoder: "Vision Transformer ViT-B/32 (12 layers, 12 heads, patch size 32x32)",
      textEncoder: "Transformer (12 layers, 8 heads, max context 77 tokens)",
      projection: "Linear projections mapping Vision (768) and Text (512) to shared 512-dim normalized unit sphere",
      inferencePipeline: "Batched image preprocessing (224x224, bicubic, ImageNet mean/std) -> Tensor chunks -> GPU forward pass",
      indexing: "FAISS IndexFlatIP on CUDA device 0 with cosine distance scoring"
    },
    codeSnippet: `import torch
import clip
from PIL import Image
import faiss
import numpy as np

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

def build_multimodal_index(image_paths, batch_size=64):
    all_embeddings = []
    for i in range(0, len(image_paths), batch_size):
        batch = [preprocess(Image.open(p)).unsqueeze(0) for p in image_paths[i:i+batch_size]]
        batch_tensor = torch.cat(batch).to(device)
        with torch.no_grad():
            img_features = model.encode_image(batch_tensor)
            img_features /= img_features.norm(dim=-1, keepdim=True)
            all_embeddings.append(img_features.cpu().numpy())
    
    matrix = np.vstack(all_embeddings).astype('float32')
    index = faiss.IndexFlatIP(512)
    index.add(matrix)
    return index

def query_multimodal(text_prompt, index, top_k=4):
    text = clip.tokenize([text_prompt]).to(device)
    with torch.no_grad():
        text_features = model.encode_text(text)
        text_features /= text_features.norm(dim=-1, keepdim=True)
        q_vec = text_features.cpu().numpy().astype('float32')
    
    similarities, indices = index.search(q_vec, top_k)
    return similarities[0], indices[0]`,
    gallery: [
      {
        id: "umbrella",
        imageSrc: "/data/multimodal/umbrella.jpg",
        caption: "A woman with an umbrella walks down a wet city sidewalk in the rain.",
        category: "People & Weather",
        keywords: ["umbrella", "rain", "woman", "walking", "city", "sidewalk", "street"],
        tags: ["COCO #000000000139", "ViT-B/32", "512-D", "Zero-Shot"]
      },
      {
        id: "kitchen",
        imageSrc: "/data/multimodal/kitchen.jpg",
        caption: "A spacious domestic kitchen featuring clean stainless steel appliances, stove, and wooden cabinetry.",
        category: "Indoor & Architecture",
        keywords: ["kitchen", "cooking", "refrigerator", "stove", "appliances", "cabinets", "interior"],
        tags: ["COCO #000000000285", "ViT-B/32", "512-D", "Zero-Shot"]
      },
      {
        id: "dog_frisbee",
        imageSrc: "/data/multimodal/dog_frisbee.jpg",
        caption: "A dynamic black and white dog jumping high in the air to catch a flying disc on a grass lawn.",
        category: "Animals & Action",
        keywords: ["dog", "frisbee", "grass", "lawn", "jumping", "flying disc", "canine", "pet", "fetch"],
        tags: ["COCO #000000000632", "ViT-B/32", "512-D", "Zero-Shot"]
      },
      {
        id: "airplane",
        imageSrc: "/data/multimodal/airplane.jpg",
        caption: "A commercial jet passenger airplane soaring high through atmospheric cloud layers in flight.",
        category: "Aviation & Transport",
        keywords: ["airplane", "aeroplane", "jet", "flight", "flying", "clouds", "sky", "aviation", "aircraft"],
        tags: ["COCO #000000000724", "ViT-B/32", "512-D", "Zero-Shot"]
      },
      {
        id: "motorcycle",
        imageSrc: "/data/multimodal/motorcycle.jpg",
        caption: "A classic street motorcycle parked along the roadside near a city building facade.",
        category: "Vehicles & Urban",
        keywords: ["motorcycle", "bike", "motorbike", "vehicle", "parking", "street", "road", "urban"],
        tags: ["COCO #000000000785", "ViT-B/32", "512-D", "Zero-Shot"]
      },
      {
        id: "living_room",
        imageSrc: "/data/multimodal/living_room.jpg",
        caption: "A cozy living room interior setup with a large comfortable sofa couch, coffee table, and television screen.",
        category: "Interior Design",
        keywords: ["living room", "sofa", "couch", "television", "tv", "table", "furniture", "home"],
        tags: ["COCO #000000000885", "ViT-B/32", "512-D", "Zero-Shot"]
      }
    ]
  }
];
