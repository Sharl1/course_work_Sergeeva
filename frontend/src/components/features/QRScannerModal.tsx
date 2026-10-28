import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from '../ui/Modal';
import { Loader2, CheckCircle2, Award, Search, ChevronDown, MinusCircle, PlusCircle } from 'lucide-react';
import apiClient from '../../api/axiosClient';
import { useToast } from '../ui/Toast';

export const QRScannerModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { showToast } = useToast();
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  
  // Состояния для действий
  const [actionType, setActionType] = useState<'accrue' | 'deduct'>('accrue');
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStoppedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !scanResult) {
      isStoppedRef.current = false;
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
              html5QrCode.clear();
              isStoppedRef.current = true;
              handleScan(decodedText);
            }).catch(err => {
              console.error(err);
              handleScan(decodedText);
            });
          }
        },
        () => {}
      ).catch(err => {
        setError("Не удалось запустить камеру. Проверьте разрешения.");
      });

      apiClient.get('/services/').then(res => setServices(res.data)).catch(console.error);
    }

    return () => {
      if (scannerRef.current && !isStoppedRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(e => console.log("cleanup"));
      }
    };
  }, [isOpen, scanResult]);

  const handleScan = async (qrText: string) => {
    setIsScanning(true);
    setError('');
    try {
      const res = await apiClient.post('/requests/scan-qr', { qr_string: qrText });
      setScanResult({ ...res.data, qr_string: qrText });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка сканирования');
      setTimeout(() => { setScanResult(null); setError(''); }, 2000);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAction = async () => {
    if (!scanResult) return;
    
    let amount = 0;
    let description = '';

    if (selectedService) {
      // Если выбрана услуга:
      if (actionType === 'accrue') {
        amount = Math.floor(Number(selectedService.Price) * 0.1);
        description = `Бонус за ${selectedService.ServiceName}`;
      } else {
        // Для списания: берем 50% от цены, но не больше, чем есть у гостя
        const maxDeductible = Math.floor(Number(selectedService.Price) * 0.5);
        amount = Math.min(scanResult.balance, maxDeductible);
        description = `Оплата 50% баллами: ${selectedService.ServiceName}`;
      }
    } else if (customAmount) {
      // Если ввели вручную:
      amount = parseInt(customAmount);
      description = customDesc || (actionType === 'accrue' ? 'Ручное начисление' : 'Ручное списание');
    }

    if (amount <= 0) return showToast('Сумма должна быть больше 0', 'error');

    // Проверка: если списываем и сумма больше баланса
    if (actionType === 'deduct' && amount > scanResult.balance) {
      return showToast(`Недостаточно баллов! У гостя только ${scanResult.balance} б.`, 'error');
    }

    const finalAmount = actionType === 'accrue' ? amount : -amount;

    try {
      await apiClient.post('/loyalty/award-points', {
        qr_string: scanResult.qr_string,
        amount: finalAmount,
        description: description
      });
      showToast(`Успешно ${actionType === 'accrue' ? 'начислено' : 'списано'} ${amount} баллов`, 'success');
      setScanResult(null);
      setSelectedService(null);
      setCustomAmount('');
      setCustomDesc('');
      onClose();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Ошибка при операции', 'error');
    }
  };

  const filteredServices = services.filter(s => s.ServiceName.toLowerCase().includes(search.toLowerCase()));

  return (
    <Modal isOpen={isOpen} onClose={() => { setScanResult(null); onClose(); }} title="Сканер QR-кодов">
      <div className="space-y-4">
        
        <div className={`bg-black rounded-xl overflow-hidden min-h-[250px] relative ${scanResult ? 'hidden' : 'flex items-center justify-center'}`}>
          <div id="reader" className="w-full"></div>
          {isScanning && <Loader2 className="absolute animate-spin text-postman" size={40} />}
        </div>

        {!scanResult ? (
          <>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <p className="text-xs text-apple-gray text-center">Наведите камеру на QR-код гостя</p>
            <button onClick={() => handleScan("CONCIERGE-USER-3-1")} className="mt-2 px-6 py-2.5 bg-apple-bg dark:bg-black/30 rounded-xl text-sm font-medium hover:bg-postman hover:text-white transition-colors flex items-center justify-center gap-2 w-full">
              Симулировать сканирование (ПК)
            </button>
          </>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[75vh] overflow-y-auto pr-1 pb-4 custom-scrollbar">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-bold text-lg">{scanResult.guest_name}</h3>
              <p className="text-xs text-apple-gray mb-2">{scanResult.email}</p>
              <div className="bg-apple-bg dark:bg-black/20 p-2 rounded-lg inline-block">
                <span className="text-xs text-apple-gray mr-2">Текущий баланс:</span>
                <span className="font-bold text-postman">{scanResult.balance} б.</span>
              </div>
            </div>

            {/* ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМОВ */}
            <div className="flex bg-apple-bg dark:bg-black/20 p-1 rounded-xl">
              <button 
                onClick={() => { setActionType('accrue'); setSelectedService(null); setCustomAmount(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${actionType === 'accrue' ? 'bg-white dark:bg-apple-darkCard shadow-sm text-green-500' : 'text-apple-gray'}`}
              >
                <PlusCircle size={16} /> Начислить
              </button>
              <button 
                onClick={() => { setActionType('deduct'); setSelectedService(null); setCustomAmount(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${actionType === 'deduct' ? 'bg-white dark:bg-apple-darkCard shadow-sm text-red-500' : 'text-apple-gray'}`}
              >
                <MinusCircle size={16} /> Списать
              </button>
            </div>

            <div className="border-t border-apple-border dark:border-apple-darkBorder pt-4">
              <h4 className={`font-semibold text-sm mb-3 flex items-center gap-2 ${actionType === 'accrue' ? 'text-green-500' : 'text-red-500'}`}>
                <Award size={16} /> {actionType === 'accrue' ? 'Начисление баллов' : 'Списание баллов'}
              </h4>
              
              {/* Выбор услуги */}
              <div className="relative mb-3">
                <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full p-3 bg-white dark:bg-black/30 border border-apple-border dark:border-apple-darkBorder rounded-xl flex justify-between items-center cursor-pointer text-sm">
                  <span className="truncate pr-2">{selectedService ? selectedService.ServiceName : 'Выберите услугу'}</span>
                  <ChevronDown size={16} className="text-apple-gray shrink-0" />
                </div>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-apple-darkCard border border-apple-border dark:border-apple-darkBorder rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-white dark:bg-apple-darkCard border-b border-apple-border dark:border-apple-darkBorder">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-apple-gray" size={14} />
                        <input type="text" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-7 pr-2 py-1.5 bg-apple-bg dark:bg-black/20 rounded-lg text-xs focus:outline-none" />
                      </div>
                    </div>
                        {filteredServices.map(s => {
                      // Вычисляем сумму: 10% для начисления, или МИНИМУМ(баланс, 50%) для списания
                      const halfPrice = Math.floor(Number(s.Price) * 0.5);
                      const amt = actionType === 'accrue' 
                        ? Math.floor(Number(s.Price) * 0.1) 
                        : Math.min(scanResult.balance, halfPrice);

                      return (
                        <div key={s.ServiceID} onClick={() => { setSelectedService(s); setIsDropdownOpen(false); setCustomAmount(''); }} className="p-2 hover:bg-apple-bg dark:hover:bg-white/5 cursor-pointer text-xs flex justify-between">
                          <span className="truncate pr-2">{s.ServiceName}</span>
                          <span className={`font-medium shrink-0 ${actionType === 'accrue' ? 'text-green-500' : 'text-red-500'}`}>
                            {actionType === 'accrue' ? '+' : '-'}{amt} б.
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-apple-border dark:border-apple-darkBorder"></div></div>
                <div className="relative flex justify-center"><span className="bg-white dark:bg-apple-darkCard px-2 text-xs text-apple-gray">ИЛИ СВОБОДНЫЙ ВВОД</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <input type="number" placeholder="Баллы" value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setSelectedService(null); }} className="p-3 bg-white dark:bg-black/30 border border-apple-border dark:border-apple-darkBorder rounded-xl text-sm focus:outline-none" />
                <input type="text" placeholder="Причина" value={customDesc} onChange={(e) => setCustomDesc(e.target.value)} className="p-3 bg-white dark:bg-black/30 border border-apple-border dark:border-apple-darkBorder rounded-xl text-sm focus:outline-none" />
              </div>

              <button 
                onClick={handleAction} 
                disabled={!selectedService && !customAmount}
                className={`w-full py-3 text-white rounded-xl font-medium transition-colors disabled:opacity-50 ${actionType === 'accrue' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {actionType === 'accrue' ? 'Начислить баллы' : 'Списать баллы'}
              </button>
              
              <button onClick={() => setScanResult(null)} className="w-full py-3 mt-2 text-apple-gray text-sm font-medium hover:text-apple-text transition-colors">
                Сканировать следующего
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};