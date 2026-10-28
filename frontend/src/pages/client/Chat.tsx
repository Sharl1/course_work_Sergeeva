import { useEffect, useRef, useState } from 'react';
import { ChatWindow } from '../../components/features/ChatWindow';
import { Loader2 } from 'lucide-react';
import apiClient from '../../api/axiosClient';

export const Chat = () => {
  const [chatId, setChatId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initRef = useRef(false); // <--- ЗАЩИТА ОТ ДВОЙНОГО ВЫЗОВА

  useEffect(() => {
    if (initRef.current) return; // Если уже запускали, выходим
    initRef.current = true;

    const initChat = async () => {
      try {
        // 1. Сначала ищем существующий чат
        const res = await apiClient.get('/chats/my');
        
        if (res.data && res.data.length > 0) {
          setChatId(res.data[0].ChatID);
        } else {
          // 2. Если чата нет, создаем новый
          const newChat = await apiClient.post('/chats/');
          setChatId(newChat.data.ChatID);
        }
      } catch (error) {
        console.error("Ошибка инициализации чата", error);
      } finally {
        setIsLoading(false);
      }
    };
    initChat();
  }, []);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-postman" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100dvh-10rem)] md:h-[calc(100vh-8rem)]">
      {chatId ? <ChatWindow chatId={chatId} /> : <div className="text-center py-20 text-apple-gray">Ошибка загрузки чата</div>}
    </div>
  );
};