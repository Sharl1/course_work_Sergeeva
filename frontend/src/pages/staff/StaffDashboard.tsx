import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Loader2, ScanLine, Clock, CheckCircle2, AlertCircle, XCircle, Calendar as CalendarIcon, LayoutGrid, MessageSquare, X, ArrowRight, Check } from 'lucide-react';
import apiClient from '../../api/axiosClient';
import { QRScannerModal } from '../../components/features/QRScannerModal';
import { useToast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';

interface RequestData {
  RequestID: number;
  BookingID: number;
  StaffID: number | null;
  StatusID: number;
  Comment: string | null;
  UpdatedAt: string;
  booking: {
    BookingDate: string;
    service: { ServiceName: string; Price: number; };
    user: { FirstName: string; LastName: string; Email: string; Phone?: string; };
  };
  status: { StatusName: string; };
}

const COLUMNS = [
  { id: 'Open', title: 'Новые', icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'InProgress', title: 'В работе', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'Completed', title: 'Выполнено', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'Rejected', title: 'Отклонено', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
];

export const StaffDashboard = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await apiClient.get('/requests/');
      setRequests(res.data || []);
    } catch (error) {
      showToast('Ошибка загрузки заявок', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleStatusChange = async (requestId: number, newStatus: string, comment?: string) => {
    try {
      await apiClient.patch(`/requests/${requestId}/status`, {
        StatusName: newStatus,
        Comment: comment || null
      });
      showToast('Статус заявки обновлен', 'success');
      fetchRequests();
      setSelectedRequest(null);
      setIsRejecting(false);
      setRejectComment('');
    } catch (error) {
      showToast('Ошибка при смене статуса', 'error');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const requestId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    if (newStatus === 'Rejected') {
      const req = requests.find(r => r.RequestID === requestId);
      if (req) setSelectedRequest(req);
      setIsRejecting(true);
      return; 
    }

    setRequests(prev => prev.map(req => 
      req.RequestID === requestId ? { ...req, status: { StatusName: newStatus } } : req
    ));
    handleStatusChange(requestId, newStatus, newStatus === 'InProgress' ? 'Взято в работу' : 'Выполнено');
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-postman" size={40} /></div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Шапка */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Рабочая панель</h1>
          <p className="text-apple-gray text-sm hidden md:block">Управляйте заявками гостей</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex bg-apple-bg dark:bg-black/20 p-1 rounded-xl border border-apple-border dark:border-apple-darkBorder">
            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-apple-darkCard shadow-sm' : 'text-apple-gray'}`}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-apple-darkCard shadow-sm' : 'text-apple-gray'}`}>
              <CalendarIcon size={18} />
            </button>
          </div>

          <button onClick={() => setIsScannerOpen(true)} className="px-4 md:px-6 py-3 bg-postman text-white font-medium rounded-xl shadow-postman-glow hover:bg-postman-hover transition-all flex items-center gap-2 flex-1 md:flex-none justify-center text-sm md:text-base">
            <ScanLine size={20} /> <span className="hidden md:inline">Сканировать QR</span><span className="md:hidden">QR</span>
          </button>
        </div>
      </div>

      {/* --- РЕЖИМ КАНБАН --- */}
      {viewMode === 'kanban' && (
        <DragDropContext onDragEnd={onDragEnd}>
          {/* На мобилке делаем горизонтальный скролл для колонок */}
          <div className="flex-1 flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4 snap-x">
            {COLUMNS.map(col => {
              const columnRequests = requests.filter(r => r.status?.StatusName === col.id);
              const Icon = col.icon;

              return (
                <div key={col.id} className="flex flex-col bg-apple-bg dark:bg-black/20 rounded-apple-lg border border-apple-border dark:border-apple-darkBorder overflow-hidden min-w-[85vw] md:min-w-0 snap-center">
                  <div className="p-4 border-b border-apple-border dark:border-apple-darkBorder flex items-center justify-between bg-white/50 dark:bg-apple-darkCard/50 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${col.bg} ${col.color}`}><Icon size={18} /></div>
                      <h3 className="font-bold">{col.title}</h3>
                    </div>
                    <span className="text-xs font-bold bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full">{columnRequests.length}</span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className={`flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px] ${snapshot.isDraggingOver ? 'bg-postman/5' : ''}`}>
                        {columnRequests.map((req, index) => (
                          <Draggable key={req.RequestID} draggableId={req.RequestID.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white dark:bg-apple-darkCard p-4 rounded-xl border border-apple-border dark:border-apple-darkBorder shadow-sm transition-all ${snapshot.isDragging ? 'shadow-xl rotate-2 scale-105 z-50' : ''}`}
                              >
                                <div className="flex justify-between items-start mb-2 cursor-pointer" onClick={() => setSelectedRequest(req)}>
                                  <span className="text-[10px] font-bold text-apple-gray">Заказ #{req.RequestID}</span>
                                  <span className="text-xs font-semibold text-postman">{Number(req.booking?.service?.Price || 0).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</span>
                                </div>
                                <h4 className="font-bold text-sm mb-2 cursor-pointer" onClick={() => setSelectedRequest(req)}>{req.booking?.service?.ServiceName}</h4>
                                
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-5 h-5 rounded-full bg-postman/10 text-postman flex items-center justify-center text-[10px] font-bold">
                                    {req.booking?.user?.FirstName?.[0]}{req.booking?.user?.LastName?.[0]}
                                  </div>
                                  <span className="text-xs text-apple-gray truncate">{req.booking?.user?.FirstName} {req.booking?.user?.LastName}</span>
                                </div>

                                {/* БЫСТРЫЕ ДЕЙСТВИЯ ДЛЯ МОБИЛОК */}
                                <div className="flex justify-end gap-2 pt-2 border-t border-apple-border dark:border-apple-darkBorder">
                                  {col.id === 'Open' && (
                                    <button onClick={() => handleStatusChange(req.RequestID, 'InProgress', 'Взято в работу')} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors" title="Взять в работу">
                                      <ArrowRight size={16} />
                                    </button>
                                  )}
                                  {col.id === 'InProgress' && (
                                    <button onClick={() => handleStatusChange(req.RequestID, 'Completed', 'Выполнено')} className="p-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors" title="Завершить">
                                      <Check size={16} />
                                    </button>
                                  )}
                                  <button onClick={() => { setSelectedRequest(req); setIsRejecting(true); }} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Отклонить">
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* --- РЕЖИМ ТАЙМЛАЙНА (Вместо календаря) --- */}
      {viewMode === 'calendar' && (
        <div className="flex-1 overflow-y-auto pr-2">
          {requests.length === 0 && <div className="text-center text-apple-gray py-10">Заявок нет</div>}
          
          <div className="relative border-l-2 border-apple-border dark:border-apple-darkBorder ml-3 md:ml-4 space-y-8 pb-8">
            {/* Группируем по датам */}
            {Object.entries(
              requests.reduce((acc, req) => {
                const date = new Date(req.booking.BookingDate).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
                if (!acc[date]) acc[date] = [];
                acc[date].push(req);
                return acc;
              }, {} as Record<string, RequestData[]>)
            ).sort((a, b) => new Date(a[1][0].booking.BookingDate).getTime() - new Date(b[1][0].booking.BookingDate).getTime())
            .map(([date, dayRequests]) => (
              <div key={date} className="relative">
                <div className="absolute -left-[9px] md:-left-[9px] top-1 w-4 h-4 rounded-full bg-postman border-4 border-apple-bg dark:border-apple-darkBg" />
                <h3 className="text-sm font-bold text-apple-gray uppercase tracking-wider mb-4 pl-4">{date}</h3>
                <div className="space-y-3 pl-4">
                  {dayRequests.sort((a, b) => new Date(a.booking.BookingDate).getTime() - new Date(b.booking.BookingDate).getTime()).map(req => (
                    <div key={req.RequestID} onClick={() => setSelectedRequest(req)} className="bg-white dark:bg-apple-darkCard p-4 rounded-xl border border-apple-border dark:border-apple-darkBorder hover:border-postman cursor-pointer transition-colors flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-bold text-postman w-12">
                          {new Date(req.booking.BookingDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm group-hover:text-postman transition-colors">{req.booking?.service?.ServiceName}</h4>
                          <p className="text-xs text-apple-gray">{req.booking?.user?.FirstName} {req.booking?.user?.LastName}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        req.status.StatusName === 'Open' ? 'bg-yellow-500/10 text-yellow-500' :
                        req.status.StatusName === 'InProgress' ? 'bg-blue-500/10 text-blue-500' :
                        req.status.StatusName === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {COLUMNS.find(c => c.id === req.status.StatusName)?.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />

      {/* МОДАЛКА ДЕТАЛЕЙ ЗАЯВКИ */}
      <Modal isOpen={!!selectedRequest && !isRejecting} onClose={() => setSelectedRequest(null)} title="Детали заявки">
        {selectedRequest && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-apple-bg dark:bg-black/20 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-postman text-white flex items-center justify-center text-lg font-bold shrink-0">
                {selectedRequest.booking?.user?.FirstName?.[0]}{selectedRequest.booking?.user?.LastName?.[0]}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-lg truncate">{selectedRequest.booking?.user?.FirstName} {selectedRequest.booking?.user?.LastName}</h3>
                <p className="text-sm text-apple-gray truncate">{selectedRequest.booking?.user?.Email}</p>
                {selectedRequest.booking?.user?.Phone && <p className="text-sm text-apple-gray">{selectedRequest.booking?.user?.Phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-apple-gray mb-1">Услуга</p>
                <p className="font-semibold text-sm">{selectedRequest.booking?.service?.ServiceName}</p>
              </div>
              <div>
                <p className="text-xs text-apple-gray mb-1">Стоимость</p>
                <p className="font-semibold text-postman text-sm">{Number(selectedRequest.booking?.service?.Price || 0).toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-apple-gray mb-1">Дата и время</p>
                <p className="font-semibold text-sm">{new Date(selectedRequest.booking?.BookingDate).toLocaleString('ru-RU')}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-apple-gray mb-2 flex items-center gap-1"><MessageSquare size={14}/> Пожелания гостя</p>
              <div className="p-3 bg-postman/5 text-postman dark:bg-postman/10 rounded-xl text-sm border border-postman/20">
                {selectedRequest.Comment || "Без дополнительных опций"}
              </div>
            </div>

            <div className="pt-4 border-t border-apple-border dark:border-apple-darkBorder flex flex-col gap-2">
              {selectedRequest.status.StatusName === 'Open' && (
                <button onClick={() => handleStatusChange(selectedRequest.RequestID, 'InProgress', 'Взято в работу')} className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
                  Взять в работу
                </button>
              )}
              {selectedRequest.status.StatusName === 'InProgress' && (
                <button onClick={() => handleStatusChange(selectedRequest.RequestID, 'Completed', 'Выполнено')} className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors">
                  Завершить заказ
                </button>
              )}
              
              {selectedRequest.status.StatusName !== 'Completed' && selectedRequest.status.StatusName !== 'Rejected' && (
                <button onClick={() => setIsRejecting(true)} className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl font-medium hover:bg-red-500 hover:text-white transition-colors">
                  Отклонить заявку
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* МОДАЛКА ОТКЛОНЕНИЯ */}
      <Modal isOpen={!!selectedRequest && isRejecting} onClose={() => { setIsRejecting(false); setSelectedRequest(null); }} title="Отклонение">
        <div className="space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
              <X size={32} />
            </div>
          </div>
          <h3 className="text-center font-bold text-lg">Укажите причину</h3>
          <p className="text-center text-xs text-apple-gray mb-4">Этот комментарий увидит клиент.</p>
          
          <textarea 
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder="Например: Нет свободных специалистов..."
            className="w-full p-3 bg-apple-bg dark:bg-black/20 border border-apple-border dark:border-apple-darkBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm min-h-[100px] resize-none"
          />

          <div className="flex gap-3 pt-2">
            <button onClick={() => setIsRejecting(false)} className="flex-1 py-3 bg-apple-bg dark:bg-black/30 rounded-xl font-medium text-sm">Назад</button>
            <button 
              disabled={!rejectComment.trim()}
              onClick={() => handleStatusChange(selectedRequest!.RequestID, 'Rejected', `Отклонено: ${rejectComment}`)}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium text-sm disabled:opacity-50"
            >
              Отклонить
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};