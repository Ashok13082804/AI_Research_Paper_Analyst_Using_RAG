import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.domain import User
from app.core.security import get_password_hash
from app.api.routes import auth, documents, rag, agents, admin

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("researchmind")

# Create database tables automatically
Base.metadata.create_all(bind=engine)

# Auto-seed demo user on startup
def seed_demo_user():
    db = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.email == "demo@researchmind.ai").first()
        if not demo_user:
            demo_user = User(
                id="demo_user_123",
                name="Demo Researcher",
                email="demo@researchmind.ai",
                institution="Stanford AI Lab",
                hashed_password=get_password_hash("demo1234"),
                is_verified=True,
                role="researcher"
            )
            db.add(demo_user)
            db.commit()
            logger.info("Demo user (demo@researchmind.ai) seeded successfully.")
        else:
            demo_user.hashed_password = get_password_hash("demo1234")
            db.commit()
            logger.info("Demo user password updated successfully.")
    except Exception as e:
        logger.warning(f"Demo user seeding skipped: {e}")
    finally:
        db.close()

seed_demo_user()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-Grade Enterprise AI Research Paper Question Answering Platform (RAG + Multi-Agent)"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please check backend logs."}
    )

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(rag.router, prefix=settings.API_V1_STR)
app.include_router(agents.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
