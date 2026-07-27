import logging
from typing import List
from langchain_community.embeddings import HuggingFaceEmbeddings

logger = logging.getLogger(__name__)

# Cache embedding instances to prevent reloading overhead
_EMBEDDING_CACHE = {}

MODEL_MAP = {
    "BAAI/bge-small-en-v1.5": "BAAI/bge-small-en-v1.5",
    "bge": "BAAI/bge-small-en-v1.5",
    "intfloat/e5-small-v2": "intfloat/e5-small-v2",
    "e5": "intfloat/e5-small-v2",
    "sentence-transformers/all-MiniLM-L6-v2": "sentence-transformers/all-MiniLM-L6-v2",
    "minilm": "sentence-transformers/all-MiniLM-L6-v2",
    "nomic-ai/nomic-embed-text-v1": "nomic-ai/nomic-embed-text-v1",
    "nomic": "nomic-ai/nomic-embed-text-v1",
    "hku-nlp/instructor-base": "hkunlp/instructor-base",
    "instructor": "hkunlp/instructor-base"
}

def get_embedding_model(model_name: str = "BAAI/bge-small-en-v1.5") -> HuggingFaceEmbeddings:
    normalized_name = MODEL_MAP.get(model_name.lower(), model_name)
    
    if normalized_name in _EMBEDDING_CACHE:
        return _EMBEDDING_CACHE[normalized_name]
    
    logger.info(f"Loading embedding model: {normalized_name}")
    try:
        model_kwargs = {'device': 'cpu'}
        encode_kwargs = {'normalize_embeddings': True}
        embeddings = HuggingFaceEmbeddings(
            model_name=normalized_name,
            model_kwargs=model_kwargs,
            encode_kwargs=encode_kwargs
        )
        _EMBEDDING_CACHE[normalized_name] = embeddings
        return embeddings
    except Exception as e:
        logger.warning(f"Failed to load {normalized_name}, falling back to all-MiniLM-L6-v2: {e}")
        fallback_name = "sentence-transformers/all-MiniLM-L6-v2"
        if fallback_name not in _EMBEDDING_CACHE:
            _EMBEDDING_CACHE[fallback_name] = HuggingFaceEmbeddings(
                model_name=fallback_name,
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
        return _EMBEDDING_CACHE[fallback_name]
