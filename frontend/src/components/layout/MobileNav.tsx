import { useAuthStore } from '../../store/authStore';
import { Home, Grid, Calendar, MessageSquare, User, Utensils, Award } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const MobileNav = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const role = user?.roles[0]?.RoleName || 'Client';

  // Упрощенное меню для мобилок
  const items = role === 'Admin' 
    ? [{ icon: Home, path: '/admin' }, { icon: Grid, path: '/admin/services' }, { icon: User, path: '/admin/users' }]
    : role === 'Staff'
    ? [{ icon: Home, path: '/staff' }, { icon: MessageSquare, path: '/staff/chats' }]
    : [
        { icon: Home, path: '/' }, 
        { icon: Utensils, path: '/food' },
        { icon: Grid, path: '/catalog' }, 
        { icon: Calendar, path: '/bookings' },
        { icon: Award, path: '/loyalty' }, 
        { icon: MessageSquare, path: '/chat' }
      ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full glass border-t border-apple-border dark:border-apple-darkBorder pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                isActive ? 'text-postman' : 'text-apple-gray'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </div>
    </nav>
  );
};