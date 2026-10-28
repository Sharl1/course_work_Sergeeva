from app.db.database import SessionLocal
from app.models.chat import Chat, Message

def clear_all_chats():
    db = SessionLocal()
    try:
        # Сначала удаляем сообщения (из-за связей Foreign Key)
        deleted_messages = db.query(Message).delete()
        # Затем удаляем сами чаты
        deleted_chats = db.query(Chat).delete()
        
        db.commit()
        print(f"✅ Успешно удалено {deleted_messages} сообщений и {deleted_chats} чатов!")
    except Exception as e:
        print(f"❌ Ошибка при очистке: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_all_chats()