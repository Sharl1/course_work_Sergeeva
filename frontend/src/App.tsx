import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { SplashScreen } from './components/layout/SplashScreen';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Layout } from './components/layout/Layout';
import { ClientDashboard } from './pages/client/Dashboard';
import { Catalog } from './pages/client/Catalog';
import { FoodMenu } from './pages/client/FoodMenu';
import { MyBookings } from './pages/client/MyBookings';
import { Loyalty } from './pages/client/Loyalty';
import { Chat } from './pages/client/Chat';
import { Profile } from './pages/client/Profile';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffChats } from './pages/staff/StaffChats';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageServices } from './pages/admin/ManageServices';
import { ManageUsers } from './pages/admin/ManageUsers';
import { useAuthStore } from './store/authStore';
import { ManageReviews } from './pages/admin/ManageReviews';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuthStore();

  // Защита от падения, если структура ролей не загрузилась
  const role = user?.roles?.[0]?.RoleName || 'Client';

  if (isLoading) {
    return <SplashScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* --- ПУБЛИЧНЫЕ МАРШРУТЫ --- */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
          
          {/* --- ОБЩИЙ LAYOUT (Доступен всем) --- */}
          <Route element={<Layout />}>
            
            {/* Главная страница (Редирект по ролям) */}
            <Route 
              path="/" 
              element={
                !isAuthenticated ? <Navigate to="/catalog" replace /> : // Гость -> в каталог
                role === 'Admin' ? <Navigate to="/admin" replace /> :
                role === 'Staff' ? <Navigate to="/staff" replace /> :
                <ClientDashboard />
              } 
            />

            {/* --- ДОСТУПНО ВСЕМ (Включая Гостей) --- */}
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/food" element={<FoodMenu />} />

            {/* --- ЗАЩИЩЕННЫЕ МАРШРУТЫ (Только для авторизованных) --- */}
            <Route path="/bookings" element={isAuthenticated ? <MyBookings /> : <Navigate to="/login" replace />} />
            <Route path="/loyalty" element={isAuthenticated ? <Loyalty /> : <Navigate to="/login" replace />} />
            <Route path="/chat" element={isAuthenticated ? <Chat /> : <Navigate to="/login" replace />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />

            {/* --- МАРШРУТЫ АДМИНИСТРАТОРА --- */}
            <Route path="/admin" element={role === 'Admin' ? <AdminDashboard /> : <Navigate to="/" replace />} />
            <Route path="/admin/services" element={role === 'Admin' ? <ManageServices /> : <Navigate to="/" replace />} />
            <Route path="/admin/users" element={role === 'Admin' ? <ManageUsers /> : <Navigate to="/" replace />} />
            <Route path="/admin/reviews" element={role === 'Admin' ? <ManageReviews /> : <Navigate to="/" />} />
            
            {/* --- МАРШРУТЫ СОТРУДНИКА --- */}
            <Route path="/staff" element={role === 'Staff' ? <StaffDashboard /> : <Navigate to="/" replace />} />
            <Route path="/staff/chats" element={role === 'Staff' ? <StaffChats /> : <Navigate to="/" replace />} />
            
          </Route>

          {/* Редирект для неизвестных путей */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;