import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import TokenStorage from "../../utils/tokenStorage";
import { Book, Play, Clock, Award, TrendingUp, Calendar, CheckCircle, Users, Star, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/constants/api";

interface EnrolledCourse {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  featured_image?: string;
  instructor_name: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  next_lesson_id?: number;
  next_lesson_title?: string;
  enrollment_date: string;
  last_activity?: string;
}

interface RecentActivity {
  id: number;
  type: "lesson_completed" | "test_passed" | "course_enrolled";
  title: string;
  course_title: string;
  date: string;
  score?: number;
}

interface UpcomingLesson {
  id: number;
  title: string;
  course_title: string;
  type: "video" | "text" | "live" | "test";
  duration_minutes?: number;
  scheduled_date?: string;
}

const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = TokenStorage.getToken();

      const [coursesResponse, activityResponse, lessonsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/student/enrolled`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/students/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/students/upcoming-lessons`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [coursesData, activityData, lessonsData] = await Promise.all([coursesResponse.json(), activityResponse.json(), lessonsResponse.json()]);

      if (coursesData.success) {
        setEnrolledCourses(coursesData.data);
      }

      if (activityData.success) {
        setRecentActivity(activityData.data);
      }

      if (lessonsData.success) {
        setUpcomingLessons(lessonsData.data);
      }
    } catch (error) {
      console.error("Ошибка при загрузке дашборда:", error);
      setError("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lesson_completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "test_passed":
        return <Award className="w-5 h-5 text-yellow-600" />;
      case "course_enrolled":
        return <Book className="w-5 h-5 text-blue-600" />;
      default:
        return <Book className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "lesson_completed":
        return "Урок завершен";
      case "test_passed":
        return "Тест пройден";
      case "course_enrolled":
        return "Курс начат";
      default:
        return type;
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-4 h-4" />;
      case "text":
        return <Book className="w-4 h-4" />;
      case "live":
        return <Users className="w-4 h-4" />;
      case "test":
        return <Award className="w-4 h-4" />;
      default:
        return <Book className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const totalProgress = enrolledCourses.length > 0 ? enrolledCourses.reduce((sum, course) => sum + course.progress_percentage, 0) / enrolledCourses.length : 0;

  const totalCompletedLessons = enrolledCourses.reduce((sum, course) => sum + course.completed_lessons, 0);
  const totalLessons = enrolledCourses.reduce((sum, course) => sum + course.total_lessons, 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Личный кабинет</h1>
            <p className="mt-2 text-gray-600">Добро пожаловать обратно! Продолжите обучение там, где остановились.</p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Book className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Активных курсов</p>
                  <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Уроков завершено</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCompletedLessons}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Общий прогресс</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(totalProgress)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Предстоящих уроков</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingLessons.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Мои курсы */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Мои курсы</h2>
                <button onClick={() => router.push("/courses")} className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                  Все курсы
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {enrolledCourses.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Book className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">У вас пока нет курсов</h3>
                  <p className="mt-1 text-sm text-gray-500">Начните обучение, записавшись на курс</p>
                  <div className="mt-6">
                    <button onClick={() => router.push("/courses")} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                      Выбрать курс
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            {course.featured_image && <img src={course.featured_image} alt={course.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>{getDifficultyLabel(course.difficulty)}</span>
                              </div>

                              {course.short_description && <p className="text-gray-600 text-sm mb-3">{course.short_description}</p>}

                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <span>Инструктор: {course.instructor_name}</span>
                                <span>•</span>
                                <span>Начат: {formatDate(course.enrollment_date)}</span>
                              </div>

                              {/* Прогресс */}
                              <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Прогресс</span>
                                  <span className="font-medium text-gray-900">
                                    {course.completed_lessons} из {course.total_lessons} уроков ({course.progress_percentage}%)
                                  </span>
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

                              {/* Следующий урок */}
                              {course.next_lesson_id && (
                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                  <p className="text-sm font-medium text-gray-900 mb-1">Следующий урок:</p>
                                  <p className="text-sm text-gray-600">{course.next_lesson_title}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                          <button onClick={() => router.push(`/courses/${course.slug}`)} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Продолжить обучение
                          </button>
                          {course.next_lesson_id && (
                            <button onClick={() => router.push(`/lessons/${course.next_lesson_id}`)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                              <Play className="w-4 h-4" />
                              Следующий урок
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Боковая панель */}
            <div className="space-y-6">
              {/* Предстоящие уроки */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Предстоящие уроки</h3>

                {upcomingLessons.length === 0 ? (
                  <p className="text-gray-500 text-sm">Нет запланированных уроков</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingLessons.slice(0, 5).map((lesson) => (
                      <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-gray-400">{getLessonIcon(lesson.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                          <p className="text-xs text-gray-500">{lesson.course_title}</p>
                          {lesson.scheduled_date && <p className="text-xs text-gray-400">{formatTime(lesson.scheduled_date)}</p>}
                        </div>
                        {lesson.duration_minutes && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {lesson.duration_minutes}м
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Недавняя активность */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Недавняя активность</h3>

                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-sm">Пока нет активности</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{getActivityLabel(activity.type)}</p>
                          <p className="text-sm text-gray-600">{activity.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.course_title} • {formatDate(activity.date)}
                          </p>
                          {activity.score && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-gray-600">Результат: {activity.score}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {recentActivity.length > 5 && <button className="w-full mt-4 text-sm text-red-600 hover:text-red-700 font-medium">Показать все</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
