from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.request import RequestInDB, RequestStatusUpdate, RequestAssign, QRScanRequest
from app.crud import crud_request
from app.api.deps import check_role
from app.models.user import User
from app.models.loyalty import LoyaltyAccount

router = APIRouter()

@router.get("/", response_model=List[RequestInDB], summary="Получить список заявок (Сотрудник/Админ)")
def read_requests(
    status_name: Optional[str] = Query(None, description="Фильтр по статусу"),
    only_my: bool = Query(False, description="Показать только мои заявки"),
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Staff", "Admin"]))
):
    staff_id = current_user.UserID if only_my else None
    return crud_request.get_requests(db, status_name=status_name, staff_id=staff_id)

@router.patch("/{request_id}/assign", response_model=RequestInDB, summary="Взять заявку в работу")
def assign_request_to_me(
    request_id: int,
    assign_data: RequestAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Staff", "Admin"]))
):
    target_staff_id = assign_data.StaffID if assign_data.StaffID else current_user.UserID
    db_request = crud_request.get_request(db, request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    return crud_request.assign_request(db, request_id, target_staff_id)

@router.patch("/{request_id}/status", response_model=RequestInDB, summary="Изменить статус заявки")
def update_status(
    request_id: int,
    update_data: RequestStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Staff", "Admin"]))
):
    db_request = crud_request.get_request(db, request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
        
    updated_request = crud_request.update_request_status(db, request_id, update_data)
    if not updated_request:
        raise HTTPException(status_code=400, detail="Некорректный статус")
    return updated_request

@router.post("/scan-qr", summary="Сканировать QR-код гостя")
def scan_qr(
    data: QRScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Staff", "Admin"]))
):
    try:
        parts = data.qr_string.split('-')
        if len(parts) != 4 or parts[0] != "CONCIERGE":
            raise ValueError("Неверный формат")
        user_id = int(parts[2])
    except:
        raise HTTPException(status_code=400, detail="Неверный QR-код")
        
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Гость не найден")
        
    account = db.query(LoyaltyAccount).filter(LoyaltyAccount.UserID == user_id).first()
    return {
        "guest_name": f"{user.FirstName} {user.LastName}",
        "email": user.Email,
        "balance": account.Balance if account else 0,
        "message": "QR успешно распознан"
    }