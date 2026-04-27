from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/events", tags=["Events"])


@router.post("", response_model=schemas.EventOut, status_code=201)
def create_event(
    event_data: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin)
):
    event = models.Event(
        **event_data.model_dump(),
        available_tickets=event_data.total_tickets,
        created_by=current_user.id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("", response_model=List[schemas.EventOut])
def list_events(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Event).filter(models.Event.is_active == True)
    if category:
        query = query.filter(models.Event.category == category)
    if search:
        query = query.filter(models.Event.title.ilike(f"%{search}%"))
    return query.order_by(models.Event.date.asc()).offset(skip).limit(limit).all()


@router.get("/all", response_model=List[schemas.EventOut])
def list_all_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin)
):
    return db.query(models.Event).order_by(models.Event.created_at.desc()).all()


@router.get("/{event_id}", response_model=schemas.EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=schemas.EventOut)
def update_event(
    event_id: int,
    event_data: schemas.EventUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = event_data.model_dump(exclude_unset=True)

    # If total_tickets is updated, adjust available_tickets accordingly
    if "total_tickets" in update_data:
        booked = event.total_tickets - event.available_tickets
        new_available = update_data["total_tickets"] - booked
        if new_available < 0:
            raise HTTPException(status_code=400, detail="Cannot reduce tickets below already booked amount")
        event.available_tickets = new_available

    for key, value in update_data.items():
        setattr(event, key, value)

    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=204)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.is_active = False
    db.commit()
    return None
