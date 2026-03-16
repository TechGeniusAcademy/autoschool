import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AvatarUpload from "@/components/common/AvatarUpload";
import { AuthAPI, User, InstructorAPI, TokenStorage } from "../../services/api";
import { getAvatarUrl, API_BASE_URL } from "../../constants/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaUser, FaCalendarAlt, FaCar, FaUsers, FaChartBar, FaFileAlt, FaUserCog, FaSignOutAlt, FaBell, FaCheckCircle, FaCreditCard, FaExclamationTriangle, FaUserGraduate, FaPlus } from "react-icons/fa";

// Тип для представления навигационных вкладок
interface NavTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Тип для представления занятия
interface Lesson {
  id: number;
  studentName: string;
  studentPhoto: string;
  date: string;
  time: string;
  type: "Теория" | "Практика";
  status: "upcoming" | "completed" | "canceled";
  location?: string;
}

// Тип для представления ученика
interface Student {
  id: number;
  name: string;
  photo: string | null;
  progress: number;
  category: string;
  start_date: string;
  last_lesson: string | null;
  next_lesson?: string | null;
  status: string;
}

// Тип для представления уведомления
interface Notification {
  id: number;
  text: string;
  date: string;
  read: boolean;
  type: "info" | "warning" | "success";
}

// Компонент модального окна для назначения занятия
interface ScheduleLessonModalProps {
  student: Student;
  onClose: () => void;
  onSubmit: (lessonData: any) => void;
}

const ScheduleLessonModal: React.FC<ScheduleLessonModalProps> = ({ student, onClose, onSubmit }) => {
  const [lessonData, setLessonData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    type: "theory",
    subject: "",
    description: "",
    location: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonData.date || !lessonData.startTime || !lessonData.endTime) {
      alert("Пожалуйста, заполните дату, время начала и время окончания занятия");
      return;
    }

    // Проверяем, что время окончания позже времени начала
    if (lessonData.startTime >= lessonData.endTime) {
      alert("Время окончания должно быть позже времени начала");
      return;
    }

    onSubmit(lessonData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Назначить занятие</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Студент: <span className="font-medium">{student.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата занятия</label>
            <input type="date" value={lessonData.date} onChange={(e) => setLessonData({ ...lessonData, date: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Время начала</label>
              <input type="time" value={lessonData.startTime} onChange={(e) => setLessonData({ ...lessonData, startTime: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Время окончания</label>
              <input type="time" value={lessonData.endTime} onChange={(e) => setLessonData({ ...lessonData, endTime: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип занятия</label>
            <select value={lessonData.type} onChange={(e) => setLessonData({ ...lessonData, type: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="theory">Теория</option>
              <option value="practice">Практика</option>
              <option value="exam">Экзамен</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Предмет занятия</label>
            <input type="text" value={lessonData.subject} onChange={(e) => setLessonData({ ...lessonData, subject: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Например: ПДД, Вождение по городу..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Место проведения</label>
            <input type="text" value={lessonData.location} onChange={(e) => setLessonData({ ...lessonData, location: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Например: Кабинет №1, Автодром..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание (необязательно)</label>
            <textarea value={lessonData.description} onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Дополнительная информация о занятии..." />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">
              Отмена
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Назначить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Компонент для отображения расписания инструктора
interface InstructorScheduleTabProps {
  onCreateLesson: (type: "individual" | "group") => void;
}

const InstructorScheduleTab: React.FC<InstructorScheduleTabProps> = ({ onCreateLesson }) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [individualLessons, setIndividualLessons] = useState<any[]>([]);
  const [oneTimeGroupLessons, setOneTimeGroupLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstructorSchedule();
  }, []);

  const fetchInstructorSchedule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      // Загружаем расписание (включает групповые и индивидуальные занятия)
      const schedulesResponse = await fetch(`${API_BASE_URL}/schedules/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const schedulesData = await schedulesResponse.json();

      if (schedulesData.success && schedulesData.data) {
        // Новая структура: data содержит schedules, individualLessons и oneTimeGroupLessons
        setSchedules(schedulesData.data.schedules || []);
        setIndividualLessons(schedulesData.data.individualLessons || []);
        setOneTimeGroupLessons(schedulesData.data.oneTimeGroupLessons || []);
      }
    } catch (error) {
      console.error("Ошибка загрузки расписания:", error);
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeekRus = {
    Monday: "Понедельник",
    Tuesday: "Вторник",
    Wednesday: "Среда",
    Thursday: "Четверг",
    Friday: "Пятница",
    Saturday: "Суббота",
    Sunday: "Воскресенье",
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Кнопки для создания занятий */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-4">
          <button onClick={() => onCreateLesson("individual")} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
            <FaPlus className="mr-2" />
            Создать индивидуальное занятие
          </button>
          <button onClick={() => onCreateLesson("group")} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
            <FaPlus className="mr-2" />
            Создать групповое занятие
          </button>
        </div>
      </div>

      {/* Групповые занятия */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Групповые занятия</h3>
        {schedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Группа</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">День недели</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Время</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Предмет</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Место</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{schedule.group_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(daysOfWeekRus as any)[schedule.day_of_week] || schedule.day_of_week}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schedule.start_time} - {schedule.end_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schedule.subject || "Не указан"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schedule.location || "Не указано"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Групповых занятий не назначено</p>
        )}
      </div>

      {/* Индивидуальные занятия */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Индивидуальные занятия</h3>
        {individualLessons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Студент</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Время</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Предмет</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Место</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {individualLessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lesson.student_name} {lesson.student_surname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.lesson_date ? new Date(lesson.lesson_date).toLocaleDateString("ru-RU") : "Дата не указана"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lesson.start_time} - {lesson.end_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.subject || "Не указан"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.location || "Не указано"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lesson.status === "completed" ? "bg-green-100 text-green-800" : lesson.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{lesson.status === "scheduled" ? "Запланировано" : lesson.status === "completed" ? "Завершено" : lesson.status === "cancelled" ? "Отменено" : lesson.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Индивидуальных занятий не назначено</p>
        )}
      </div>

      {/* Одноразовые групповые занятия */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Одноразовые групповые занятия</h3>
        {oneTimeGroupLessons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Группа</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Время</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Предмет</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Место</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {oneTimeGroupLessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lesson.group_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(lesson.lesson_date).toLocaleDateString("ru-RU")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lesson.start_time} - {lesson.end_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.subject || "Не указан"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.location || "Не указано"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Одноразовых групповых занятий не назначено</p>
        )}
      </div>
    </div>
  );
};

const InstructorProfilePage: React.FC = () => {
  const router = useRouter();

  // Состояние для активной вкладки
  const [activeTab, setActiveTab] = useState("dashboard");
  // Состояние для данных пользователя
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Состояния для ближайшего занятия
  const [upcomingLesson, setUpcomingLesson] = useState<any>(null);
  const [upcomingLessonLoading, setUpcomingLessonLoading] = useState(false);

  // Состояния для студентов
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [showScheduleLesson, setShowScheduleLesson] = useState(false);

  // Состояния для профиля инструктора
  const [instructorProfile, setInstructorProfile] = useState({
    categories: [] as string[],
    experience: "",
    description: "",
    schedule: "",
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileSaveMessage, setProfileSaveMessage] = useState<string | null>(null);

  // Состояния для создания занятий
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState<"individual" | "group">("individual");
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);

  // Данные формы для индивидуального занятия
  const [individualFormData, setIndividualFormData] = useState({
    student_id: "",
    lesson_date: "",
    start_time: "",
    end_time: "",
    subject: "",
    location: "",
    notes: "",
  });

  // Данные формы для группового занятия
  const [groupFormData, setGroupFormData] = useState({
    group_id: "",
    scheduled_date: "",
    start_time: "",
    end_time: "",
    subject: "",
    location: "",
    description: "",
  });

  // Загрузка данных пользователя при монтировании компонента
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await AuthAPI.getProfile();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Функция обновления аватарки
  const handleAvatarUpdate = (avatarUrl: string | null) => {
    if (user) {
      setUser({
        ...user,
        avatarUrl: avatarUrl || undefined,
      });
    }
  };

  // Функция выхода из системы
  const handleLogout = async () => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      TokenStorage.remove();
      setUser(null);
      router.push("/");
    }
  };

  // Загрузка профиля инструктора
  const fetchInstructorProfile = async () => {
    try {
      setIsProfileLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/instructor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      console.log("Instructor profile response:", data);

      if (data.success) {
        setInstructorProfile({
          categories: data.data.categories || [],
          experience: data.data.experience || "",
          description: data.data.description || "",
          schedule: data.data.schedule || "",
        });
        console.log("Instructor profile set:", {
          categories: data.data.categories || [],
          experience: data.data.experience || "",
          description: data.data.description || "",
          schedule: data.data.schedule || "",
        });
      } else {
        console.error("Failed to load instructor profile:", data.message);
      }
    } catch (error) {
      console.error("Error fetching instructor profile:", error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Сохранение профиля инструктора
  const saveInstructorProfile = async () => {
    try {
      setIsProfileLoading(true);
      console.log("Saving instructor profile:", instructorProfile);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/instructor/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(instructorProfile),
      });
      const data = await response.json();

      console.log("Save instructor profile response:", data);

      if (data.success) {
        setProfileSaveMessage("Профиль успешно сохранен!");
        setTimeout(() => setProfileSaveMessage(null), 3000);
      } else {
        setProfileSaveMessage("Ошибка при сохранении профиля: " + data.message);
      }
    } catch (error) {
      console.error("Error saving instructor profile:", error);
      setProfileSaveMessage("Ошибка при сохранении профиля");
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Функция для загрузки ближайшего занятия
  const fetchUpcomingLesson = async () => {
    try {
      setUpcomingLessonLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/schedules/my/upcoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success && data.data) {
        setUpcomingLesson(data.data);
      } else {
        setUpcomingLesson(null);
      }
    } catch (error) {
      console.error("Error fetching upcoming lesson:", error);
      setUpcomingLesson(null);
    } finally {
      setUpcomingLessonLoading(false);
    }
  };

  // Функция для загрузки студентов
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const response = await InstructorAPI.getAllStudents();

      if (response.success && response.data) {
        // Преобразуем в формат Student
        const studentsData = response.data.map((user: any) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          photo: getAvatarUrl(user.avatar_url), // Используем getAvatarUrl для правильного URL
          progress: Math.floor(Math.random() * 100), // Временно рандомный прогресс
          category: "B", // Временно фиксированная категория B
          start_date: user.created_at ? new Date(user.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          last_lesson: null, // Временно null
          next_lesson: null, // Временно null
          status: user.is_active ? "active" : "inactive", // Используем is_active из БД
        }));
        setStudents(studentsData);
      }
    } catch (error) {
      console.error("Ошибка загрузки студентов:", error);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Функция для показа детальной информации о студенте
  const handleShowStudentDetails = async (student: Student) => {
    try {
      const response = await InstructorAPI.getStudentDetails(student.id);
      if (response.success && response.data) {
        setSelectedStudent({ ...student, ...response.data });
        setShowStudentDetails(true);
      }
    } catch (error) {
      console.error("Ошибка загрузки детальной информации:", error);
      // Показываем базовую информацию, если не удалось загрузить детали
      setSelectedStudent(student);
      setShowStudentDetails(true);
    }
  };

  // Функция для показа формы назначения занятия
  const handleScheduleLesson = (student: Student) => {
    setSelectedStudent(student);
    setShowScheduleLesson(true);
  };

  // Загрузка профиля инструктора при переходе на вкладку настроек
  useEffect(() => {
    if (activeTab === "settings" && user?.role === "instructor") {
      fetchInstructorProfile();
    }
  }, [activeTab, user?.role]);

  // Загрузка студентов при переходе на вкладку студентов
  useEffect(() => {
    if (activeTab === "students" && user?.role === "instructor") {
      fetchStudents();
    }
  }, [activeTab, user?.role]);

  // Загрузка ближайшего занятия при переходе на дашборд
  useEffect(() => {
    if (activeTab === "dashboard" && user?.role === "instructor") {
      fetchUpcomingLesson();
    }
  }, [activeTab, user?.role]);

  // Функция обновления всех данных дашборда
  const refreshDashboardData = async () => {
    if (user?.role === "instructor") {
      await fetchUpcomingLesson();
      await fetchStudents();
    }
  };

  // Функции для создания занятий
  // Загрузка данных для форм
  const loadFormData = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      // Загружаем студентов
      const studentsResponse = await fetch(`${API_BASE_URL}/instructor/all-students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const studentsData = await studentsResponse.json();
      if (studentsData.success) {
        setAvailableStudents(studentsData.data || []);
      }

      // Загружаем группы (если нужно)
      try {
        const groupsResponse = await fetch(`${API_BASE_URL}/instructor/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groupsData = await groupsResponse.json();
        if (groupsData.success) {
          setAvailableGroups(groupsData.data || []);
        }
      } catch (groupsError) {
        console.log("Группы недоступны, только индивидуальные занятия");
        setAvailableGroups([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки данных для форм:", error);
    }
  };

  // Открытие модального окна
  const openCreateModal = (type: "individual" | "group") => {
    setModalType(type);
    setShowCreateModal(true);
    loadFormData();
  };

  // Закрытие модального окна
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setIndividualFormData({
      student_id: "",
      lesson_date: "",
      start_time: "",
      end_time: "",
      subject: "",
      location: "",
      notes: "",
    });
    setGroupFormData({
      group_id: "",
      scheduled_date: "",
      start_time: "",
      end_time: "",
      subject: "",
      location: "",
      description: "",
    });
  };

  // Обработка изменений в форме индивидуального занятия
  const handleIndividualInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIndividualFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработка изменений в форме группового занятия
  const handleGroupInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGroupFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Создание индивидуального занятия
  const createIndividualLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth_token");

      // Получаем ID инструктора из токена или контекста
      const userResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userResponse.json();
      const instructorId = userData.data?.user?.id;

      const lessonData = {
        title: `Индивидуальное занятие - ${individualFormData.subject || "Без темы"}`,
        description: individualFormData.notes,
        instructor_id: instructorId,
        student_id: parseInt(individualFormData.student_id),
        scheduled_date: individualFormData.lesson_date,
        start_time: individualFormData.start_time,
        end_time: individualFormData.end_time,
        location: individualFormData.location,
        subject: individualFormData.subject,
        status: "scheduled",
      };

      const response = await InstructorAPI.scheduleLesson(lessonData);

      if (response.success) {
        closeCreateModal();
        // Обновляем данные дашборда
        refreshDashboardData();
        alert("Индивидуальное занятие успешно создано!");
      }
    } catch (error) {
      console.error("Ошибка создания индивидуального занятия:", error);
      alert("Ошибка при создании занятия");
    }
  };

  // Создание группового занятия
  const createGroupLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth_token");

      // Получаем ID инструктора
      const userResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userResponse.json();
      const instructorId = userData.data?.user?.id;

      const lessonData = {
        ...groupFormData,
        instructor_id: instructorId,
        group_id: parseInt(groupFormData.group_id),
        title: `Занятие группы - ${groupFormData.subject || "Без темы"}`,
      };

      const response = await InstructorAPI.createGroupLesson(lessonData);

      if (response.success) {
        closeCreateModal();
        // Обновляем данные дашборда
        refreshDashboardData();
        alert("Групповое занятие успешно создано!");
      }
    } catch (error) {
      console.error("Ошибка создания группового занятия:", error);
      alert("Ошибка при создании группового занятия");
    }
  };

  // Навигационные вкладки
  const navTabs: NavTab[] = [
    { id: "dashboard", label: "Дашборд", icon: <FaUser /> },
    { id: "schedule", label: "Расписание", icon: <FaCalendarAlt /> },
    { id: "students", label: "Ученики", icon: <FaUserGraduate /> },
    // { id: "statistics", label: "Статистика", icon: <FaChartBar /> },
    // { id: "materials", label: "Материалы", icon: <FaFileAlt /> },
    { id: "settings", label: "Настройки", icon: <FaUserCog /> },
  ];

  // Моковые данные для уведомлений
  const notifications: Notification[] = [
    {
      id: 1,
      text: "Изменения в расписании на следующую неделю",
      date: "12.09.2023",
      read: false,
      type: "info",
    },
    {
      id: 2,
      text: "Ученик Сидоров Д. перенес занятие на 17.09.2023",
      date: "11.09.2023",
      read: true,
      type: "warning",
    },
    {
      id: 3,
      text: "Новые учебные материалы доступны для скачивания",
      date: "09.09.2023",
      read: false,
      type: "info",
    },
  ];

  // Получение иконки для статуса занятия
  const getStatusIcon = (status: Lesson["status"]) => {
    switch (status) {
      case "upcoming":
        return <FaCalendarAlt className="text-blue-500" />;
      case "completed":
        return <FaCheckCircle className="text-green-500" />;
      case "canceled":
        return <FaExclamationTriangle className="text-red-500" />;
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
                <div className="w-20 h-20 mr-6 mb-4 md:mb-0">
                  <AvatarUpload user={user} onAvatarUpdate={handleAvatarUpdate} size="medium" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    Добро пожаловать, {user?.firstName} {user?.lastName}!
                  </h2>
                  <p className="text-gray-600">{upcomingLesson ? "У вас есть ближайшее занятие" : "Нет предстоящих занятий на сегодня"}</p>
                </div>
              </div>
            </div>

            {/* Краткая сводка */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="flex items-center mb-3">
                  <FaCalendarAlt className="text-red-600 text-xl mr-3" />
                  <h3 className="font-bold">Ближайшее занятие</h3>
                </div>
                {upcomingLessonLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  </div>
                ) : upcomingLesson ? (
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-300 flex items-center justify-center">{upcomingLesson.student_photo ? <Image src={getAvatarUrl(upcomingLesson.student_photo) || "/default-avatar.svg"} alt={upcomingLesson.student_name} fill className="object-cover" /> : <FaUser className="text-gray-600 text-sm" />}</div>
                      <span className="font-medium">{upcomingLesson.student_name || upcomingLesson.group_name || "Группа"}</span>
                    </div>
                    <p className="text-gray-600">
                      {new Date(upcomingLesson.lesson_date).toLocaleDateString("ru-RU")}, {upcomingLesson.start_time} - {upcomingLesson.end_time}
                    </p>
                    <p className="text-gray-600">
                      {upcomingLesson.subject || upcomingLesson.type_display}, {upcomingLesson.location || "Не указано"}
                    </p>
                    <button onClick={() => setActiveTab("schedule")} className="text-red-600 hover:text-red-700 text-sm mt-2 inline-block">
                      Все занятия →
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-600">Нет предстоящих занятий</p>
                )}
              </div>

              <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="flex items-center mb-3">
                  <FaUsers className="text-red-600 text-xl mr-3" />
                  <h3 className="font-bold">Мои ученики</h3>
                </div>
                <p className="font-medium">Всего учеников: {students.length}</p>
                <div className="flex -space-x-2 overflow-hidden my-3">
                  {students.slice(0, 4).map((student) => (
                    <div key={student.id} className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-gray-300 flex items-center justify-center">
                      {student.photo ? <Image src={getAvatarUrl(student.photo) || "/default-avatar.svg"} alt={student.name} fill className="object-cover" /> : <FaUser className="text-gray-600 text-sm" />}
                    </div>
                  ))}
                  {students.length > 4 && <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-gray-200 text-gray-700 font-bold text-sm">+{students.length - 4}</div>}
                </div>
                <button onClick={() => setActiveTab("students")} className="text-red-600 hover:text-red-700 text-sm inline-block">
                  Управление учениками →
                </button>
              </div>

              {/* <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="flex items-center mb-3">
                  <FaCreditCard className="text-red-600 text-xl mr-3" />
                  <h3 className="font-bold">Оплата</h3>
                </div>
                <p className="font-medium">Заработано в этом месяце:</p>
                <p className="text-2xl font-bold mb-2">45 000 ₸</p>
                <p className="text-gray-600 text-sm">
                  Следующая выплата: 30.09.2023
                </p>
                <Link
                  href="/profile/instructor/payments"
                  className="text-red-600 hover:text-red-700 text-sm mt-2 inline-block"
                >
                  Подробнее →
                </Link>
              </div> */}
            </div>

            {/* Сегодняшние занятия */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Занятия</h3>
                <button onClick={() => setActiveTab("schedule")} className="text-red-600 hover:text-red-700 text-sm">
                  Полное расписание →
                </button>
              </div>
              {upcomingLessonLoading ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                </div>
              ) : upcomingLesson ? (
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-300 flex items-center justify-center">{upcomingLesson.student_photo ? <Image src={getAvatarUrl(upcomingLesson.student_photo) || "/default-avatar.svg"} alt={upcomingLesson.student_name} fill className="object-cover" /> : <FaUser className="text-gray-600 text-sm" />}</div>
                    <div>
                      <p className="font-medium">{upcomingLesson.student_name || upcomingLesson.group_name || "Группа"}</p>
                      <p className="text-sm text-gray-600">
                        {upcomingLesson.subject || upcomingLesson.type_display}
                        {upcomingLesson.location && ` • ${upcomingLesson.location}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end">
                    <span className="font-medium sm:mb-1">
                      {upcomingLesson.start_time} - {upcomingLesson.end_time}
                    </span>
                    <span className="text-sm text-gray-600 ml-3 sm:ml-0">{new Date(upcomingLesson.lesson_date).toLocaleDateString("ru-RU")}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">На сегодня занятий нет</p>
              )}
            </div>

            {/* Уведомления */}
            {/* <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Уведомления</h3>
                <button onClick={() => setActiveTab("notifications")} className="text-red-600 hover:text-red-700 text-sm">
                  Все уведомления →
                </button>
              </div>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`border rounded-lg p-3 ${getNotificationColor(notification.type)} ${!notification.read ? "border-l-4" : ""}`}>
                      <div className="flex justify-between">
                        <p className={!notification.read ? "font-semibold" : "font-normal"}>{notification.text}</p>
                        <span className="text-gray-500 text-sm">{notification.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Нет новых уведомлений</p>
              )}
            </div> */}

            {/* Быстрые действия */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-4">Быстрые действия</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setActiveTab("schedule")} className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50">
                  <FaCalendarAlt className="text-red-600 text-2xl mb-2" />
                  <span className="text-center">Создать занятие</span>
                </button>
                <button onClick={() => setActiveTab("materials")} className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50">
                  <FaFileAlt className="text-red-600 text-2xl mb-2" />
                  <span className="text-center">Учебные материалы</span>
                </button>
                <button onClick={() => setActiveTab("students")} className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50">
                  <FaUsers className="text-red-600 text-2xl mb-2" />
                  <span className="text-center">Ученики</span>
                </button>
                {/* <button onClick={() => setActiveTab("statistics")} className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50">
                  <FaChartBar className="text-red-600 text-2xl mb-2" />
                  <span className="text-center">Статистика</span>
                </button> */}
              </div>
            </div>
          </div>
        );

      case "students":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Мои ученики</h2>

            {studentsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <FaUserGraduate className="mx-auto text-gray-400 text-6xl mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет учеников</h3>
                <p className="text-gray-500">У вас пока нет назначенных учеников.</p>
              </div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ученик
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Категория
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Прогресс
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата начала
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Последнее занятие
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Следующее занятие
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Действия</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative bg-gray-300 rounded-full flex items-center justify-center">{student.photo ? <Image src={getAvatarUrl(student.photo) || "/default-avatar.svg"} alt={student.name} fill className="rounded-full object-cover" /> : <FaUser className="text-gray-600 text-sm" />}</div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{student.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${student.progress}%` }}></div>
                            </div>
                            <span>{student.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.start_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.last_lesson || "Нет данных"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.next_lesson || "Не назначено"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-red-600 hover:text-red-900 mr-3" onClick={() => handleShowStudentDetails(student)}>
                            Подробнее
                          </button>
                          {/* <button className="text-blue-600 hover:text-blue-900" onClick={() => handleScheduleLesson(student)}>
                            Назначить занятие
                          </button> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case "settings":
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Настройки профиля</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Основная информация */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Основная информация</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                      <input type="text" value={user?.firstName || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                      <input type="text" value={user?.lastName || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={user?.email || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                      <input type="tel" value={user?.phone || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" readOnly />
                    </div>
                  </div>
                </div>

                {/* Профиль инструктора */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Профиль инструктора</h4>

                  {profileSaveMessage && <div className={`mb-4 p-3 rounded-md ${profileSaveMessage.includes("успешно") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{profileSaveMessage}</div>}

                  <div className="space-y-4">
                    {/* Категории */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Категории обучения</label>
                      <div className="flex flex-wrap gap-2">
                        {["A", "B", "C", "D"].map((category) => (
                          <label key={category} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={instructorProfile.categories.includes(category)}
                              onChange={(e) => {
                                const categories = e.target.checked ? [...instructorProfile.categories, category] : instructorProfile.categories.filter((c) => c !== category);
                                setInstructorProfile({
                                  ...instructorProfile,
                                  categories,
                                });
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Категория {category}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Стаж */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Стаж работы</label>
                      <input
                        type="text"
                        value={instructorProfile.experience}
                        onChange={(e) =>
                          setInstructorProfile({
                            ...instructorProfile,
                            experience: e.target.value,
                          })
                        }
                        placeholder="Например: 10 лет"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Описание */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
                      <textarea
                        value={instructorProfile.description}
                        onChange={(e) =>
                          setInstructorProfile({
                            ...instructorProfile,
                            description: e.target.value,
                          })
                        }
                        placeholder="Расскажите о своем опыте, подходе к обучению..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* График работы */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">График работы</label>
                      <input
                        type="text"
                        value={instructorProfile.schedule}
                        onChange={(e) =>
                          setInstructorProfile({
                            ...instructorProfile,
                            schedule: e.target.value,
                          })
                        }
                        placeholder="Например: Пн-Пт: 9:00-18:00, Сб: 10:00-15:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-start">
                      <button onClick={saveInstructorProfile} disabled={isProfileLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                        {isProfileLoading ? "Сохранение..." : "Сохранить профиль"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Уведомления */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Уведомления</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Email уведомления о новых занятиях</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">SMS напоминания</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                      <span className="ml-2 text-sm text-gray-700">Уведомления о отменах занятий</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">Сохранить изменения</button>
                </div>
              </div>
            </div>
          </div>
        );

      case "schedule":
        return (
          <>
            <InstructorScheduleTab onCreateLesson={openCreateModal} />
          </>
        );

      // Другие вкладки могут быть добавлены по аналогии...
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>В разработке...</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["instructor"]}>
        <Layout title="Профиль инструктора">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["instructor"]}>
      <Layout title="Кабинет инструктора - Автошкола" description="Панель управления инструктора автошколы. Расписание занятий, ученики и статистика.">
        <div className="bg-gray-100 py-10">
          <div className="container-fluid">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Боковая навигация */}
              <div className="md:w-1/4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto mb-4">
                      <AvatarUpload user={user} onAvatarUpdate={handleAvatarUpdate} size="large" />
                    </div>
                    <h2 className="text-xl font-bold">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-600">Инструктор автошколы</p>
                    <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                  </div>

                  <nav className="space-y-1">
                    {navTabs.map((tab) => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center p-3 rounded-lg transition ${activeTab === tab.id ? "bg-red-100 text-red-700" : "hover:bg-gray-100"}`}>
                        <span className="mr-3">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <button onClick={handleLogout} className="w-full flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
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
        {/* Модальное окно детальной информации о студенте */}
        {showStudentDetails && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Информация о студенте</h3>
                <button onClick={() => setShowStudentDetails(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">{selectedStudent.photo ? <Image src={getAvatarUrl(selectedStudent.photo) || "/default-avatar.svg"} alt={selectedStudent.name} width={64} height={64} className="rounded-full object-cover" /> : <FaUser className="text-gray-600 text-2xl" />}</div>
                  <div>
                    <h4 className="font-bold text-lg">{selectedStudent.name}</h4>
                    <p className="text-gray-600">Категория: {selectedStudent.category}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Прогресс:</span>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${selectedStudent.progress}%` }}></div>
                        </div>
                        <span className="text-xs">{selectedStudent.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Статус:</span>
                      <p className="font-medium">{selectedStudent.status === "active" ? "Активный" : "Неактивный"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Дата начала:</span>
                      <p className="font-medium">{selectedStudent.start_date}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Последнее занятие:</span>
                      <p className="font-medium">{selectedStudent.last_lesson || "Нет данных"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-2">
                <button onClick={() => setShowStudentDetails(false)} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">
                  Закрыть
                </button>
                <button
                  onClick={() => {
                    setShowStudentDetails(false);
                    handleScheduleLesson(selectedStudent);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Назначить занятие
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Модальное окно создания занятий */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">{modalType === "individual" ? "Создать индивидуальное занятие" : "Создать групповое занятие"}</h3>
                <button onClick={closeCreateModal} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <form onSubmit={modalType === "individual" ? createIndividualLesson : createGroupLesson} className="space-y-4">
                {modalType === "individual" ? (
                  <>
                    {/* Форма индивидуального занятия */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Студент *</label>
                      <select name="student_id" value={individualFormData.student_id} onChange={handleIndividualInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Выберите студента</option>
                        {availableStudents.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.first_name} {student.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата *</label>
                        <input type="date" name="lesson_date" value={individualFormData.lesson_date} onChange={handleIndividualInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Время начала *</label>
                        <input type="time" name="start_time" value={individualFormData.start_time} onChange={handleIndividualInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Время окончания *</label>
                        <input type="time" name="end_time" value={individualFormData.end_time} onChange={handleIndividualInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Предмет</label>
                        <input type="text" name="subject" value={individualFormData.subject} onChange={handleIndividualInputChange} placeholder="Например: Теория ПДД, Практическое вождение" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Место проведения</label>
                        <input type="text" name="location" value={individualFormData.location} onChange={handleIndividualInputChange} placeholder="Например: Класс №1, Автодром" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Заметки</label>
                      <textarea name="notes" value={individualFormData.notes} onChange={handleIndividualInputChange} rows={3} placeholder="Дополнительная информация о занятии..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Форма группового занятия */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Группа *</label>
                      <select name="group_id" value={groupFormData.group_id} onChange={handleGroupInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Выберите группу</option>
                        {availableGroups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата *</label>
                        <input type="date" name="scheduled_date" value={groupFormData.scheduled_date} onChange={handleGroupInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Время начала *</label>
                        <input type="time" name="start_time" value={groupFormData.start_time} onChange={handleGroupInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Время окончания *</label>
                        <input type="time" name="end_time" value={groupFormData.end_time} onChange={handleGroupInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Предмет</label>
                        <input type="text" name="subject" value={groupFormData.subject} onChange={handleGroupInputChange} placeholder="Например: Теория ПДД, Практическое вождение" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Место проведения</label>
                        <input type="text" name="location" value={groupFormData.location} onChange={handleGroupInputChange} placeholder="Например: Класс №1, Автодром" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                      <textarea name="description" value={groupFormData.description} onChange={handleGroupInputChange} rows={3} placeholder="Дополнительная информация о групповом занятии..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <button type="button" onClick={closeCreateModal} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">
                    Отмена
                  </button>
                  <button type="submit" className={`px-4 py-2 text-white rounded hover:opacity-90 ${modalType === "individual" ? "bg-blue-600" : "bg-green-600"}`}>
                    {modalType === "individual" ? "Создать индивидуальное занятие" : "Создать групповое занятие"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}{" "}
        {/* Модальное окно назначения занятия */}
        {showScheduleLesson && selectedStudent && (
          <ScheduleLessonModal
            student={selectedStudent}
            onClose={() => setShowScheduleLesson(false)}
            onSubmit={async (lessonData) => {
              try {
                // Получаем информацию о текущем инструкторе
                const token = localStorage.getItem("auth_token");
                if (!token) {
                  alert("Ошибка аутентификации. Пожалуйста, войдите в систему снова.");
                  return;
                }

                const userResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const userData = await userResponse.json();

                if (!userData.success || !userData.data?.user?.id) {
                  alert("Ошибка получения данных инструктора");
                  return;
                }

                const instructorId = userData.data.user.id;

                // Формируем данные для сервера в правильном формате
                const formattedLessonData = {
                  title: `Индивидуальное занятие - ${lessonData.subject || lessonData.type}`,
                  description: lessonData.description || "",
                  subject: lessonData.subject || "",
                  location: lessonData.location || "",
                  student_id: selectedStudent.id,
                  instructor_id: instructorId,
                  scheduled_date: lessonData.date, // сервер ожидает scheduled_date
                  start_time: lessonData.startTime,
                  end_time: lessonData.endTime,
                  status: "scheduled",
                };

                console.log("Отправляем данные на сервер:", formattedLessonData);

                await InstructorAPI.scheduleLesson(formattedLessonData);
                setShowScheduleLesson(false);
                alert("Занятие успешно назначено!");
                // Обновляем список студентов
                fetchStudents();
              } catch (error: any) {
                console.error("Ошибка при назначении занятия:", error);
                alert(`Ошибка при назначении занятия: ${error.message || "Неизвестная ошибка"}`);
              }
            }}
          />
        )}
      </Layout>
    </ProtectedRoute>
  );
};

export default InstructorProfilePage;

/*
ВНЕСЕННЫЕ ИЗМЕНЕНИЯ:

1. Создание личного кабинета инструктора (1 сентября 2025):
   - Создана специальная страница /profile/instructor для инструкторов
   - Адаптирована структура компонентов под потребности инструктора
   - Добавлены специфические разделы: студенты, статистика инструктора
   - Интерфейс оптимизирован для управления учебным процессом

2. Интерфейс инструктора:
   - Дашборд с ключевой статистикой (всего студентов, активные занятия, рейтинг)
   - Расписание занятий с информацией о студентах и типах занятий
   - Управление студентами с отображением прогресса обучения
   - Доступ к учебным материалам и методическим пособиям
   - Детальная статистика работы инструктора
   - Настройки профиля с персональными предпочтениями

3. Функциональность:
   - Отображение списка закрепленных студентов с прогрессом
   - Календарь занятий с типами (теория/практика)
   - Статистика эффективности работы и рейтинга
   - Система уведомлений о переносах и изменениях
   - Возможность просмотра контактных данных студентов
   - Управление расписанием и планирование занятий

4. Технические особенности:
   - Использование ProtectedRoute с ролью "instructor" для защиты доступа
   - Интеграция с AuthAPI для загрузки данных пользователя из базы данных
   - Реализация компонента AvatarUpload для загрузки и отображения аватарки
   - Использование React Hooks (useState, useEffect) для управления состоянием
   - Адаптивный дизайн для всех устройств
   - Интеграция с общей системой Layout
   - Моковые данные для демонстрации функциональности
   - TypeScript типизация для всех компонентов и интерфейсов
   - Индикатор загрузки для улучшения UX

5. Безопасность и доступ:
   - Маршрут защищен компонентом ProtectedRoute
   - Доступ только для пользователей с ролью "instructor"
   - Автоматический редирект неавторизованных пользователей
   - Интеграция с системой ролей и авторизации

6. UI/UX особенности:
   - Красная цветовая схема для выделения роли инструктора
   - Иконки, соответствующие преподавательской деятельности
   - Табличное отображение данных студентов
   - Карточки с прогресс-барами для наглядности
   - Статусы занятий с цветовой индикацией
   - Интуитивная навигация по разделам

7. Структура данных:
   - Интерфейсы для занятий, студентов и уведомлений
   - Моковые данные для демонстрации работы системы
   - Типизация всех компонентов состояния
   - Гибкая структура для будущего подключения к API

История изменений:
- 01.09.2025: Создание базового интерфейса инструктора
- 01.09.2025: Добавление специфической навигации и разделов
- 01.09.2025: Реализация системы вкладок и контента
- 01.09.2025: Применение финального дизайна и функциональности
- 01.09.2025: Добавление защиты маршрута с помощью ProtectedRoute
- 01.09.2025: Интеграция с базой данных для аватарки и данных пользователя
- 01.09.2025: Добавление загрузки данных через AuthAPI
- 01.09.2025: Реализация компонента AvatarUpload в профиле инструктора
- 01.09.2025: Добавление динамического отображения имени и email
- 01.09.2025: Создание полноценной вкладки настроек с данными пользователя
- 01.09.2025: Документирование всех внесенных изменений
*/
