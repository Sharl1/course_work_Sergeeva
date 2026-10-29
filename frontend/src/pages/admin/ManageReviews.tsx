import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Star, Trash2, MessageSquare } from 'lucide-react';
import apiClient from '../../api/axiosClient';
import { useToast } from '../../components/ui/Toast';

interface Review {
  ReviewID: number; Rating: number; Comment: string; CreatedAt: string;
  user: { FirstName: string; LastName: string; };
  service: { ServiceName: string; };
}

export const ManageReviews = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await apiClient.get('/reviews/all');
      setReviews(res.data);
    } catch (error) { showToast('Ошибка загрузки отзывов', 'error'); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот отзыв?')) return;
    try {
      await apiClient.delete(`/reviews/${id}`);
      showToast('Отзыв удален', 'success');
      fetchReviews();
    } catch (error) { showToast('Ошибка при удалении', 'error'); }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-postman" size={40} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Модерация отзывов</h1>
        <p className="text-apple-gray text-sm">Следите за качеством обратной связи от гостей</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map(review => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={review.ReviewID} className="bg-white dark:bg-apple-darkCard p-5 rounded-apple-lg border border-apple-border dark:border-apple-darkBorder flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-postman/10 text-postman flex items-center justify-center font-bold text-xs">
                    {review.user?.FirstName?.[0]}{review.user?.LastName?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{review.user?.FirstName} {review.user?.LastName}</p>
                    <p className="text-[10px] text-apple-gray">{review.service?.ServiceName}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= review.Rating ? 'fill-yellow-400 text-yellow-400' : 'text-apple-gray/30'} />)}
                </div>
              </div>
              <div className="bg-apple-bg dark:bg-black/20 p-3 rounded-xl mb-3">
                <p className="text-sm text-apple-gray italic flex items-start gap-2">
                  <MessageSquare size={14} className="mt-1 shrink-0 opacity-50" /> {review.Comment || "Без текста"}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-apple-border dark:border-apple-darkBorder">
              <span className="text-xs text-apple-gray">{new Date(review.CreatedAt).toLocaleDateString('ru-RU')}</span>
              <button onClick={() => handleDelete(review.ReviewID)} className="p-2 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
        {reviews.length === 0 && <div className="col-span-2 text-center text-apple-gray py-10">Отзывов пока нет</div>}
      </div>
    </div>
  );
};