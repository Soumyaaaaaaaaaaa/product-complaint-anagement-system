# PharmaComplaint AI - Intelligent Complaint Management System

A production-ready, AI-powered system designed for the pharmaceutical industry to manage, track, and analyze product quality and customer complaints efficiently. 

This full-stack application leverages **FastAPI**, **PostgreSQL**, **React (Vite)**, and **LangGraph / Groq LLMs** to extract insights from raw complaints, classify risks, identify duplicates, and automatically suggest Corrective and Preventive Actions (CAPA).

## Features

### 🧠 Intelligent AI Analysis
- **Automated Text Extraction:** Uses `pdfplumber` and `pytesseract` OCR to extract text from uploaded PDFs, Images, and Docs.
- **Smart Data Extraction:** Powered by Groq's `gemma2-9b-it`, automatically pulling key fields like product name, lot number, and priority with Confidence Scores.
- **Root Cause & CAPA Generation:** Instantly suggest root causes and CAPA recommendations based on historical complaint patterns.
- **AI Chat Assistant:** Context-aware interactive assistant to help analysts query the specific complaint.

### 🛡️ Production-Ready Backend
- **Framework:** FastAPI with Python 3.9+
- **Database:** PostgreSQL (SQLAlchemy + Alembic)
- **Security:** JWT Authentication, Role-Based Access Control (Admin, Manager, User), Password Hashing (bcrypt).
- **Audit Trails:** Comprehensive logging of all system actions (creations, AI modifications, status changes).
- **Exports:** Native PDF (`reportlab`) and Excel (`openpyxl`) export endpoints.
- **Error Handling:** Centralized exception handlers for robust API stability.

### 💻 Modern Frontend
- **Framework:** React 18 (Vite + TypeScript)
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS + Flowbite Components + Framer Motion (Animations)
- **Analytics:** Interactive `recharts` on the main Dashboard.
- **UX/UI:** Loading skeletons, toast notifications, responsive grids, and advanced table filtering/pagination.

---

## 📋 Prerequisites / Requirements

Before you begin, ensure you have the following installed on your host machine:
- **Docker Desktop**
- **WSL2** (if on Windows)
- **Docker Engine** (running)
- **Node.js** (v18+) (if running locally without Docker)
- **Python 3.11+** (if running locally without Docker)

---

## 🚀 Quick Start (Docker)

The easiest way to get the entire stack running is via Docker Compose.

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd pharma-complaint-mgmt
   ```

2. **Configure Environment Variables:**
   Ensure `.env` exists in the root directory with the following variables:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   POSTGRES_USER=pharma_user
   POSTGRES_PASSWORD=pharma_pass
   POSTGRES_DB=pharma_complaints
   ```

3. **Start the containers:**
   ```bash
   docker compose up --build -d
   ```

4. **Run Database Migrations (if needed):**
   ```bash
   docker exec -it pharma_backend alembic upgrade head
   ```

5. **Access the Application:**
   - Frontend UI: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Docs (Swagger): [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

**Default Admin Credentials:**
- Email: `admin@pharma.com`
- Password: `Admin@123`

---

## 🛠️ Manual Setup

If you prefer to run the services locally without Docker:

### Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. `pip install -r requirements.txt`
5. Ensure PostgreSQL is running locally and update your `.env` `DATABASE_URL`.
6. Run migrations: `alembic upgrade head`
7. Start server: `uvicorn app.main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

## 📁 System Architecture

```text
product-complaint-management/
├── backend/
│   ├── alembic/              # Database migration scripts
│   ├── app/
│   │   ├── core/             # Security, config, JWT logic
│   │   ├── crud/             # SQLAlchemy DB operations
│   │   ├── models/           # DB tables (Complaint, User, AuditLog)
│   │   ├── routers/          # API endpoints
│   │   ├── schemas/          # Pydantic validation models
│   │   └── services/         # AI Logic (LangGraph, Prompts, Exports)
│   ├── requirements.txt      
│   └── Dockerfile            
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios client and interceptors
│   │   ├── components/       # Reusable UI (Skeletons, RiskCard)
│   │   ├── pages/            # Views (Dashboard, Audit Log, Complaints)
│   │   ├── store/            # Redux Slices
│   │   └── App.tsx           # React Router
│   ├── package.json          
│   └── Dockerfile            
└── docker-compose.yml        # Multi-container orchestration
```

---

## 🔒 Security Best Practices
- CORS restricted via environment configurations.
- Stateless JWT Tokens with automatic token refreshing via Axios interceptors.
- Granular Role checks on critical API endpoints using dependency injection (`require_role`).
- Passwords salted and hashed with `bcrypt`.

## 📈 Optimization
- Memoized React components and Redux selectors.
- Paginated database queries to handle large complaint volumes.
- Debounced search inputs to minimize backend load.

*Designed for compliance, speed, and intelligence.*
