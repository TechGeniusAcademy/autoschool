import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/layout/Layout";
import TokenStorage from "../../../utils/tokenStorage";
import { Plus, Search, Filter, Book, Video, FileText, Tv, Award, Edit, Trash2, Eye, Clock, CheckCircle, XCircle } from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  type: "video" | "text" | "live" | "test";
  course_title: string;
  course_id: number;
  content?: string;
  video_url?: string;
  order_index: number;
  is_free: boolean;
  duration_minutes?: number;
  is_published: boolean;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const LessonsManagement: React.FC = () => {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
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
  const [typeFilter, setTypeFilter] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const fetchLessons = async (page = 1) => {
    try {
      setLoading(true);
      const token = TokenStorage.getToken();

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (typeFilter) params.append("type", typeFilter);
      if (publishedFilter) params.append("published", publishedFilter);
      if (courseFilter) params.append("course", courseFilter);

      const response = await fetch(`http://localhost:3001/api/lessons?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setLessons(data.data.lessons);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Ошибка при загрузке уроков");
      }
    } catch (error) {
      console.error("Ошибка при загрузке уроков:", error);
      setError("Ошибка при загрузке уроков");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [searchTerm, typeFilter, publishedFilter, courseFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLessons(1);
  };

  const handleDeleteLesson = async (lessonId: number, lessonTitle: string) => {
    try {
      const token = TokenStorage.getToken();
      const response = await fetch(`http://localhost:3001/api/lessons/${lessonId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchLessons(pagination.page);
        alert("Урок удален успешно");
      } else {
        alert(data.message || "Ошибка при удалении урока");
      }
    } catch (error) {
      console.error("Ошибка при удалении урока:", error);
      alert("Ошибка при удалении урока");
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5 text-blue-600" />;
      case "text":
        return <FileText className="w-5 h-5 text-green-600" />;
      case "live":
        return <Tv className="w-5 h-5 text-purple-600" />;
      case "test":
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <Book className="w-5 h-5 text-gray-600" />;
    }
  };

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Видео";
      case "text":
        return "Текст";
      case "live":
        return "Прямой эфир";
      case "test":
        return "Тест";
      default:
        return type;
    }
  };

  const getLessonTypeBadgeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-blue-100 text-blue-800";
      case "text":
        return "bg-green-100 text-green-800";
      case "live":
        return "bg-purple-100 text-purple-800";
      case "test":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && lessons.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка уроков...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Управление уроками</h1>
                <p className="mt-2 text-gray-600">Создавайте и управляйте уроками для курсов</p>
              </div>
              <button onClick={() => router.push("/admin/lessons/create")} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
                <Plus className="w-5 h-5" />
                Создать урок
              </button>
            </div>
          </div>

          {/* Фильтры */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Название урока..." className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тип</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500">
                  <option value="">Все типы</option>
                  <option value="video">Видео</option>
                  <option value="text">Текст</option>
                  <option value="live">Прямой эфир</option>
                  <option value="test">Тест</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                <select value={publishedFilter} onChange={(e) => setPublishedFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500">
                  <option value="">Все статусы</option>
                  <option value="true">Опубликованные</option>
                  <option value="false">Черновики</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Курс</label>
                <input type="text" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} placeholder="Название курса..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500" />
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

          {/* Список уроков */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {lessons.length === 0 ? (
              <div className="text-center py-12">
                <Book className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Уроки не найдены</h3>
                <p className="mt-1 text-sm text-gray-500">Начните с создания нового урока</p>
                <div className="mt-6">
                  <button onClick={() => router.push("/admin/lessons/create")} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                    Создать урок
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Урок</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Курс</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Порядок</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Создан</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lessons.map((lesson) => (
                      <tr key={lesson.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-4">{getLessonIcon(lesson.type)}</div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                              <div className="flex items-center gap-2 mt-1">
                                {lesson.duration_minutes && (
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration_minutes} мин
                                  </div>
                                )}
                                {lesson.is_free && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Бесплатно</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLessonTypeBadgeColor(lesson.type)}`}>{getLessonTypeLabel(lesson.type)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{lesson.course_title}</div>
                          <div className="text-sm text-gray-500">ID: {lesson.course_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">{lesson.order_index}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {lesson.is_published ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Опубликован</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-400">
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm">Черновик</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(lesson.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button onClick={() => router.push(`/admin/lessons/${lesson.id}`)} className="text-blue-600 hover:text-blue-700 p-1 rounded" title="Просмотр">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => router.push(`/admin/lessons/${lesson.id}/edit`)} className="text-green-600 hover:text-green-700 p-1 rounded" title="Редактировать">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteLesson(lesson.id, lesson.title)} className="text-red-600 hover:text-red-700 p-1 rounded" title="Удалить">
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
                    <button onClick={() => fetchLessons(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                      Предыдущая
                    </button>
                    <button onClick={() => fetchLessons(Math.min(pagination.pages, pagination.page + 1))} disabled={pagination.page === pagination.pages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
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
                        <button onClick={() => fetchLessons(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                          Предыдущая
                        </button>
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                          <button key={page} onClick={() => fetchLessons(page)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pagination.page ? "z-10 bg-red-50 border-red-500 text-red-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
                            {page}
                          </button>
                        ))}
                        <button onClick={() => fetchLessons(Math.min(pagination.pages, pagination.page + 1))} disabled={pagination.page === pagination.pages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
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

export default LessonsManagement;
