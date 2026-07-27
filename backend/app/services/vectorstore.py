import os
import logging
from typing import List, Dict, Any, Optional
from langchain_core.documents import Document
from langchain_chroma import Chroma

try:
    from langchain_community.vectorstores import FAISS
except ImportError:
    from langchain_community.vectorstores.faiss import FAISS

try:
    from langchain_qdrant import QdrantVectorStore as Qdrant
except ImportError:
    try:
        from langchain_community.vectorstores import Qdrant
    except ImportError:
        Qdrant = None

from app.core.config import settings
from app.services.embeddings import get_embedding_model

logger = logging.getLogger(__name__)

class VectorStoreManager:
    """Unified Vector Store Manager supporting ChromaDB, FAISS, and Qdrant."""

    @staticmethod
    def get_vectorstore(
        store_type: str = "chromadb",
        embedding_model_name: str = "BAAI/bge-small-en-v1.5",
        collection_name: str = "researchmind_chunks"
    ):
        embedding_fn = get_embedding_model(embedding_model_name)
        store_type = store_type.lower()

        if store_type == "faiss":
            faiss_dir = os.path.join(settings.FAISS_PERSIST_DIRECTORY, collection_name)
            if os.path.exists(os.path.join(faiss_dir, "index.faiss")):
                return FAISS.load_local(faiss_dir, embedding_fn, allow_dangerous_deserialization=True)
            else:
                # Create empty FAISS store
                return FAISS.from_texts(["Initial index placeholder"], embedding_fn, metadatas=[{"dummy": True}])

        elif store_type == "qdrant" and Qdrant is not None:
            try:
                from qdrant_client import QdrantClient
                client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
                return Qdrant(client=client, collection_name=collection_name, embeddings=embedding_fn)
            except Exception as e:
                logger.warning(f"Qdrant connection failed ({e}), falling back to ChromaDB")
                store_type = "chromadb"

        # Default ChromaDB
        os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
        return Chroma(
            collection_name=collection_name,
            embedding_function=embedding_fn,
            persist_directory=settings.CHROMA_PERSIST_DIRECTORY
        )

    @classmethod
    def add_documents(
        cls,
        documents: List[Document],
        store_type: str = "chromadb",
        embedding_model_name: str = "BAAI/bge-small-en-v1.5"
    ):
        vstore = cls.get_vectorstore(store_type=store_type, embedding_model_name=embedding_model_name)
        vstore.add_documents(documents)
        if hasattr(vstore, "persist"):
            try:
                vstore.persist()
            except Exception:
                pass
        return len(documents)

    @classmethod
    def similarity_search_with_score(
        cls,
        query: str,
        k: int = 5,
        store_type: str = "chromadb",
        embedding_model_name: str = "BAAI/bge-small-en-v1.5",
        filter_dict: Optional[Dict[str, Any]] = None
    ):
        vstore = cls.get_vectorstore(store_type=store_type, embedding_model_name=embedding_model_name)
        try:
            if filter_dict and store_type == "chromadb":
                results = vstore.similarity_search_with_score(query, k=k, filter=filter_dict)
            else:
                results = vstore.similarity_search_with_score(query, k=k)
            return results
        except Exception as e:
            logger.error(f"Error searching vectorstore ({store_type}): {e}")
            return []
