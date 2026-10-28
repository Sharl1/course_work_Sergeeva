import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ClipboardList, TrendingUp, Award, Loader2, Download } from 'lucide-react';
import apiClient from '../../api/axiosClient';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

// Цвета для графиков (Postman Orange + Apple accents)
const COLORS = ['#FF6C37', '#34C759', '#007AFF', '#FF3B30', '#FFCC00'];

export const AdminDashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [detailed, setDetailed] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Состояния для детализации
  const [modalType, setModalType] = useState<'users' | 'bookings' | 'services' | 'bonuses' | null>(null);
  const [modalData, setModalData] = useState<any[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [summaryRes, detailedRes] = await Promise.all([
          apiClient.get('/analytics/summary'),
          apiClient.get('/analytics/detailed')
        ]);
        setStats(summaryRes.data);
        setDetailed(detailedRes.data);
      } catch (error) {
        console.error("Ошибка аналитики", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleCardClick = async (type: 'users' | 'bookings' | 'services' | 'bonuses') => {
    setModalType(type);
    setIsModalLoading(true);
    setModalData([]);
    try {
      if (type === 'users') {
        const res = await apiClient.get('/users/');
        setModalData(res.data);
      } else if (type === 'bookings') {
        const res = await apiClient.get('/bookings/all');
        setModalData(res.data);
      } else if (type === 'services') {
        const res = await apiClient.get('/services/', { params: { only_active: false } });
        setModalData(res.data);
      } else if (type === 'bonuses') {
        const res = await apiClient.get('/analytics/transactions');
        setModalData(res.data);
      }
    } catch (error) {
      console.error("Ошибка детализации", error);
    } finally {
      setIsModalLoading(false);
    }
  };

  // Генерация CSV отчета (имитация Excel)
  const handleExport = () => {
    if (!stats) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Показатель,Значение\n"
      + `Всего пользователей,${stats.total_users}\n`
      + `Всего броней,${stats.total_bookings}\n`
      + `Услуг в каталоге,${stats.total_services}\n`
      + `Бонусов начислено,${stats.total_bonus_issued}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "concierge_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Отчет успешно выгружен!', 'success');
  };

  if (isLoading || !detailed) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-postman" size={40} /></div>;

  const cards = [
    { id: 'users', title: 'Пользователи', value: stats?.total_users || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'bookings', title: 'Бронирования', value: stats?.total_bookings || 0, icon: ClipboardList, color: 'text-postman', bg: 'bg-postman/10' },
    { id: 'services', title: 'Услуги', value: stats?.total_services || 0, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'bonuses', title: 'Бонусы выдано', value: stats?.total_bonus_issued || 0, icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Аналитика и отчеты</h1>
          <p className="text-apple-gray text-sm">Ключевые метрики отеля в реальном времени</p>
        </div>
        <button 
          onClick={handleExport}
          className="px-5 py-2.5 bg-apple-bg dark:bg-black/20 border border-apple-border dark:border-apple-darkBorder hover:border-postman text-apple-text dark:text-white rounded-xl font-medium transition-all flex items-center gap-2 text-sm"
        >
          <Download size={18} /> Выгрузить отчет (CSV)
        </button>
      </div>

      {/* Карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div 
            key={card.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            onClick={() => handleCardClick(card.id as any)}
            className="bg-white dark:bg-apple-darkCard p-6 rounded-apple-lg border border-apple-border dark:border-apple-darkBorder shadow-sm cursor-pointer hover:border-postman hover:shadow-postman-glow transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${card.bg} ${card.color}`}>
              <card.icon size={24} />
            </div>
            <p className="text-sm font-medium text-apple-gray mb-1 group-hover:text-postman transition-colors">{card.title}</p>
            <h3 className="text-3xl font-bold">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Графики: Верхний ряд */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* График активности */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white dark:bg-apple-darkCard p-6 rounded-apple-lg border border-apple-border dark:border-apple-darkBorder shadow-sm">
          <h3 className="font-bold text-lg mb-6">Заказы за последние 7 дней</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={detailed.activity}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6C37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6C37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="заказы" stroke="#FF6C37" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Статусы броней */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-apple-darkCard p-6 rounded-apple-lg border border-apple-border dark:border-apple-darkBorder shadow-sm">
          <h3 className="font-bold text-lg mb-2">Статусы броней</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={detailed.status_distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {detailed.status_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Нижний ряд: Топ услуг */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white dark:bg-apple-darkCard p-6 rounded-apple-lg border border-apple-border dark:border-apple-darkBorder shadow-sm">
        <h3 className="font-bold text-lg mb-6">Топ-5 востребованных услуг</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={detailed.top_services} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#1D1D1F', fontSize: 12, fontWeight: 'bold' }} width={150} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" fill="#FF6C37" radius={[0, 8, 8, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* УНИВЕРСАЛЬНАЯ МОДАЛКА ДЕТАЛИЗАЦИИ */}
      <Modal 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)} 
        title={
          modalType === 'users' ? 'Список пользователей' :
          modalType === 'bookings' ? 'Все бронирования' :
          modalType === 'services' ? 'Все услуги' : 'История бонусов'
        }
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          {isModalLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-postman" size={30} /></div>
          ) : modalData.length === 0 ? (
            <p className="text-center text-apple-gray py-4">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {modalType === 'users' && modalData.map(u => (
                <div key={u.UserID} className="p-3 bg-apple-bg dark:bg-black/20 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{u.FirstName} {u.LastName}</p>
                    <p className="text-xs text-apple-gray">{u.Email}</p>
                  </div>
                  <span className="text-xs font-bold bg-postman/10 text-postman px-2 py-1 rounded-lg">{u.roles?.[0]?.RoleName}</span>
                </div>
              ))}

              {modalType === 'bookings' && modalData.map(b => (
                <div key={b.BookingID} className="p-3 bg-apple-bg dark:bg-black/20 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{b.service?.ServiceName}</p>
                    <p className="text-xs text-apple-gray">Гость: {b.user?.FirstName} {b.user?.LastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-postman text-sm">{Number(b.FinalPrice || b.service?.Price).toLocaleString('ru-RU')} ₽</p>
                    <span className="text-[10px] text-apple-gray">{b.status?.StatusName}</span>
                  </div>
                </div>
              ))}

              {modalType === 'services' && modalData.map(s => (
                <div key={s.ServiceID} className="p-3 bg-apple-bg dark:bg-black/20 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{s.ServiceName}</p>
                    <p className="text-xs text-apple-gray">{s.category?.CategoryName}</p>
                  </div>
                  <p className="font-bold text-sm">{Number(s.Price).toLocaleString('ru-RU')} ₽</p>
                </div>
              ))}

              {modalType === 'bonuses' && modalData.map(t => (
                <div key={t.id} className="p-3 bg-apple-bg dark:bg-black/20 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{t.user_name}</p>
                    <p className="text-xs text-apple-gray">{t.desc}</p>
                  </div>
                  <span className={`font-bold text-sm ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {t.amount > 0 ? '+' : ''}{t.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};