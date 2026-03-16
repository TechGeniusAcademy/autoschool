import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/layout/Layout";
import TokenStorage from "../../../utils/tokenStorage";
import { ArrowLeft, Edit, Trash2, Plus, Book, Users, Clock, Award, Play, FileText, Video, Tv, CheckCircle, XCircle, Eye } from "lucide-react";

interface Course {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  description: string;
  featured_image?: string;
  price: number;
  instructor_name: string;
  category?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration_weeks: number;
  is_active: boolean;
  prerequisites?: string;
  learning_outcomes?: string;
  created_at: string;
  updated_at: string;
}

interface Lesson {
  id: number;
  title: string;
  type: "video" | "text" | "live" | "test";
  content?: string;
  video_url?: string;
  order_index: number;
  is_free: boolean;
  duration_minutes?: number;
  is_published: boolean;
  created_at: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  enrollment_date: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
}

const CourseDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "lessons" | "students">("overview");

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const token = TokenStorage.getToken();

      // Загружаем данные курса
      const [courseResponse, lessonsResponse, studentsResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:3001/api/lessons/course/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:3001/api/courses/${id}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [courseData, lessonsData, studentsData] = await Promise.all([courseResponse.json(), lessonsResponse.json(), studentsResponse.json()]);

      if (courseData.success) {
        setCourse(courseData.data);
      } else {
        setError(courseData.message || "Курс не найден");
      }

      if (lessonsData.success) {
        setLessons(lessonsData.data);
      }

      if (studentsData.success) {
        setStudents(studentsData.data);
      }
    } catch (error) {
      console.error("Ошибка при загрузке курса:", error);
      setError("Ошибка при загрузке курса");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) {
      return;
    }

    try {
      const token = TokenStorage.getToken();
      const response = await fetch(`http://localhost:3001/api/courses/${course.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        alert("Курс удален успешно");
        router.push("/admin/courses");
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

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "text":
        return <FileText className="w-5 h-5" />;
      case "live":
        return <Tv className="w-5 h-5" />;
      case "test":
        return <Award className="w-5 h-5" />;
      default:
        return <Book className="w-5 h-5" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка курса...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !course) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Ошибка</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <div className="mt-6">
                <button onClick={() => router.push("/admin/courses")} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                  Вернуться к курсам
                </button>
              </div>
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
              <div className="flex items-center gap-4">
                <button onClick={() => router.push("/admin/courses")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                  <p className="mt-2 text-gray-600">
                    Создан {formatDate(course.created_at)} • Инструктор: {course.instructor_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => router.push(`/admin/courses/${course.id}/assign-students`)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Назначить студентов
                </button>
                <button onClick={() => router.push(`/admin/courses/${course.id}/edit`)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Редактировать
                </button>
                <button onClick={handleDeleteCourse} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Удалить
                </button>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Book className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Уроков</p>
                  <p className="text-2xl font-bold text-gray-900">{lessons.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Студентов</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Длительность</p>
                  <p className="text-2xl font-bold text-gray-900">{course.duration_weeks} нед.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Цена</p>
                  <p className="text-2xl font-bold text-gray-900">{course.price > 0 ? `${course.price} ₸` : "Бесплатно"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Табы */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button onClick={() => setActiveTab("overview")} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "overview" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                Обзор
              </button>
              <button onClick={() => setActiveTab("lessons")} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "lessons" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                Уроки ({lessons.length})
              </button>
              <button onClick={() => setActiveTab("students")} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "students" ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                Студенты ({students.length})
              </button>
            </nav>
          </div>

          {/* Содержимое табов */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Описание курса</h3>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line text-gray-600">{course.description}</div>
                  </div>
                </div>

                {course.learning_outcomes && (
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Результаты обучения</h3>
                    <div className="whitespace-pre-line text-gray-600">{course.learning_outcomes}</div>
                  </div>
                )}

                {course.prerequisites && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Предварительные требования</h3>
                    <div className="whitespace-pre-line text-gray-600">{course.prerequisites}</div>
                  </div>
                )}
              </div>

              <div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {course.featured_image && <img src={course.featured_image} alt={course.title} className="w-full h-48 object-cover rounded-lg mb-6" />}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Категория:</span>
                      <span className="text-sm text-gray-900">{course.category || "Не указана"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Сложность:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>{getDifficultyLabel(course.difficulty)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Статус:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${course.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{course.is_active ? "Активен" : "Неактивен"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Обновлен:</span>
                      <span className="text-sm text-gray-900">{formatDate(course.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "lessons" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Уроки курса ({lessons.length})</h3>
                <button onClick={() => router.push(`/admin/lessons/create?course=${course.id}`)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Добавить урок
                </button>
              </div>

              {lessons.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Book className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Уроки не найдены</h3>
                  <p className="mt-1 text-sm text-gray-500">Начните с создания первого урока</p>
                  <div className="mt-6">
                    <button onClick={() => router.push(`/admin/lessons/create?course=${course.id}`)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                      Создать урок
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {lessons.map((lesson, index) => (
                      <div key={lesson.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">{lesson.order_index}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-gray-400">{getLessonIcon(lesson.type)}</div>
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">{lesson.title}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm text-gray-500">{getLessonTypeLabel(lesson.type)}</span>
                                  {lesson.duration_minutes && (
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {lesson.duration_minutes} мин
                                    </span>
                                  )}
                                  {lesson.is_free && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Бесплатно</span>}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              {lesson.is_published ? (
                                <div title="Опубликован">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                              ) : (
                                <div title="Черновик">
                                  <XCircle className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <button onClick={() => router.push(`/admin/lessons/${lesson.id}`)} className="text-blue-600 hover:text-blue-700 p-1 rounded" title="Просмотр">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => router.push(`/admin/lessons/${lesson.id}/edit`)} className="text-green-600 hover:text-green-700 p-1 rounded" title="Редактировать">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "students" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Студенты курса ({students.length})</h3>
                <button onClick={() => router.push(`/admin/courses/${course.id}/assign-students`)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Назначить студентов
                </button>
              </div>

              {students.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Студенты не найдены</h3>
                  <p className="mt-1 text-sm text-gray-500">Назначьте студентов на этот курс</p>
                  <div className="mt-6">
                    <button onClick={() => router.push(`/admin/courses/${course.id}/assign-students`)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                      Назначить студентов
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Студент</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Прогресс</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Зачислен</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                                  <div
                                    className="bg-red-600 h-2 rounded-full"
                                    style={{
                                      width: `${student.progress_percentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-600">{student.progress_percentage}%</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {student.completed_lessons} из {student.total_lessons} уроков
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(student.enrollment_date)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => router.push(`/admin/students/${student.id}`)} className="text-blue-600 hover:text-blue-700">
                              Профиль
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetails;
