import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import ProgrammingError, SQLAlchemyError
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi import Request
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

from app.config import settings
from app.database import engine, SessionLocal
from app.models import User, Customer, Product, Complaint, UploadedFile, ChatHistory, AuditLog
from app.database import Base
from app.routers import auth, users, customers, products, complaints, chat, audit
from app.core.security import get_password_hash


def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)


def seed_admin_user():
    """Create or verify default admin user."""
    db = SessionLocal()
    try:
        from app.models.user import UserRole
        admin = db.query(User).filter(User.email.ilike("admin@pharma.com")).first()
        if not admin:
            admin = User(
                email="admin@pharma.com",
                full_name="System Administrator",
                password_hash=get_password_hash("Admin@123"),
                role=UserRole.admin,
                is_active=True,
                department="IT",
            )
            db.add(admin)
            db.commit()
            print("✅ Default admin user created: admin@pharma.com / Admin@123")
        else:
            admin.password_hash = get_password_hash("Admin@123")
            admin.is_active = True
            db.commit()
            print("✅ Default admin user verified: admin@pharma.com / Admin@123")
    except Exception as e:
        print(f"⚠️  Seeding skipped: {e}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    print("🚀 Starting PharmaComplaint AI backend...")
    create_tables()
    seed_admin_user()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield
    print("🛑 Shutting down PharmaComplaint AI backend...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Customer Complaint Management System for Pharmaceutical Industry",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Database error occurred."})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register all routers
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(customers.router, prefix=API_PREFIX)
app.include_router(products.router, prefix=API_PREFIX)
app.include_router(complaints.router, prefix=API_PREFIX)
app.include_router(chat.router, prefix=API_PREFIX)
app.include_router(audit.router, prefix=API_PREFIX)


@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "app": settings.APP_NAME,
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/api/docs",
        "version": settings.APP_VERSION,
    }
