import { useAuthStore } from '../../store/authStore';
import { Moon, Sun, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Logo } from '../ui/Logo';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const [isDark, setIsDark] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // Закрытие меню профиля при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-apple-border dark:border-apple-darkBorder bg-white/50 dark:bg-apple-darkBg/50 backdrop-blur-md sticky top-0 z-40">
      {/* Мобильный логотип */}
      <div className="flex md:hidden items-center gap-2">
        <Logo className="w-8 h-8" />
        <span className="font-semibold">Concierge</span>
      </div>

      {/* Приветствие (Десктоп) */}
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold tracking-tight">Добро пожаловать, {user?.FirstName}</h1>
        <p className="text-xs text-apple-gray">Хорошего дня! Чем можем помочь?</p>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-apple-gray transition-colors">
          <Bell size={20} />
        </button>
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-apple-gray transition-colors"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Меню профиля (Мобилка) */}
        <div className="relative md:hidden" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 ml-1 rounded-full bg-postman text-white flex items-center justify-center font-bold text-xs"
          >
            {user?.FirstName?.[0]}{user?.LastName?.[0]}
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-apple-darkCard rounded-xl shadow-apple-light dark:shadow-apple-dark border border-apple-border dark:border-apple-darkBorder py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-apple-border dark:border-apple-darkBorder mb-1">
                <p className="text-sm font-semibold truncate">{user?.FirstName} {user?.LastName}</p>
                <p className="text-xs text-apple-gray truncate">{user?.roles?.[0]?.RoleName}</p>
              </div>
              <button 
                onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} 
                className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <UserIcon size={16} /> Профиль
              </button>
              <button 
                onClick={logout} 
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} /> Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};