import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AvatarUpload from "@/components/common/AvatarUpload";
import AdminBlogManager from "@/components/AdminBlogManager";
import StudentCoursesComponent from "@/components/profile/StudentCoursesComponent";
import StudentGroup from "@/components/student/StudentGroup";
import StudentSchedule from "@/components/student/StudentSchedule";
import { AuthAPI, User, StudentAPI } from "../../services/api";
import { useLanguage } from "../../contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaCalendarAlt, FaClock, FaCarSide, FaGraduationCap, FaClipboardList, FaFileAlt, FaUserCog, FaSignOutAlt, FaBell, FaCheckCircle, FaCreditCard, FaBlog } from "react-icons/fa";

// Тип для представления навигационных вкладок
interface NavTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Тип для представления урока
interface Lesson {
  id: number;
  title: string;
  date: string;
  time: string;
  instructor: string;
  type: "Теория" | "Практика";
  status: "upcoming" | "completed" | "canceled";
}

// Тип для представления уведомления
interface Notification {
  id: number;
  text: string;
  date: string;
  read: boolean;
  type: "info" | "warning" | "success";
}

// Тип для представления прогресса курса
interface CourseProgress {
  id: number;
  title: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  examDate?: string;
}

const ProfilePage: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();
  // Состояние для активной вкладки
  const [activeTab, setActiveTab] = useState("dashboard");
  // Состояние для данных пользователя
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Состояния для данных дашборда студента
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Функция для загрузки данных дашборда студента
  const fetchStudentDashboard = async () => {
    if (!user || user.role !== "student") return;

    try {
      setDashboardLoading(true);

      // Параллельно загружаем все данные
      const [dashboardRes, lessonsRes, notificationsRes, coursesRes] = await Promise.all([StudentAPI.getDashboard(), StudentAPI.getUpcomingLessons(), StudentAPI.getNotifications(), StudentAPI.getCourses()]);

      if (dashboardRes.success) {
        setDashboardData(dashboardRes.data);
      }

      if (lessonsRes.success) {
        setUpcomingLessons(lessonsRes.data);
      }

      if (notificationsRes.success) {
        setNotifications(notificationsRes.data);
      }

      if (coursesRes.success && coursesRes.data.length > 0) {
        // Используем первый активный курс для отображения прогресса
        const activeCourse = coursesRes.data.find((course: any) => course.status === "active");
        if (activeCourse) {
          setCourseProgress({
            id: activeCourse.id,
            title: activeCourse.title,
            progress: activeCourse.progress,
            totalLessons: activeCourse.total_lessons,
            completedLessons: activeCourse.completed_lessons,
            examDate: activeCourse.exam_date || null,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching student dashboard data:", error);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Загрузка данных пользователя при монтировании компонента
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await AuthAPI.getProfile();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
          // Устанавливаем вкладку курсов по умолчанию для студентов
          if (response.data.user.role === "student") {
            setActiveTab("courses");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Загружаем данные дашборда когда пользователь загрузился и является студентом
  useEffect(() => {
    if (user && user.role === "student") {
      fetchStudentDashboard();
    }
  }, [user]);

  // Функция обновления аватарки
  const handleAvatarUpdate = (avatarUrl: string | null) => {
    if (user) {
      setUser({
        ...user,
        avatarUrl: avatarUrl || undefined,
      });
    }
  };

  // Навигационные вкладки
  const getNavTabs = (): NavTab[] => {
    const baseTabs: NavTab[] = [
      { id: "dashboard", label: t("dashboard"), icon: <FaUser /> },
      { id: "schedule", label: t("schedule"), icon: <FaCalendarAlt /> },
      // { id: "progress", label: t("my_progress"), icon: <FaGraduationCap /> },
      // { id: "materials", label: t("materials"), icon: <FaFileAlt /> },
      // { id: "tests", label: t("tests"), icon: <FaClipboardList /> },
      // { id: "settings", label: t("settings"), icon: <FaUserCog /> },
    ];

    // Добавляем вкладки в зависимости от роли
    if (user?.role === "student") {
      baseTabs.splice(2, 0, {
        id: "group",
        label: t("my_group"),
        icon: <FaUser />,
      });
      baseTabs.splice(-1, 0, {
        id: "courses",
        label: t("my_courses"),
        icon: <FaCarSide />,
      });
    }

    if (user?.role === "instructor") {
      baseTabs.splice(-1, 0, {
        id: "instructor-courses",
        label: t("my_courses"),
        icon: <FaCarSide />,
      });
    }

    // Добавляем вкладку блога для админов
    if (user?.role === "admin") {
      baseTabs.splice(-1, 0, { id: "blog", label: t("blog"), icon: <FaBlog /> });
    }

    return baseTabs;
  };

  const navTabs = getNavTabs();

  // Получение иконки для статуса занятия
  const getStatusIcon = (status: Lesson["status"]) => {
    switch (status) {
      case "upcoming":
        return <FaClock className="text-blue-500" />;
      case "completed":
        return <FaCheckCircle className="text-green-500" />;
      case "canceled":
        return <FaBell className="text-red-500" />;
      default:
        return null;
    }
  };

  // Получение цвета для типа уведомления
  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "bg-blue-50 border-blue-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "success":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  // Рендер содержимого в зависимости от активной вкладки
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Приветствие */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="mr-6 mb-4 md:mb-0">
                  <AvatarUpload user={user} onAvatarUpdate={handleAvatarUpdate} size="medium" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">{isLoading ? "Загрузка..." : user ? `Добро пожаловать, ${user.firstName}!` : "Добро пожаловать!"}</h2>
                  <p className="text-gray-600">{dashboardLoading ? "Загружаем данные..." : courseProgress ? `Ваш прогресс обучения: ${courseProgress.progress}% завершено` : dashboardData?.stats?.averageProgress ? `Средний прогресс: ${dashboardData.stats.averageProgress}% завершено` : "Начните изучение курсов!"}</p>
                </div>
              </div>
            </div>

            {/* Краткая сводка */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="flex items-center mb-3">
                  <FaCalendarAlt className="text-red-600 text-xl mr-3" />
                  <h3 className="font-bold">Следующее занятие</h3>
                </div>
                {dashboardLoading ? (
                  <p className="text-gray-600">Загружаем данные...</p>
                ) : dashboardData?.nextLesson ? (
                  <div>
                    <p className="font-medium">{dashboardData.nextLesson.title}</p>
                    <p className="text-gray-600">
                      {new Date(dashboardData.nextLesson.date).toLocaleDateString()}, {dashboardData.nextLesson.startTime} - {dashboardData.nextLesson.endTime}
                    </p>
                    <p className="text-gray-600">Инструктор: {dashboardData.nextLesson.instructorName}</p>
                    {dashboardData.nextLesson.location && <p className="text-gray-600">Место: {dashboardData.nextLesson.location}</p>}
                    {/* <Link href="/profile/schedule" className="text-red-600 hover:text-red-700 text-sm mt-2 inline-block">
                      Все занятия →
                    </Link> */}
                  </div>
                ) : (
                  <p className="text-gray-600">Нет предстоящих занятий</p>
                )}
              </div>

              <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="flex items-center mb-3">
                  <FaGraduationCap className="text-red-600 text-xl mr-3" />
                  <h3 className="font-bold">Прогресс курса</h3>
                </div>
                {dashboardLoading ? (
                  <p className="text-gray-600">Загружаем данные...</p>
                ) : courseProgress ? (
                  <div>
                    <p className="font-medium">{courseProgress.title}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 mb-2">
                      <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${courseProgress.progress}%` }}></div>
                    </div>
                    <p className="text-gray-600">
                      {courseProgress.completedLessons} из {courseProgress.totalLessons} занятий
                    </p>
                    {courseProgress.examDate && <p className="text-gray-600">Экзамен: {new Date(courseProgress.examDate).toLocaleDateString()}</p>}
                    {/* <Link href="/profile/progress" className="text-red-600 hover:text-red-700 text-sm mt-2 inline-block">
                      Подробнее →
                    </Link> */}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600">Нет активных курсов</p>
                    <Link href="/profile/courses" className="text-red-600 hover:text-red-700 text-sm mt-2 inline-block">
                      Посмотреть курсы →
                    </Link>
                  </div>
                )}
              </div>

              {/* <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="flex items-center mb-3">
                  <FaCreditCard className="text-red-600 text-xl mr-3" />
                  <h3 className="font-bold">Оплата</h3>
                </div>
                <p className="font-medium">Статус: Оплачено 2 из 3 этапов</p>
                <p className="text-gray-600">Следующий платеж: 5 000 тенге до 20.09.2023</p>
                <Link href="/profile/payments" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm mt-3 inline-block">
                  Оплатить
                </Link>
              </div> */}
            </div>

            {/* Уведомления */}
            {/* <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Уведомления</h3>
                <Link href="/profile/notifications" className="text-red-600 hover:text-red-700 text-sm">
                  Все уведомления →
                </Link>
              </div>
              {dashboardLoading ? (
                <p className="text-gray-600">Загружаем уведомления...</p>
              ) : notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className={`border rounded-lg p-3 ${getNotificationColor(notification.type)} ${!notification.read ? "border-l-4" : ""}`}>
                      <div className="flex justify-between">
                        <p className={!notification.read ? "font-semibold" : "font-normal"}>{notification.text}</p>
                        <span className="text-gray-500 text-sm">{new Date(notification.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Нет новых уведомлений</p>
              )}
            </div> */}

            {/* Быстрые действия */}
            {/* <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-4">Быстрые действия</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/profile/materials" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50">
                  <FaFileAlt className="text-red-600 text-2xl mb-2" />
                  <span className="text-center">Учебные материалы</span>
                </Link>
                <Link href="/profile/tests" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50">
                  <FaClipboardList className="text-red-600 text-2xl mb-2" />
                  <span className="text-center">Пройти тестирование</span>
                </Link>
                <Link href="/profile/schedule" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50">
                  <FaCalendarAlt className="text-red-600 text-2xl mb-2" />
                  <span className="text-center">Расписание занятий</span>
                </Link>
                {/* SETTINGS REMOVED - <Link href="/profile/settings" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50">
                  <FaUserCog className="text-red-600 text-2xl mb-2" />
                  <span className="text-center">Настройки профиля</span>
                </Link> */}
            {/* </div>
            </div> */}
          </div>
        );

      case "schedule":
        if (user?.role === "student") {
          return <StudentSchedule />;
        }
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Расписание занятий</h2>
            {dashboardLoading ? (
              <p className="text-gray-600">Загружаем расписание...</p>
            ) : upcomingLessons.length > 0 ? (
              <div className="space-y-4">
                {upcomingLessons.slice(0, 5).map((lesson, index) => (
                  <div key={`${lesson.lesson_source}_${lesson.id}_${index}`} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          {getStatusIcon(lesson.status)}
                          <span className={`ml-2 ${lesson.type === "theory" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"} px-2 py-1 rounded text-xs font-semibold`}>{lesson.type === "theory" ? "Теория" : lesson.type === "practice" ? "Практика" : lesson.type}</span>
                          {lesson.lesson_source === "group" && <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">Группа</span>}
                        </div>
                        <h3 className="font-bold">{lesson.title}</h3>
                        <p className="text-gray-600">Инструктор: {lesson.instructor_name}</p>
                        {lesson.location && <p className="text-gray-600">Место: {lesson.location}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{new Date(lesson.date).toLocaleDateString()}</p>
                        <p className="text-gray-600">
                          {lesson.start_time} - {lesson.end_time}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Перенести</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">Отменить</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Нет предстоящих занятий</p>
            )}

            <div className="mt-6">
              <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">Записаться на занятие</button>
            </div>
          </div>
        );

      case "group":
        return <StudentGroup />;

      case "progress":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Прогресс обучения</h2>

            <div className="mb-6">
              {courseProgress ? (
                <>
                  <h3 className="font-bold text-lg mb-2">{courseProgress.title}</h3>
                  <div className="flex items-center mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
                      <div className="bg-red-600 h-4 rounded-full" style={{ width: `${courseProgress.progress}%` }}></div>
                    </div>
                    <span className="text-gray-700 font-semibold">{courseProgress.progress}%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      Пройдено занятий: {courseProgress.completedLessons} из {courseProgress.totalLessons}
                    </span>
                    {courseProgress.examDate && <span>Дата экзамена: {new Date(courseProgress.examDate).toLocaleDateString()}</span>}
                  </div>
                </>
              ) : (
                <p className="text-gray-600">Нет активных курсов для отслеживания прогресса</p>
              )}
            </div>

            <div className="mt-8">
              <h3 className="font-bold text-lg mb-4">Модули курса</h3>
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">1. Основы ПДД</h4>
                    <span className="text-green-600 text-sm font-semibold">Завершен</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">2. Маневрирование</h4>
                    <span className="text-blue-600 text-sm font-semibold">В процессе (80%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">3. Вождение в городе</h4>
                    <span className="text-blue-600 text-sm font-semibold">В процессе (30%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "30%" }}></div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">4. Подготовка к экзамену</h4>
                    <span className="text-gray-500 text-sm font-semibold">Не начат</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full" style={{ width: "0%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-bold text-lg mb-4">Результаты тестов</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название теста</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Результат</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Основы ПДД</td>
                      <td className="px-6 py-4 whitespace-nowrap">05.09.2023</td>
                      <td className="px-6 py-4 whitespace-nowrap">90% (18/20)</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Сдан</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Дорожные знаки</td>
                      <td className="px-6 py-4 whitespace-nowrap">10.09.2023</td>
                      <td className="px-6 py-4 whitespace-nowrap">85% (17/20)</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Сдан</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Маневрирование</td>
                      <td className="px-6 py-4 whitespace-nowrap">-</td>
                      <td className="px-6 py-4 whitespace-nowrap">-</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Не пройден</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // Другие вкладки можно добавить по аналогии...
      case "blog":
        return user?.role === "admin" ? (
          <AdminBlogManager />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>Доступ запрещен</p>
          </div>
        );

      case "courses":
        return user?.role === "student" ? (
          <StudentCoursesComponent />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>Доступ запрещен</p>
          </div>
        );

      case "instructor-courses":
        return user?.role === "instructor" || user?.role === "admin" ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-4">Для просмотра ваших курсов и студентов перейдите на специальную страницу</p>
              <Link href="/profile/instructor-courses" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg inline-flex items-center">
                <FaCarSide className="mr-2" />
                Перейти к курсам
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>Доступ запрещен</p>
          </div>
        );

      // SETTINGS SECTION DISABLED
      /* case "settings":
        // Перенаправляем на отдельную страницу настроек
        if (typeof window !== "undefined") {
          router.push("/profile/settings");
          return null;
        }
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-4">Переход к настройкам...</p>
            </div>
          </div>
        ); */

      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>В разработке...</p>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute allowedRoles={["student", "admin"]}>
      <Layout title="Личный кабинет - Автошкола" description="Управление обучением, расписание занятий и прогресс в личном кабинете ученика автошколы.">
        <div className="bg-gray-100 py-10">
          <div className="container-fluid">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Боковая навигация */}
              <div className="md:w-1/4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-center mb-6">
                    <div className="mb-4 flex justify-center">
                      <AvatarUpload user={user} onAvatarUpdate={handleAvatarUpdate} size="medium" />
                    </div>
                    <h2 className="text-xl font-bold">{isLoading ? "Загрузка..." : user ? `${user.firstName} ${user.lastName}` : "Пользователь"}</h2>
                    <p className="text-gray-600">{user?.role === "student" ? "Ученик" : user?.role === "instructor" ? "Инструктор" : user?.role === "admin" ? "Администратор" : "Пользователь"}</p>
                  </div>

                  <nav className="space-y-1">
                    {navTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          // SETTINGS DISABLED
                          /* if (tab.id === "settings") {
                            router.push("/profile/settings");
                          } else { */
                          setActiveTab(tab.id);
                          // }
                        }}
                        className={`w-full flex items-center p-3 rounded-lg transition ${activeTab === tab.id ? "bg-red-100 text-red-700" : "hover:bg-gray-100"}`}
                      >
                        <span className="mr-3">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <button className="w-full flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                        <FaSignOutAlt className="mr-3" />
                        <span>Выйти</span>
                      </button>
                    </div>
                  </nav>
                </div>
              </div>

              {/* Основной контент */}
              <div className="md:w-3/4">{renderContent()}</div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ProfilePage;
