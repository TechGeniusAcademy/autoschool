import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AuthAPI, User } from "../../services/api";
import Link from "next/link";
import {
  FaUser,
  FaUsers,
  FaGraduationCap,
  FaChartLine,
  FaEye,
  FaCalendarAlt,
  FaBook,
  FaTrophy,
  FaCheckCircle,
  FaClock,
  FaSearch,
} from "react-icons/fa";

// Тип для представления курса инструктора
interface InstructorCourse {
  id: number;
  title: string;
  description: string;
  students_count: number;
  lessons_count: number;
  average_progress: number;
  created_at: string;
}

// Тип для представления студента курса
interface CourseStudent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  enrollment_date: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  last_activity?: string;
  status: "active" | "completed" | "paused";
}

// Тип для детального прогресса студента
interface StudentProgress {
  student_id: number;
  student_name: string;
  lessons: {
    id: number;
    title: string;
    order_number: number;
    is_completed: boolean;
    completed_at?: string;
  }[];
}

const InstructorCoursesPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<InstructorCourse | null>(
    null
  );
  const [courseStudents, setCourseStudents] = useState<CourseStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<CourseStudent | null>(
    null
  );
  const [studentProgress, setStudentProgress] =
    useState<StudentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [activeView, setActiveView] = useState<
    "courses" | "students" | "progress"
  >("courses");
  const [searchTerm, setSearchTerm] = useState("");

  // Загрузка данных пользователя и курсов
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await AuthAPI.getProfile();
        if (userResponse.success && userResponse.data?.user) {
          setUser(userResponse.data.user);

          // Загружаем курсы инструктора
          const coursesResponse = await fetch("/api/instructor/courses", {
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

  // Загрузка студентов курса
  const loadCourseStudents = async (courseId: number) => {
    setIsLoadingStudents(true);
    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/students`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCourseStudents(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Загрузка прогресса студента
  const loadStudentProgress = async (courseId: number, studentId: number) => {
    setIsLoadingProgress(true);
    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/students/${studentId}/progress`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStudentProgress(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch student progress:", error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // Открытие списка студентов курса
  const openCourseStudents = async (course: InstructorCourse) => {
    setSelectedCourse(course);
    setActiveView("students");
    await loadCourseStudents(course.id);
  };

  // Открытие прогресса студента
  const openStudentProgress = async (student: CourseStudent) => {
    if (selectedCourse) {
      setSelectedStudent(student);
      setActiveView("progress");
      await loadStudentProgress(selectedCourse.id, student.id);
    }
  };

  // Фильтрация студентов по поиску
  const filteredStudents = courseStudents.filter(
    (student) =>
      `${student.first_name} ${student.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <ProtectedRoute allowedRoles={["instructor", "admin"]}>
      <Layout>
        <div className="container mx-auto py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeView === "courses" ? (
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
                      У вас пока нет назначенных курсов
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
                          {course.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {course.description}
                        </p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                              <FaUsers className="mr-2" />
                              <span>Студентов: {course.students_count}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <FaBook className="mr-2" />
                              <span>Уроков: {course.lessons_count}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Средний прогресс:
                              </span>
                              <span className="font-semibold">
                                {course.average_progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${course.average_progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <FaCalendarAlt className="mr-2" />
                            <span>
                              Создан:{" "}
                              {new Date(course.created_at).toLocaleDateString(
                                "ru-RU"
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6">
                          <button
                            onClick={() => openCourseStudents(course)}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                          >
                            <FaUsers className="mr-2" />
                            Просмотреть студентов
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : activeView === "students" ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setActiveView("courses")}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ← Назад к курсам
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                      Студенты курса: {selectedCourse?.title}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Всего студентов: {courseStudents.length}
                    </span>
                  </div>
                </div>

                {/* Поиск студентов */}
                <div className="mb-6">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск студентов по имени или email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {isLoadingStudents ? (
                  <div className="text-center py-8">
                    <div className="text-lg">Загрузка студентов...</div>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      {searchTerm ? "Студенты не найдены" : "Нет студентов"}
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm
                        ? "Попробуйте изменить критерии поиска"
                        : "На этот курс пока никто не записан"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            {student.avatar_url ? (
                              <img
                                src={student.avatar_url}
                                alt={`${student.first_name} ${student.last_name}`}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <FaUser className="text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {student.first_name} {student.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Прогресс:
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                student.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : student.status === "active"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {student.status === "completed"
                                ? "Завершен"
                                : student.status === "active"
                                ? "Активный"
                                : "Приостановлен"}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {student.completed_lessons}/
                                {student.total_lessons} уроков
                              </span>
                              <span className="font-semibold">
                                {student.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2" />
                              <span>
                                Записан:{" "}
                                {new Date(
                                  student.enrollment_date
                                ).toLocaleDateString("ru-RU")}
                              </span>
                            </div>
                            {student.last_activity && (
                              <div className="flex items-center mt-1">
                                <FaClock className="mr-2" />
                                <span>
                                  Последняя активность:{" "}
                                  {new Date(
                                    student.last_activity
                                  ).toLocaleDateString("ru-RU")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-6">
                          <button
                            onClick={() => openStudentProgress(student)}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                          >
                            <FaChartLine className="mr-2" />
                            Детальный прогресс
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Детальный прогресс студента */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setActiveView("students")}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ← Назад к студентам
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                      Прогресс: {selectedStudent?.first_name}{" "}
                      {selectedStudent?.last_name}
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Прогресс: {selectedStudent?.progress}%
                    </span>
                  </div>
                </div>

                {isLoadingProgress ? (
                  <div className="text-center py-8">
                    <div className="text-lg">Загрузка прогресса...</div>
                  </div>
                ) : studentProgress ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Информация о студенте */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-3">
                          Информация о студенте
                        </h3>
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            {selectedStudent?.avatar_url ? (
                              <img
                                src={selectedStudent.avatar_url}
                                alt={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <FaUser className="text-blue-600 text-xl" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {studentProgress.student_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {selectedStudent?.email}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <FaBook className="mr-2" />
                            <span>
                              Уроков пройдено:{" "}
                              {selectedStudent?.completed_lessons}/
                              {selectedStudent?.total_lessons}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FaCalendarAlt className="mr-2" />
                            <span>
                              Записан:{" "}
                              {selectedStudent &&
                                new Date(
                                  selectedStudent.enrollment_date
                                ).toLocaleDateString("ru-RU")}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full"
                              style={{ width: `${selectedStudent?.progress}%` }}
                            ></div>
                          </div>
                          <div className="text-right text-sm text-gray-600 mt-1">
                            {selectedStudent?.progress}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Прогресс по урокам */}
                    <div className="lg:col-span-2">
                      <h3 className="font-semibold text-gray-800 mb-4">
                        Прогресс по урокам
                      </h3>

                      {studentProgress.lessons.length === 0 ? (
                        <div className="text-center py-8">
                          <FaBook className="mx-auto text-4xl text-gray-300 mb-2" />
                          <p className="text-gray-500">Уроки не найдены</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {studentProgress.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`border rounded-lg p-4 ${
                                lesson.is_completed
                                  ? "bg-green-50 border-green-200"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                                    {lesson.order_number}
                                  </span>
                                  <h4 className="font-semibold text-gray-800">
                                    {lesson.title}
                                  </h4>
                                </div>

                                <div className="flex items-center space-x-2">
                                  {lesson.is_completed ? (
                                    <div className="flex items-center text-green-600">
                                      <FaCheckCircle className="mr-1" />
                                      <span className="text-sm">Завершен</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-gray-500">
                                      <FaClock className="mr-1" />
                                      <span className="text-sm">
                                        Не пройден
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {lesson.completed_at && (
                                <p className="text-xs text-green-600 mt-2 ml-11">
                                  Пройден:{" "}
                                  {new Date(
                                    lesson.completed_at
                                  ).toLocaleDateString("ru-RU")}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Не удалось загрузить прогресс студента
                    </p>
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

export default InstructorCoursesPage;
