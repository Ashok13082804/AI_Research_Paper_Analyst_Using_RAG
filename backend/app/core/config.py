import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ResearchMind AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "researchmind_super_secret_jwt_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 day for dev
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "sqlite:///./researchmind.db"
    
    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Vector Stores
    DEFAULT_VECTOR_STORE: str = "chromadb"
    CHROMA_PERSIST_DIRECTORY: str = "./vectorstore/chroma"
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    FAISS_PERSIST_DIRECTORY: str = "./vectorstore/faiss"
    
    # Embeddings
    DEFAULT_EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    
    # Chunking & Retrieval
    DEFAULT_CHUNKING_STRATEGY: str = "recursive"
    DEFAULT_CHUNK_SIZE: int = 1000
    DEFAULT_CHUNK_OVERLAP: int = 200
    DEFAULT_RETRIEVAL_STRATEGY: str = "hybrid"
    
    # Ollama / LLM
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    DEFAULT_LLM_MODEL: str = "llama3.1"
    OLLAMA_TIMEOUT: float = 120.0
    
    # Uploads
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 50
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
