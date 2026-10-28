import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Utensils, Check } from 'lucide-react';
import apiClient from '../../api/axiosClient';
import { useCartStore } from '../../store/cartStore';
import { CartDrawer } from '../../components/features/CartDrawer';
import { Modal } from '../../components/ui/Modal';

interface Service { ServiceID: number; ServiceName: string; Description: string; Price: number; }

// Рабочие прямые ссылки на Unsplash
const FOOD_IMAGES: Record<string, string> = {
  'Стейк Рибай': 'https://elements-resized.envatousercontent.com/envato-dam-assets-production/EVA/TRX/cc/02/c3/23/b0/v1_E10/E10HH83C.jpg?w=1600&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto&s=dbf6b440562993615c4c02b978127449a7c6561e1a65b53001d0424ab276b825',
  'Паста Карбонара': 'https://elements-resized.envatousercontent.com/envato-dam-assets-production/EVA/TRX/cd/a2/35/12/28/v1_E10/E10208P5.jpg?w=1600&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto&s=f9787eff9ea0ee0c7596144e5edf7b7e9fb0e72e5d439351337b7151a5373587',
  'Салат Цезарь с курицей': 'https://elements-resized.envatousercontent.com/envato-dam-assets-production/EVA/TRX/ab/71/fd/05/92/v1_E10/E105LTNR.jpg?w=1600&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto&s=75297213e939d37a03a712f5288cfc55935ab1b9703baaa7aa3dd80e570ac6f9',
  'Томатный суп с базиликом': 'https://elements-resized.envatousercontent.com/envato-dam-assets-production/EVA/TRX/4f/86/69/77/61/v1_E11/E115O49M.jpg?w=1600&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto&s=9899e8beed2dc87a7f8b8b7216efdce3579329a3422a5ff4d40cb1d5d03aef87',
  'Чизкейк Нью-Йорк': 'https://elements-resized.envatousercontent.com/envato-dam-assets-production/EVA/TRX/01/76/0b/76/71/v1_E10/E109NCBS.jpg?w=1600&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto&s=7910353e7a765c098783a1a7d1a3dc23fb7fa628b8be2fd60e136a3959560dc5',
  'Завтрак континентальный': 'https://elements-resized.envatousercontent.com/envato-dam-assets-production/portfolio-manager/9ad27fa9-cb0d-4153-8fc2-6162d4321c24/2a067162-50cb-46a1-98d4-9cb571111102/000003077162.jpg?w=1600&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto&s=c6bf56132add8c602bc6cf15adfd70ef46c9ec9a7d30c62c97a0c009296bf6be',
  'Ужин при свечах (Комбо)': 'https://elements-resized.envatousercontent.com/envato-dam-assets-production/portfolio-manager/9ad27fa9-cb0d-4153-8fc2-6162d4321c24/d447a276-8843-45a4-bd50-3e3c2fef79bb/000002876929.jpg?w=1600&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto&s=0a85566ea8fb3901236a049551d530ab2aadd207b14158291a39725ea53a962b',
  'default': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800&auto=format&fit=crop'
};

// Настройки опций для разных блюд
const FOOD_OPTIONS: Record<string, { id: string, name: string, price: number, type: 'single' | 'multiple' }[]> = {
  'Стейк Рибай': [
    { id: 'medium', name: 'Прожарка Medium', price: 0, type: 'single' },
    { id: 'well', name: 'Прожарка Well Done', price: 0, type: 'single' },
    { id: 'pepper', name: 'Соус перечный', price: 100, type: 'multiple' },
    { id: 'cheese', name: 'Соус сырный', price: 100, type: 'multiple' },
  ],
  'Завтрак континентальный': [
    { id: 'coffee', name: 'Кофе Американо', price: 0, type: 'single' },
    { id: 'tea', name: 'Чай зеленый', price: 0, type: 'single' },
    { id: 'croissant', name: 'Доп. круассан', price: 150, type: 'multiple' },
  ],
  'Ужин при свечах (Комбо)': [
    { id: 'wine_red', name: 'Вино красное', price: 0, type: 'single' },
    { id: 'wine_white', name: 'Вино белое', price: 0, type: 'single' },
    { id: 'dessert', name: 'Доп. десерт', price: 400, type: 'multiple' },
  ]
};

export const FoodMenu = () => {
  const [foodItems, setFoodItems] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Состояние модалки
  const [selectedItem, setSelectedItem] = useState<Service | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  const { addItem, getTotalItems, getTotalPrice } = useCartStore();
  const cartCount = getTotalItems();
  const cartTotal = getTotalPrice();

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const catRes = await apiClient.get('/services/categories');
        const roomServiceCat = catRes.data.find((c: any) => c.CategoryName === 'Room Service');
        
        if (roomServiceCat) {
          const servicesRes = await apiClient.get(`/services/?category_id=${roomServiceCat.CategoryID}`);
          setFoodItems(servicesRes.data);
        }
      } catch (error) {
        console.error("Ошибка загрузки меню", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFood();
  }, []);

  // Подсчет цены с опциями
  const calculateTotal = () => {
    if (!selectedItem) return 0;
    let total = Number(selectedItem.Price); // <-- Оборачиваем в Number
    const opts = FOOD_OPTIONS[selectedItem.ServiceName] || [];
    selectedOptions.forEach(id => {
      const opt = opts.find(o => o.id === id);
      if (opt) total += Number(opt.price); // <-- И здесь тоже
    });
    return total;
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    
    // Формируем название с учетом опций
    const opts = FOOD_OPTIONS[selectedItem.ServiceName] || [];
    const selectedNames = selectedOptions.map(id => opts.find(o => o.id === id)?.name).filter(Boolean);
    const finalName = selectedNames.length > 0 
      ? `${selectedItem.ServiceName} (${selectedNames.join(', ')})` 
      : selectedItem.ServiceName;

    addItem({ 
      ServiceID: selectedItem.ServiceID, 
      ServiceName: finalName, 
      Price: calculateTotal() 
    });

    setSelectedItem(null);
    setSelectedOptions([]);
  };

  const toggleOption = (optId: string, type: 'single' | 'multiple') => {
    const opts = FOOD_OPTIONS[selectedItem?.ServiceName || ''] || [];
    const sameTypeOpts = opts.filter(o => o.type === type).map(o => o.id);

    setSelectedOptions(prev => {
      if (type === 'single') {
        // Для радиокнопок: убираем другие из этой же группы и добавляем новый
        const withoutGroup = prev.filter(id => !sameTypeOpts.includes(id));
        return prev.includes(optId) ? withoutGroup : [...withoutGroup, optId];
      } else {
        // Для чекбоксов: просто переключаем
        return prev.includes(optId) ? prev.filter(id => id !== optId) : [...prev, optId];
      }
    });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-postman" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Utensils className="text-postman" size={32} /> Room Service
        </h1>
        <p className="text-apple-gray text-sm">Изысканные блюда и комбо-наборы с доставкой в номер</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodItems.map(item => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            key={item.ServiceID} 
            className="bg-white dark:bg-apple-darkCard rounded-apple-lg overflow-hidden border border-apple-border dark:border-apple-darkBorder group cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            <div className="h-48 overflow-hidden relative">
                <img 
                src={FOOD_IMAGES[item.ServiceName] || FOOD_IMAGES['default']} 
                alt={item.ServiceName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Если картинка не загрузилась, ставим заглушку
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800&auto=format&fit=crop';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-3 left-4 text-white font-bold text-lg">{item.Price.toLocaleString('ru-RU')} ₽</span>
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-lg mb-1">{item.ServiceName}</h3>
              <p className="text-apple-gray text-xs line-clamp-2 mb-4 h-8">{item.Description}</p>
              
              <button className="w-full py-2.5 bg-apple-bg dark:bg-black/30 rounded-xl text-sm font-medium group-hover:bg-postman group-hover:text-white transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> Выбрать
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {cartCount > 0 && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40">
          <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-4 bg-postman text-white px-6 py-4 rounded-full shadow-2xl shadow-postman/50 hover:bg-postman-hover transition-transform hover:scale-105">
            <div className="flex items-center gap-2 font-bold">
              <span className="bg-white/20 px-2.5 py-1 rounded-full text-xs">{cartCount}</span>
              <span>Корзина</span>
            </div>
            <div className="w-px h-5 bg-white/30" />
            <span className="font-bold">{cartTotal.toLocaleString('ru-RU')} ₽</span>
          </button>
        </motion.div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* МОДАЛКА ВЫБОРА ОПЦИЙ */}
      <Modal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        title="Настройте ваш заказ"
      >
        {selectedItem && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
            <div className="flex gap-4">
              <img 
                src={FOOD_IMAGES[selectedItem.ServiceName] || FOOD_IMAGES['default']} 
                className="w-24 h-24 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-bold text-lg">{selectedItem.ServiceName}</h3>
                <p className="text-apple-gray text-xs mt-1 line-clamp-2">{selectedItem.Description}</p>
              </div>
            </div>

            {FOOD_OPTIONS[selectedItem.ServiceName] && (
              <div className="space-y-4">
                {['single', 'multiple'].map((type) => {
                  const opts = FOOD_OPTIONS[selectedItem.ServiceName].filter(o => o.type === type);
                  if (opts.length === 0) return null;
                  return (
                    <div key={type} className="bg-apple-bg dark:bg-black/20 p-4 rounded-xl">
                      <h4 className="font-semibold text-sm mb-3">
                        {type === 'single' ? 'Обязательный выбор' : 'Добавить по желанию'}
                      </h4>
                      <div className="space-y-2">
                        {opts.map(opt => (
                          <label key={opt.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 flex items-center justify-center transition-colors ${type === 'single' ? 'rounded-full' : 'rounded-md'} border ${selectedOptions.includes(opt.id) ? 'bg-postman border-postman' : 'border-apple-gray/50'}`}>
                                {selectedOptions.includes(opt.id) && <Check size={14} className="text-white" />}
                              </div>
                              <span className="text-sm">{opt.name}</span>
                            </div>
                            <span className="text-sm font-medium">{opt.price > 0 ? `+${opt.price} ₽` : ''}</span>
                            <input 
                              type={type === 'single' ? 'radio' : 'checkbox'} 
                              name={type === 'single' ? 'single_group' : undefined}
                              className="hidden" 
                              checked={selectedOptions.includes(opt.id)} 
                              onChange={() => toggleOption(opt.id, opt.type)} 
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button 
              onClick={handleAddToCart}
              className="w-full py-3.5 bg-postman text-white font-medium rounded-xl hover:bg-postman-hover transition-all flex justify-center items-center gap-2 shadow-postman-glow"
            >
              Добавить в корзину • {calculateTotal().toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};