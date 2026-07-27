from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# Auth Schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    institution: Optional[str] = None
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    institution: Optional[str] = None
    role: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ForgotPassword(BaseModel):
    email: EmailStr

class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str
    new_password: Optional[str] = None

# Document Schemas
class DocumentResponse(BaseModel):
    id: str
    filename: str
    title: Optional[str] = None
    authors: Optional[List[str]] = []
    year: Optional[int] = None
    page_count: int
    file_size_bytes: int
    status: str
    category: str
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Citation Schema
class Citation(BaseModel):
    paper_title: str
    page_number: int
    chunk_score: float
    similarity_score: float
    supporting_passage: str
    chunk_id: Optional[str] = None
    section: Optional[str] = None

# RAG & Chat Schemas
class ChatQuery(BaseModel):
    conversation_id: Optional[str] = None
    query: str
    document_ids: Optional[List[str]] = None # If restricted to specific docs
    embedding_model: Optional[str] = None
    vector_store: Optional[str] = None
    retrieval_strategy: Optional[str] = None
    chunking_strategy: Optional[str] = None
    llm_model: Optional[str] = None

class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    query: str
    response: str
    citations: List[Citation]
    metrics: Dict[str, Any]

# Multi-Agent Tool Request
class AgentTaskRequest(BaseModel):
    agent_type: str # research, summary, citation, comparison, reviewer, code, tutor, gap, eval
    document_ids: List[str]
    prompt: Optional[str] = None
    extra_params: Optional[Dict[str, Any]] = None

# Settings Configuration Schema
class SystemConfigUpdate(BaseModel):
    vector_store: Optional[str] = None
    embedding_model: Optional[str] = None
    chunking_strategy: Optional[str] = None
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None
    retrieval_strategy: Optional[str] = None
    llm_model: Optional[str] = None

# Dashboard Stats Schema
class DashboardStats(BaseModel):
    total_papers: int
    total_users: int
    total_questions: int
    avg_response_time_sec: float
    active_embedding_model: str
    active_vector_store: str
    active_retrieval_strategy: str
    active_llm: str
    estimated_accuracy_pct: float
    estimated_hallucination_pct: float
    citation_coverage_pct: float
