from app.db.database import SessionLocal
from app.models.user import User
from app.models.loyalty import LoyaltyAccount, LoyaltyTransaction

def add_points(email: str, points: int):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.Email == email).first()
        if not user:
            print(f"Пользователь {email} не найден")
            return
            
        acc = db.query(LoyaltyAccount).filter(LoyaltyAccount.UserID == user.UserID).first()
        if not acc:
            acc = LoyaltyAccount(UserID=user.UserID, Balance=0)
            db.add(acc)
            db.commit()
            db.refresh(acc)

        acc.Balance += points
        tx = LoyaltyTransaction(
            AccountID=acc.AccountID, 
            Amount=points, 
            TransactionType="Accrual", 
            Description="Тестовое начисление баллов"
        )
        db.add(tx)
        db.commit()
        print(f"✅ Успешно начислено {points} баллов для {email}. Текущий баланс: {acc.Balance}")
    finally:
        db.close()

if __name__ == "__main__":
    add_points("anna@mail.ru", 500)
    add_points("ivan@mail.ru", 250)