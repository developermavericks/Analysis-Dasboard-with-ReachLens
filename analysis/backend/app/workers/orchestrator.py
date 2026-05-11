from datetime import datetime, timedelta, timezone

from celery.utils.log import get_task_logger
from sqlalchemy import select

from app.config.settings import get_settings
from app.db.models import Upload
from app.db.session import SessionLocal
from app.workers.celery_app import celery_app
logger = get_task_logger(__name__)
settings = get_settings()


def update_status(upload_id: str, status: str, error: str | None = None):
    with SessionLocal() as db:
        upload = db.execute(select(Upload).where(Upload.id == upload_id)).scalar_one_or_none()
        if not upload:
            return
        upload.status = status
        if error:
            upload.error_log = (upload.error_log or []) + [{"type": "exception", "message": error}]
        db.commit()


def cleanup_temp_file(file_path: str):
    try:
        import os

        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        logger.warning("cleanup_failed", extra={"path": file_path})


@celery_app.task(bind=True, max_retries=3)
def process_upload(self, upload_id: str, file_path: str):
    try:
        from app.workers.phase1_preprocess import phase1_preprocess
        from app.workers.phase2_ner import phase2_ner
        from app.workers.phase3_sentiment import phase3_sentiment
        from app.workers.phase4_tfidf import phase4_tfidf
        from app.workers.phase6_aggregate import phase6_aggregate

        update_status(upload_id, "processing")
        phase1_preprocess(upload_id, file_path)
        phase2_ner(upload_id)
        phase3_sentiment(upload_id)
        phase4_tfidf(upload_id)
        if settings.REACHLENS_ENABLED:
            from app.workers.phase5_reachlens import run_reachlens

            run_reachlens(upload_id)
        phase6_aggregate(upload_id)
        update_status(upload_id, "complete")
    except Exception as exc:
        update_status(upload_id, "failed", error=str(exc))
        if isinstance(exc, FileNotFoundError):
            return
        raise self.retry(exc=exc, countdown=30)
    finally:
        cleanup_temp_file(file_path)


@celery_app.task(bind=True, max_retries=3)
def process_db_import(self, upload_id: str, date_str: str, sector: str):
    """
    Specialized task to import data from the scraper database.
    The user will integrate the actual database fetching logic here.
    """
    try:
        from app.workers.phase1_preprocess import phase1_preprocess
        from app.workers.phase2_ner import phase2_ner
        from app.workers.phase3_sentiment import phase3_sentiment
        from app.workers.phase4_tfidf import phase4_tfidf
        from app.workers.phase6_aggregate import phase6_aggregate

        update_status(upload_id, "processing")
        
        # MOCK/PLACEHOLDER: In a real integration, this would query the scraper DB
        # and create a temporary CSV/processed format for phase1.
        # For now, we simulate a small delay and a "No data" error if it's the weekend
        import time
        time.sleep(2) 
        
        # For demonstration, we'll use a sample file if available, or just fail with a clear message
        # until the user plugs in the actual DB builder logic.
        placeholder_path = "/app/sample_100_rows.csv"
        
        phase1_preprocess(upload_id, placeholder_path)
        phase2_ner(upload_id)
        phase3_sentiment(upload_id)
        phase4_tfidf(upload_id)
        
        if settings.REACHLENS_ENABLED:
            from app.workers.phase5_reachlens import run_reachlens
            run_reachlens(upload_id)
            
        phase6_aggregate(upload_id)
        update_status(upload_id, "complete")
    except Exception as exc:
        update_status(upload_id, "failed", error=str(exc))
        raise self.retry(exc=exc, countdown=30)


@celery_app.task(name="app.workers.orchestrator.mark_stale_pending_uploads")
def mark_stale_pending_uploads():
    cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
    with SessionLocal() as db:
        uploads = db.execute(select(Upload).where(Upload.status == "pending", Upload.created_at < cutoff)).scalars().all()
        for upload in uploads:
            upload.status = "failed"
            upload.error_log = (upload.error_log or []) + [{"type": "stale_pending_cleanup"}]
        db.commit()
