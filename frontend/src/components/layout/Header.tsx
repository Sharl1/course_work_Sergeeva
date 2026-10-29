import { useAuthStore } from '../../store/authStore';
import { Moon, Sun, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Logo } from '../ui/Logo';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient';

interface Notification { NotificationID: number; Title: string; Message: string; IsRead: boolean; CreatedAt: string; }

export const Header = () => {
  const { user, logout } = useAuthStore();
  const [isDark, setIsDark] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await apiClient.get('/notifications/');
        setNotifications(res.data);
      } catch (e) { console.error(e); }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.IsRead).length;

  const handleOpenNotifs = async () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen && unreadCount > 0) {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, IsRead: true })));
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-apple-border dark:border-apple-darkBorder bg-white/50 dark:bg-apple-darkBg/50 backdrop-blur-md sticky top-0 z-40">
      <div className="flex md:hidden items-center gap-2">
        <Logo className="w-8 h-8" />
        <span className="font-semibold">Concierge</span>
      </div>
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold tracking-tight">Добро пожаловать, {user?.FirstName || 'Гость'}</h1>
        <p className="text-xs text-apple-gray">Хорошего дня! Чем можем помочь?</p>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        {user && (
          <div className="relative" ref={notifRef}>
            <button onClick={handleOpenNotifs} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-apple-gray transition-colors relative">
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-apple-darkBg"></span>}
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-apple-darkCard rounded-xl shadow-apple-light dark:shadow-apple-dark border border-apple-border dark:border-apple-darkBorder overflow-hidden z-50">
                <div className="p-3 border-b border-apple-border dark:border-apple-darkBorder bg-apple-bg dark:bg-black/20">
                  <h3 className="font-bold text-sm">Уведомления</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? <p className="text-center text-xs text-apple-gray py-6">Нет уведомлений</p> : notifications.map(n => (
                    <div key={n.NotificationID} className="p-3 border-b border-apple-border dark:border-apple-darkBorder last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <p className="font-semibold text-xs mb-1">{n.Title}</p>
                      <p className="text-xs text-apple-gray leading-snug">{n.Message}</p>
                      <p className="text-[10px] text-apple-gray/60 mt-1">{new Date(n.CreatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-apple-gray transition-colors">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {user && (
          <div className="relative md:hidden" ref={dropdownRef}>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-8 h-8 ml-1 rounded-full bg-postman text-white flex items-center justify-center font-bold text-xs">
              {user?.FirstName?.[0]}{user?.LastName?.[0]}
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-apple-darkCard rounded-xl shadow-apple-light dark:shadow-apple-dark border border-apple-border dark:border-apple-darkBorder py-1 z-50">
                <button onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2">
                  <UserIcon size={16} /> Профиль
                </button>
                <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2">
                  <LogOut size={16} /> Выйти
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};