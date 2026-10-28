import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/ui/Logo';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';


export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/'); // После успешного входа на главную
    } catch (err: any) {
      console.log("ПОЛНАЯ ОШИБКА:", err); // Выведем в консоль для дебага
      
      if (err.response) {
        // Сервер ответил с ошибкой (например, 400 или 401)
        setError(err.response.data?.detail || `Ошибка сервера: ${err.response.status}`);
      } else if (err.request) {
        // Запрос ушел, но ответа нет. Это 100% CORS или бэкенд не запущен.
        setError('Нет ответа от сервера. Проверьте CORS или запущен ли бэкенд.');
      } else {
        setError('Ошибка при отправке: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Фоновые декоративные пятна (как в iOS) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-postman/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-8 glass rounded-apple-lg relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-16 h-16 mb-4 drop-shadow-md" />
          <h2 className="text-2xl font-bold tracking-tight">С возвращением</h2>
          <p className="text-apple-gray text-sm mt-1">Войдите в свой аккаунт Консьержа</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-apple-gray group-focus-within:text-postman transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-black/50 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 focus:border-postman transition-all text-sm"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-apple-gray group-focus-within:text-postman transition-colors">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-black/50 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-postman/50 focus:border-postman transition-all text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-postman hover:bg-postman-hover text-white font-medium rounded-xl shadow-postman-glow transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Войти
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-apple-gray">
          Нет аккаунта? <Link to="/register" className="text-postman hover:underline">Зарегистрироваться</Link>
        </div>
      </motion.div>
    </div>
  );
};