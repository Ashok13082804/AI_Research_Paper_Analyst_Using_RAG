import logging
from typing import List, Dict, Any, Tuple
from langchain_core.documents import Document
from rank_bm25 import BM25Okapi
import numpy as np

from app.services.vectorstore import VectorStoreManager

logger = logging.getLogger(__name__)

class AdvancedRetriever:
    """Implements multiple retrieval strategies: Cosine, MMR, Hybrid (BM25 + Dense), Reranked."""

    @staticmethod
    def retrieve(
        query: str,
        k: int = 5,
        strategy: str = "hybrid",
        vector_store_type: str = "chromadb",
        embedding_model_name: str = "BAAI/bge-small-en-v1.5",
        filter_dict: Dict[str, Any] = None
    ) -> List[Tuple[Document, float]]:
        strategy = strategy.lower()

        if strategy == "mmr":
            vstore = VectorStoreManager.get_vectorstore(
                store_type=vector_store_type,
                embedding_model_name=embedding_model_name
            )
            try:
                docs = vstore.max_marginal_relevance_search(query, k=k, fetch_k=k*3)
                # Assign default score
                return [(doc, 0.85 - (idx * 0.05)) for idx, doc in enumerate(docs)]
            except Exception as e:
                logger.warning(f"MMR failed ({e}), falling back to cosine similarity")
                strategy = "cosine"

        if strategy == "hybrid":
            # 1. Fetch dense results
            dense_results = VectorStoreManager.similarity_search_with_score(
                query=query,
                k=k * 2,
                store_type=vector_store_type,
                embedding_model_name=embedding_model_name,
                filter_dict=filter_dict
            )

            if not dense_results:
                return []

            # 2. Simple BM25 rerank over dense candidates
            corpus = [doc.page_content for doc, _ in dense_results]
            tokenized_corpus = [doc.lower().split() for doc in corpus]
            bm25 = BM25Okapi(tokenized_corpus)

            tokenized_query = query.lower().split()
            bm25_scores = bm25.get_scores(tokenized_query)

            # Normalize BM25 scores
            max_bm25 = max(bm25_scores) if max(bm25_scores) > 0 else 1.0
            norm_bm25 = [s / max_bm25 for s in bm25_scores]

            # Reciprocal Rank Fusion / Hybrid score
            hybrid_results = []
            for idx, (doc, dense_dist) in enumerate(dense_results):
                # Distance to similarity
                dense_sim = 1.0 / (1.0 + float(dense_dist)) if isinstance(dense_dist, (int, float)) else 0.8
                combined_score = 0.6 * dense_sim + 0.4 * norm_bm25[idx]
                hybrid_results.append((doc, round(float(combined_score), 4)))

            # Sort by combined score descending
            hybrid_results.sort(key=lambda x: x[1], reverse=True)
            return hybrid_results[:k]

        # Default Cosine / Similarity Search
        raw_results = VectorStoreManager.similarity_search_with_score(
            query=query,
            k=k,
            store_type=vector_store_type,
            embedding_model_name=embedding_model_name,
            filter_dict=filter_dict
        )

        formatted_results = []
        for doc, score in raw_results:
            sim_score = 1.0 / (1.0 + float(score)) if isinstance(score, (int, float)) else 0.85
            formatted_results.append((doc, round(float(sim_score), 4)))
            
        return formatted_results
