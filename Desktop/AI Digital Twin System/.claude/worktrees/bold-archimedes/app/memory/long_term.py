"""Long-term memory backed by vector database."""

from __future__ import annotations

import abc
import uuid
from dataclasses import dataclass

from app.config import VectorDBProvider, get_settings
from app.memory.embeddings import BaseEmbedder, get_embedder


@dataclass
class VectorSearchResult:
    id: str
    content: str
    metadata: dict
    score: float


class BaseVectorStore(abc.ABC):
    @abc.abstractmethod
    async def upsert(self, collection: str, doc_id: str, text: str, embedding: list[float], metadata: dict) -> None: ...

    @abc.abstractmethod
    async def search(self, collection: str, query_embedding: list[float], top_k: int = 5) -> list[VectorSearchResult]: ...

    @abc.abstractmethod
    async def delete(self, collection: str, doc_id: str) -> None: ...


class ChromaVectorStore(BaseVectorStore):
    def __init__(self) -> None:
        import chromadb
        settings = get_settings()
        self._client = chromadb.PersistentClient(path=settings.chroma_persist_dir)

    def _get_collection(self, name: str):
        return self._client.get_or_create_collection(name=name, metadata={"hnsw:space": "cosine"})

    async def upsert(self, collection: str, doc_id: str, text: str, embedding: list[float], metadata: dict) -> None:
        col = self._get_collection(collection)
        col.upsert(ids=[doc_id], documents=[text], embeddings=[embedding], metadatas=[metadata])

    async def search(self, collection: str, query_embedding: list[float], top_k: int = 5) -> list[VectorSearchResult]:
        col = self._get_collection(collection)
        results = col.query(query_embeddings=[query_embedding], n_results=top_k)
        output = []
        for i in range(len(results["ids"][0])):
            output.append(VectorSearchResult(
                id=results["ids"][0][i],
                content=results["documents"][0][i] if results["documents"] else "",
                metadata=results["metadatas"][0][i] if results["metadatas"] else {},
                score=1 - (results["distances"][0][i] if results["distances"] else 0),
            ))
        return output

    async def delete(self, collection: str, doc_id: str) -> None:
        col = self._get_collection(collection)
        col.delete(ids=[doc_id])


class LongTermMemory:
    def __init__(self, vector_store: BaseVectorStore | None = None, embedder: BaseEmbedder | None = None) -> None:
        self._store = vector_store or _default_store()
        self._embedder = embedder or get_embedder()

    def _collection_name(self, twin_id: uuid.UUID) -> str:
        return f"twin_{twin_id.hex}"

    async def store(self, twin_id: uuid.UUID, memory_id: str, content: str, metadata: dict | None = None) -> None:
        embedding = await self._embedder.embed_one(content)
        await self._store.upsert(
            collection=self._collection_name(twin_id), doc_id=memory_id,
            text=content, embedding=embedding, metadata=metadata or {},
        )

    async def recall(self, twin_id: uuid.UUID, query: str, top_k: int = 5, min_relevance: float = 0.0) -> list[VectorSearchResult]:
        query_embedding = await self._embedder.embed_one(query)
        results = await self._store.search(
            collection=self._collection_name(twin_id), query_embedding=query_embedding, top_k=top_k,
        )
        return [r for r in results if r.score >= min_relevance]

    async def forget(self, twin_id: uuid.UUID, memory_id: str) -> None:
        await self._store.delete(self._collection_name(twin_id), memory_id)


def _default_store() -> BaseVectorStore:
    settings = get_settings()
    if settings.vector_db_provider == VectorDBProvider.CHROMA:
        return ChromaVectorStore()
    raise ValueError(f"Unsupported vector DB provider: {settings.vector_db_provider}")
