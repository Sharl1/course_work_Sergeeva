import { useEffect, useState, useRef } from 'react';
import { Loader2, Send, MessageSquare, Headphones } from 'lucide-react';
import apiClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../ui/Toast';

interface Message {
  MessageID: number;
  SenderID: number;
  Content: string;
  SentAt: string;
  sender: { FirstName: string; LastName: string; };
}

// Добавили пропс otherPartyName (для сотрудника)
export const ChatWindow = ({ chatId, otherPartyName }: { chatId: number, otherPartyName?: string }) => {
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStaffView = !!otherPartyName; // Если передали имя — значит мы сотрудник

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await apiClient.get(`/chats/${chatId}/messages`);
      setMessages(res.data);
    } catch (error) {
      showToast('Ошибка загрузки сообщений', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Обновляем чаще (раз в 3 сек)
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    const content = newMessage;
    setNewMessage('');

    try {
      const res = await apiClient.post(`/chats/${chatId}/messages`, { Content: content });
      setMessages(prev => [...prev, res.data]);
      scrollToBottom();
    } catch (error) {
      showToast('Ошибка отправки', 'error');
      setNewMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-postman" /></div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-apple-darkCard overflow-hidden">
      {/* Шапка чата (Динамическая) */}
      <div className="p-4 border-b border-apple-border dark:border-apple-darkBorder bg-white/50 dark:bg-apple-darkCard/50 backdrop-blur-md flex items-center gap-3">
        {isStaffView ? (
          <div className="w-10 h-10 bg-postman text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
            {otherPartyName?.[0]}
          </div>
        ) : (
          <div className="w-10 h-10 bg-postman/10 text-postman rounded-full flex items-center justify-center shrink-0">
            <Headphones size={20} />
          </div>
        )}
        
        <div>
          <h3 className="font-bold">{isStaffView ? otherPartyName : 'Служба поддержки'}</h3>
          <p className="text-xs text-green-500 font-medium">Онлайн</p>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-apple-bg dark:bg-black/10">
        {messages.map((msg) => {
          const isMe = msg.SenderID === user?.UserID;
          return (
            <div key={msg.MessageID} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-apple-gray mb-1 px-1">
                {isMe ? 'Вы' : `${msg.sender.FirstName} ${msg.sender.LastName}`}
              </span>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe ? 'bg-postman text-white rounded-tr-sm' : 'bg-white dark:bg-apple-darkCard border border-apple-border dark:border-apple-darkBorder rounded-tl-sm'}`}>
                {msg.Content}
              </div>
              <span className="text-[10px] text-apple-gray mt-1 px-1">
                {new Date(msg.SentAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Инпут */}
      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-apple-darkCard border-t border-apple-border dark:border-apple-darkBorder flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Напишите сообщение..."
          className="flex-1 p-3 bg-apple-bg dark:bg-black/20 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim() || isSending}
          className="p-3 bg-postman text-white rounded-xl disabled:opacity-50 hover:bg-postman-hover transition-colors"
        >
          {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};