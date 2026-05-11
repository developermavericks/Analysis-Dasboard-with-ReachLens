import os
import uuid
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.models import AggregationCache, Article, Upload
from app.db.session import get_db
from app.schemas.upload import UploadCreateResponse, UploadStatusResponse
from app.workers.orchestrator import process_upload

router = APIRouter(tags=["uploads"])
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXT = {".xlsx", ".xls", ".csv"}


@router.post("/uploads", response_model=UploadCreateResponse)
async def create_upload(file: UploadFile = File(...), sector_context: str | None = Form(default=None), db: Session = Depends(get_db)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File contains no data rows")

    uid = uuid.uuid4()
    path = UPLOAD_DIR / f"{uid}{ext}"
    with open(path, "wb") as f:
        f.write(content)

    try:
        if ext == ".csv":
            df = pd.read_csv(path)
        else:
            df = pd.read_excel(path)
        if df.empty:
            raise HTTPException(status_code=400, detail="File contains no data rows")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Unable to parse file")

    upload = Upload(id=uid, filename=file.filename, status="pending", error_log=[{"type": "sector_context", "value": sector_context}])
    db.add(upload)
    db.commit()

    task = process_upload.delay(str(uid), str(path))
    upload.celery_task_id = task.id
    db.commit()

    return {"upload_id": str(uid), "status": "pending", "message": "Upload accepted"}


@router.get("/uploads/{upload_id}/status", response_model=UploadStatusResponse)
def get_status(upload_id: str, db: Session = Depends(get_db)):
    upload = db.execute(select(Upload).where(Upload.id == upload_id)).scalar_one_or_none()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return {
        "upload_id": str(upload.id),
        "status": upload.status,
        "processed_rows": upload.processed_rows or 0,
        "total_rows": upload.total_rows,
        "failed_rows": upload.failed_rows or 0,
        "error_summary": upload.error_log or [],
    }


@router.post("/uploads/from-db", response_model=UploadCreateResponse)
async def create_db_upload(data: dict, db: Session = Depends(get_db)):
    date_str = data.get("date")
    sector = data.get("sector")
    if not date_str or not sector:
        raise HTTPException(status_code=400, detail="Date and Sector are required")
    
    uid = uuid.uuid4()
    # In a real scenario, we would verify data exists for this date/sector here
    upload = Upload(
        id=uid, 
        filename=f"DB_IMPORT_{sector}_{date_str}", 
        status="pending", 
        error_log=[{"type": "db_import", "date": date_str, "sector": sector}]
    )
    db.add(upload)
    db.commit()

    # Trigger a specialized task for DB import
    from app.workers.orchestrator import process_db_import
    task = process_db_import.delay(str(uid), date_str, sector)
    upload.celery_task_id = task.id
    db.commit()

    return {"upload_id": str(uid), "status": "pending", "message": "Database retrieval synchronized"}


@router.delete("/uploads/{upload_id}")
def delete_upload(upload_id: str, db: Session = Depends(get_db)):
    upload = db.execute(select(Upload).where(Upload.id == upload_id)).scalar_one_or_none()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    if upload.celery_task_id and upload.status == "processing":
        process_upload.AsyncResult(upload.celery_task_id).revoke(terminate=True)
    db.execute(delete(AggregationCache).where(AggregationCache.upload_id == upload_id))
    db.execute(delete(Article).where(Article.upload_id == upload_id))
    db.execute(delete(Upload).where(Upload.id == upload_id))
    db.commit()
    return {"status": "deleted", "upload_id": upload_id}
