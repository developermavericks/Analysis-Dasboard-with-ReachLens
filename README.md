# 🖥️ Analysis Dashboard Mavericks

[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Celery](https://img.shields.io/badge/Celery-3776AB?style=for-the-badge&logo=celery)](https://docs.celeryq.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/satyam1289/Analysis_dashboard_mavericks)

## 🚀 Overview

**Analysis Dashboard Mavericks** is a full-stack, production-ready analytics platform designed for media/content analysis. Upload Excel/CSV files containing articles/publications, and get instant insights via an intuitive dashboard featuring sentiment analysis, NER (Named Entity Recognition), TF-IDF topics, word clouds, top entities, competitor comparisons, and **ReachLens™** audience reach estimation.

### Key Capabilities
- **Multi-phase Processing Pipeline**: Preprocessing → NER → Sentiment → TF-IDF → ReachLens → Aggregation
- **Real-time Dashboard**: Responsive React frontend with Tailwind CSS, interactive widgets
- **Scalable Backend**: FastAPI + PostgreSQL + Celery distributed tasks + Redis
- **ReachLens Integration**: Proprietary scraping & estimation for social/Google reach
- **Bulk Processing**: Handle 10k+ rows with dockerized workers
- **Column Auto-mapping**: Intelligent Excel column detection & mapping

## 🏗️ Architecture & Flow Diagram

```mermaid
graph TD
    A["Excel/CSV Upload<br/>via Drag & Drop"] --> B["Column Mapping<br/>Auto-detect + Manual"]
    B --> C["Phase 1: Preprocess<br/>Text Cleaning, Author Normalize"]
    C --> D["Phase 2: NER<br/>Entities Extraction"]
    D --> E["Phase 3: Sentiment<br/>Positive/Negative/Neutral"]
    E --> F["Phase 4: TF-IDF<br/>Topics & Keywords"]
    F --> G["Phase 5: ReachLens<br/>Social Scrape + Google Reach Est."]
    G --> H["Phase 6: Aggregate<br/>Metrics, Top Lists"]
    H --> I["PostgreSQL Storage"]
    I --> J["FastAPI API Endpoints"]
    J --> K["React Dashboard<br/>Widgets: Sentiment Overview, WordClouds<br/>(Pos/Neg/HotTopics), Top Companies/Journalists/Pubs<br/>Client/Sector/Comparison/ReachLens Views"]
    
    L["Docker Compose<br/>Backend + Frontend + Celery + Redis + Postgres + Nginx"] -.-> A
    M["Scripts: Seed Data<br/>Clients, Publisher Tiers, Bulk Retag"] -.-> I
    
    style A fill:#e1f5fe
    style K fill:#f3e5f5
    style L fill:#e8f5e8
```

## ✨ Features

### 📊 Dashboard Widgets
| Widget | Description |
|--------|-------------|
| **Sentiment Overview** | Pie chart: Positive/Negative/Neutral ratios |
| **Positive/Negative WordCloud** | Top sentiment keywords visualized |
| **Hot Topics** | TF-IDF powered trending topics |
| **Top Companies/Publications/Journalists** | Ranked by mentions/reach |
| **Client View** | Custom client-focused metrics |
| **Sector View** | Industry sector comparisons |
| **Comparison View** | Side-by-side competitor analysis |
| **ReachLens View** | Audience reach estimation graphs |

### 🔧 Processing Pipeline
1. **Phase1 Preprocess**: Clean text, normalize authors, column mapping
2. **Phase2 NER**: Extract entities (companies, pubs, journalists)
3. **Phase3 Sentiment**: VADER/ custom model scoring
4. **Phase4 TF-IDF**: Keyword/topic extraction
5. **Phase5 ReachLens**: Scrape social profiles + proprietary reach calc
6. **Phase6 Aggregate**: Compute dashboard metrics

### 📱 Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS + PostCSS
- Zustand state management
- Real-time polling for results
- Responsive design (desktop/mobile)

### 🐍 Backend
- FastAPI with SQLAlchemy + Alembic
- PostgreSQL database
- Celery + Redis for async tasks
- Bulk processing scripts
- API: `/health`, `/upload`, `/results`

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

```bash
git clone https://github.com/satyam1289/Analysis_dashboard_mavericks.git
cd Analysis_dashboard_mavericks
cp analysis/.env.example analysis/.env
# Edit .env: set POSTGRES_PASSWORD, etc.
docker compose -f analysis/docker-compose.yml up -d
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs (Swagger)
- Admin DB: Use pgAdmin/DBeaver with creds from .env

Upload sample CSV (analysis/sample_100_rows.csv) to test!

## 📖 Usage Guide

### 1. File Upload
- Drag Excel/CSV to upload zone
- Auto-map columns: 'title', 'content', 'date', 'author', etc.
- Manual override if needed
- View ColumnMappingReport

### 2. Processing
- UploadProgress tracker
- Celery orchestrator runs 6 phases sequentially
- View logs: `docker logs analysis_backend_1`

### 3. Dashboard
- Select Scope: Client/Sector/Comparison
- Widgets auto-refresh every 30s
- Search/filter entities
- Export metrics (TODO)

### 4. Seeding Data
```bash
# Seed clients & publisher tiers
docker compose exec backend python app/seed/client_aliases.py
docker compose exec backend python app/seed/publisher_tiers.py
```

## 📁 File Structure

```
Analysis_dashboard_mavericks/
├── README.md                 # This file
├── analysis/                 # Main app
│   ├── backend/              # FastAPI + Celery
│   │   ├── app/
│   │   │   ├── api/routes/   # Endpoints: health, uploads, results
│   │   │   ├── db/           # Models, session
│   │   │   ├── workers/      # Phase1-6 tasks
│   │   │   ├── utils/        # Text cleaners, cache, etc.
│   │   │   └── seed/         # Client aliases, pub tiers
│   │   ├── scripts/          # Bulk reprocess, seed
│   │   └── tests/            # Unit tests
│   ├── frontend/             # React app
│   │   ├── src/components/dashboard/widgets/
│   │   ├── src/hooks/        # useUpload, useResults, usePolling
│   │   └── src/store/        # Zustand stores
│   ├── docker-compose.yml    # Orchestration
│   └── nginx/                # Reverse proxy
├── Reach_lens/               # Reach estimation submodule
│   ├── client/               # React scraper UI
│   └── server/               # Node/TS: ScraperService, ReachEstimator
└── uploads/                  # Processed files (gitignore'd)
```

## 🔌 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/upload` | POST | Upload file + mapping |
| `/results/{upload_id}` | GET | Fetch results |

**Schemas:** Pydantic models in `app/schemas/`

## 🛠️ Development

### Backend
```bash
cd analysis/backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
celery -A app.workers.celery_app worker --loglevel=info
```

### Frontend
```bash
cd analysis/frontend
npm install
npm run dev
```

### Testing
```bash
# Backend tests
cd analysis/backend && pytest

# Frontend (add jest)
npm test
```

### Scripts
- `bulk_retag_fast.py`: Fast client tagging
- `rerun_sentiment_all.py`: Reprocess sentiment
- `reprocess_clients.py`: Bulk re-upload

## 🚢 Deployment

**Docker Production:**
```bash
docker compose -f analysis/docker-compose.yml up -d --scale celery-worker-1=3
```

**Configs:**
- nginx.conf: Reverse proxy + gzip
- docker-compose.yml: Services scaling, volumes

## 🔍 ReachLens™ Integration

Reach_lens provides:
- **SmartScraper**: Google/social profile scraping
- **ReachEstimator**: Proprietary audience calc
- Integrated as Phase 5 in pipeline
- Standalone: `cd Reach_lens && docker compose up`

**Note:** Respect robots.txt & rate limits. For production, use proxies.

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Celery stuck | Check Redis: `docker logs redis` |
| DB connection | Verify POSTGRES_PASSWORD in .env |
| Frontend 404 | Nginx logs: `docker logs nginx` |
| Upload fails | Check column mapping, file size <10MB |
| WordCloud empty | Ensure content column has text |

**Logs:** `docker compose logs -f`

## 🤝 Contributing

1. Fork → Clone → Branch `feature/xyz`
2. `git checkout -b blackboxai/update-readme`
3. Commit → PR to `main`

## 📄 License
MIT - See LICENSE (add one)

## 👥 Authors
- Satyam1289 & Team

---

**⭐ Star us on GitHub!** Questions? Open an issue.

![Dashboard Preview](https://via.placeholder.com/1200x600/0f172a/ffffff?text=Analysis+Dashboard+Mavericks) <!-- Replace with real screenshot -->

