import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Loader2, ArrowUpRight, ArrowDownLeft, Sparkles, Maximize2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import apiClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/authStore';
import { Modal } from '../../components/ui/Modal';

interface Transaction {
  TransactionID: number;
  Amount: number;
  TransactionType: string;
  Description: string;
  CreatedAt: string;
}

interface LoyaltyAccount {
  AccountID: number;
  Balance: number;
  transactions: Transaction[];
}

export const Loyalty = () => {
  const { user } = useAuthStore();
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQrOpen, setIsQrOpen] = useState(false);

  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        const res = await apiClient.get('/loyalty/my');
        setAccount(res.data);
      } catch (error) {
        console.error("Ошибка загрузки бонусов", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLoyalty();
  }, []);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-postman" size={40} /></div>;

  // Строка для QR-кода (должна совпадать с форматом на бэкенде)
  const qrValue = `CONCIERGE-USER-${user?.UserID}-${account?.AccountID}`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Award className="text-postman" size={32} /> Программа лояльности
        </h1>
        <p className="text-apple-gray text-sm">Накапливайте баллы и оплачивайте ими до 50% от стоимости заказов</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Левая колонка: Карта лояльности */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1"
        >
          <div className="relative overflow-hidden rounded-apple-lg p-6 bg-gradient-to-br from-postman to-[#ff8f66] text-white shadow-postman-glow h-64 flex flex-col justify-between">
            <div className="flex justify-between items-start relative z-10">
              <Award size={32} className="opacity-80" />
              <span className="text-[10px] font-semibold tracking-widest uppercase opacity-80">Concierge Club</span>
            </div>
            
            <div className="relative z-10 mt-6 flex justify-between items-end">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Доступно баллов</p>
                <h2 className="text-5xl font-bold">{account?.Balance || 0}</h2>
              </div>
              
              {/* Маленький QR-код */}
              <div 
                className="bg-white p-2 rounded-xl cursor-pointer hover:scale-105 transition-transform relative group"
                onClick={() => setIsQrOpen(true)}
                title="Развернуть QR-код"
              >
                <QRCodeSVG 
                  value={qrValue} 
                  size={64} 
                  bgColor={"#ffffff"}
                  fgColor={"#1D1D1F"}
                  level={"L"}
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <Maximize2 className="text-white" size={20} />
                </div>
              </div>
            </div>
            
            <p className="text-white/60 text-[10px] mt-2 text-right relative z-10">Покажите QR для списания на ресепшн</p>

            {/* Декор */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>
          
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
            <Sparkles className="text-blue-500 shrink-0" size={20} />
            <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
              За каждый оплаченный заказ мы начисляем <b>10%</b> от его стоимости бонусами. 1 балл = 1 рубль.
            </p>
          </div>
        </motion.div>

        {/* Правая колонка: История операций */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <div className="bg-white dark:bg-apple-darkCard rounded-apple-lg border border-apple-border dark:border-apple-darkBorder overflow-hidden h-full">
            <div className="p-5 border-b border-apple-border dark:border-apple-darkBorder bg-white/50 dark:bg-apple-darkCard/50 backdrop-blur-md sticky top-0 z-10">
              <h3 className="font-bold text-lg">История операций</h3>
            </div>
            
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {!account?.transactions || account.transactions.length === 0 ? (
                <div className="text-center py-12 text-apple-gray">
                  У вас пока нет начислений. Закажите услугу, чтобы получить бонусы!
                </div>
              ) : (
                <div className="space-y-1">
                  {account.transactions.map((tx) => {
                    const isAccrual = tx.Amount > 0;
                    return (
                      <div key={tx.TransactionID} className="flex items-center justify-between p-3 hover:bg-apple-bg dark:hover:bg-black/20 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${isAccrual ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {isAccrual ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tx.Description || 'Операция по бонусам'}</p>
                            <p className="text-xs text-apple-gray">
                              {new Date(tx.CreatedAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <span className={`font-bold ${isAccrual ? 'text-green-500' : 'text-red-500'}`}>
                          {isAccrual ? '+' : ''}{tx.Amount} ₽
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Модалка с большим QR-кодом */}
      <Modal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} title="Ваш QR-код">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl mb-6">
            <QRCodeSVG 
              value={qrValue} 
              size={280} 
              bgColor={"#ffffff"}
              fgColor={"#1D1D1F"}
              level={"L"}
            />
          </div>
          <p className="text-center text-apple-gray text-sm">
            Покажите этот код сотруднику отеля,<br/> чтобы списать или начислить баллы.
          </p>
        </div>
      </Modal>
    </div>
  );
};