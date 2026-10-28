from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.review import Review
from app.models.service import Service
from app.schemas.review import ReviewCreate, ReviewInDB
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=ReviewInDB, status_code=status.HTTP_201_CREATED, summary="Оставить отзыв")
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    service = db.query(Service).filter(Service.ServiceID == review_in.ServiceID).first()
    if not service:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    
    review = Review(
        UserID=current_user.UserID,
        ServiceID=review_in.ServiceID,
        Rating=review_in.Rating,
        Comment=review_in.Comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.get("/service/{service_id}", response_model=List[ReviewInDB], summary="Отзывы об услуге")
def read_service_reviews(service_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.ServiceID == service_id).all()