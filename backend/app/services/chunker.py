import re
from typing import List, Dict, Any

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter, TokenTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter, TokenTextSplitter

class DocumentChunker:
    """Supports multiple chunking strategies: recursive, token, semantic, fixed."""

    @staticmethod
    def chunk_text(
        text: str,
        strategy: str = "recursive",
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
        metadata: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        metadata = metadata or {}
        chunks = []

        if strategy == "token":
            splitter = TokenTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
            raw_chunks = splitter.split_text(text)
        elif strategy == "fixed":
            # Fixed character step chunking
            raw_chunks = []
            step = chunk_size - chunk_overlap
            for i in range(0, len(text), max(1, step)):
                raw_chunks.append(text[i : i + chunk_size])
        elif strategy == "semantic":
            # Paragraph / Section split semantic approximation
            paragraphs = re.split(r'\n\s*\n', text)
            raw_chunks = []
            current_chunk = ""
            for p in paragraphs:
                p = p.strip()
                if not p:
                    continue
                if len(current_chunk) + len(p) <= chunk_size:
                    current_chunk += "\n\n" + p if current_chunk else p
                else:
                    if current_chunk:
                        raw_chunks.append(current_chunk)
                    current_chunk = p
            if current_chunk:
                raw_chunks.append(current_chunk)
        else:
            # Default: Recursive Character Splitter
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            raw_chunks = splitter.split_text(text)

        for idx, chunk_str in enumerate(raw_chunks):
            if not chunk_str.strip():
                continue
            chunks.append({
                "chunk_index": idx,
                "content": chunk_str.strip(),
                "metadata": {
                    **metadata,
                    "chunk_index": idx,
                    "strategy": strategy,
                    "chunk_size": chunk_size
                }
            })

        return chunks
