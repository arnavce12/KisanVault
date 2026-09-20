"""
search.py — Natural language search route
  POST /api/search/query
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.record_schema import SearchQuery, SearchResponse, SourceRecord
from app.services.ai_service import handle_query
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.post("/query", response_model=SearchResponse)
def natural_language_search(
    payload: SearchQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Natural language query endpoint.
    - Embeds the query with llama-text-embed-v2
    - Searches Pinecone for relevant farm records
    - Fetches full records from PostgreSQL
    - Calls Groq LLM to generate an answer
    - Returns: answer + source_records (evidence traceability)

    Example queries:
      "How much water did I use last season?"
      "What was my wheat harvest in 2024?"
      "Total fertilizer cost for North Field?"
    """
    if not payload.query.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Query cannot be empty.",
        )

    result = handle_query(
        user_query=payload.query,
        original_query=payload.original_query,
        db=db,
        user_id=str(current_user.id),
        n_results=payload.n_results,
    )

    return SearchResponse(
        answer=result["answer"],
        source_records=[SourceRecord(**s) for s in result["source_records"]],
        query=result["query"],
    )
