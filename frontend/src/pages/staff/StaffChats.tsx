import { useEffect, useState, useRef } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import apiClient from '../../api/axiosClient';
import { ChatWindow } from '../../components/features/ChatWindow';
import { useToast } from '../../components/ui/Toast';

interface ChatData {
  ChatID: number;
  client: { FirstName: string; LastName: string; Email: string; };
  messages: { Content: string; SentAt: string; }[];
}

export const StaffChats = () => {
  const { showToast } = useToast();
  const [chats, setChats] = useState<ChatData[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isInitialMount = useRef(true); // <--- Защита от прыжков

  const fetchChats = async () => {
    try {
      const res = await apiClient.get('/chats/my');
      setChats(res.data);
      
      // Выбираем чат ТОЛЬКО при первой загрузке страницы
      if (isInitialMount.current && res.data.length > 0) {
        setActiveChatId(res.data[0].ChatID);
        isInitialMount.current = false;
      }
    } catch (error) {
      showToast('Ошибка загрузки чатов', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-postman" size={40} /></div>;

  return (
    <div className="h-[calc(100dvh-10rem)] md:h-[calc(100vh-8rem)] flex bg-white dark:bg-apple-darkCard rounded-apple-lg border border-apple-border dark:border-apple-darkBorder overflow-hidden shadow-apple-light dark:shadow-apple-dark">
      
      <div className={`w-full md:w-80 border-r border-apple-border dark:border-apple-darkBorder flex-col bg-apple-bg dark:bg-black/10 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-apple-border dark:border-apple-darkBorder bg-white/50 dark:bg-apple-darkCard/50 backdrop-blur-md">
          <h2 className="font-bold text-lg">Диалоги</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="text-center text-apple-gray py-10 text-sm">Пока нет активных чатов</div>
          ) : (
            chats.map(chat => {
              const lastMsg = chat.messages[chat.messages.length - 1];
              const isActive = activeChatId === chat.ChatID;
              
              return (
                <div 
                  key={chat.ChatID}
                  onClick={() => setActiveChatId(chat.ChatID)}
                  className={`p-4 border-b border-apple-border dark:border-apple-darkBorder cursor-pointer transition-colors ${isActive ? 'bg-postman/5 border-l-4 border-l-postman' : 'hover:bg-black/5 dark:hover:bg-white/5 border-l-4 border-l-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-postman text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {chat.client.FirstName?.[0]}{chat.client.LastName?.[0]}
                    </div>
                    <div className="overflow-hidden w-full">
                      <h4 className="font-semibold text-sm truncate">{chat.client.FirstName} {chat.client.LastName}</h4>
                      <p className="text-xs text-apple-gray truncate">
                        {lastMsg ? lastMsg.Content : 'Нет сообщений'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={`flex-1 flex-col ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChatId ? (
          <div className="h-full flex flex-col">
            <div className="md:hidden p-3 border-b border-apple-border dark:border-apple-darkBorder bg-white dark:bg-apple-darkCard">
              <button onClick={() => setActiveChatId(null)} className="text-postman text-sm font-medium flex items-center gap-1">
                <MessageSquare size={16} /> К списку чатов
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
                          <div className="flex-1 overflow-hidden">
              <ChatWindow 
                chatId={activeChatId} 
                otherPartyName={
                  chats.find(c => c.ChatID === activeChatId)?.client.FirstName + ' ' + 
                  chats.find(c => c.ChatID === activeChatId)?.client.LastName
                } 
              />
            </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-apple-gray bg-apple-bg dark:bg-black/10">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Выберите диалог, чтобы начать общение</p>
          </div>
        )}
      </div>

    </div>
  );
};