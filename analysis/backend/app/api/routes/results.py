from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import case, distinct, func, select
from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.db.models import AggregationCache, Article, Upload
from app.db.session import get_db
from app.utils.cache import cache_get_or_db

router = APIRouter(tags=["results"])
settings = get_settings()

WIDGETS = [
    "top_publications",
    "word_cloud",
    "sentiment_overview",
    "top_companies",
    "positive_word_cloud",
    "negative_word_cloud",
    "hot_topics",
    "top_journalists",
]


@router.get("/uploads/{upload_id}/results")
def get_results(
    upload_id: str,
    scope: str = "sector",
    scope_value: str = "General",
    widgets: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    db: Session = Depends(get_db),
):
    requested = WIDGETS if not widgets else [w.strip() for w in widgets.split(",") if w.strip()]
    payload_widgets = {}
    now = datetime.now(timezone.utc)
    for widget in requested:
        key = f"{upload_id}:{scope}:{scope_value}:{widget}"
        data = cache_get_or_db(db, key, upload_id, scope, scope_value, widget)
        if not data:
            payload_widgets[widget] = {"status": "pending"}
            continue
        row = db.execute(
            select(AggregationCache).where(
                AggregationCache.upload_id == upload_id,
                AggregationCache.scope == scope,
                AggregationCache.scope_value == scope_value,
                AggregationCache.widget == widget,
            )
        ).scalar_one_or_none()
        if row and row.expires_at and row.expires_at < now:
            payload_widgets[widget] = {"status": "computing", "retry_after": 5}
        else:
            payload_widgets[widget] = data

    # Calculate meta stats (Filtered by scope)
    q = select(
        func.count(Article.id),
        func.sum(case((Article.is_english.is_(True), 1), else_=0)),
        func.sum(case((Article.is_duplicate.is_(True), 1), else_=0)),
    ).where(Article.upload_id == upload_id)

    if scope_value != "General":
        if scope == "client":
            # PostgreSQL contains operator for ARRAYS
            q = q.where(Article.client_tags.any(scope_value))
        elif scope == "sector":
            q = q.where(Article.sector == scope_value)

    total, english, duplicate = db.execute(q).one()
    upload = db.execute(select(Upload).where(Upload.id == upload_id)).scalar_one_or_none()
    return {
        "upload_id": upload_id,
        "scope": scope,
        "scope_value": scope_value,
        "reachlens_enabled": settings.REACHLENS_ENABLED,
        "widgets": payload_widgets,
        "meta": {
            "total_articles": int(total or 0),
            "english_articles": int(english or 0),
            "duplicate_articles": int(duplicate or 0),
            "failed_rows": int((upload.failed_rows if upload else 0) or 0),
            "date_range": {"from": date_from, "to": date_to},
        },
    }


@router.get("/uploads/{upload_id}/scopes")
def get_scopes(
    upload_id: str,
    type: str = "sector",
    db: Session = Depends(get_db),
):
    """Return all distinct values for the given upload based on type ('sector' or 'client')."""
    if type == "client":
        # client_tags is a PostgreSQL ARRAY column. Use unnest to get distinct values.
        rows = db.execute(
            select(func.distinct(func.unnest(Article.client_tags))).where(
                Article.upload_id == upload_id
            )
        ).scalars().all()
    else:
        rows = db.execute(
            select(distinct(Article.sector)).where(
                Article.upload_id == upload_id,
                Article.sector.isnot(None),
            )
        ).scalars().all()
    
    values = sorted([r for r in rows if r])
    return {"type": type, "values": values}


@router.get("/uploads/{upload_id}/articles")
def get_articles(
    upload_id: str,
    sentiment: str | None = None,
    publication: str | None = None,
    author: str | None = None,
    brand: str | None = None,
    scope: str = "General",
    scope_type: str = "sector",
    db: Session = Depends(get_db),
):
    """Retrieve articles filtered by specific criteria for the drill-down view."""
    query = select(Article).where(Article.upload_id == upload_id)
    
    # Intelligence / Entity Scope Filter
    if scope != "General":
        if scope_type == "client":
            # Filter by client_tags using PostgreSQL any()
            query = query.where(Article.client_tags.any(scope))
        else:
            query = query.where(Article.sector == scope)
        
    # Selection Filters
    if sentiment:
        query = query.where(Article.sentiment_label == sentiment.lower())
    if publication:
        query = query.where(Article.publisher == publication)
    if author:
        query = query.where(Article.author == author)
    if brand:
        # brand is stored in entity_orgs JSONB list
        query = query.where(Article.entity_orgs.contains([brand]))
        
    articles = db.execute(query.limit(100)).scalars().all()
    
    return {
        "upload_id": upload_id,
        "count": len(articles),
        "articles": [
            {
                "id": str(article.id),
                "title": article.title,
                "url": article.resolved_url,
                "published_at": article.published_at.isoformat() if article.published_at else None,
                "publisher": article.publisher,
                "author": article.author,
                "sentiment": article.sentiment_label,
                "summary": article.summary,
            }
            for article in articles
        ]
    }
