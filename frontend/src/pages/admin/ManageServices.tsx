import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, Search, Edit2, Power, X, Check } from 'lucide-react';
import apiClient from '../../api/axiosClient';
import { useToast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';

interface Category { CategoryID: number; CategoryName: string; }
interface Service { 
  ServiceID: number; 
  ServiceName: string; 
  Description: string; 
  Price: number; 
  CategoryID: number; 
  IsActive: boolean;
  category: Category; 
}

export const ManageServices = () => {
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Состояния для модалки
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Форма
  const [formData, setFormData] = useState({
    ServiceName: '',
    Description: '',
    Price: '',
    CategoryID: '',
    IsActive: true
  });

  const fetchData = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        // Передаем параметр через объект params — это самый надежный способ в Axios
        apiClient.get('/services/', { params: { only_active: false } }), 
        apiClient.get('/services/categories')
      ]);
      
      console.log("ВСЕ УСЛУГИ С БЭКЕНДА:", sRes.data); // <--- Смотрим в консоль браузера (F12)
      
      setServices(sRes.data);
      setCategories(cRes.data);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      showToast('Ошибка загрузки данных', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({ ServiceName: '', Description: '', Price: '', CategoryID: categories[0]?.CategoryID.toString() || '', IsActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      ServiceName: service.ServiceName,
      Description: service.Description,
      Price: service.Price.toString(),
      CategoryID: service.CategoryID.toString(),
      IsActive: service.IsActive
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      ...formData,
      Price: parseFloat(formData.Price),
      CategoryID: parseInt(formData.CategoryID)
    };

    try {
      if (editingService) {
        await apiClient.put(`/services/${editingService.ServiceID}`, payload);
        showToast('Услуга обновлена', 'success');
      } else {
        await apiClient.post('/services/', payload);
        showToast('Услуга создана', 'success');
      }
      setIsModalOpen(false);
      fetchData(); // Обновляем список
    } catch (error) {
      showToast('Ошибка при сохранении', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (service: Service) => {
    try {
      // У нас на бэкенде DELETE делает Soft Delete (IsActive = false)
      // А для включения обратно мы используем PUT
      if (service.IsActive) {
        await apiClient.delete(`/services/${service.ServiceID}`);
        showToast('Услуга скрыта из каталога', 'info');
      } else {
        await apiClient.put(`/services/${service.ServiceID}`, { IsActive: true });
        showToast('Услуга снова активна', 'success');
      }
      fetchData();
    } catch (error) {
      showToast('Ошибка изменения статуса', 'error');
    }
  };

  const filteredServices = services.filter(s => 
    s.ServiceName.toLowerCase().includes(search.toLowerCase()) ||
    s.category.CategoryName.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-postman" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Шапка */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управление услугами</h1>
          <p className="text-apple-gray text-sm">Добавляйте, редактируйте и скрывайте услуги из каталога</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="px-6 py-3 bg-postman text-white font-medium rounded-xl shadow-postman-glow hover:bg-postman-hover transition-all flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus size={20} /> Добавить услугу
        </button>
      </div>

      {/* Поиск */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray" size={18} />
        <input 
          type="text" 
          placeholder="Поиск по названию или категории..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-apple-darkCard border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm transition-all"
        />
      </div>

      {/* Список услуг (Адаптивный: на мобилке карточки, на ПК таблица) */}
      <div className="bg-white dark:bg-apple-darkCard rounded-apple-lg border border-apple-border dark:border-apple-darkBorder overflow-hidden">
        
        {/* Заголовок таблицы (только для ПК) */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-apple-border dark:border-apple-darkBorder bg-apple-bg dark:bg-black/20 text-xs font-bold text-apple-gray uppercase tracking-wider">
          <div className="col-span-5">Название</div>
          <div className="col-span-2">Категория</div>
          <div className="col-span-2">Цена</div>
          <div className="col-span-1 text-center">Статус</div>
          <div className="col-span-2 text-right">Действия</div>
        </div>

        <div className="divide-y divide-apple-border dark:divide-apple-darkBorder">
          {filteredServices.map(service => (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              key={service.ServiceID} 
              className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 items-center transition-colors hover:bg-apple-bg dark:hover:bg-black/10 ${!service.IsActive && 'opacity-60 grayscale'}`}
            >
              <div className="col-span-5">
                <h4 className="font-bold text-sm">{service.ServiceName}</h4>
                <p className="text-xs text-apple-gray line-clamp-1">{service.Description}</p>
              </div>
              <div className="col-span-2 text-sm text-apple-gray">
                <span className="md:hidden font-medium text-apple-text dark:text-white mr-2">Категория:</span>
                {service.category.CategoryName}
              </div>
              <div className="col-span-2 font-semibold text-sm">
                <span className="md:hidden font-medium text-apple-text dark:text-white mr-2">Цена:</span>
                {Number(service.Price).toLocaleString('ru-RU')} ₽
              </div>
              <div className="col-span-1 flex md:justify-center">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${service.IsActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {service.IsActive ? 'Активна' : 'Скрыта'}
                </span>
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-2 md:mt-0">
                <button 
                  onClick={() => openEditModal(service)}
                  className="p-2 text-blue-500 bg-blue-500/10 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                  title="Редактировать"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => toggleStatus(service)}
                  className={`p-2 rounded-lg transition-colors ${service.IsActive ? 'text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white' : 'text-green-500 bg-green-500/10 hover:bg-green-500 hover:text-white'}`}
                  title={service.IsActive ? "Скрыть" : "Активировать"}
                >
                  <Power size={16} />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredServices.length === 0 && (
            <div className="p-8 text-center text-apple-gray">Ничего не найдено</div>
          )}
        </div>
      </div>

      {/* МОДАЛКА СОЗДАНИЯ/РЕДАКТИРОВАНИЯ */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? "Редактировать услугу" : "Новая услуга"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название услуги</label>
            <input 
              type="text" required
              value={formData.ServiceName} 
              onChange={(e) => setFormData({...formData, ServiceName: e.target.value})}
              className="w-full p-3 bg-apple-bg dark:bg-black/20 border border-apple-border dark:border-apple-darkBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-postman/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea 
              required rows={3}
              value={formData.Description} 
              onChange={(e) => setFormData({...formData, Description: e.target.value})}
              className="w-full p-3 bg-apple-bg dark:bg-black/20 border border-apple-border dark:border-apple-darkBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-postman/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Цена (₽)</label>
              <input 
                type="number" required min="0" step="0.01"
                value={formData.Price} 
                onChange={(e) => setFormData({...formData, Price: e.target.value})}
                className="w-full p-3 bg-apple-bg dark:bg-black/20 border border-apple-border dark:border-apple-darkBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-postman/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Категория</label>
              <select 
                required
                value={formData.CategoryID} 
                onChange={(e) => setFormData({...formData, CategoryID: e.target.value})}
                className="w-full p-3 bg-apple-bg dark:bg-black/20 border border-apple-border dark:border-apple-darkBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-postman/50"
              >
                {categories.map(c => (
                  <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="isActive"
              checked={formData.IsActive}
              onChange={(e) => setFormData({...formData, IsActive: e.target.checked})}
              className="w-5 h-5 accent-postman"
            />
            <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
              Показывать в каталоге (Активна)
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full py-3.5 mt-4 bg-postman text-white font-medium rounded-xl hover:bg-postman-hover transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
            {editingService ? 'Сохранить изменения' : 'Создать услугу'}
          </button>
        </form>
      </Modal>

    </div>
  );
};