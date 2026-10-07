from collections.abc import Callable, Sequence
from dataclasses import dataclass, field
from typing import Any

import chromadb


@dataclass(frozen=True)
class DocumentChunk:
    chunk_id: str
    content: str
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class SearchResult:
    content: str
    source: str | None
    metadata: dict[str, Any] = field(default_factory=dict)


def chunk_text(
    text: str,
    *,
    source: str,
    metadata: dict[str, Any],
    chunk_size: int = 200,
    chunk_overlap: int = 40,
) -> list[DocumentChunk]:
    """Split text into overlapping fixed-size word windows."""
    words = text.split()
    step = max(1, chunk_size - chunk_overlap)
    chunks: list[DocumentChunk] = []
    for start in range(0, len(words), step):
        window = words[start : start + chunk_size]
        if not window:
            continue
        chunks.append(
            DocumentChunk(
                chunk_id=f"{source}:{start}",
                content=" ".join(window),
                metadata=dict(metadata),
            )
        )
    return chunks


def _to_where(filters: dict[str, Any] | None):
    if not filters:
        return None
    if len(filters) == 1:
        key, value = next(iter(filters.items()))
        return {key: value}
    return {"$and": [{key: value} for key, value in filters.items()]}


class ChromaVectorIndex:
    """A persistent vector index backed by Chroma.

    `embed` takes a list of texts and returns one embedding vector per text.
    """

    def __init__(
        self,
        embed: Callable[[Sequence[str]], list[list[float]]],
        *,
        path: str,
        collection_name: str = "video_chunks",
    ):
        self._embed = embed
        self._client = chromadb.PersistentClient(path=path)
        self._collection = self._client.get_or_create_collection(collection_name)

    def add(self, chunks: Sequence[DocumentChunk]) -> None:
        if not chunks:
            return
        vectors = self._embed([chunk.content for chunk in chunks])
        self._collection.upsert(
            ids=[chunk.chunk_id for chunk in chunks],
            embeddings=vectors,
            documents=[chunk.content for chunk in chunks],
            metadatas=[dict(chunk.metadata) for chunk in chunks],
        )

    def delete(self, chunk_ids: Sequence[str]) -> None:
        if not chunk_ids:
            return
        self._collection.delete(ids=list(chunk_ids))

    def retrieve(
        self,
        query: str,
        *,
        top_k: int = 5,
        filters: dict[str, Any] | None = None,
    ) -> list[SearchResult]:
        query_vector = self._embed([query])[0]
        results = self._collection.query(
            query_embeddings=[query_vector],
            n_results=top_k,
            where=_to_where(filters),
        )

        ids = results.get("ids") or [[]]
        documents = results.get("documents") or [[]]
        metadatas = results.get("metadatas") or [[]]

        search_results: list[SearchResult] = []
        for chunk_id, content, metadata in zip(ids[0], documents[0], metadatas[0], strict=True):
            metadata = dict(metadata or {})
            search_results.append(
                SearchResult(
                    content=content,
                    source=metadata.get("video_id"),
                    metadata={**metadata, "chunk_id": chunk_id},
                )
            )
        return search_results
