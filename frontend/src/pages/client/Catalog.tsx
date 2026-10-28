import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Star, Check, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore'; // <-- ДОБАВИЛИ

interface Category { CategoryID: number; CategoryName: string; }
interface Service { ServiceID: number; ServiceName: string; Description: string; Price: number; CategoryID: number; category: Category; }

const SERVICE_OPTIONS: Record<string, { id: string, name: string, price: number }[]> = {
  'СПА': [
    { id: 'oil', name: 'Ароматерапия (премиум масла)', price: 500 },
    { id: 'tea', name: 'Травяной чай в зоне релакса', price: 0 },
  ],
  'Ресторан': [
    { id: 'wine', name: 'Бокал вина (красное/белое)', price: 800 },
    { id: 'dessert', name: 'Фирменный десерт от шефа', price: 450 },
  ],
  'Такси': [
    { id: 'child_seat', name: 'Детское кресло', price: 0 },
    { id: 'water', name: 'Бутылка воды в салон', price: 0 },
  ]
};

export const Catalog = () => {
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuthStore(); // <-- ДОБАВИЛИ
  const navigate = useNavigate(); // <-- ДОБАВИЛИ
  
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  const [userBalance, setUserBalance] = useState(0);
  const [usePoints, setUsePoints] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sRes = await apiClient.get('/services/');
        setServices(sRes.data);
      } catch (error) {
        console.error("Ошибка загрузки услуг:", error);
      }

      try {
        const cRes = await apiClient.get('/services/categories');
        const filteredCats = cRes.data.filter((c: Category) => c.CategoryName !== 'Room Service');
        setCategories(filteredCats);
      } catch (error) {
        console.error("Ошибка загрузки категорий:", error);
      }

      // Баллы грузим только если авторизован
      if (isAuthenticated) {
        try {
          const loyRes = await apiClient.get('/loyalty/my');
          setUserBalance(loyRes.data.Balance || 0);
        } catch (e) {
          console.log("Не удалось загрузить баланс баллов");
        }
      }

      setIsLoading(false);
    };
    fetchData();
  }, [isAuthenticated]);

  const filteredServices = services.filter(s => {
    if (s.category?.CategoryName === 'Room Service') return false;
    const matchCat = activeCategory ? s.CategoryID === activeCategory : true;
    const matchSearch = s.ServiceName.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPrice = useMemo(() => {
    if (!selectedService) return 0;
    let price = Number(selectedService.Price);
    const availableOptions = SERVICE_OPTIONS[selectedService.category?.CategoryName] || [];
    selectedOptions.forEach(optId => {
      const opt = availableOptions.find(o => o.id === optId);
      if (opt) price += Number(opt.price);
    });
    return price;
  }, [selectedService, selectedOptions]);

  const finalPrice = useMemo(() => {
    if (!usePoints || userBalance === 0) return totalPrice;
    const maxDiscount = totalPrice * 0.5;
    const actualDiscount = Math.min(userBalance, maxDiscount);
    return totalPrice - actualDiscount;
  }, [totalPrice, usePoints, userBalance]);

  const toggleOption = (optId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optId) ? prev.filter(id => id !== optId) : [...prev, optId]
    );
  };

  const handleOpenModal = (service: Service) => {
    setSelectedService(service);
    setSelectedOptions([]);
    setBookingDate('');
    setUsePoints(false);
  };

  const handleBook = async () => {
    // ПРОВЕРКА АВТОРИЗАЦИИ
    if (!isAuthenticated) {
      showToast('Войдите в аккаунт, чтобы забронировать услугу', 'info');
      navigate('/login');
      return;
    }

    if (!selectedService || !bookingDate) return;
    setIsBooking(true);
    try {
      const availableOpts = SERVICE_OPTIONS[selectedService.category?.CategoryName] || [];
      const optNames = selectedOptions
        .map(id => availableOpts.find(o => o.id === id)?.name)
        .filter(Boolean)
        .join(', ');

      await apiClient.post('/bookings/', {
        ServiceID: selectedService.ServiceID,
        BookingDate: new Date(bookingDate).toISOString(),
        UsePoints: usePoints,
        TotalPrice: finalPrice,
        Options: optNames || null
      });
      
      if (usePoints) {
        const maxDiscount = totalPrice * 0.5;
        const actualDiscount = Math.min(userBalance, maxDiscount);
        setUserBalance(prev => Math.max(0, prev - actualDiscount));
      }
      
      showToast('Услуга успешно забронирована!', 'success');
      setSelectedService(null);
    } catch (error) {
      console.error(error);
      showToast('Ошибка при бронировании', 'error');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-postman" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Каталог услуг</h1>
          <p className="text-apple-gray text-sm">Выберите то, что сделает ваш отдых незабываемым</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray" size={18} />
          <input 
            type="text" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-apple-darkCard border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button 
          onClick={() => setActiveCategory(null)}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === null ? 'bg-postman text-white shadow-postman-glow' : 'bg-white dark:bg-apple-darkCard border border-apple-border dark:border-apple-darkBorder text-apple-gray hover:border-postman'}`}
        >
          Все услуги
        </button>
        {categories.map(cat => (
          <button 
            key={cat.CategoryID} onClick={() => setActiveCategory(cat.CategoryID)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.CategoryID ? 'bg-postman text-white shadow-postman-glow' : 'bg-white dark:bg-apple-darkCard border border-apple-border dark:border-apple-darkBorder text-apple-gray hover:border-postman'}`}
          >
            {cat.CategoryName}
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredServices.map(service => (
            <motion.div 
              layout key={service.ServiceID}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-white dark:bg-apple-darkCard rounded-apple-lg p-6 border border-apple-border dark:border-apple-darkBorder hover:shadow-apple-light dark:hover:shadow-apple-dark transition-all flex flex-col cursor-pointer"
              onClick={() => handleOpenModal(service)}
            >
              <div className="flex-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-postman mb-3 block">{service.category?.CategoryName}</span>
                <h3 className="text-xl font-bold mb-2 group-hover:text-postman transition-colors">{service.ServiceName}</h3>
                <p className="text-apple-gray text-sm line-clamp-2 mb-4 leading-relaxed">{service.Description}</p>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-apple-border dark:border-apple-darkBorder">
                <span className="text-lg font-bold">{Number(service.Price).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</span>
                <button className="px-4 py-2 bg-apple-bg dark:bg-black/30 text-apple-text dark:text-white text-sm font-medium rounded-xl group-hover:bg-postman group-hover:text-white transition-all">
                  Подробнее
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredServices.length === 0 && (
        <div className="text-center py-20 text-apple-gray">
          Ничего не найдено. Попробуйте изменить запрос.
        </div>
      )}

      <Modal isOpen={!!selectedService} onClose={() => setSelectedService(null)} title="Детали услуги">
        {selectedService && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <span className="text-xs font-bold text-postman uppercase mb-1 block">{selectedService.category?.CategoryName}</span>
              <h2 className="text-2xl font-bold mb-3">{selectedService.ServiceName}</h2>
              <p className="text-apple-gray text-sm leading-relaxed">{selectedService.Description}</p>
            </div>

            {SERVICE_OPTIONS[selectedService.category?.CategoryName] && (
              <div className="bg-apple-bg dark:bg-black/20 p-4 rounded-xl border border-apple-border dark:border-apple-darkBorder">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Star size={16} className="text-postman" /> Дополнительные опции
                </h4>
                <div className="space-y-2">
                  {SERVICE_OPTIONS[selectedService.category.CategoryName].map(opt => (
                    <label key={opt.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedOptions.includes(opt.id) ? 'bg-postman border-postman' : 'border-apple-gray/50'}`}>
                          {selectedOptions.includes(opt.id) && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm">{opt.name}</span>
                      </div>
                      <span className="text-sm font-medium">{opt.price > 0 ? `+${opt.price} ₽` : 'Бесплатно'}</span>
                      <input type="checkbox" className="hidden" onChange={() => toggleOption(opt.id)} checked={selectedOptions.includes(opt.id)} />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Когда вам удобно?</label>
              <input 
                type="datetime-local" 
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full p-3 bg-white dark:bg-black/30 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm"
              />
            </div>

            {isAuthenticated && userBalance > 0 && (
              <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${userBalance > 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-gray-500/10 border-gray-500/20'}`}>
                <div>
                  <p className={`font-semibold text-sm flex items-center gap-2 ${userBalance > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <Wallet size={16} /> Оплатить баллами
                  </p>
                  <p className={`text-xs mt-1 ${userBalance > 0 ? 'text-green-600/70 dark:text-green-400/70' : 'text-gray-500/70'}`}>
                    Доступно: {userBalance} б. (макс. 50% от суммы)
                  </p>
                </div>
                <label className={`relative inline-flex items-center ${userBalance > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                  <input 
                    type="checkbox" className="sr-only peer" checked={usePoints} 
                    onChange={(e) => setUsePoints(e.target.checked)} disabled={userBalance === 0}
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                </label>
              </div>
            )}

            <div className="pt-4 border-t border-apple-border dark:border-apple-darkBorder flex items-center justify-between">
              <div>
                <p className="text-xs text-apple-gray mb-1">Итого к оплате:</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{finalPrice.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</p>
                  {usePoints && <p className="text-sm text-apple-gray line-through">{totalPrice.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</p>}
                </div>
              </div>
              <button 
                onClick={handleBook}
                disabled={!bookingDate || isBooking}
                className="px-8 py-3.5 bg-postman hover:bg-postman-hover text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-postman-glow"
              >
                {isBooking ? <Loader2 className="animate-spin" size={20} /> : 'Забронировать'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};