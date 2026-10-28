import { useAuthStore } from '../../store/authStore';
import { Logo } from '../ui/Logo';
import { 
  Home, Grid, Calendar, MessageSquare, Award, 
  LogOut, Users, ClipboardList, Utensils, LogIn
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.roles?.[0]?.RoleName || 'Client';

  const getMenuItems = () => {
    // ГОСТЕВОЙ РЕЖИМ
    if (!user) {
      return [
        { name: 'Каталог услуг', icon: Grid, path: '/catalog' },
        { name: 'Room Service', icon: Utensils, path: '/food' },
      ];
    }

    // АВТОРИЗОВАННЫЕ ПОЛЬЗОВАТЕЛИ
    switch (role) {
      case 'Admin':
        return [
          { name: 'Дашборд', icon: Home, path: '/admin' },
          { name: 'Услуги', icon: Grid, path: '/admin/services' },
          { name: 'Пользователи', icon: Users, path: '/admin/users' },
        ];
      case 'Staff':
        return [
          { name: 'Заявки', icon: ClipboardList, path: '/staff' },
          { name: 'Чаты', icon: MessageSquare, path: '/staff/chats' },
        ];
      case 'Client':
      default:
        return [
          { name: 'Дашборд', icon: Home, path: '/' },
          { name: 'Room Service', icon: Utensils, path: '/food' },
          { name: 'Каталог', icon: Grid, path: '/catalog' },
          { name: 'Мои брони', icon: Calendar, path: '/bookings' },
          { name: 'Лояльность', icon: Award, path: '/loyalty' },
          { name: 'Чат', icon: MessageSquare, path: '/chat' },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen glass border-r border-apple-border dark:border-apple-darkBorder p-4 z-50">
      <div className="flex items-center gap-3 px-2 mb-8 cursor-pointer" onClick={() => navigate('/')}>
        <Logo className="w-8 h-8" />
        <span className="font-semibold text-lg tracking-tight">Concierge</span>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                isActive 
                  ? 'text-postman font-medium' 
                  : 'text-apple-gray hover:bg-black/5 dark:hover:bg-white/5 hover:text-apple-text dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute inset-0 bg-postman/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={20} className="relative z-10" />
              <span className="relative z-10 text-sm">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-apple-border dark:border-apple-darkBorder">
        {/* Если это ГОСТЬ */}
        {!user ? (
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-postman text-white hover:bg-postman-hover transition-colors text-sm font-medium shadow-postman-glow"
          >
            <LogIn size={18} /> Войти в систему
          </button>
        ) : (
          /* Если АВТОРИЗОВАН */
          <>
            <div 
              className="flex items-center gap-3 px-3 py-2 mb-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
              onClick={() => navigate('/profile')}
            >
              <div className="w-8 h-8 rounded-full bg-postman text-white flex items-center justify-center font-bold text-sm">
                {user?.FirstName?.[0]}{user?.LastName?.[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.FirstName} {user?.LastName}</p>
                <p className="text-xs text-apple-gray truncate">{role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium"
            >
              <LogOut size={20} />
              Выйти
            </button>
          </>
        )}
      </div>
    </aside>
  );
};