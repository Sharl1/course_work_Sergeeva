import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { motion } from 'framer-motion';

export const Layout = () => {
  return (
    <div className="flex min-h-screen bg-apple-bg dark:bg-apple-darkBg text-apple-text dark:text-white transition-colors duration-300">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        
        {/* Область контента с анимацией появления */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8"
        >
          <Outlet /> {/* Сюда будут рендериться страницы */}
        </motion.div>
      </main>

      <MobileNav />
    </div>
  );
};