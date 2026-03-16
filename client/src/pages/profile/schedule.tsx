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
  FaClock,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCarSide,
  FaChalkboardTeacher,
} from "react-icons/fa";

// Тип для представления навигационных вкладок
interface NavTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Тип для представления занятия
interface Lesson {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  instructor: {
    id: number;
    name: string;
    photo: string;
  };
  type: "Теория" | "Практика";
  location: string;
  status: "upcoming" | "completed" | "canceled";
  notes?: string;
}

// Дни недели
const DAYS_OF_WEEK = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

// Месяцы
const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const ProfileSchedulePage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("schedule");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewType, setViewType] = useState<"month" | "week" | "day" | "list">(
    "month"
  );
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [lessonToCancel, setLessonToCancel] = useState<Lesson | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  // Навигационные вкладки
  const navTabs: NavTab[] = [
    { id: "dashboard", label: "Дашборд", icon: <FaUser /> },
    { id: "schedule", label: "Расписание", icon: <FaCalendarAlt /> },
    { id: "progress", label: "Прогресс", icon: <FaGraduationCap /> },
    { id: "materials", label: "Материалы", icon: <FaFileAlt /> },
    { id: "tests", label: "Тесты", icon: <FaClipboardList /> },
    // { id: "settings", label: "Настройки", icon: <FaUserCog /> },
  ];

  // Моковые данные занятий
  const lessons: Lesson[] = [
    {
      id: 1,
      title: "Правила дорожного движения - основы",
      date: "2023-09-15",
      time: "10:00",
      duration: "1:30",
      instructor: {
        id: 1,
        name: "Иванов Иван Иванович",
        photo: "/images/profile/instructor1.jpg",
      },
      type: "Теория",
      location: "Учебный класс №2",
      status: "upcoming",
    },
    {
      id: 2,
      title: "Вождение в городе",
      date: "2023-09-17",
      time: "14:00",
      duration: "1:30",
      instructor: {
        id: 2,
        name: "Петров Петр Петрович",
        photo: "/images/profile/instructor2.jpg",
      },
      type: "Практика",
      location: "Площадка автошколы",
      status: "upcoming",
    },
    {
      id: 3,
      title: "Дорожные знаки и разметка",
      date: "2023-09-20",
      time: "11:00",
      duration: "1:30",
      instructor: {
        id: 1,
        name: "Иванов Иван Иванович",
        photo: "/images/profile/instructor1.jpg",
      },
      type: "Теория",
      location: "Учебный класс №1",
      status: "upcoming",
    },
    {
      id: 4,
      title: "Парковка и маневрирование",
      date: "2023-09-22",
      time: "15:00",
      duration: "1:30",
      instructor: {
        id: 2,
        name: "Петров Петр Петрович",
        photo: "/images/profile/instructor2.jpg",
      },
      type: "Практика",
      location: "Площадка автошколы",
      status: "upcoming",
    },
    {
      id: 5,
      title: "Движение в сложных условиях",
      date: "2023-09-10",
      time: "10:00",
      duration: "2:00",
      instructor: {
        id: 3,
        name: "Сидоров Сидор Сидорович",
        photo: "/images/profile/instructor3.jpg",
      },
      type: "Практика",
      location: "Маршрут по городу",
      status: "completed",
      notes: "Отработка навыков вождения в плотном городском потоке",
    },
    {
      id: 6,
      title: "Экзаменационный маршрут",
      date: "2023-09-05",
      time: "14:00",
      duration: "2:00",
      instructor: {
        id: 2,
        name: "Петров Петр Петрович",
        photo: "/images/profile/instructor2.jpg",
      },
      type: "Практика",
      location: "Экзаменационный маршрут спецЦОН",
      status: "canceled",
      notes: "Отменено по погодным условиям",
    },
  ];

  // Получение статуса занятия
  const getLessonStatusInfo = (status: Lesson["status"]) => {
    switch (status) {
      case "upcoming":
        return {
          icon: <FaClock className="text-blue-600" />,
          text: "Предстоит",
          class: "text-blue-600",
        };
      case "completed":
        return {
          icon: <FaCheckCircle className="text-green-600" />,
          text: "Завершено",
          class: "text-green-600",
        };
      case "canceled":
        return {
          icon: <FaExclamationTriangle className="text-red-600" />,
          text: "Отменено",
          class: "text-red-600",
        };
      default:
        return {
          icon: <FaClock className="text-gray-600" />,
          text: "Неизвестно",
          class: "text-gray-600",
        };
    }
  };

  // Получение иконки для типа занятия
  const getLessonTypeIcon = (type: Lesson["type"]) => {
    switch (type) {
      case "Теория":
        return <FaChalkboardTeacher className="text-blue-600" />;
      case "Практика":
        return <FaCarSide className="text-green-600" />;
      default:
        return <FaCalendarAlt className="text-gray-600" />;
    }
  };

  // Получение цвета для типа занятия
  const getLessonTypeColor = (type: Lesson["type"]) => {
    switch (type) {
      case "Теория":
        return "bg-blue-100 text-blue-800";
      case "Практика":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Получение дней в месяце
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Получение первого дня месяца
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Получение занятий на указанную дату
  const getLessonsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return lessons.filter((lesson) => lesson.date === dateString);
  };

  // Обработчик отмены занятия
  const handleCancelLesson = () => {
    if (lessonToCancel) {
      console.log(
        `Отмена занятия: ${lessonToCancel.id}, причина: ${cancellationReason}`
      );
      // В реальном приложении здесь будет запрос к API
      setShowCancellationModal(false);
      setLessonToCancel(null);
      setCancellationReason("");
    }
  };

  // Обработчик переноса месяца
  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prevDate) => {
      const newDate = new Date(prevDate);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Рендер календаря
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Заголовки дней недели
    const dayHeaders = DAYS_OF_WEEK.map((day, index) => (
      <div
        key={`header-${index}`}
        className="text-center font-medium py-2 border-b"
      >
        {day.substring(0, 3)}
      </div>
    ));

    // Пустые ячейки для первой недели
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2 border bg-gray-50"></div>
      );
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split("T")[0];
      const lessonsForDay = lessons.filter(
        (lesson) => lesson.date === dateString
      );
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      days.push(
        <div
          key={`day-${day}`}
          className={`p-2 border hover:bg-gray-50 cursor-pointer ${
            isSelected ? "bg-red-50 border-red-200" : ""
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="flex justify-between items-center mb-1">
            <span
              className={`inline-block w-6 h-6 rounded-full flex items-center justify-center ${
                isSelected ? "bg-red-600 text-white" : ""
              }`}
            >
              {day}
            </span>
            {lessonsForDay.length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {lessonsForDay.length}
              </span>
            )}
          </div>
          {lessonsForDay.length > 0 && (
            <div className="space-y-1">
              {lessonsForDay.slice(0, 2).map((lesson) => (
                <div
                  key={lesson.id}
                  className={`text-xs p-1 rounded truncate ${
                    lesson.type === "Теория" ? "bg-blue-100" : "bg-green-100"
                  }`}
                >
                  {lesson.time} {lesson.title.substring(0, 15)}...
                </div>
              ))}
              {lessonsForDay.length > 2 && (
                <div className="text-xs text-right text-gray-500">
                  +{lessonsForDay.length - 2} еще
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-1">
          {dayHeaders}
          {days}
        </div>
      </div>
    );
  };

  // Рендер списка занятий
  const renderLessonsList = (lessons: Lesson[]) => {
    return (
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="border rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="mr-2">{getLessonTypeIcon(lesson.type)}</span>
                  <h3 className="font-bold">{lesson.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${getLessonTypeColor(
                      lesson.type
                    )}`}
                  >
                    {lesson.type}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold flex items-center ${
                      getLessonStatusInfo(lesson.status).class
                    }`}
                  >
                    {getLessonStatusInfo(lesson.status).icon}
                    <span className="ml-1">
                      {getLessonStatusInfo(lesson.status).text}
                    </span>
                  </span>
                </div>
                <div className="text-gray-600 text-sm space-y-1">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    {formatDate(lesson.date)}
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    {lesson.time} - {lesson.duration}
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    {lesson.location}
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4">
                <div className="flex items-center mb-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src={lesson.instructor.photo}
                      alt={lesson.instructor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {lesson.instructor.name}
                    </p>
                    <Link
                      href={`/instructors/${lesson.instructor.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Профиль
                    </Link>
                  </div>
                </div>
                {lesson.status === "upcoming" && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setLessonToCancel(lesson);
                        setShowCancellationModal(true);
                      }}
                      className="px-3 py-1 border border-red-600 text-red-600 hover:bg-red-50 rounded text-sm"
                    >
                      Отменить
                    </button>
                    <button className="px-3 py-1 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-sm">
                      Перенести
                    </button>
                  </div>
                )}
              </div>
            </div>
            {lesson.notes && (
              <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Примечание:</span>{" "}
                  {lesson.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout
      title="Расписание занятий - Автошкола"
      description="Управление и просмотр расписания занятий в автошколе."
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
                        if (tab.id !== "schedule") {
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
              {/* Заголовок и кнопки управления */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                  <h2 className="text-xl font-bold mb-4 md:mb-0">
                    Расписание занятий
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewType("month")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        viewType === "month"
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      Месяц
                    </button>
                    <button
                      onClick={() => setViewType("list")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        viewType === "list"
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      Список
                    </button>
                  </div>
                </div>

                {viewType === "month" && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <button
                        onClick={() => handleMonthChange("prev")}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <FaChevronLeft />
                      </button>
                      <h3 className="text-lg font-bold">
                        {MONTHS[currentMonth.getMonth()]}{" "}
                        {currentMonth.getFullYear()}
                      </h3>
                      <button
                        onClick={() => handleMonthChange("next")}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                    {renderCalendar()}

                    {/* Занятия на выбранную дату */}
                    {selectedDate && (
                      <div className="mt-6 pt-6 border-t">
                        <h3 className="text-lg font-bold mb-4">
                          Занятия на {selectedDate.getDate()}{" "}
                          {MONTHS[selectedDate.getMonth()]}{" "}
                          {selectedDate.getFullYear()}
                        </h3>
                        {getLessonsForDate(selectedDate).length > 0 ? (
                          renderLessonsList(getLessonsForDate(selectedDate))
                        ) : (
                          <p className="text-gray-600">
                            Нет занятий на выбранную дату
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {viewType === "list" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold">Предстоящие занятия</h3>
                      <Link
                        href="/profile/schedule/new"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <FaPlus className="mr-1" />
                        Записаться на занятие
                      </Link>
                    </div>
                    {lessons.filter((lesson) => lesson.status === "upcoming")
                      .length > 0 ? (
                      renderLessonsList(
                        lessons
                          .filter((lesson) => lesson.status === "upcoming")
                          .sort(
                            (a, b) =>
                              new Date(a.date).getTime() -
                              new Date(b.date).getTime()
                          )
                      )
                    ) : (
                      <p className="text-gray-600 py-4">
                        У вас нет предстоящих занятий
                      </p>
                    )}

                    <div className="mt-8 pt-6 border-t">
                      <h3 className="font-bold mb-4">История занятий</h3>
                      {lessons.filter((lesson) => lesson.status !== "upcoming")
                        .length > 0 ? (
                        renderLessonsList(
                          lessons
                            .filter((lesson) => lesson.status !== "upcoming")
                            .sort(
                              (a, b) =>
                                new Date(b.date).getTime() -
                                new Date(a.date).getTime()
                            )
                        )
                      ) : (
                        <p className="text-gray-600 py-4">
                          У вас нет прошедших занятий
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Быстрая информация */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold mb-4">Статистика занятий</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FaCalendarAlt className="text-blue-600 mr-2" />
                      <h4 className="font-semibold">Всего занятий</h4>
                    </div>
                    <p className="text-2xl font-bold">{lessons.length}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FaCheckCircle className="text-green-600 mr-2" />
                      <h4 className="font-semibold">Завершено</h4>
                    </div>
                    <p className="text-2xl font-bold">
                      {lessons.filter((l) => l.status === "completed").length}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FaClock className="text-yellow-600 mr-2" />
                      <h4 className="font-semibold">Предстоит</h4>
                    </div>
                    <p className="text-2xl font-bold">
                      {lessons.filter((l) => l.status === "upcoming").length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Полезная информация */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold mb-4">Полезная информация</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">
                      Правила отмены занятий
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Отмена занятия возможна не позднее, чем за 24 часа до
                      начала. В случае отмены менее чем за 24 часа, занятие
                      считается проведенным и оплата не возвращается.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Опоздания на занятия</h4>
                    <p className="text-gray-600 text-sm">
                      Допустимое время опоздания на практическое занятие - 15
                      минут, на теоретическое - 10 минут. В случае более
                      длительного опоздания, инструктор имеет право отменить
                      занятие.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Перенос занятий</h4>
                    <p className="text-gray-600 text-sm">
                      Перенос занятия возможен при наличии свободного времени у
                      инструктора. Для переноса необходимо согласовать новое
                      время как минимум за 48 часов.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно отмены занятия */}
      {showCancellationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Отмена занятия</h3>
              <button
                onClick={() => setShowCancellationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <p className="mb-4">
              Вы уверены, что хотите отменить занятие "{lessonToCancel?.title}"
              на {lessonToCancel ? formatDate(lessonToCancel.date) : ""} в{" "}
              {lessonToCancel?.time}?
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Причина отмены
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={3}
                placeholder="Укажите причину отмены занятия"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancellationModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleCancelLesson}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={!cancellationReason.trim()}
              >
                Подтвердить отмену
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProfileSchedulePage;
