import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, Shield, ShieldAlert, User as UserIcon, Power, Edit2, Check } from 'lucide-react';
import apiClient from '../../api/axiosClient';
import { useToast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';

interface UserData {
  UserID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  IsActive: boolean;
  roles: { RoleName: string }[];
}

export const ManageUsers = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Модалка смены роли
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users/');
      setUsers(res.data);
    } catch (error) {
      showToast('Ошибка загрузки пользователей', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (user: UserData) => {
    try {
      await apiClient.patch(`/users/${user.UserID}/status`);
      showToast(user.IsActive ? 'Пользователь заблокирован' : 'Пользователь разблокирован', 'info');
      fetchUsers();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Ошибка', 'error');
    }
  };

  const openRoleModal = (user: UserData) => {
    setEditingUser(user);
    setSelectedRole(user.roles[0]?.RoleName || 'Client');
  };

  const handleRoleSave = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await apiClient.patch(`/users/${editingUser.UserID}/role`, { RoleName: selectedRole });
      showToast('Роль успешно изменена', 'success');
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Ошибка', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.FirstName} ${u.LastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.Email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case 'Admin': return <span className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-max"><ShieldAlert size={12}/> Админ</span>;
      case 'Staff': return <span className="bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-max"><Shield size={12}/> Сотрудник</span>;
      default: return <span className="bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-max"><UserIcon size={12}/> Клиент</span>;
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-postman" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Шапка */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
          <p className="text-apple-gray text-sm">Управление доступом и ролями</p>
        </div>
      </div>

      {/* Поиск */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray" size={18} />
        <input 
          type="text" 
          placeholder="Поиск по имени или email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-apple-darkCard border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 text-sm transition-all"
        />
      </div>

      {/* Список */}
      <div className="bg-white dark:bg-apple-darkCard rounded-apple-lg border border-apple-border dark:border-apple-darkBorder overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-apple-border dark:border-apple-darkBorder bg-apple-bg dark:bg-black/20 text-xs font-bold text-apple-gray uppercase tracking-wider">
          <div className="col-span-4">Пользователь</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Роль</div>
          <div className="col-span-2 text-right">Действия</div>
        </div>

        <div className="divide-y divide-apple-border dark:divide-apple-darkBorder">
          {filteredUsers.map(user => (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              key={user.UserID} 
              className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-apple-bg dark:hover:bg-black/10 ${!user.IsActive && 'opacity-50 grayscale'}`}
            >
              {/* Имя и аватарка */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-postman text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {user.FirstName?.[0]}{user.LastName?.[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{user.FirstName} {user.LastName}</h4>
                  <p className="text-xs text-apple-gray md:hidden">{user.Email}</p>
                </div>
              </div>
              
              {/* Email (скрыт на мобилке, так как дублируется выше) */}
              <div className="col-span-4 text-sm text-apple-gray hidden md:block truncate">
                {user.Email}
              </div>

              {/* Роль */}
              <div className="col-span-2">
                {getRoleBadge(user.roles[0]?.RoleName || 'Client')}
              </div>

              {/* Кнопки */}
              <div className="col-span-2 flex justify-end gap-2">
                <button 
                  onClick={() => openRoleModal(user)}
                  className="p-2 text-blue-500 bg-blue-500/10 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                  title="Изменить роль"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => toggleStatus(user)}
                  className={`p-2 rounded-lg transition-colors ${user.IsActive ? 'text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white' : 'text-green-500 bg-green-500/10 hover:bg-green-500 hover:text-white'}`}
                  title={user.IsActive ? "Заблокировать" : "Разблокировать"}
                >
                  <Power size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* МОДАЛКА СМЕНЫ РОЛИ */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Изменение роли">
        {editingUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-apple-bg dark:bg-black/20 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-postman text-white flex items-center justify-center font-bold text-lg">
                {editingUser.FirstName?.[0]}{editingUser.LastName?.[0]}
              </div>
              <div>
                <h3 className="font-bold text-lg">{editingUser.FirstName} {editingUser.LastName}</h3>
                <p className="text-sm text-apple-gray">{editingUser.Email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Выберите новую роль:</p>
              
              {[
                { id: 'Client', name: 'Клиент', desc: 'Может заказывать услуги и общаться в чате' },
                { id: 'Staff', name: 'Сотрудник', desc: 'Обрабатывает заявки и отвечает в чате' },
                { id: 'Admin', name: 'Администратор', desc: 'Полный доступ к системе' }
              ].map(role => (
                <div 
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedRole === role.id ? 'border-postman bg-postman/5' : 'border-apple-border dark:border-apple-darkBorder hover:border-postman/50'}`}
                >
                  <div>
                    <h4 className="font-bold text-sm">{role.name}</h4>
                    <p className="text-xs text-apple-gray">{role.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedRole === role.id ? 'bg-postman border-postman' : 'border-apple-gray/50'}`}>
                    {selectedRole === role.id && <Check size={12} className="text-white" />}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleRoleSave}
              disabled={isSaving || selectedRole === (editingUser.roles[0]?.RoleName || 'Client')}
              className="w-full py-3.5 bg-postman text-white font-medium rounded-xl hover:bg-postman-hover transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Сохранить роль'}
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
};