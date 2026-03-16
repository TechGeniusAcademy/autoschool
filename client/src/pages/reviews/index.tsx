import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { TokenStorage } from "@/services/api";
import { API_BASE_URL, SERVER_URL } from "@/constants/api";
import { useLanguage } from "../../contexts/LanguageContext";

interface Review {
  id: number;
  user_id: number;
  reason?: string;
  author_name: string;
  author_email: string;
  author_phone?: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  is_approved: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  display_name?: string;
  is_liked_by_user?: boolean;
}

// Функция для получения текстового представления причины отзыва
const getReasonLabel = (reason: string): string => {
  const reasonLabels: Record<string, string> = {
    overall: "Общее впечатление о школе",
    general: "Общее впечатление о школе",
    course: "Курс обучения",
    instructor: "Качество обучения инструкторов",
    administration: "Работа администрации",
    facilities: "Состояние учебных помещений",
    vehicles: "Учебные автомобили",
    pricing: "Цены и условия оплаты",
    schedule: "Расписание занятий",
    other: "Другое",
  };
  return reasonLabels[reason] || reason;
};

const ReviewsPage: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest" | "likes">("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    verified: 0,
    fiveStars: 0,
  });

  // Проверка авторизации
  useEffect(() => {
    const token = TokenStorage.get();
    setIsAuthenticated(!!token);
  }, []);

  // Загрузка отзывов
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("sort", sortOrder);
      if (filterRating) {
        params.append("rating", filterRating.toString());
      }

      const url = `${API_BASE_URL}/reviews/public?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data.reviews);
        // Вычисляем статистику
        const total = data.data.reviews.length;
        const averageRating = total > 0 ? data.data.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / total : 0;
        const verified = data.data.reviews.filter((review: Review) => review.is_verified).length;
        const fiveStars = data.data.reviews.filter((review: Review) => review.rating === 5).length;

        setStats({ total, averageRating, verified, fiveStars });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [sortOrder, filterRating]);

  // Валидация формы (упрощенная для авторизованных пользователей)
  const validationSchema = Yup.object({
    reason: Yup.string(),
    rating: Yup.number().min(1, "Минимальная оценка 1").max(5, "Максимальная оценка 5").required("Оценка обязательна"),
    comment: Yup.string().min(10, "Отзыв должен содержать минимум 10 символов").max(1000, "Отзыв должен содержать максимум 1000 символов").required("Отзыв обязателен"),
  });

  // Отправка нового отзыва
  const handleSubmitReview = async (values: any, { resetForm }: any) => {
    if (!isAuthenticated) {
      alert("Для отправки отзыва необходимо войти в систему");
      router.push("/login");
      return;
    }

    try {
      setSubmitting(true);
      const token = TokenStorage.get();

      const response = await fetch(`${API_BASE_URL}/reviews/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: values.reason || null,
          rating: values.rating,
          comment: values.comment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        resetForm();
        alert("Отзыв успешно отправлен на модерацию!");
        // Обновляем список отзывов
        fetchReviews();
      } else {
        alert("Ошибка при отправке отзыва: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Ошибка при отправке отзыва");
    } finally {
      setSubmitting(false);
    }
  };

  // Лайк отзыва
  const handleLike = async (reviewId: number) => {
    if (!isAuthenticated) {
      alert("Для оценки отзывов необходимо войти в систему");
      router.push("/login");
      return;
    }

    try {
      const token = TokenStorage.get();
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  likes_count: data.data.likes_count,
                  is_liked_by_user: data.data.is_liked_by_user,
                }
              : review
          )
        );
      } else {
        alert("Ошибка при оценке отзыва: " + data.message);
      }
    } catch (error) {
      console.error("Error liking review:", error);
      alert("Ошибка при оценке отзыва");
    }
  };

  // Функция для отображения звезд
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-lg ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Заголовок страницы */}
        <section className="bg-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">{t("reviews_section_title")}</h1>
            <p className="text-xl">{t("reviews_section_subtitle")}</p>
          </div>
        </section>

        {/* Статистика */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
                <div className="text-gray-600">{t("reviews_total_count")}</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.averageRating.toFixed(1)}</div>
                <div className="text-gray-600">{t("reviews_average_rating")}</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.verified}</div>
                <div className="text-gray-600">{t("reviews_verified_count")}</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.fiveStars}</div>
                <div className="text-gray-600">{t("reviews_five_star_count")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Фильтры и сортировка */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <label className="font-medium text-gray-700">Фильтр по рейтингу:</label>
                  <select value={filterRating || ""} onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Все оценки</option>
                    <option value="5">5 звезд</option>
                    <option value="4">4 звезды</option>
                    <option value="3">3 звезды</option>
                    <option value="2">2 звезды</option>
                    <option value="1">1 звезда</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="font-medium text-gray-700">Сортировка:</label>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest" | "highest" | "lowest" | "likes")} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="newest">Сначала новые</option>
                    <option value="oldest">Сначала старые</option>
                    <option value="highest">Сначала высокие оценки</option>
                    <option value="lowest">Сначала низкие оценки</option>
                    <option value="likes">По популярности</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Список отзывов */}
        <section className="py-16">
          <div className="container mx-auto px-4">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">{review.avatar_url ? <img src={`${SERVER_URL}${review.avatar_url}`} alt={review.display_name || review.author_name || "Пользователь"} className="w-12 h-12 rounded-full object-cover" /> : <span className="text-gray-500 text-xl">👤</span>}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800">{review.display_name || review.author_name || "Гость"}</h3>
                          {review.is_verified && (
                            <span className="text-green-500 text-sm" title="Верифицированный отзыв">
                              ✓
                            </span>
                          )}
                        </div>
                        {review.reason && <p className="text-sm text-gray-600 mb-2">Тема: {getReasonLabel(review.reason)}</p>}
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">{review.rating}/5</span>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString("ru-RU")}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button onClick={() => handleLike(review.id)} disabled={!isAuthenticated} className={`flex items-center gap-2 transition-colors ${isAuthenticated ? (review.is_liked_by_user ? "text-blue-600 hover:text-blue-800" : "text-gray-500 hover:text-blue-600") : "text-gray-300 cursor-not-allowed"}`} title={!isAuthenticated ? "Войдите в систему для оценки отзывов" : review.is_liked_by_user ? "Убрать лайк" : "Поставить лайк"}>
                        <span>{review.is_liked_by_user ? "👍" : "👍"}</span>
                        <span>{review.likes_count}</span>
                      </button>
                      {!isAuthenticated && <span className="text-xs text-gray-400">Войдите для оценки отзывов</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Форма добавления отзыва */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Оставить отзыв</h2>
              <div className="bg-gray-50 rounded-lg p-8">
                {!isAuthenticated ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Для отправки отзыва необходимо войти в систему</p>
                    <button onClick={() => router.push("/login")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Войти в систему
                    </button>
                  </div>
                ) : (
                  <Formik
                    initialValues={{
                      reason: "",
                      rating: 5,
                      comment: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmitReview}
                  >
                    {({ values, setFieldValue }) => (
                      <Form className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Тема отзыва</label>
                          <Field as="select" name="reason" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="">Выберите тему</option>
                            <option value="overall">Общее впечатление</option>
                            <option value="instructor">Инструкторы</option>
                            <option value="course">Курс обучения</option>
                            <option value="administration">Администрация</option>
                            <option value="facilities">Помещения</option>
                            <option value="vehicles">Автомобили</option>
                            <option value="pricing">Цены</option>
                            <option value="schedule">Расписание</option>
                            <option value="other">Другое</option>
                          </Field>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Оценка *</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} type="button" onClick={() => setFieldValue("rating", star)} className={`text-3xl ${star <= values.rating ? "text-yellow-500" : "text-gray-300"} hover:text-yellow-400 transition-colors`}>
                                ★
                              </button>
                            ))}
                            <span className="ml-2 text-gray-600">({values.rating}/5)</span>
                          </div>
                          <ErrorMessage name="rating" component="div" className="text-red-500 text-sm mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Отзыв *</label>
                          <Field as="textarea" name="comment" rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Поделитесь своим опытом обучения в нашей автошколе..." />
                          <ErrorMessage name="comment" component="div" className="text-red-500 text-sm mt-1" />
                        </div>

                        <div className="text-center">
                          <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {submitting ? "Отправка..." : "Отправить отзыв"}
                          </button>
                        </div>

                        <p className="text-sm text-gray-500 text-center">* Все отзывы проходят модерацию перед публикацией</p>
                      </Form>
                    )}
                  </Formik>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ReviewsPage;
