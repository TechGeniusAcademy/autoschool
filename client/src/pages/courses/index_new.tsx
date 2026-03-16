import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import TokenStorage from "../../utils/tokenStorage";
import { Book, Clock, Users, Star, Search, Filter, Play, Award, CheckCircle, ArrowRight } from "lucide-react";

interface Course {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  featured_image?: string;
  price: number;
  instructor_name: string;
  category?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration_weeks: number;
  lessons_count: number;
  students_count: number;
  rating?: number;
  is_enrolled?: boolean;
  progress_percentage?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const CoursesPage: React.FC = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Фильтры
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, categoryFilter, difficultyFilter, priceFilter]);

  const fetchCourses = async (page = 1) => {
    try {
      setLoading(true);
      const token = TokenStorage.getToken();

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        include_enrollment: "true",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (categoryFilter) params.append("category", categoryFilter);
      if (difficultyFilter) params.append("difficulty", difficultyFilter);
      if (priceFilter) params.append("price", priceFilter);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3001/api/courses?${params}`, { headers });
      const data = await response.json();

      if (data.success) {
        setCourses(data.data.courses);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Ошибка при загрузке курсов");
      }
    } catch (error) {
      console.error("Ошибка при загрузке курсов:", error);
      setError("Ошибка при загрузке курсов");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async (courseId: number, courseTitle: string) => {
    if (!TokenStorage.isAuthenticated()) {
      router.push("/login");
      return;
    }

    try {
      const token = TokenStorage.getToken();
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        alert("Вы успешно записались на курс!");
        fetchCourses(pagination.page);
      } else {
        alert(data.message || "Ошибка при записи на курс");
      }
    } catch (error) {
      console.error("Ошибка при записи на курс:", error);
      alert("Ошибка при записи на курс");
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Начинающий";
      case "intermediate":
        return "Средний";
      case "advanced":
        return "Продвинутый";
      default:
        return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "theory":
        return "Теория";
      case "practice":
        return "Практика";
      case "exam":
        return "Экзамен";
      case "special":
        return "Специальный";
      default:
        return category;
    }
  };

  if (loading && courses.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка курсов...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Курсы автошколы</h1>
            <p className="mt-2 text-gray-600">Выберите курс для обучения вождению и подготовки к экзаменам</p>
          </div>

          {/* Фильтры */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Название курса..." className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500">
                  <option value="">Все категории</option>
                  <option value="theory">Теория</option>
                  <option value="practice">Практика</option>
                  <option value="exam">Экзамен</option>
                  <option value="special">Специальный</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Сложность</label>
                <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500">
                  <option value="">Все уровни</option>
                  <option value="beginner">Начинающий</option>
                  <option value="intermediate">Средний</option>
                  <option value="advanced">Продвинутый</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Цена</label>
                <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500">
                  <option value="">Все цены</option>
                  <option value="free">Бесплатные</option>
                  <option value="paid">Платные</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("");
                    setDifficultyFilter("");
                    setPriceFilter("");
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  Сбросить
                </button>
              </div>
            </div>
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Сетка курсов */}
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <Book className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Курсы не найдены</h3>
              <p className="mt-1 text-sm text-gray-500">Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {course.featured_image && <img src={course.featured_image} alt={course.title} className="w-full h-48 object-cover" />}

                    <div className="p-6">
                      {/* Заголовок и бейджи */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>{getDifficultyLabel(course.difficulty)}</span>
                          {course.category && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">{getCategoryLabel(course.category)}</span>}
                          {course.is_enrolled && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Записан
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>

                        {course.short_description && <p className="text-gray-600 text-sm">{course.short_description}</p>}
                      </div>

                      {/* Прогресс для записанных курсов */}
                      {course.is_enrolled && course.progress_percentage !== undefined && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Прогресс</span>
                            <span className="font-medium text-gray-900">{course.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${course.progress_percentage}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Информация о курсе */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Book className="w-4 h-4" />
                            <span>{course.lessons_count} уроков</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration_weeks} нед.</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{course.students_count} студентов</span>
                          </div>
                          {course.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{course.rating}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-500">Инструктор: {course.instructor_name}</p>
                      </div>

                      {/* Цена */}
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-red-600">{course.price > 0 ? `${course.price} ₸` : "Бесплатно"}</span>
                      </div>

                      {/* Действия */}
                      <div className="space-y-2">
                        {course.is_enrolled ? (
                          <div className="space-y-2">
                            <button onClick={() => router.push(`/courses/${course.slug}`)} className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                              <Play className="w-4 h-4" />
                              Продолжить обучение
                            </button>
                            {course.progress_percentage !== undefined && course.progress_percentage === 100 && (
                              <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
                                <Award className="w-4 h-4" />
                                Курс завершен
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <button onClick={() => router.push(`/courses/${course.slug}`)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                              Подробнее
                            </button>
                            <button onClick={() => handleEnrollment(course.id, course.title)} className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                              Записаться на курс
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Пагинация */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => fetchCourses(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                    Предыдущая
                  </button>

                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => fetchCourses(page)} className={`px-4 py-2 border rounded-lg text-sm font-medium ${page === pagination.page ? "bg-red-600 border-red-600 text-white" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"}`}>
                      {page}
                    </button>
                  ))}

                  <button onClick={() => fetchCourses(Math.min(pagination.pages, pagination.page + 1))} disabled={pagination.page === pagination.pages} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                    Следующая
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CoursesPage;
