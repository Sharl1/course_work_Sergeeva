from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.db.database import get_db
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewInDB
from app.api.deps import get_current_active_user, check_role
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=ReviewInDB, summary="Оставить отзыв")
def create_review(review_in: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    review = Review(UserID=current_user.UserID, ServiceID=review_in.ServiceID, Rating=review_in.Rating, Comment=review_in.Comment)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.get("/all", response_model=List[ReviewInDB], summary="Все отзывы (Админ)")
def get_all_reviews(db: Session = Depends(get_db), current_user: User = Depends(check_role(["Admin"]))):
    return db.query(Review).options(joinedload(Review.user), joinedload(Review.service)).order_by(Review.CreatedAt.desc()).all()

@router.delete("/{review_id}", summary="Удалить отзыв (Админ)")
def delete_review(review_id: int, db: Session = Depends(get_db), current_user: User = Depends(check_role(["Admin"]))):
    review = db.query(Review).filter(Review.ReviewID == review_id).first()
    if not review: raise HTTPException(status_code=404, detail="Отзыв не найден")
    db.delete(review)
    db.commit()
    return {"message": "Удалено"}