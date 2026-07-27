from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.domain import Conversation, Message
from app.schemas.schemas import ChatQuery, ChatResponse
from app.services.rag_engine import RAGEngine

router = APIRouter(prefix="/rag", tags=["RAG & Chat"])

@router.post("/query", response_model=ChatResponse)
def query_rag(payload: ChatQuery, db: Session = Depends(get_db)):
    # 1. Manage Conversation
    conv_id = payload.conversation_id
    if not conv_id:
        conv = Conversation(user_id="demo_user_123", title=payload.query[:40])
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conv_id = conv.id

    # 2. Record User Message
    user_msg = Message(
        conversation_id=conv_id,
        role="user",
        content=payload.query
    )
    db.add(user_msg)
    db.commit()

    # 3. Execute RAG Pipeline
    filter_dict = None
    if payload.document_ids:
        filter_dict = {"document_id": {"$in": payload.document_ids}}

    rag_result = RAGEngine.query(
        query=payload.query,
        vector_store_type=payload.vector_store or "chromadb",
        embedding_model_name=payload.embedding_model or "BAAI/bge-small-en-v1.5",
        retrieval_strategy=payload.retrieval_strategy or "hybrid",
        llm_model=payload.llm_model or "llama3.1",
        filter_dict=filter_dict
    )

    # 4. Save Assistant Response Message with Citations & Metrics
    citations_data = [c.model_dump() for c in rag_result["citations"]]
    assistant_msg = Message(
        conversation_id=conv_id,
        role="assistant",
        content=rag_result["response"],
        citations=citations_data,
        metrics=rag_result["metrics"]
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatResponse(
        conversation_id=conv_id,
        message_id=assistant_msg.id,
        query=payload.query,
        response=rag_result["response"],
        citations=rag_result["citations"],
        metrics=rag_result["metrics"]
    )
