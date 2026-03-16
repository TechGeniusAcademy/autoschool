import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AuthAPI, User } from "../../services/api";
import Link from "next/link";
import {
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaCarSide,
  FaGraduationCap,
  FaClipboardList,
  FaFileAlt,
  FaUserCog,
  FaSignOutAlt,
  FaBell,
  FaCheckCircle,
  FaCreditCard,
  FaPlay,
  FaBook,
  FaTrophy,
  FaChartLine,
  FaEye,
} from "react-icons/fa";

// Тип для представления курса студента
interface StudentCourse {
  id: number;
  title: string;
  description: string;
  instructor_name: string;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
  is_active: boolean;
  enrollment_date: string;
  completion_date?: string;
  status: "active" | "completed" | "paused";
}

// Тип для представления урока курса
interface CourseLesson {
  id: number;
  title: string;
  description: string;
  content: string;
  order_number: number;
  is_completed: boolean;
  completed_at?: string;
}

const CoursesTabs: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(
    null
  );
  const [courseLessons, setCourseLessons] = useState<CourseLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [activeView, setActiveView] = useState<"list" | "course">("list");

  // Загрузка данных пользователя и курсов
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await AuthAPI.getProfile();
        if (userResponse.success && userResponse.data?.user) {
          setUser(userResponse.data.user);

          // Загружаем курсы студента
          const coursesResponse = await fetch("/api/student/courses", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            setCourses(coursesData.data || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Загрузка уроков курса
  const loadCourseLessons = async (courseId: number) => {
    setIsLoadingLessons(true);
    try {
      const response = await fetch(`/api/student/courses/${courseId}/lessons`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourseLessons(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  // Открытие курса
  const openCourse = async (course: StudentCourse) => {
    setSelectedCourse(course);
    setActiveView("course");
    await loadCourseLessons(course.id);
  };

  // Отметка урока как пройденного
  const completeLesson = async (lessonId: number) => {
    try {
      const response = await fetch(
        `/api/student/lessons/${lessonId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Обновляем список уроков
        if (selectedCourse) {
          await loadCourseLessons(selectedCourse.id);
        }
      }
    } catch (error) {
      console.error("Failed to complete lesson:", error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="text-lg">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeView === "list" ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Мои курсы
                  </h1>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Всего курсов: {courses.length}
                    </span>
                  </div>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <FaGraduationCap className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Курсы не найдены
                    </h3>
                    <p className="text-gray-500">
                      Вы еще не записаны ни на один курс
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                            {course.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              course.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : course.status === "active"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {course.status === "completed"
                              ? "Завершен"
                              : course.status === "active"
                              ? "Активный"
                              : "Приостановлен"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {course.description}
                        </p>

                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <FaUser className="mr-2" />
                            <span>Инструктор: {course.instructor_name}</span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <FaBook className="mr-2" />
                            <span>
                              Прогресс: {course.completed_lessons}/
                              {course.total_lessons} уроков
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            {course.progress}%
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <FaCalendarAlt className="mr-2" />
                            <span>
                              Начат:{" "}
                              {new Date(
                                course.enrollment_date
                              ).toLocaleDateString("ru-RU")}
                            </span>
                          </div>

                          {course.completion_date && (
                            <div className="flex items-center text-sm text-green-600">
                              <FaTrophy className="mr-2" />
                              <span>
                                Завершен:{" "}
                                {new Date(
                                  course.completion_date
                                ).toLocaleDateString("ru-RU")}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 flex space-x-2">
                          <button
                            onClick={() => openCourse(course)}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                          >
                            <FaPlay className="mr-2" />
                            {course.status === "completed"
                              ? "Просмотреть"
                              : "Продолжить"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Детальный вид курса */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setActiveView("list")}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ← Назад к курсам
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {selectedCourse?.title}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Прогресс: {selectedCourse?.progress}%
                    </span>
                  </div>
                </div>

                {selectedCourse && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Информация о курсе */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Информация о курсе
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <FaUser className="mr-2" />
                            <span>
                              Инструктор: {selectedCourse.instructor_name}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FaBook className="mr-2" />
                            <span>
                              Уроков: {selectedCourse.completed_lessons}/
                              {selectedCourse.total_lessons}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FaCalendarAlt className="mr-2" />
                            <span>
                              Начат:{" "}
                              {new Date(
                                selectedCourse.enrollment_date
                              ).toLocaleDateString("ru-RU")}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full"
                              style={{ width: `${selectedCourse.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-right text-sm text-gray-600 mt-1">
                            {selectedCourse.progress}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Список уроков */}
                    <div className="lg:col-span-2">
                      <h3 className="font-semibold text-gray-800 mb-4">
                        Уроки курса
                      </h3>

                      {isLoadingLessons ? (
                        <div className="text-center py-8">
                          <div className="text-lg">Загрузка уроков...</div>
                        </div>
                      ) : courseLessons.length === 0 ? (
                        <div className="text-center py-8">
                          <FaBook className="mx-auto text-4xl text-gray-300 mb-2" />
                          <p className="text-gray-500">Уроки не найдены</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {courseLessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`border rounded-lg p-4 ${
                                lesson.is_completed
                                  ? "bg-green-50 border-green-200"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                                      {lesson.order_number}
                                    </span>
                                    <h4 className="font-semibold text-gray-800">
                                      {lesson.title}
                                    </h4>
                                    {lesson.is_completed && (
                                      <FaCheckCircle className="text-green-600" />
                                    )}
                                  </div>

                                  <p className="text-sm text-gray-600 mt-2 ml-11">
                                    {lesson.description}
                                  </p>

                                  {lesson.completed_at && (
                                    <p className="text-xs text-green-600 mt-2 ml-11">
                                      Пройден:{" "}
                                      {new Date(
                                        lesson.completed_at
                                      ).toLocaleDateString("ru-RU")}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center space-x-2">
                                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                                    <FaEye className="mr-1" />
                                    Открыть
                                  </button>
                                  {!lesson.is_completed && (
                                    <button
                                      onClick={() => completeLesson(lesson.id)}
                                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                                    >
                                      <FaCheckCircle className="mr-1" />
                                      Завершить
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default CoursesTabs;
