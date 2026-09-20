"""
vector_service.py
Handles ChromaDB embedding and retrieval using BAAI/bge-small-en-v1.5.
"""

import os
import logging
from typing import List, Dict, Any, Optional

from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)

_chroma_client = None
_collection = None
_embedding_model: Optional[SentenceTransformer] = None
_chroma_available = None

COLLECTION_NAME = "farm_records"


def _get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        _embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _embedding_model


def _get_chroma_collection():
    global _chroma_client, _collection, _chroma_available
    if _chroma_available is False:
        return None
    if _collection is not None:
        return _collection
    try:
        import chromadb
        os.makedirs(settings.CHROMA_PATH, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PATH)
        _collection = _chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        _chroma_available = True
        logger.info(f"ChromaDB collection '{COLLECTION_NAME}' ready.")
    except Exception as e:
        _chroma_available = False
        logger.warning(f"ChromaDB unavailable — vector search disabled: {e}")
        return None
    return _collection


def _record_to_text(record: Dict[str, Any], table: str) -> str:
    """Convert any record dict to a searchable text string."""
    if table == "activities":
        return (
            f"Field: {record.get('field_name', 'N/A')}\n"
            f"Crop: {record.get('crop_name', 'N/A')}\n"
            f"Season: {record.get('season', 'N/A')}\n"
            f"Activity: {record.get('activity_type', 'N/A')}\n"
            f"Description: {record.get('description', 'N/A')}\n"
            f"Date: {record.get('date', 'N/A')}\n"
            f"Quantity: {record.get('quantity', 'N/A')} {record.get('unit', '')}\n"
            f"Cost: {record.get('cost', 'N/A')}\n"
        )
    elif table == "expenses":
        return (
            f"Field: {record.get('field_name', 'N/A')}\n"
            f"Crop: {record.get('crop_name', 'N/A')}\n"
            f"Season: {record.get('season', 'N/A')}\n"
            f"Expense Type: {record.get('expense_type', 'N/A')}\n"
            f"Amount: {record.get('amount', 'N/A')}\n"
            f"Description: {record.get('description', 'N/A')}\n"
            f"Date: {record.get('date', 'N/A')}\n"
        )
    elif table == "harvests":
        return (
            f"Field: {record.get('field_name', 'N/A')}\n"
            f"Crop: {record.get('crop_name', 'N/A')}\n"
            f"Season: {record.get('season', 'N/A')}\n"
            f"Harvest Date: {record.get('harvest_date', 'N/A')}\n"
            f"Quantity: {record.get('quantity', 'N/A')} {record.get('unit', 'kg')}\n"
            f"Selling Price: {record.get('selling_price', 'N/A')}\n"
            f"Total Revenue: {record.get('total_revenue', 'N/A')}\n"
            f"Quality Notes: {record.get('quality_notes', 'N/A')}\n"
        )
    elif table == "crops":
        return (
            f"Field: {record.get('field_name', 'N/A')}\n"
            f"Crop: {record.get('crop_name', 'N/A')}\n"
            f"Season: {record.get('season', 'N/A')}\n"
            f"Sowing Date: {record.get('sowing_date', 'N/A')}\n"
            f"Expected Harvest: {record.get('expected_harvest_date', 'N/A')}\n"
            f"Status: {record.get('status', 'N/A')}\n"
        )
    else:
        return str(record)


def embed_and_store(
    record_id: str,
    table: str,
    record_or_text: Any,
    user_id: str,
) -> None:
    """
    Embed a farm record and store it in ChromaDB.
    The authenticated user's ID is stored as metadata for tenant isolation.
    """
    try:
        collection = _get_chroma_collection()
        if collection is None:
            logger.warning(f"Skipping embed for {record_id} — ChromaDB unavailable.")
            return
        model = _get_embedding_model()

        if isinstance(record_or_text, str):
            text = record_or_text
        else:
            text = _record_to_text(record_or_text, table)

        embedding = model.encode(text).tolist()

        collection.upsert(
            documents=[text],
            embeddings=[embedding],
            metadatas=[{
                "record_id": record_id,
                "table": table,
                "user_id": user_id,
            }],
            ids=[record_id],
        )
        logger.info(f"Embedded record {record_id} ({table}) into ChromaDB.")
    except Exception as e:
        logger.error(f"Failed to embed record {record_id}: {e}")


def query_similar(
    query_text: str,
    n_results: int = 5,
    where: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Search ChromaDB for records semantically similar to query_text.

    The where filter is used for tenant scoping.
    """
    try:
        collection = _get_chroma_collection()
        if collection is None:
            return []

        model = _get_embedding_model()
        query_embedding = model.encode(query_text).tolist()

        collection_size = collection.count()
        if collection_size == 0:
            return []

        kwargs = {
            "query_embeddings": [query_embedding],
            "n_results": min(n_results, collection_size),
            "include": ["documents", "metadatas", "distances"],
        }
        if where:
            kwargs["where"] = where

        results = collection.query(**kwargs)

        hits = []
        if results and results.get("ids") and results["ids"][0]:
            for i, doc_id in enumerate(results["ids"][0]):
                metadata = results["metadatas"][0][i] or {}
                hits.append({
                    "record_id": metadata.get("record_id", doc_id),
                    "table": metadata.get("table", "unknown"),
                    "text_preview": results["documents"][0][i][:300],
                    "distance": results["distances"][0][i],
                })
        return hits
    except Exception as e:
        logger.error(f"ChromaDB query failed: {e}")
        return []


def delete_record(record_id: str, user_id: Optional[str] = None) -> None:
    """Remove a record from ChromaDB when deleted from the database."""
    try:
        collection = _get_chroma_collection()
        if collection is None:
            return

        if user_id:
            collection.delete(
                where={
                    "$and": [
                        {"record_id": record_id},
                        {"user_id": user_id},
                    ]
                }
            )
        else:
            collection.delete(ids=[record_id])

        logger.info(f"Deleted record {record_id} from ChromaDB.")
    except Exception as e:
        logger.warning(f"Could not delete {record_id} from ChromaDB: {e}")


def collection_count() -> int:
    """Return number of documents in ChromaDB."""
    try:
        collection = _get_chroma_collection()
        return collection.count() if collection is not None else 0
    except Exception:
        return 0
