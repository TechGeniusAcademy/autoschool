import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Image from "next/image";
import { FaStar, FaThumbsUp, FaComment, FaFilter, FaSortAmountDown, FaUser, FaCheckCircle } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { API_BASE_URL, SERVER_URL } from "@/constants/api";

interface Review {
  id: number;
  user_id: number;
  course_id?: number;
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
  course_title?: string;
  avatar_url?: string;
}

interface Course {
  id: number;
  title: string;
}

const ReviewsPage: React.FC = () => {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest" | "likes">("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    verified: 0,
    fiveStars: 0,
  });

  // Загрузка отзывов
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("sort", sortOrder);
      if (filterRating) {
        params.append("rating", filterRating.toString());
      }

      const response = await fetch(`${API_BASE_URL}/reviews/public?${params.toString()}`);
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

  // Загрузка курсов для формы
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      const data = await response.json();

      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchCourses();
  }, [sortOrder, filterRating]);

  // Валидация формы
  const validationSchema = Yup.object({
    name: Yup.string().min(2, "Имя должно содержать минимум 2 символа").max(50, "Имя должно содержать максимум 50 символов").required("Имя обязательно"),
    email: Yup.string().email("Неверный формат email").required("Email обязателен"),
    phone: Yup.string().matches(/^[+]?[0-9\s\-\(\)]+$/, "Неверный формат телефона"),
    course: Yup.string(),
    rating: Yup.number().min(1, "Минимальная оценка 1").max(5, "Максимальная оценка 5").required("Оценка обязательна"),
    comment: Yup.string().min(10, "Отзыв должен содержать минимум 10 символов").max(1000, "Отзыв должен содержать максимум 1000 символов").required("Отзыв обязателен"),
  });

  // Отправка нового отзыва
  const handleSubmitReview = async (values: any, { resetForm }: any) => {
    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/reviews/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author_name: values.name,
          author_email: values.email,
          author_phone: values.phone,
          course_id: values.course || null,
          rating: values.rating,
          comment: values.comment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        resetForm();
        alert("Отзыв успешно отправлен на модерацию!");
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
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ increment: true }),
      });

      const data = await response.json();

      if (data.success) {
        setReviews((prevReviews) => prevReviews.map((review) => (review.id === reviewId ? { ...review, likes_count: data.data.likes_count } : review)));
      }
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  // Функция для отображения звезд
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => <FaStar key={index} className={`${index < rating ? "text-yellow-400" : "text-gray-300"} text-sm`} />);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Отзывы наших учеников</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">Узнайте, что думают наши выпускники о качестве обучения в нашей автошколе</p>
          </div>
        </section>

        {/* Статистика */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
                <div className="text-gray-600">Всего отзывов</div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.averageRating.toFixed(1)}</div>
                <div className="text-gray-600">Средняя оценка</div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.verified}</div>
                <div className="text-gray-600">Верифицированных</div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.fiveStars}</div>
                <div className="text-gray-600">5-звездочных отзывов</div>
              </div>
            </div>
          </div>
        </section>

        {/* Фильтры и сортировка */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800">{reviews.length} отзывов</h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Фильтр по рейтингу */}
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-500" />
                  <select value={filterRating || ""} onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Все оценки</option>
                    <option value="5">5 звезд</option>
                    <option value="4">4 звезды</option>
                    <option value="3">3 звезды</option>
                    <option value="2">2 звезды</option>
                    <option value="1">1 звезда</option>
                  </select>
                </div>

                {/* Сортировка */}
                <div className="flex items-center gap-2">
                  <FaSortAmountDown className="text-gray-500" />
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
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">{review.avatar_url ? <Image src={`${SERVER_URL}${review.avatar_url}`} alt={review.author_name} width={48} height={48} className="rounded-full object-cover" /> : <FaUser className="text-gray-500" />}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800">{review.author_name}</h3>
                          {review.is_verified && <FaCheckCircle className="text-green-500 text-sm" title="Верифицированный отзыв" />}
                        </div>
                        {review.course_title && <p className="text-sm text-gray-600 mb-2">Курс: {review.course_title}</p>}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">{review.rating}/5</span>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString("ru-RU")}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button onClick={() => handleLike(review.id)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                        <FaThumbsUp />
                        <span>{review.likes_count}</span>
                      </button>
                      {review.replies_count > 0 && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <FaComment />
                          <span>{review.replies_count} ответов</span>
                        </div>
                      )}
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
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Оставить отзыв</h2>
                <p className="text-gray-600">Поделитесь своим опытом обучения в нашей автошколе</p>
              </div>

              <Formik
                initialValues={{
                  name: "",
                  email: "",
                  phone: "",
                  course: "",
                  rating: 5,
                  comment: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmitReview}
              >
                {({ values, setFieldValue }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
                        <Field type="text" name="name" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ваше имя" />
                        <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <Field type="email" name="email" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your@email.com" />
                        <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                        <Field type="tel" name="phone" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+7 (999) 123-45-67" />
                        <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Курс</label>
                        <Field as="select" name="course" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="">Выберите курс</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.title}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="course" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Оценка *</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setFieldValue("rating", star)} className={`text-2xl ${star <= values.rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 transition-colors`}>
                            <FaStar />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{values.rating}/5</span>
                      </div>
                      <ErrorMessage name="rating" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Отзыв *</label>
                      <Field as="textarea" name="comment" rows={5} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical" placeholder="Расскажите о своем опыте обучения..." />
                      <ErrorMessage name="comment" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="text-center">
                      <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {submitting ? "Отправка..." : "Отправить отзыв"}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ReviewsPage;
