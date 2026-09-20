"""
vector_service.py
Handles Pinecone embedding and retrieval using BAAI/bge-small-en-v1.5.
"""

import os
import logging
from typing import List, Dict, Any, Optional

from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)

_pinecone_client = None
_pinecone_index = None
_embedding_model: Optional[SentenceTransformer] = None
_pinecone_available = None


def _get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        _embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _embedding_model


def _get_pinecone_index():
    global _pinecone_client, _pinecone_index, _pinecone_available
    if _pinecone_available is False:
        return None
    if _pinecone_index is not None:
        return _pinecone_index
    try:
        from pinecone import Pinecone
        if not settings.PINECONE_API_KEY:
            raise ValueError("PINECONE_API_KEY is not set.")
        
        _pinecone_client = Pinecone(api_key=settings.PINECONE_API_KEY)
        _pinecone_index = _pinecone_client.Index(settings.PINECONE_INDEX_NAME)
        _pinecone_available = True
        logger.info(f"Pinecone index '{settings.PINECONE_INDEX_NAME}' ready.")
    except Exception as e:
        _pinecone_available = False
        logger.warning(f"Pinecone unavailable — vector search disabled: {e}")
        return None
    return _pinecone_index


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
    Embed a farm record and store it in Pinecone.
    The authenticated user's ID is stored as metadata for tenant isolation.
    """
    try:
        index = _get_pinecone_index()
        if index is None:
            logger.warning(f"Skipping embed for {record_id} — Pinecone unavailable.")
            return
        model = _get_embedding_model()

        if isinstance(record_or_text, str):
            text = record_or_text
        else:
            text = _record_to_text(record_or_text, table)

        embedding = model.encode(text).tolist()

        index.upsert(
            vectors=[
                {
                    "id": record_id,
                    "values": embedding,
                    "metadata": {
                        "record_id": record_id,
                        "table": table,
                        "user_id": user_id,
                        "text": text,
                    }
                }
            ]
        )
        logger.info(f"Embedded record {record_id} ({table}) into Pinecone.")
    except Exception as e:
        logger.error(f"Failed to embed record {record_id}: {e}")


def query_similar(
    query_text: str,
    n_results: int = 5,
    where: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Search Pinecone for records semantically similar to query_text.
    The where filter is used for tenant scoping.
    """
    try:
        index = _get_pinecone_index()
        if index is None:
            return []

        model = _get_embedding_model()
        query_embedding = model.encode(query_text).tolist()

        kwargs = {
            "vector": query_embedding,
            "top_k": n_results,
            "include_metadata": True,
        }
        if where:
            # Translate simple equality to explicit $eq for Pinecone filter
            kwargs["filter"] = {k: {"$eq": v} for k, v in where.items()}

        results = index.query(**kwargs)

        hits = []
        if results and results.matches:
            for match in results.matches:
                metadata = match.metadata or {}
                hits.append({
                    "record_id": metadata.get("record_id", match.id),
                    "table": metadata.get("table", "unknown"),
                    "text_preview": metadata.get("text", "")[:300],
                    "distance": match.score,
                })
        return hits
    except Exception as e:
        logger.error(f"Pinecone query failed: {e}")
        return []


def delete_record(record_id: str, user_id: Optional[str] = None) -> None:
    """Remove a record from Pinecone when deleted from the database."""
    try:
        index = _get_pinecone_index()
        if index is None:
            return

        if user_id:
            index.delete(
                filter={
                    "record_id": {"$eq": record_id},
                    "user_id": {"$eq": user_id},
                }
            )
        else:
            index.delete(ids=[record_id])

        logger.info(f"Deleted record {record_id} from Pinecone.")
    except Exception as e:
        logger.warning(f"Could not delete {record_id} from Pinecone: {e}")


def collection_count() -> int:
    """Return number of documents in Pinecone index."""
    try:
        index = _get_pinecone_index()
        if index is not None:
            stats = index.describe_index_stats()
            return stats.total_vector_count
        return 0
    except Exception as e:
        logger.warning(f"Could not get collection count from Pinecone: {e}")
        return 0
