import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Calendar, Clock, XCircle, CheckCircle2, AlertCircle, Trash2, Star, Send } from 'lucide-react';
import apiClient from '../../api/axiosClient';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

interface Booking {
  BookingID: number;
  BookingDate: string;
  FinalPrice?: number;
  service: { ServiceName: string; Price: number; ServiceID: number };
  status: { StatusName: string };
  request?: { Comment: string | null };
}

const STATUS_STYLES: Record<string, { color: string, icon: any, label: string }> = {
  'Pending': { color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500', icon: AlertCircle, label: 'Ожидает' },
  'Confirmed': { color: 'bg-green-500/10 text-green-600 dark:text-green-500', icon: CheckCircle2, label: 'Подтверждено' },
  'Completed': { color: 'bg-blue-500/10 text-blue-600 dark:text-blue-500', icon: CheckCircle2, label: 'Выполнено' },
  'Cancelled': { color: 'bg-red-500/10 text-red-600 dark:text-red-500', icon: XCircle, label: 'Отменено' },
};

export const MyBookings = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояния для модалки отмены
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Состояния для модалки отзыва
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSendingReview, setIsSendingReview] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get('/bookings/my');
      setBookings(res.data);
    } catch (error) {
      console.error("Ошибка загрузки броней", error);
      showToast('Не удалось загрузить список броней', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const confirmCancel = async () => {
    if (!bookingToCancel) return;
    setIsCancelling(true);
    try {
      await apiClient.patch(`/bookings/${bookingToCancel}/cancel`);
      showToast('Бронирование успешно отменено', 'success');
      fetchBookings();
      setBookingToCancel(null);
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.detail || 'Не удалось отменить бронь', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const submitReview = async () => {
    if (!reviewBooking) return;
    setIsSendingReview(true);
    try {
      await apiClient.post('/reviews/', {
        ServiceID: reviewBooking.service.ServiceID,
        Rating: rating,
        Comment: comment
      });
      showToast('Спасибо за ваш отзыв!', 'success');
      setReviewBooking(null);
      setComment('');
      setRating(5);
    } catch (error) {
      showToast('Ошибка отправки отзыва', 'error');
    } finally {
      setIsSendingReview(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-postman" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Calendar className="text-postman" size={32} /> Мои брони
        </h1>
        <p className="text-apple-gray text-sm">История ваших заказов и активные бронирования</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-apple-darkCard rounded-apple-lg border border-apple-border dark:border-apple-darkBorder">
          <p className="text-apple-gray mb-4">У вас пока нет броней</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {bookings.map((booking) => {
              const status = STATUS_STYLES[booking.status.StatusName] || STATUS_STYLES['Pending'];
              const StatusIcon = status.icon;
              const dateObj = new Date(booking.BookingDate);

              return (
                <motion.div 
                  key={booking.BookingID}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-apple-darkCard p-5 rounded-apple-lg border border-apple-border dark:border-apple-darkBorder flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${status.color}`}>
                      <StatusIcon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{booking.service.ServiceName}</h3>
                      <div className="flex items-center gap-4 text-sm text-apple-gray mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {dateObj.toLocaleDateString('ru-RU')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Причина отмены (если есть) */}
                      {booking.status.StatusName === 'Cancelled' && booking.request?.Comment && (
                        <div className="mt-2 text-xs text-red-500 bg-red-500/10 p-2 rounded-lg inline-block border border-red-500/20">
                          <b>Причина:</b> {booking.request.Comment}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 md:w-1/2">
                    <span className="font-bold text-lg">
                      {Number(booking.FinalPrice || booking.service.Price).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
                    </span>
                    
                    <div className="flex gap-2">
                      {/* Кнопка отзыва для выполненных */}
                      {booking.status.StatusName === 'Completed' && (
                        <button 
                          onClick={() => setReviewBooking(booking)}
                          className="px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-500/10 rounded-xl hover:bg-yellow-500 hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          <Star size={14} /> Отзыв
                        </button>
                      )}

                      {/* Кнопка отмены для активных */}
                      {(booking.status.StatusName === 'Pending' || booking.status.StatusName === 'Confirmed') && (
                        <button 
                          onClick={() => setBookingToCancel(booking.BookingID)}
                          className="px-4 py-2 text-sm font-medium text-red-500 bg-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                        >
                          Отменить
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* --- МОДАЛКА ОТМЕНЫ БРОНИ --- */}
      <Modal 
        isOpen={!!bookingToCancel} 
        onClose={() => !isCancelling && setBookingToCancel(null)} 
        title="Отмена бронирования"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Вы уверены?</h3>
          <p className="text-apple-gray text-sm mb-8">
            Это действие нельзя отменить. Бронирование будет удалено из вашего списка активных заказов.
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setBookingToCancel(null)}
              disabled={isCancelling}
              className="flex-1 py-3 bg-apple-bg dark:bg-black/30 text-apple-text dark:text-white font-medium rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Оставить
            </button>
            <button 
              onClick={confirmCancel}
              disabled={isCancelling}
              className="flex-1 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isCancelling ? <Loader2 className="animate-spin" size={20} /> : 'Да, отменить'}
            </button>
          </div>
        </div>
      </Modal>

      {/* --- МОДАЛКА ОТЗЫВА --- */}
      <Modal 
        isOpen={!!reviewBooking} 
        onClose={() => !isSendingReview && setReviewBooking(null)} 
        title="Оставить отзыв"
      >
        {reviewBooking && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-1">{reviewBooking.service.ServiceName}</h3>
              <p className="text-xs text-apple-gray">Как вам услуга?</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} className="p-1 transition-transform hover:scale-110">
                  <Star size={36} className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-apple-gray/30'} />
                </button>
              ))}
            </div>

            <textarea 
              value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Поделитесь впечатлениями (необязательно)..."
              className="w-full p-4 bg-apple-bg dark:bg-black/20 border border-apple-border dark:border-apple-darkBorder rounded-xl text-sm min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-postman/50"
            />

            <button 
              onClick={submitReview}
              disabled={isSendingReview}
              className="w-full py-3.5 bg-postman text-white font-medium rounded-xl hover:bg-postman-hover shadow-postman-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSendingReview ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Отправить отзыв</>}
            </button>
          </div>
        )}
      </Modal>

    </div>
  );
};