import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useState } from 'react';
import apiClient from '../../api/axiosClient';
import { useToast } from '../ui/Toast';

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { showToast } = useToast();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    
    try {
      const bookingTime = new Date(Date.now() + 30 * 60000).toISOString();
      
      const promises = items.map(item => 
        apiClient.post('/bookings/', {
          ServiceID: item.ServiceID,
          BookingDate: bookingTime,
          TotalPrice: item.Price,
          Options: "Дополнительные опции включены в стоимость" // Или можно распарсить из названия
        })
      );

      await Promise.all(promises);
      clearCart();
      onClose();
      showToast('Заказ успешно оформлен! Ожидайте доставку.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Ошибка при оформлении заказа.', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Фон */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          {/* Панель */}
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-apple-darkCard shadow-2xl z-[70] flex flex-col border-l border-apple-border dark:border-apple-darkBorder"
          >
            <div className="flex items-center justify-between p-5 border-b border-apple-border dark:border-apple-darkBorder">
              <h2 className="text-xl font-bold">Ваш заказ</h2>
              <button onClick={onClose} className="p-2 bg-apple-bg dark:bg-black/30 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="text-center text-apple-gray py-10">Корзина пуста</div>
              ) : (
                items.map(item => (
                  <div key={item.ServiceID} className="flex items-center gap-4 bg-apple-bg dark:bg-black/20 p-3 rounded-xl border border-transparent dark:border-apple-darkBorder">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.ServiceName}</h4>
                      <p className="text-postman font-bold text-sm mt-1">{Number(item.Price).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white dark:bg-black/40 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.ServiceID, -1)} className="p-1 hover:text-postman"><Minus size={16}/></button>
                      <span className="text-sm font-medium w-4 text-center">{item.Quantity}</span>
                      <button onClick={() => updateQuantity(item.ServiceID, 1)} className="p-1 hover:text-postman"><Plus size={16}/></button>
                    </div>
                    
                    <button onClick={() => removeItem(item.ServiceID)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 border-t border-apple-border dark:border-apple-darkBorder bg-white dark:bg-apple-darkCard">
              <div className="flex justify-between items-center mb-4">
                <span className="text-apple-gray">Итого:</span>
                <span className="text-2xl font-bold">{getTotalPrice().toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={items.length === 0 || isCheckingOut}
                className="w-full py-4 bg-postman text-white font-bold rounded-xl hover:bg-postman-hover transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-postman-glow"
              >
                {isCheckingOut ? <Loader2 className="animate-spin" size={20} /> : 'Оформить заказ'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};