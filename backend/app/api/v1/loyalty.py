from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.loyalty import LoyaltyAccount, LoyaltyTransaction
from app.models.user import User
from app.schemas.loyalty import LoyaltyAccountInDB, AwardPointsRequest
from app.api.deps import get_current_active_user, check_role

router = APIRouter()

@router.get("/my", response_model=LoyaltyAccountInDB, summary="Мой бонусный счет")
def read_my_loyalty(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    account = db.query(LoyaltyAccount).filter(LoyaltyAccount.UserID == current_user.UserID).first()
    if not account:
        account = LoyaltyAccount(UserID=current_user.UserID, Balance=0)
        db.add(account)
        db.commit()
        db.refresh(account)
    return account

@router.post("/award-points", summary="Изменить баланс баллов гостя (Сотрудник)")
def award_points(
    data: AwardPointsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Staff", "Admin"]))
):
    # Достаем ID пользователя из QR-строки
    try:
        user_id = int(data.qr_string.split('-')[2])
    except:
        raise HTTPException(status_code=400, detail="Неверный QR-код")

    account = db.query(LoyaltyAccount).filter(LoyaltyAccount.UserID == user_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Счет лояльности не найден")

    # Проверка на достаточное количество баллов для списания
    if data.amount < 0 and account.Balance < abs(data.amount):
        raise HTTPException(
            status_code=400, 
            detail=f"Недостаточно баллов. На счету: {account.Balance} б."
        )

    account.Balance += data.amount
    
    # Определяем тип транзакции
    tx_type = "Accrual" if data.amount > 0 else "Deduction"
    
    tx = LoyaltyTransaction(
        AccountID=account.AccountID,
        Amount=data.amount,
        TransactionType=tx_type,
        Description=data.description
    )
    db.add(tx)
    db.commit()
    
    action = "начислено" if data.amount > 0 else "списано"
    return {"message": f"Успешно {action} {abs(data.amount)} баллов", "new_balance": account.Balance}