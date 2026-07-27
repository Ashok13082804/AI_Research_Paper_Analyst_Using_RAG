import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from langchain_core.documents import Document as LCDocument

from app.core.config import settings
from app.core.database import get_db
from app.models.domain import User, Document, Chunk
from app.schemas.schemas import DocumentResponse
from app.services.pdf_processor import PDFProcessor
from app.services.chunker import DocumentChunker
from app.services.vectorstore import VectorStoreManager

router = APIRouter(prefix="/documents", tags=["Documents"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

def get_current_user_id() -> str:
    return "demo_user_123"

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(...),
    chunking_strategy: str = Form("recursive"),
    chunk_size: int = Form(1000),
    chunk_overlap: int = Form(200),
    vector_store: str = Form("chromadb"),
    embedding_model: str = Form("BAAI/bge-small-en-v1.5"),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    user_id = get_current_user_id()

    # Ensure demo user exists in DB
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(
            id=user_id,
            name="Demo Researcher",
            email="demo@researchmind.ai",
            hashed_password="demo",
            is_verified=True
        )
        db.add(user)
        db.commit()

    saved_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    
    # Read file content safely
    try:
        content = await file.read()
        with open(saved_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    file_size = os.path.getsize(saved_path)

    # 1. Save Document record
    doc_record = Document(
        user_id=user_id,
        filename=file.filename,
        filepath=saved_path,
        file_size_bytes=file_size,
        status="processing"
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    try:
        # 2. Extract PDF text & metadata
        pdf_data = PDFProcessor.process_pdf(saved_path)
        metadata = pdf_data["metadata"]

        doc_record.title = metadata.get("title", file.filename)
        doc_record.page_count = metadata.get("page_count", 1)
        doc_record.year = metadata.get("year", 2024)

        # 3. Chunking
        chunk_dicts = DocumentChunker.chunk_text(
            text=pdf_data["full_text"],
            strategy=chunking_strategy,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            metadata={"document_id": doc_record.id, "title": doc_record.title, "filename": file.filename}
        )

        lc_docs = []
        for c in chunk_dicts:
            chunk_rec = Chunk(
                document_id=doc_record.id,
                chunk_index=c["chunk_index"],
                content=c["content"],
                page_number=c["metadata"].get("page_number", 1),
                metadata_json=c["metadata"]
            )
            db.add(chunk_rec)
            db.commit()

            lc_docs.append(LCDocument(
                page_content=c["content"],
                metadata={
                    "document_id": doc_record.id,
                    "chunk_id": chunk_rec.id,
                    "title": doc_record.title,
                    "filename": file.filename,
                    "page_number": c["metadata"].get("page_number", 1)
                }
            ))

        # 4. Vector Store Indexing
        VectorStoreManager.add_documents(
            documents=lc_docs,
            store_type=vector_store,
            embedding_model_name=embedding_model
        )

        doc_record.status = "indexed"
        db.commit()
        db.refresh(doc_record)

    except Exception as e:
        doc_record.status = "error"
        doc_record.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"PDF processing failed: {e}")

    return doc_record

@router.get("", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return docs

@router.get("/{doc_id}/download")
def download_pdf(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc or not os.path.exists(doc.filepath):
        raise HTTPException(status_code=404, detail="Document file not found")
    return FileResponse(doc.filepath, media_type="application/pdf", filename=doc.filename)

@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if os.path.exists(doc.filepath):
        try:
            os.remove(doc.filepath)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return None
