import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { Calendar, Award, ChevronRight, Utensils, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiClient from '../../api/axiosClient';

// Типы данных
interface Recommendation {
  ServiceID: number;
  ServiceName: string;
  Description: string;
  Price: number;
  category: { CategoryName: string };
}

export const ClientDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [loyalty, setLoyalty] = useState<any>(null);
  const [lastBooking, setLastBooking] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем все данные параллельно
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Бонусы
        try {
          const loyRes = await apiClient.get('/loyalty/my');
          setLoyalty(loyRes.data);
        } catch (e) { console.log("Лояльность пуста"); }

        // 2. Последняя бронь
        try {
          const bookRes = await apiClient.get('/bookings/my');
          if (bookRes.data.length > 0) {
            setLastBooking(bookRes.data[0]);
          }
        } catch (e) { console.log("Броней нет"); }

        // 3. Рекомендации
        try {
          const recRes = await apiClient.get('/services/recommendations/');
          setRecommendations(recRes.data);
        } catch (e) { console.log("Рекомендаций нет"); }

      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300 } } };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-postman" size={40} /></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Главная карточка (Приветствие) */}
        <motion.div variants={item} className="md:col-span-2 relative overflow-hidden rounded-apple-lg p-8 bg-white dark:bg-apple-darkCard shadow-apple-light dark:shadow-apple-dark border border-apple-border dark:border-apple-darkBorder group">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Привет, {user?.FirstName}!</h2>
            <p className="text-apple-gray mb-6 max-w-md">Добро пожаловать в ваш цифровой консьерж. Закажите услуги или пообщайтесь с нами.</p>
            <button 
              onClick={() => navigate('/catalog')}
              className="px-6 py-3 bg-postman hover:bg-postman-hover text-white rounded-xl font-medium transition-all shadow-postman-glow flex items-center gap-2 w-fit"
            >
              Перейти в каталог
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-postman/10 rounded-full blur-3xl group-hover:bg-postman/20 transition-all duration-500" />
        </motion.div>

        {/* Бонусы */}
        <motion.div variants={item} className="rounded-apple-lg p-6 bg-gradient-to-br from-postman to-[#ff8f66] text-white shadow-postman-glow flex flex-col justify-between cursor-pointer" onClick={() => navigate('/loyalty')}>
          <Award size={32} className="opacity-80 mb-4" />
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Бонусный баланс</p>
            <h3 className="text-4xl font-bold">
              {loyalty?.Balance || 0} <span className="text-lg font-normal opacity-80">баллов</span>
            </h3>
          </div>
        </motion.div>

        {/* Ближайшая бронь */}
        <motion.div variants={item} className="rounded-apple-lg p-6 bg-white dark:bg-apple-darkCard shadow-apple-light dark:shadow-apple-dark border border-apple-border dark:border-apple-darkBorder cursor-pointer" onClick={() => navigate('/bookings')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
              <Calendar size={24} />
            </div>
            {lastBooking && <span className="text-xs font-medium px-2.5 py-1 bg-green-500/10 text-green-500 rounded-full">Активна</span>}
          </div>
          {lastBooking ? (
            <>
              <h3 className="text-lg font-semibold mb-1 line-clamp-1">{lastBooking.service?.ServiceName}</h3>
              <p className="text-sm text-apple-gray">{new Date(lastBooking.BookingDate).toLocaleString('ru-RU')}</p>
            </>
          ) : (
            <p className="text-sm text-apple-gray mt-2">У вас пока нет активных броней</p>
          )}
        </motion.div>

        {/* Быстрые действия */}
        <motion.div variants={item} className="md:col-span-2 rounded-apple-lg p-6 bg-white dark:bg-apple-darkCard shadow-apple-light dark:shadow-apple-dark border border-apple-border dark:border-apple-darkBorder">
          <h3 className="text-lg font-semibold mb-4">Быстрые действия</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/food')} className="p-4 rounded-xl bg-apple-bg dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex flex-col items-center gap-2 border border-transparent hover:border-apple-border dark:hover:border-apple-darkBorder">
              <Utensils className="text-postman" size={24} />
              <span className="text-sm font-medium">Заказать еду</span>
            </button>
            <button onClick={() => navigate('/chat')} className="p-4 rounded-xl bg-apple-bg dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex flex-col items-center gap-2 border border-transparent hover:border-apple-border dark:hover:border-apple-darkBorder">
              <MessageSquare className="text-postman" size={24} />
              <span className="text-sm font-medium">Вызвать консьержа</span>
            </button>
          </div>
        </motion.div>

      </motion.div>

      {/* Персональные рекомендации */}
      {recommendations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="text-postman" size={24} /> Рекомендуем для вас
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {recommendations.map(service => (
              <div 
                key={service.ServiceID} 
                className="min-w-[280px] bg-white dark:bg-apple-darkCard p-5 rounded-apple-lg border border-apple-border dark:border-apple-darkBorder flex flex-col cursor-pointer hover:border-postman hover:shadow-apple-light dark:hover:shadow-apple-dark transition-all" 
                onClick={() => navigate('/catalog')}
              >
                <span className="text-[10px] uppercase tracking-wider font-bold text-postman mb-2">{service.category?.CategoryName}</span>
                <h4 className="font-bold text-lg mb-1">{service.ServiceName}</h4>
                <p className="text-apple-gray text-xs line-clamp-2 mb-4 flex-1">{service.Description}</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-apple-border dark:border-apple-darkBorder">
                  <span className="font-bold">{service.Price.toLocaleString('ru-RU')} ₽</span>
                  <span className="text-postman text-sm font-medium">Забронировать</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};