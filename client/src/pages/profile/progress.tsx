import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaUser,
  FaCalendarAlt,
  FaGraduationCap,
  FaFileAlt,
  FaClipboardList,
  FaUserCog,
  FaSignOutAlt,
  FaCheckCircle,
  FaTrophy,
  FaMedal,
  FaChartLine,
  FaCarSide,
  FaChalkboardTeacher,
  FaExclamationTriangle,
  FaInfoCircle,
  FaStar,
} from "react-icons/fa";

// Тип для представления навигационных вкладок
interface NavTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Тип для прогресса по курсу
interface CourseProgress {
  id: number;
  title: string;
  category: string;
  completed: number;
  total: number;
  lastActivity: string;
}

// Тип для представления тем курса
interface CourseTopic {
  id: number;
  title: string;
  type: "theory" | "practice";
  status: "completed" | "in-progress" | "upcoming";
  grade?: number;
  completedAt?: string;
}

// Тип для достижений
interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  dateEarned?: string;
  progress?: number;
  totalNeeded?: number;
}

// Тип для результатов экзаменов
interface ExamResult {
  id: number;
  title: string;
  date: string;
  score: number;
  maxScore: number;
  passed: boolean;
  instructor: string;
  notes?: string;
}

const ProfileProgressPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("progress");
  const [selectedCourse, setSelectedCourse] = useState<number>(1);
  const [viewMode, setViewMode] = useState<
    "general" | "detailed" | "exams" | "achievements"
  >("general");

  // Навигационные вкладки
  const navTabs: NavTab[] = [
    { id: "dashboard", label: "Дашборд", icon: <FaUser /> },
    { id: "schedule", label: "Расписание", icon: <FaCalendarAlt /> },
    { id: "progress", label: "Прогресс", icon: <FaGraduationCap /> },
    { id: "materials", label: "Материалы", icon: <FaFileAlt /> },
    { id: "tests", label: "Тесты", icon: <FaClipboardList /> },
    // { id: "settings", label: "Настройки", icon: <FaUserCog /> },
  ];

  // Данные прогресса по курсам
  const courseProgresses: CourseProgress[] = [
    {
      id: 1,
      title: "Водительское удостоверение категории B",
      category: "B",
      completed: 18,
      total: 30,
      lastActivity: "15.09.2023",
    },
    {
      id: 2,
      title: "Дополнительный курс: Контраварийное вождение",
      category: "Дополнительно",
      completed: 2,
      total: 5,
      lastActivity: "10.09.2023",
    },
  ];

  // Темы курса (для детального просмотра)
  const courseTopics: CourseTopic[] = [
    {
      id: 1,
      title: "Введение в ПДД",
      type: "theory",
      status: "completed",
      grade: 4.8,
      completedAt: "01.09.2023",
    },
    {
      id: 2,
      title: "Основы управления автомобилем",
      type: "theory",
      status: "completed",
      grade: 4.5,
      completedAt: "05.09.2023",
    },
    {
      id: 3,
      title: "Дорожные знаки и разметка",
      type: "theory",
      status: "completed",
      grade: 4.2,
      completedAt: "08.09.2023",
    },
    {
      id: 4,
      title: "Первое занятие на площадке",
      type: "practice",
      status: "completed",
      grade: 3.8,
      completedAt: "10.09.2023",
    },
    {
      id: 5,
      title: "Маневрирование и парковка",
      type: "practice",
      status: "completed",
      grade: 4.0,
      completedAt: "12.09.2023",
    },
    {
      id: 6,
      title: "Сигналы светофора и регулировщика",
      type: "theory",
      status: "in-progress",
    },
    {
      id: 7,
      title: "Проезд перекрестков",
      type: "theory",
      status: "upcoming",
    },
    {
      id: 8,
      title: "Выезд на дороги общего пользования",
      type: "practice",
      status: "upcoming",
    },
  ];

  // Достижения
  const achievements: Achievement[] = [
    {
      id: 1,
      title: "Первые шаги",
      description: "Завершите первое занятие",
      icon: <FaCarSide className="text-blue-500" />,
      earned: true,
      dateEarned: "01.09.2023",
    },
    {
      id: 2,
      title: "Теоретик",
      description: "Пройдите все теоретические занятия",
      icon: <FaChalkboardTeacher className="text-green-500" />,
      earned: false,
      progress: 3,
      totalNeeded: 6,
    },
    {
      id: 3,
      title: "Практик",
      description: "Завершите все практические занятия",
      icon: <FaCarSide className="text-orange-500" />,
      earned: false,
      progress: 2,
      totalNeeded: 8,
    },
    {
      id: 4,
      title: "Отличник",
      description: "Получите максимальную оценку на экзамене",
      icon: <FaStar className="text-yellow-500" />,
      earned: false,
    },
    {
      id: 5,
      title: "Мастер вождения",
      description: "Успешно сдайте экзамен с первой попытки",
      icon: <FaTrophy className="text-yellow-500" />,
      earned: false,
    },
  ];

  // Результаты экзаменов
  const examResults: ExamResult[] = [
    {
      id: 1,
      title: "Промежуточный тест: Основы ПДД",
      date: "05.09.2023",
      score: 92,
      maxScore: 100,
      passed: true,
      instructor: "Иванов И.И.",
    },
    {
      id: 2,
      title: "Тест: Дорожные знаки",
      date: "08.09.2023",
      score: 87,
      maxScore: 100,
      passed: true,
      instructor: "Петров П.П.",
    },
    {
      id: 3,
      title: "Практическое вождение: площадка",
      date: "12.09.2023",
      score: 78,
      maxScore: 100,
      passed: true,
      instructor: "Сидоров С.С.",
      notes:
        "Хорошо выполняет упражнения, но нужно работать над точностью парковки",
    },
  ];

  // Получение активного курса
  const getActiveCourse = () => {
    return courseProgresses.find((course) => course.id === selectedCourse);
  };

  // Расчет процента выполнения
  const calculateCompletionPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  // Получение статуса темы
  const getTopicStatusInfo = (status: CourseTopic["status"]) => {
    switch (status) {
      case "completed":
        return {
          icon: <FaCheckCircle className="text-green-600" />,
          text: "Завершено",
          class: "bg-green-100 text-green-800",
        };
      case "in-progress":
        return {
          icon: <FaChartLine className="text-blue-600" />,
          text: "В процессе",
          class: "bg-blue-100 text-blue-800",
        };
      case "upcoming":
        return {
          icon: <FaCalendarAlt className="text-gray-600" />,
          text: "Предстоит",
          class: "bg-gray-100 text-gray-800",
        };
      default:
        return {
          icon: <FaInfoCircle className="text-gray-600" />,
          text: "Неизвестно",
          class: "bg-gray-100 text-gray-800",
        };
    }
  };

  // Получение иконки для типа занятия
  const getTopicTypeIcon = (type: CourseTopic["type"]) => {
    switch (type) {
      case "theory":
        return <FaChalkboardTeacher className="text-blue-600" />;
      case "practice":
        return <FaCarSide className="text-green-600" />;
      default:
        return <FaInfoCircle className="text-gray-600" />;
    }
  };

  // Получение цвета для оценки
  const getGradeColor = (grade?: number) => {
    if (!grade) return "text-gray-600";
    if (grade >= 4.5) return "text-green-600";
    if (grade >= 4.0) return "text-blue-600";
    if (grade >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Layout
      title="Прогресс обучения - Автошкола"
      description="Отслеживание прогресса обучения в автошколе."
    >
      <div className="bg-gray-100 py-10">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Боковая навигация */}
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src="/images/profile/avatar.jpg"
                      alt="Аватар пользователя"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-bold">Александр Иванов</h2>
                  <p className="text-gray-600">Ученик</p>
                </div>

                <nav className="space-y-1">
                  {navTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id !== "progress") {
                          router.push(
                            tab.id === "dashboard"
                              ? "/profile"
                              : `/profile/${tab.id}`
                          );
                        } else {
                          setActiveTab(tab.id);
                        }
                      }}
                      className={`w-full flex items-center p-3 rounded-lg transition ${
                        activeTab === tab.id
                          ? "bg-red-100 text-red-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <button
                      className="w-full flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                      onClick={() => router.push("/login")}
                    >
                      <FaSignOutAlt className="mr-3" />
                      <span>Выйти</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Основной контент */}
            <div className="md:w-3/4 space-y-6">
              {/* Заголовок и вкладки */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-6">Прогресс обучения</h2>

                {/* Выбор курса */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courseProgresses.map((course) => (
                      <div
                        key={course.id}
                        className={`border p-4 rounded-lg cursor-pointer hover:shadow-md transition ${
                          selectedCourse === course.id
                            ? "border-blue-500 bg-blue-50"
                            : ""
                        }`}
                        onClick={() => setSelectedCourse(course.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold">{course.title}</h3>
                            <p className="text-sm text-gray-600">
                              Категория: {course.category}
                            </p>
                          </div>
                          <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {calculateCompletionPercentage(
                              course.completed,
                              course.total
                            )}
                            %
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${calculateCompletionPercentage(
                                  course.completed,
                                  course.total
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-gray-600">
                            <span>
                              Пройдено: {course.completed} из {course.total}
                            </span>
                            <span>
                              Последняя активность: {course.lastActivity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Режимы просмотра */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => setViewMode("general")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      viewMode === "general"
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    Общий прогресс
                  </button>
                  <button
                    onClick={() => setViewMode("detailed")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      viewMode === "detailed"
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    Детальный прогресс
                  </button>
                  <button
                    onClick={() => setViewMode("exams")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      viewMode === "exams"
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    Экзамены и тесты
                  </button>
                  <button
                    onClick={() => setViewMode("achievements")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      viewMode === "achievements"
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    Достижения
                  </button>
                </div>

                {/* Содержимое в зависимости от выбранного режима */}
                {viewMode === "general" && (
                  <div>
                    <div className="mb-6">
                      <h3 className="font-bold mb-4">
                        Общий прогресс: {getActiveCourse()?.title}
                      </h3>

                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                              Общий прогресс
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-blue-600">
                              {calculateCompletionPercentage(
                                getActiveCourse()?.completed || 0,
                                getActiveCourse()?.total || 1
                              )}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                          <div
                            style={{
                              width: `${calculateCompletionPercentage(
                                getActiveCourse()?.completed || 0,
                                getActiveCourse()?.total || 1
                              )}%`,
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white border rounded-lg p-4">
                          <div className="flex items-center">
                            <FaChalkboardTeacher className="text-blue-600 text-xl mr-3" />
                            <div>
                              <h4 className="font-bold">Теоретическая часть</h4>
                              <div className="text-sm text-gray-600">
                                Пройдено: 3 из 6 (50%)
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: "50%" }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border rounded-lg p-4">
                          <div className="flex items-center">
                            <FaCarSide className="text-green-600 text-xl mr-3" />
                            <div>
                              <h4 className="font-bold">Практическая часть</h4>
                              <div className="text-sm text-gray-600">
                                Пройдено: 2 из 8 (25%)
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: "25%" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-bold mb-2">Средний балл</h4>
                        <div className="flex items-center">
                          <div className="text-3xl font-bold text-blue-600 mr-3">
                            4.2
                          </div>
                          <div className="text-sm text-gray-600">
                            из 5.0 возможных
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-bold text-blue-800 mb-2">
                          Рекомендации
                        </h4>
                        <ul className="list-disc pl-5 text-blue-800 space-y-1">
                          <li>
                            Повторите материал по теме "Дорожные знаки и
                            разметка"
                          </li>
                          <li>
                            Попрактикуйтесь в выполнении упражнений на площадке
                          </li>
                          <li>
                            Пройдите дополнительный тест по теме "Сигналы
                            светофора"
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === "detailed" && (
                  <div>
                    <h3 className="font-bold mb-4">
                      Детальный прогресс: {getActiveCourse()?.title}
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Тема
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Тип
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Статус
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Оценка
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Дата завершения
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {courseTopics.map((topic) => (
                            <tr key={topic.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {topic.title}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="mr-2">
                                    {getTopicTypeIcon(topic.type)}
                                  </span>
                                  <span className="text-sm text-gray-900">
                                    {topic.type === "theory"
                                      ? "Теория"
                                      : "Практика"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    getTopicStatusInfo(topic.status).class
                                  }`}
                                >
                                  <span className="mr-1">
                                    {getTopicStatusInfo(topic.status).icon}
                                  </span>
                                  {getTopicStatusInfo(topic.status).text}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {topic.grade ? (
                                  <div
                                    className={`text-sm font-bold ${getGradeColor(
                                      topic.grade
                                    )}`}
                                  >
                                    {topic.grade}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">-</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {topic.completedAt || "-"}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {viewMode === "exams" && (
                  <div>
                    <h3 className="font-bold mb-4">
                      Экзамены и тесты: {getActiveCourse()?.title}
                    </h3>

                    <div className="space-y-4">
                      {examResults.map((exam) => (
                        <div
                          key={exam.id}
                          className="border rounded-lg overflow-hidden"
                        >
                          <div
                            className={`p-3 ${
                              exam.passed ? "bg-green-50" : "bg-red-50"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold">{exam.title}</h4>
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                  exam.passed
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {exam.passed ? "Сдано" : "Не сдано"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Дата: {exam.date} | Инструктор: {exam.instructor}
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-gray-600">
                                Результат: {exam.score} из {exam.maxScore}{" "}
                                баллов
                              </div>
                              <div className="text-sm font-semibold">
                                {Math.round((exam.score / exam.maxScore) * 100)}
                                %
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  exam.passed ? "bg-green-600" : "bg-red-600"
                                }`}
                                style={{
                                  width: `${
                                    (exam.score / exam.maxScore) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            {exam.notes && (
                              <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                                <p>
                                  <span className="font-semibold">
                                    Примечание:
                                  </span>{" "}
                                  {exam.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <FaInfoCircle className="text-yellow-600 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-bold text-yellow-800 mb-1">
                            Предстоящие экзамены
                          </h4>
                          <p className="text-sm text-yellow-800">
                            Итоговый экзамен по теории: 25.09.2023
                            <br />
                            Экзамен по вождению: по результатам обучения
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === "achievements" && (
                  <div>
                    <h3 className="font-bold mb-4">Достижения и награды</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`border rounded-lg p-4 transition ${
                            achievement.earned
                              ? "border-yellow-300 bg-yellow-50"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`p-3 rounded-full ${
                                achievement.earned
                                  ? "bg-yellow-100"
                                  : "bg-gray-100"
                              } mr-4`}
                            >
                              {achievement.icon}
                            </div>
                            <div>
                              <h4
                                className={`font-bold ${
                                  achievement.earned
                                    ? "text-yellow-800"
                                    : "text-gray-800"
                                }`}
                              >
                                {achievement.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {achievement.description}
                              </p>
                            </div>
                          </div>

                          {achievement.earned ? (
                            <div className="mt-3 pt-3 border-t border-yellow-200">
                              <div className="flex items-center text-sm text-yellow-800">
                                <FaMedal className="text-yellow-600 mr-2" />
                                Получено: {achievement.dateEarned}
                              </div>
                            </div>
                          ) : achievement.progress !== undefined &&
                            achievement.totalNeeded !== undefined ? (
                            <div className="mt-3 pt-3 border-t">
                              <div className="mb-1 text-sm flex justify-between">
                                <span className="text-gray-600">Прогресс</span>
                                <span className="text-gray-800 font-medium">
                                  {achievement.progress} /{" "}
                                  {achievement.totalNeeded}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full"
                                  style={{
                                    width: `${
                                      (achievement.progress /
                                        achievement.totalNeeded) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                              <span>Не получено</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Советы по улучшению */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold mb-4">
                  Советы по улучшению результатов
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start p-4 border rounded-lg">
                    <FaChalkboardTeacher className="text-blue-600 text-xl mr-4 mt-0.5" />
                    <div>
                      <h4 className="font-bold mb-1">
                        Теоретическая подготовка
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Регулярно повторяйте пройденный материал, особенно по
                        темам, где у вас возникли трудности. Используйте
                        дополнительные онлайн-тесты для закрепления знаний ПДД.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 border rounded-lg">
                    <FaCarSide className="text-green-600 text-xl mr-4 mt-0.5" />
                    <div>
                      <h4 className="font-bold mb-1">Практические навыки</h4>
                      <p className="text-gray-600 text-sm">
                        Проанализируйте ошибки, допущенные во время практических
                        занятий. Обсудите с инструктором сложные моменты и
                        запросите дополнительную практику в проблемных зонах.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 border rounded-lg">
                    <FaTrophy className="text-yellow-600 text-xl mr-4 mt-0.5" />
                    <div>
                      <h4 className="font-bold mb-1">Подготовка к экзаменам</h4>
                      <p className="text-gray-600 text-sm">
                        Уделите особое внимание решению экзаменационных билетов.
                        Тренируйтесь в условиях, максимально приближенных к
                        экзаменационным.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileProgressPage;
