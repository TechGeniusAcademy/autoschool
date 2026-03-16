import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/layout/Layout";
import TokenStorage from "../../../utils/tokenStorage";
import { Plus, Search, Filter, Book, Users, Clock, Edit, Trash2, Eye } from "lucide-react";

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
  is_active: boolean;
  lessons_count: number;
  students_count: number;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const CoursesManagement: React.FC = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Фильтры
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  const fetchCourses = async (page = 1) => {
    try {
      setLoading(true);
      const token = TokenStorage.getToken();

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (categoryFilter) params.append("category", categoryFilter);
      if (difficultyFilter) params.append("difficulty", difficultyFilter);

      const response = await fetch(`http://localhost:3001/api/courses?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

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

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, categoryFilter, difficultyFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses(1);
  };

  const handleDeleteCourse = async (courseId: number, courseTitle: string) => {
    try {
      const token = TokenStorage.getToken();
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchCourses(pagination.page);
        alert("Курс удален успешно");
      } else {
        alert(data.message || "Ошибка при удалении курса");
      }
    } catch (error) {
      console.error("Ошибка при удалении курса:", error);
      alert("Ошибка при удалении курса");
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Управление курсами</h1>
                <p className="mt-2 text-gray-600">Создавайте и управляйте курсами автошколы</p>
              </div>
              <button onClick={() => router.push("/admin/courses/create")} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
                <Plus className="w-5 h-5" />
                Создать курс
              </button>
            </div>
          </div>

          {/* Фильтры */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

              <div className="flex items-end">
                <button type="submit" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Filter className="w-5 h-5" />
                  Применить
                </button>
              </div>
            </form>
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Список курсов */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <Book className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Курсы не найдены</h3>
                <p className="mt-1 text-sm text-gray-500">Начните с создания нового курса</p>
                <div className="mt-6">
                  <button onClick={() => router.push("/admin/courses/create")} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                    Создать курс
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Курс</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сложность</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статистика</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Инструктор</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {course.featured_image && <img className="h-10 w-10 rounded-lg object-cover mr-4" src={course.featured_image} alt={course.title} />}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{course.title}</div>
                              {course.short_description && <div className="text-sm text-gray-500 max-w-xs truncate">{course.short_description}</div>}
                              <div className="text-xs text-gray-400">{course.price > 0 ? `${course.price} ₸` : "Бесплатно"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>{getDifficultyLabel(course.difficulty)}</span>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {course.duration_weeks} нед.
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center">
                              <Book className="w-4 h-4 text-gray-400 mr-1" />
                              <span>{course.lessons_count}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 text-gray-400 mr-1" />
                              <span>{course.students_count}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.instructor_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${course.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{course.is_active ? "Активен" : "Неактивен"}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button onClick={() => router.push(`/admin/courses/${course.id}`)} className="text-blue-600 hover:text-blue-700 p-1 rounded" title="Просмотр">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => router.push(`/admin/courses/${course.id}/edit`)} className="text-green-600 hover:text-green-700 p-1 rounded" title="Редактировать">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => router.push(`/admin/courses/${course.id}/assign-students`)} className="text-blue-600 hover:text-blue-700 p-1 rounded" title="Назначить студентов">
                              <Users className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteCourse(course.id, course.title)} className="text-red-600 hover:text-red-700 p-1 rounded" title="Удалить">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Пагинация */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button onClick={() => fetchCourses(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                      Предыдущая
                    </button>
                    <button onClick={() => fetchCourses(Math.min(pagination.pages, pagination.page + 1))} disabled={pagination.page === pagination.pages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                      Следующая
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Показано <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> до <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> из <span className="font-medium">{pagination.total}</span> результатов
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button onClick={() => fetchCourses(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                          Предыдущая
                        </button>
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                          <button key={page} onClick={() => fetchCourses(page)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pagination.page ? "z-10 bg-red-50 border-red-500 text-red-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
                            {page}
                          </button>
                        ))}
                        <button onClick={() => fetchCourses(Math.min(pagination.pages, pagination.page + 1))} disabled={pagination.page === pagination.pages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                          Следующая
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoursesManagement;
