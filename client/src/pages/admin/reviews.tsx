import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { TokenStorage } from "../../services/api";
import { FaStar, FaCheck, FaTimes, FaTrash, FaEye, FaFilter, FaSort, FaUser, FaCheckCircle } from "react-icons/fa";

interface Review {
  id: number;
  user_id?: number;
  course_id?: number;
  author_name: string;
  author_email: string;
  author_phone?: string;
  rating: number;
  comment: string;
  reason: string;
  is_verified: boolean;
  is_approved: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  course_title?: string;
  avatar_url?: string;
  user_full_name?: string;
  display_name?: string;
  is_liked_by_user?: boolean;
}

interface ReviewStats {
  total: number;
  approved: number;
  pending: number;
  averageRating: number;
}

const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    approved: 0,
    pending: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "rating_high" | "rating_low">("newest");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Загрузка отзывов
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = TokenStorage.get();
      console.log("Admin reviews: fetching with token:", !!token);

      const params = new URLSearchParams();
      params.append("status", filter);
      params.append("sort", sort);

      const url = `http://localhost:3001/api/reviews/admin/all?${params.toString()}`;
      console.log("Admin reviews: fetching from URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Admin reviews: response status:", response.status);
      const data = await response.json();
      console.log("Admin reviews: response data:", data);

      if (data.success) {
        console.log("Sample review data:", data.data.reviews[0]); // Логируем первый отзыв для отладки
        setReviews(data.data.reviews);
        setStats(data.data.stats);
      } else {
        console.error("Admin reviews: API error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter, sort]);

  // Обновление статуса отзыва
  const updateReviewStatus = async (reviewId: number, isApproved: boolean) => {
    try {
      const token = TokenStorage.get();
      const response = await fetch(`http://localhost:3001/api/reviews/admin/${reviewId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_approved: isApproved }),
      });

      const data = await response.json();

      if (data.success) {
        fetchReviews(); // Обновляем список
      } else {
        alert("Ошибка при обновлении статуса отзыва");
      }
    } catch (error) {
      console.error("Error updating review status:", error);
      alert("Ошибка при обновлении статуса отзыва");
    }
  };

  // Удаление отзыва
  const deleteReview = async (reviewId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот отзыв?")) {
      return;
    }

    try {
      const token = TokenStorage.get();
      const response = await fetch(`http://localhost:3001/api/reviews/admin/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchReviews(); // Обновляем список
      } else {
        alert("Ошибка при удалении отзыва");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Ошибка при удалении отзыва");
    }
  };

  // Функция для отображения звезд
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => <FaStar key={index} className={`${index < rating ? "text-yellow-400" : "text-gray-300"} text-sm`} />);
  };

  // Функция для преобразования кода причины в читаемый текст
  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case "course":
        return "Курс обучения";
      case "instructor":
        return "Инструктор";
      case "facilities":
        return "Материально-техническая база";
      case "support":
        return "Поддержка";
      case "overall":
        return "Общее впечатление";
      default:
        return reason;
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-6">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Управление отзывами</h1>
            <p className="text-gray-600 mt-2">Модерация и управление отзывами пользователей</p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <FaEye className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всего отзывов</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <FaCheck className="text-green-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Одобрено</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <FaTimes className="text-yellow-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">На модерации</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <FaStar className="text-purple-600 text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Средняя оценка</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Фильтры и сортировка */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-500" />
                  <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "approved" | "pending")} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">Все отзывы</option>
                    <option value="approved">Одобренные</option>
                    <option value="pending">На модерации</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <FaSort className="text-gray-500" />
                  <select value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest" | "rating_high" | "rating_low")} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="newest">Сначала новые</option>
                    <option value="oldest">Сначала старые</option>
                    <option value="rating_high">Высокие оценки</option>
                    <option value="rating_low">Низкие оценки</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-600">Показано: {reviews.length} отзывов</div>
            </div>
          </div>

          {/* Список отзывов */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка отзывов...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Отзывы не найдены</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">{review.avatar_url ? <img src={`http://localhost:3001${review.avatar_url}`} alt={review.display_name || review.user_full_name || review.author_name || "Пользователь"} className="w-12 h-12 rounded-full object-cover" /> : <FaUser className="text-gray-500" />}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800">{review.display_name || review.user_full_name || review.author_name || "Гость"}</h3>
                          {review.is_verified && <FaCheckCircle className="text-green-500 text-sm" title="Верифицированный отзыв" />}
                          <span className={`px-2 py-1 text-xs rounded-full ${review.is_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{review.is_approved ? "Одобрено" : "На модерации"}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Email: {review.author_email}</p>
                        {review.author_phone && <p className="text-sm text-gray-600 mb-1">Телефон: {review.author_phone}</p>}
                        <p className="text-sm text-gray-600 mb-2">Причина: {getReasonLabel(review.reason)}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">{review.rating}/5</span>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString("ru-RU")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!review.is_approved && (
                        <button onClick={() => updateReviewStatus(review.id, true)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Одобрить отзыв">
                          <FaCheck />
                        </button>
                      )}

                      {review.is_approved && (
                        <button onClick={() => updateReviewStatus(review.id, false)} className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors" title="Отклонить отзыв">
                          <FaTimes />
                        </button>
                      )}

                      <button onClick={() => deleteReview(review.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Удалить отзыв">
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Лайки: {review.likes_count}</span>
                      {review.replies_count > 0 && <span>Ответы: {review.replies_count}</span>}
                    </div>
                    <div className="text-sm text-gray-500">ID: {review.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AdminReviewsPage;
