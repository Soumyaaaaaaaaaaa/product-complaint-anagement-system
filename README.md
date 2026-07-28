# AI-Powered Pharmaceutical Customer Complaint Management System

![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688) ![React](https://img.shields.io/badge/React-18-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

A full-stack, AI-assisted complaint management platform for the pharmaceutical industry. The system helps quality teams intake customer complaints, extract structured information from uploaded documents, classify risk, and generate actionable insights for investigation and CAPA planning.

This repository is designed as a practical assignment submission for an AI Product Engineer role, demonstrating end-to-end product thinking, workflow design, backend APIs, modern frontend UX, and AI integration.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#system-architecture)
- [AI Workflow](#ai-workflow)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Default Login](#default-login)
- [API Documentation](#api-documentation)
- [File Upload](#file-upload)
- [AI Features](#ai-features)
- [Database](#database)
- [Security](#security)
- [Docker](#docker)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Overview

This project exists to simplify and accelerate complaint triage in pharmaceutical operations. When customers report issues, the team often receives unstructured documents such as PDFs, images, and Word files. Manually entering that information into systems is slow, error-prone, and inconsistent.

This platform solves that by combining:

- a modern web dashboard for complaint management,
- a FastAPI backend for secure data operations,
- AI-powered text extraction and document parsing,
- risk classification and complaint summarization,
- built-in audit logs and export capabilities.

Pharmaceutical companies use complaint management systems to monitor quality events, protect patients, track investigations, and maintain compliance with internal quality processes. AI improves the workflow by reducing manual effort, surfacing likely risks earlier, and generating a structured first draft of the complaint record.

### Assignment Objective

The objective of this project is to demonstrate an AI-enhanced product workflow that can:

1. ingest complaints from multiple file types,
2. extract key information automatically,
3. reduce analyst workload through AI suggestions,
4. provide a clean operational dashboard for review and follow-up.

## Screenshots

> Screenshots and a live demo GIF can be added here for presentation purposes.

- Login screen
- Dashboard overview
- Complaint intake form
- Complaint detail page with AI insights
- Audit trail and user activity view

## Demo GIF Placeholder

> Add a short GIF or screen recording showcasing: login → upload document → AI extraction → complaint save → dashboard review.

## Features

The current implementation includes the following features:

- Authentication and secure login flow
- Dashboard with complaint statistics
- Complaint management with create, read, update, delete, and search
- Customer management
- Product management
- Audit logs for tracking actions
- Search, filters, and pagination on list views
- In-app notifications and toast feedback
- OCR and text extraction from uploaded documents
- PDF upload support
- DOCX upload support
- Image upload support for OCR-based parsing
- AI Copilot-style assistance for complaint intake
- Complaint summary generation
- Root cause recommendation
- CAPA recommendation
- Duplicate complaint detection based on complaint history and similarity scoring
- Risk classification and priority suggestion
- Complaint completeness checking for required fields
- Excel and PDF export for complaint reports
- Responsive UI
- Dark mode support

## Tech Stack

### Frontend

- React
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- TypeScript

### Backend

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- JWT authentication
- LangGraph
- Groq API
- OCR and text extraction
- PyMuPDF
- pdfplumber
- python-docx
- pytesseract

### Database

- PostgreSQL

### DevOps

- Docker
- Docker Compose
- Nginx

## Project Structure

```text
product-complaint-management-system/
├── backend/
│   ├── alembic/                 # Database migration scripts
│   ├── app/
│   │   ├── core/                # Security and shared config
│   │   ├── crud/                # Database access helpers
│   │   ├── models/              # SQLAlchemy models
│   │   ├── routers/             # API endpoints
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   └── services/            # AI workflows, prompts, exports, OCR helpers
│   ├── uploads/                # Uploaded files and temp assets
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client setup
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route-based screens
│   │   ├── store/               # Redux slices and store config
│   │   └── types/               # Shared TypeScript types
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## System Architecture

```mermaid
flowchart LR
    A[React Frontend] --> B[FastAPI API]
    B --> C[LangGraph Workflow]
    C --> D[Groq LLM]
    B --> E[(PostgreSQL)]
    C --> F[OCR + Text Extraction]
    B --> G[File Storage / Uploads]
```

The frontend sends requests to the FastAPI API. The backend handles authentication, complaint storage, and AI workflows. The workflow layer uses LangGraph and Groq to generate parsed complaint data and recommendations, while PostgreSQL stores the core business records.

## AI Workflow

```mermaid
flowchart TD
    A[User uploads PDF / DOCX / image] --> B[OCR and text extraction]
    B --> C[LangGraph parsing workflow]
    C --> D[Groq-based summarization and risk scoring]
    D --> E[Structured complaint JSON]
    E --> F[Complaint form auto-filled]
    F --> G[Save to database]
```

## Installation

### Prerequisites

- Docker Desktop and Docker Engine
- Node.js 18+ for frontend development
- Python 3.11+ for backend development
- PostgreSQL (recommended) or Docker Compose for the database
- Tesseract installed on the host for OCR support

### Option 1: Run with Docker (Recommended)

```bash
git clone <repository-url>
cd product-complaint-mangment-system
```

Create a root-level `.env` file before starting the stack:

```env
DATABASE_URL=postgresql://pharma_user:pharma_pass@db:5432/pharma_complaints
SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
GROQ_API_KEY=your_groq_api_key_here
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=10
```

Then start the services:

```bash
docker compose up --build
```

Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger UI: http://localhost:8000/api/docs
- Redoc: http://localhost:8000/api/redoc

### Option 2: Run Without Docker

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at http://localhost:5173 and proxy API requests to the backend.

#### Backend

```bash
cd backend
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If you are not using Docker, make sure your `.env` points to a reachable PostgreSQL instance:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/pharma_complaints
```

## Environment Variables

The backend reads the following environment variables from the root `.env` file:

| Variable | Description | Required | Example |
|---|---|---:|---|
| DATABASE_URL | PostgreSQL connection string used by SQLAlchemy | Yes | `postgresql://pharma_user:pharma_pass@db:5432/pharma_complaints` |
| SECRET_KEY | JWT signing secret | Yes | `change-me-in-production` |
| ALGORITHM | JWT algorithm | Yes | `HS256` |
| GROQ_API_KEY | API key used by the AI workflow and Groq-based prompts | Optional for local fallback | `gsk_...` |
| UPLOAD_DIR | Directory used to store uploaded files | No | `uploads` |
| MAX_UPLOAD_SIZE_MB | Maximum upload size in megabytes | No | `10` |

> Note: The current implementation does not read a dedicated `OCR_PATH` environment variable. OCR support depends on Tesseract being available on the host machine.

## Default Login

A default administrator account is created automatically when the backend starts:

- Email: `admin@pharma.com`
- Password: `Admin@123`

## API Documentation

The backend exposes interactive API documentation at:

- Swagger UI: http://localhost:8000/api/docs
- Redoc: http://localhost:8000/api/redoc

### Authentication

The login endpoint returns a JWT access token and refresh token. Use the access token in the `Authorization: Bearer <token>` header for protected routes.

### Example Endpoints

```bash
POST /api/v1/auth/login
POST /api/v1/complaints/upload
GET /api/v1/complaints
POST /api/v1/complaints
GET /api/v1/customers
GET /api/v1/products
```

Example login request:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pharma.com","password":"Admin@123"}'
```

## File Upload

The application accepts the following file formats:

- PDF
- DOCX
- PNG
- JPG
- JPEG
- TIFF
- BMP
- TXT

Upload flow:

1. The file is stored temporarily in the uploads directory.
2. Text is extracted using PyMuPDF, pdfplumber, python-docx, or OCR via pytesseract.
3. The extracted text is parsed into a structured complaint draft.
4. The parsed complaint can be reviewed and saved to the database.

## AI Features

The AI layer currently provides:

- Complaint summary generation
- Risk classification and priority suggestions
- CAPA recommendation generation
- Root cause analysis suggestions
- Duplicate complaint detection based on existing complaint history
- Complaint completeness checking for missing required fields

If the `GROQ_API_KEY` is not configured, the system falls back to heuristic parsing and safe default responses.

## Database

The application stores the following core entities:

- Users
- Complaints
- Products
- Customers
- Audit Logs
- Uploaded Files
- Chat History

The database layer uses SQLAlchemy models and Alembic for migration management.

## Security

Security controls implemented in the project include:

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes behind authentication guards
- Role-based access handling for administrative and operational users
- Input validation through Pydantic schemas
- File validation and size limits for uploads

## Docker

The repository includes a production-friendly Docker Compose setup:

- `backend` service built from the backend Dockerfile
- `frontend` service served through Nginx
- `db` service running PostgreSQL 16
- persistent Docker volumes for PostgreSQL and uploads

Useful commands:

```bash
docker compose up --build
docker compose down
docker compose logs backend --tail=100
docker compose ps
```

## Testing

A basic manual test flow for the application:

1. Log in with the default admin credentials.
2. Upload a PDF or DOCX complaint document.
3. Confirm OCR/text extraction succeeds.
4. Review the parsed complaint fields.
5. Create or save the complaint.
6. Open the dashboard and confirm the statistics update.
7. Test the AI Copilot or AI analysis parts for a complaint detail page.

## Troubleshooting

### Docker not starting

- Ensure Docker Desktop is running.
- Check that ports `3000`, `8000`, and `5432` are not already in use.

### Database connection failed

- Verify the `DATABASE_URL` in the root `.env` file.
- Ensure the PostgreSQL container is healthy before the backend starts.

### Groq API missing

- The system will still run in fallback mode, but AI features will be less rich.
- Add a valid `GROQ_API_KEY` to enable full AI behavior.

### OCR not working

- Install Tesseract on the host machine.
- Verify the OCR-related dependencies are installed in the backend environment.

### Upload failed

- Confirm the file type is supported.
- Check that the file size is under the configured upload limit.

### Login failed

- Use `admin@pharma.com` and `Admin@123` for the default account.
- Check the backend logs if the admin user was not created correctly.

### Migration errors

- If you are running locally, ensure your database is reachable.
- Re-run the migration workflow from the backend project if needed.

## Future Improvements

Planned enhancements for the project include:

- Email integration
- SAP or ERP integration
- Advanced analytics and dashboards
- Multi-language OCR support
- Mobile app support
- Deeper workflow automation and investigation tracking

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Open a pull request with a clear summary of the change.

Please keep changes focused, documented, and tested where possible.

## License

This project is licensed under the MIT License.

## Acknowledgements

This project makes use of excellent open-source tools and services, including:

- FastAPI
- React
- LangGraph
- Groq
- PostgreSQL
- Docker

