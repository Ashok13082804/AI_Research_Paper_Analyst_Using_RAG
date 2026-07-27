import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    institution = Column(String, nullable=True)
    role = Column(String, default="researcher") # admin, researcher, student
    hashed_password = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    title = Column(String, nullable=True)
    authors = Column(JSON, nullable=True, default=list) # ["Author 1", "Author 2"]
    year = Column(Integer, nullable=True)
    page_count = Column(Integer, default=0)
    file_size_bytes = Column(Integer, default=0)
    status = Column(String, default="pending") # pending, processing, indexed, error
    error_message = Column(Text, nullable=True)
    category = Column(String, default="Uncategorized") # NLP, Computer Vision, etc.
    metadata_json = Column(JSON, nullable=True, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="documents")
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, default=1)
    section_name = Column(String, nullable=True)
    metadata_json = Column(JSON, nullable=True, default=dict)
    vector_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="chunks")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="New Research Chat")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    citations = Column(JSON, nullable=True, default=list) # Top 3 passages with page, title, score
    metrics = Column(JSON, nullable=True, default=dict) # response_time, retrieval_strategy, etc.
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    conversation = relationship("Conversation", back_populates="messages")


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    embedding_model = Column(String, nullable=False)
    vector_store = Column(String, nullable=False)
    chunking_strategy = Column(String, nullable=False)
    retrieval_strategy = Column(String, nullable=False)
    chunk_size = Column(Integer, default=1000)
    chunk_overlap = Column(Integer, default=200)
    metrics = Column(JSON, nullable=False, default=dict) # precision, recall, groundedness, latency
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False) # LOGIN, UPLOAD_PDF, QUERY_RAG, DELETE_DOC
    resource = Column(String, nullable=True)
    details = Column(JSON, nullable=True, default=dict)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="audit_logs")
