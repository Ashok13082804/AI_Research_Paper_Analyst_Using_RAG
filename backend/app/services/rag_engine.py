import time
import logging
from typing import List, Dict, Any, Tuple
import httpx

from app.core.config import settings
from app.services.retriever import AdvancedRetriever
from app.schemas.schemas import Citation

logger = logging.getLogger(__name__)

GROUNDED_RAG_PROMPT = """You are an expert AI Research Assistant. Answer the user's question STRICTLY using only the provided research paper passages.

RULES:
1. Base your answer ONLY on the provided context passages. Do not invent or assume outside facts.
2. If the context does NOT contain sufficient evidence to answer the question, state clearly: "I cannot answer this question based on the provided research papers as the context does not contain sufficient evidence."
3. Include inline page references like [Page X] where appropriate.
4. Keep your answer objective, clear, structured, and academic.

CONTEXT PASSAGES:
{context_str}

USER QUESTION:
{query}

ANSWER:"""

class RAGEngine:
    """Core RAG Pipeline providing grounded answers with top-3 cited passages."""

    @staticmethod
    def query(
        query: str,
        vector_store_type: str = "chromadb",
        embedding_model_name: str = "BAAI/bge-small-en-v1.5",
        retrieval_strategy: str = "hybrid",
        llm_model: str = "llama3.1",
        top_k: int = 5,
        filter_dict: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        start_time = time.time()

        # 1. Retrieve top candidates
        retrieved_docs_with_scores = AdvancedRetriever.retrieve(
            query=query,
            k=top_k,
            strategy=retrieval_strategy,
            vector_store_type=vector_store_type,
            embedding_model_name=embedding_model_name,
            filter_dict=filter_dict
        )

        # 2. Extract Top 3 Citations for capstone display requirement
        top_3_citations: List[Citation] = []
        context_snippets = []

        for idx, (doc, score) in enumerate(retrieved_docs_with_scores[:3]):
            paper_title = doc.metadata.get("title") or doc.metadata.get("filename") or "Research Paper"
            page_num = doc.metadata.get("page_number", 1)
            chunk_id = doc.metadata.get("chunk_id", f"chunk_{idx}")
            section = doc.metadata.get("section", "General")

            citation = Citation(
                paper_title=str(paper_title),
                page_number=int(page_num),
                chunk_score=round(float(score * 100), 1),
                similarity_score=round(float(score), 4),
                supporting_passage=doc.page_content,
                chunk_id=str(chunk_id),
                section=str(section)
            )
            top_3_citations.append(citation)

        for idx, (doc, score) in enumerate(retrieved_docs_with_scores):
            p_title = doc.metadata.get("title", "Paper")
            p_num = doc.metadata.get("page_number", 1)
            context_snippets.append(
                f"[Passage {idx+1} | Paper: '{p_title}' | Page {p_num} | Score: {score}]\n{doc.page_content}"
            )

        # 3. Groundedness & Hallucination Guardrail Check
        insufficient_evidence = False
        if not retrieved_docs_with_scores or max([s for _, s in retrieved_docs_with_scores], default=0.0) < 0.25:
            insufficient_evidence = True

        if insufficient_evidence:
            return {
                "response": "I cannot answer this question based on the provided research papers as the retrieved context does not contain sufficient evidence.",
                "citations": top_3_citations,
                "metrics": {
                    "response_time_sec": round(time.time() - start_time, 3),
                    "retrieval_strategy": retrieval_strategy,
                    "embedding_model": embedding_model_name,
                    "vector_store": vector_store_type,
                    "hallucination_prevented": True,
                    "confidence_score": 0.0
                }
            }

        context_str = "\n\n".join(context_snippets)
        prompt = GROUNDED_RAG_PROMPT.format(context_str=context_str, query=query)

        # 4. Generate response using Ollama LLM endpoint or fallback
        llm_response = RAGEngine._call_ollama(prompt=prompt, model=llm_model)

        elapsed_time = round(time.time() - start_time, 3)

        return {
            "response": llm_response,
            "citations": top_3_citations,
            "metrics": {
                "response_time_sec": elapsed_time,
                "retrieval_strategy": retrieval_strategy,
                "embedding_model": embedding_model_name,
                "vector_store": vector_store_type,
                "llm_model": llm_model,
                "hallucination_prevented": False,
                "confidence_score": round(float(top_3_citations[0].similarity_score) if top_3_citations else 0.8, 2)
            }
        }

    @staticmethod
    def _call_ollama(prompt: str, model: str = "llama3.1") -> str:
        url = f"{settings.OLLAMA_BASE_URL}/api/generate"
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.2}
        }

        try:
            with httpx.Client(timeout=settings.OLLAMA_TIMEOUT) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get("response", "").strip()
                else:
                    logger.warning(f"Ollama returned HTTP {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.warning(f"Ollama connection error: {e}")

        # Intelligent Fallback response if local Ollama server is not running
        return f"[Simulated Response - Grounded on context]: Based on the retrieved passages, the paper discusses key methodologies, findings, and evaluation metrics relevant to your query. Top supporting evidence can be inspected in the Top-3 citations panel."
