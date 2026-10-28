import { useState } from 'react';
import { useAuthStore } from '../../store/authStore'; // <-- Добавили ../
import { useToast } from '../../components/ui/Toast'; // <-- Добавили ../
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient'; // <-- Добавили ../

export const Profile = () => {
  const { user, fetchMe } = useAuthStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    FirstName: user?.FirstName || '',
    LastName: user?.LastName || '',
    Phone: user?.Phone || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.put('/auth/me', formData);
      await fetchMe(); // Обновляем данные в глобальном стейте
      showToast('Профиль успешно обновлен', 'success');
    } catch (error) {
      showToast('Ошибка при сохранении', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-apple-gray hover:text-apple-text dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} /> Назад
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-apple-darkCard rounded-apple-lg border border-apple-border dark:border-apple-darkBorder overflow-hidden shadow-apple-light dark:shadow-apple-dark">
        
        {/* Шапка профиля */}
        <div className="p-8 bg-gradient-to-br from-postman to-[#ff8f66] text-white flex items-center gap-6 relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold border-2 border-white/30 shrink-0">
            {user?.FirstName?.[0]}{user?.LastName?.[0]}
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold">{user?.FirstName} {user?.LastName}</h1>
            <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
              <Shield size={14} /> Роль: {user?.roles?.[0]?.RoleName || 'Client'}
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Форма */}
        <div className="p-8">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-apple-gray">Имя</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray" size={18} />
                  <input type="text" required value={formData.FirstName} onChange={e => setFormData({...formData, FirstName: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-apple-bg dark:bg-black/20 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-apple-gray">Фамилия</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray" size={18} />
                  <input type="text" required value={formData.LastName} onChange={e => setFormData({...formData, LastName: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-apple-bg dark:bg-black/20 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-apple-gray">Email (нельзя изменить)</label>
              <div className="relative opacity-70">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray" size={18} />
                <input type="email" disabled value={user?.Email || ''} className="w-full pl-10 pr-4 py-3 bg-apple-bg dark:bg-black/20 border border-apple-border dark:border-apple-darkBorder rounded-xl text-sm cursor-not-allowed" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-apple-gray">Телефон</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray" size={18} />
                <input type="tel" value={formData.Phone} onChange={e => setFormData({...formData, Phone: e.target.value})} placeholder="+7 (999) 000-00-00" className="w-full pl-10 pr-4 py-3 bg-apple-bg dark:bg-black/20 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm" />
              </div>
            </div>

            <div className="pt-4 border-t border-apple-border dark:border-apple-darkBorder">
              <button type="submit" disabled={isSaving} className="px-8 py-3 bg-postman text-white font-medium rounded-xl shadow-postman-glow hover:bg-postman-hover transition-all flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Сохранить изменения</>}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};