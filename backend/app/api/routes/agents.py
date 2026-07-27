from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.domain import Document, Chunk
from app.schemas.schemas import AgentTaskRequest
from app.services.agents import MultiAgentSystem

router = APIRouter(prefix="/agents", tags=["Multi-Agent System"])

@router.post("/execute")
def execute_agent_task(payload: AgentTaskRequest, db: Session = Depends(get_db)):
    context_text = ""

    # Aggregate context from specified document IDs
    if payload.document_ids:
        chunks = db.query(Chunk).filter(Chunk.document_id.in_(payload.document_ids)).all()
        context_text = "\n\n".join([c.content for c in chunks])
    
    if not context_text:
        # Sample paper fallback if no docs uploaded yet
        context_text = (
            "Attention Is All You Need (Vaswani et al., 2017). We propose the Transformer, a model architecture "
            "eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies "
            "between input and output. The Transformer allows for significantly more parallelization and can reach a "
            "new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs."
        )

    result = MultiAgentSystem.run_agent(
        agent_type=payload.agent_type,
        context_text=context_text,
        extra_params=payload.extra_params
    )

    return result
