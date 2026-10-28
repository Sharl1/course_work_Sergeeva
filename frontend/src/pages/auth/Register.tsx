import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../../components/ui/Logo';
import { Mail, Lock, Loader2, ArrowRight, User, Phone } from 'lucide-react';
import apiClient from '../../api/axiosClient';
import { useToast } from '../../components/ui/Toast';

export const Register = () => {
  const [formData, setFormData] = useState({
    Email: '', Password: '', FirstName: '', LastName: '', Phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Отправляем данные на бэкенд
      await apiClient.post('/auth/register', formData);
      showToast('Аккаунт успешно создан! Теперь войдите.', 'success');
      navigate('/login');
    } catch (err: any) {
      console.error("ОШИБКА РЕГИСТРАЦИИ:", err.response?.data); // Смотрим в консоль
      
      // Если бэкенд вернул массив ошибок (валидация Pydantic)
      if (Array.isArray(err.response?.data?.detail)) {
        showToast(err.response.data.detail[0].msg, 'error');
      } else {
        showToast(err.response?.data?.detail || 'Ошибка при регистрации', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-apple-bg dark:bg-apple-darkBg">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-postman/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md p-8 glass rounded-apple-lg relative z-10 my-8"
      >
        <div className="flex flex-col items-center mb-6">
          <Logo className="w-16 h-16 mb-4 drop-shadow-md" />
          <h2 className="text-2xl font-bold tracking-tight">Создать аккаунт</h2>
          <p className="text-apple-gray text-sm mt-1">Присоединяйтесь к Digital Concierge</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-apple-gray group-focus-within:text-postman"><User size={18} /></div>
              <input type="text" placeholder="Имя" required value={formData.FirstName} onChange={e => setFormData({...formData, FirstName: e.target.value})} className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/50 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm" />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-apple-gray group-focus-within:text-postman"><User size={18} /></div>
              <input type="text" placeholder="Фамилия" required value={formData.LastName} onChange={e => setFormData({...formData, LastName: e.target.value})} className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/50 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm" />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-apple-gray group-focus-within:text-postman"><Mail size={18} /></div>
            <input type="email" placeholder="Email" required value={formData.Email} onChange={e => setFormData({...formData, Email: e.target.value})} className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/50 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm" />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-apple-gray group-focus-within:text-postman"><Phone size={18} /></div>
            <input type="tel" placeholder="Телефон (необязательно)" value={formData.Phone} onChange={e => setFormData({...formData, Phone: e.target.value})} className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/50 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm" />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-apple-gray group-focus-within:text-postman"><Lock size={18} /></div>
            <input type="password" placeholder="Пароль (мин. 6 символов)" required minLength={6} value={formData.Password} onChange={e => setFormData({...formData, Password: e.target.value})} className="w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-black/50 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm" />
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-2 bg-postman hover:bg-postman-hover text-white font-medium rounded-xl shadow-postman-glow transition-all flex items-center justify-center gap-2 disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Зарегистрироваться <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-apple-gray">
          Уже есть аккаунт? <Link to="/login" className="text-postman hover:underline">Войти</Link>
        </div>
      </motion.div>
    </div>
  );
};