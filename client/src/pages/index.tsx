import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import Image from "next/image";
import { FaCar, FaGraduationCap, FaUsers, FaCheck, FaPhone, FaMapMarkerAlt, FaClock, FaShieldAlt, FaWhatsapp, FaTimes } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";
import { API_BASE_URL, SERVER_URL } from "@/constants/api";

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

interface Course {
  id: number;
  title: string;
  description: string;
  slug: string;
  category: string;
  difficulty: string;
  price: number;
  duration_weeks: number;
  lessons_count: number;
  students_count: number;
  instructor_name: string;
  featured_image?: string;
  rating?: number;
  is_enrolled?: boolean;
  progress_percentage?: number;
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

export default function Home() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log("Fetching reviews from API...");
        const params = new URLSearchParams();
        params.append("sort", "highest"); // Сортируем по наивысшему рейтингу
        params.append("rating", "5"); // Фильтруем только 5-звездочные отзывы

        const url = `${API_BASE_URL}/reviews/public?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          console.log("Reviews received:", data.data.reviews);
          // Берем первые 3 отзыва с 5 звездами
          const fiveStarReviews = data.data.reviews.slice(0, 3);
          console.log("Filtered 5-star reviews:", fiveStarReviews);
          setReviews(fiveStarReviews);
        } else {
          console.log("API returned success: false");
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCourses = async () => {
      try {
        console.log("Fetching courses from API...");
        const response = await fetch(`${API_BASE_URL}/courses/public?limit=8`);
        const data = await response.json();

        if (data.success) {
          console.log("Courses received:", data.data.courses);
          setCourses(data.data.courses.slice(0, 8)); // Берем первые 8 курсов
        } else {
          console.log("API returned success: false for courses");
          setCourses([]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchReviews();
    fetchCourses();
  }, []);

  // Функция для получения цвета фона категории
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      A1: "bg-pink-500",
      A: "bg-red-600",
      B: "bg-blue-600",
      BC1: "bg-teal-600",
      C1: "bg-green-500",
      C: "bg-yellow-500",
      D: "bg-purple-600",
      theory: "bg-blue-500",
      practice: "bg-green-500",
      exam: "bg-orange-500",
      special: "bg-purple-500",
    };
    return colors[category] || "bg-gray-600";
  };

  // Функция для получения переведенного названия категории
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "theory":
        return t("theory");
      case "practice":
        return t("practice");
      case "exam":
        return t("exam");
      case "special":
        return t("special");
      default:
        return category.toUpperCase();
    }
  };

  // Группировка курсов по категориям
  const groupedCourses = courses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = [];
    }
    acc[course.category].push(course);
    return acc;
  }, {} as Record<string, Course[]>);
  return (
    <Layout title={t("page_title")} description={t("page_description")}>
      {/* Hero секция */}
      <section className="relative bg-gray-900 text-white py-20">
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-gray-900 to-primary-900"></div>
        <div className="container-fluid relative z-10 py-12 md:py-20">
          <div className="max-w-2xl">
            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4 inline-block">{t("enrollment_announcement")}</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("hero_title")}</h1>
            <p className="text-xl mb-8 text-gray-300">{t("hero_subtitle")}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/courses" className="btn btn-primary text-lg px-8 py-3 rounded-lg">
                {t("choose_course")}
              </Link>
              <button onClick={() => setIsContactModalOpen(true)} className="btn btn-outline text-lg px-8 py-3 rounded-lg border-2">
                {t("contact_us")}
              </button>
            </div>
            <div className="mt-12 bg-gray-800/80 rounded-lg p-4 shadow-lg">
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex items-center">
                  <FaPhone className="text-red-500 mr-3" />
                  <div>
                    <p className="text-gray-400 text-sm">{t("phone")}</p>
                    <p className="font-medium">+7 (707) 929-11-21</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-red-500 mr-3" />
                  <div>
                    <p className="text-gray-400 text-sm">{t("address")}</p>
                    <p className="font-medium">{t("our_address")}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaClock className="text-red-500 mr-3" />
                  <div>
                    <p className="text-gray-400 text-sm">{t("working_hours")}</p>
                    <p className="font-medium">{t("work_schedule")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-16 bg-white">
        <div className="container-fluid">
          <div className="text-center mb-12">
            <span className="text-red-600 font-medium">{t("why_choose_us")}</span>
            <h2 className="text-3xl font-bold mb-4">{t("advantages_title")}</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">{t("advantages_description")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="bg-red-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <FaCar className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t("course_first_header")}</h3>
              <p className="text-gray-600">{t("course_first_description")}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="bg-red-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <FaGraduationCap className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t("course_second_header")}</h3>
              <p className="text-gray-600">{t("course_second_description")}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="bg-red-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <FaUsers className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t("course_third_header")}</h3>
              <p className="text-gray-600">{t("course_third_description")}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="bg-red-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <FaCheck className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t("course_four_header")}</h3>
              <p className="text-gray-600">{t("course_four_description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Категории */}
      <section className="py-16 bg-gray-50">
        <div className="container-fluid">
          <div className="text-center mb-12">
            <span className="text-red-600 font-medium">{t("our_programs")}</span>
            <h2 className="text-3xl font-bold mb-4">{t("course_categories")}</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">{t("quality_training_description")}</p>
          </div>

          {coursesLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.entries(groupedCourses)
                .slice(0, 8)
                .map(([category, categoryCourses]) => {
                  const course = categoryCourses[0]; // Берем первый курс из категории
                  const minPrice = Math.min(...categoryCourses.map((c) => c.price));

                  return (
                    <div key={category} className="relative group overflow-hidden rounded-lg shadow-sm">
                      <div className={`aspect-w-16 aspect-h-9 w-full relative ${getCategoryColor(category)}`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">{getCategoryLabel(category)}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-xl font-bold mb-1">
                          {t("category")} {getCategoryLabel(category)}
                        </h3>
                        <p className="text-sm mb-3">{categoryCourses.length === 1 ? course.title : `${categoryCourses.length} ${t("courses_available")}`}</p>
                        <Link href={`/courses?category=${category}`} className="inline-block bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition">
                          {minPrice > 0 ? `${t("От")} ${minPrice.toLocaleString()} ₸` : t("Бесплатно")}
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/courses" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
              {t("all_courses")}
            </Link>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container-fluid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">15</div>
              <p className="text-xl">{t("years_experience")}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">12</div>
              <p className="text-xl">{t("stats_instructors")}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">15 000+</div>
              <p className="text-xl">{t("graduates")}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">97%</div>
              <p className="text-xl">{t("first_time_pass_rate")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Отзывы */}
      <section className="py-16 bg-white">
        <div className="container-fluid">
          <div className="text-center mb-12">
            <span className="text-red-600 font-medium">{t("reviews_header_first")}</span>
            <h2 className="text-3xl font-bold mb-4">{t("reviews_main_first")}</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">{t("reviews_footer_first")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              // Skeleton для загрузки
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-300 mr-3"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              ))
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">{review.avatar_url ? <img src={`${SERVER_URL}${review.avatar_url}`} alt={review.display_name || review.author_name || "Пользователь"} className="w-12 h-12 rounded-full object-cover" /> : <span className="text-gray-500 text-xl">👤</span>}</div>
                    <div>
                      <h4 className="font-bold text-lg">{review.display_name || review.author_name || "Анонимный пользователь"}</h4>
                      <p className="text-gray-600 text-sm">
                        {getReasonLabel(review.reason || "general")}, {new Date(review.created_at).toLocaleDateString("ru-RU", { year: "numeric", month: "long" })}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">"{review.comment}"</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">Отзывы временно недоступны</div>
            )}
          </div>

          <div className="text-center mt-10">
            <Link href="/reviews" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
              Больше отзывов
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold mb-2">{t("reviews_call_first")}</h2>
              <p className="text-white/90">{t("consultation_call_to_action_free")}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses" className="bg-white text-red-600 hover:bg-gray-100 py-3 px-6 rounded-lg font-bold transition">
                {t("button_choose_course")}
              </Link>
              <a href="tel:+77079291121" className="border-2 border-white text-white hover:bg-white/10 py-3 px-6 rounded-lg font-bold flex items-center justify-center transition">
                <FaPhone className="mr-2" />
                {t("button_call_action")}
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Модальное окно контактов */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setIsContactModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsContactModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
              <FaTimes className="text-xl" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t("contact_us")}</h3>
            <p className="text-gray-500 text-center mb-6 text-sm">{t("choose_contact_method")}</p>
            <div className="flex flex-col gap-4">
              <a
                href="tel:+77079291121"
                className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition text-lg"
              >
                <FaPhone className="text-xl" />
                +7 (707) 929-11-21
              </a>
              <a
                href="https://wa.me/77079291121"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition text-lg"
              >
                <FaWhatsapp className="text-2xl" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
