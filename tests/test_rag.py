import pytest
from app.services.chunker import DocumentChunker
from app.services.rag_engine import RAGEngine

def test_chunker():
    text = "Attention Is All You Need. " * 50
    chunks = DocumentChunker.chunk_text(text, strategy="recursive", chunk_size=100, chunk_overlap=20)
    assert len(chunks) > 0
    assert "chunk_index" in chunks[0]

def test_rag_insufficient_evidence():
    result = RAGEngine.query("What is quantum computing?", top_k=1)
    assert "response" in result
    assert "citations" in result
    assert "metrics" in result
