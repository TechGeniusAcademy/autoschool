import React, { useState, useEffect, useCallback } from "react";
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaClock, FaUsers, FaUser, FaTimes } from "react-icons/fa";
import { AdminAPI, TokenStorage } from "../../../services/api";
import { API_BASE_URL } from "../../../constants/api";

interface Schedule {
  id: number;
  title: string;
  description?: string;
  instructor_id: number;
  instructor_name: string;
  group_id?: number;
  group_name?: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  location?: string;
  subject?: string;
  is_active: boolean;
  is_one_time?: boolean;
  created_at: string;
}

interface IndividualLesson {
  id: number;
  title: string;
  description?: string;
  instructor_id: number;
  instructor_name: string;
  student_id: number;
  student_name: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  location?: string;
  subject?: string;
  status: "scheduled" | "completed" | "cancelled";
  created_at: string;
}

interface ScheduleFormData {
  title: string;
  description: string;
  instructor_id: number;
  group_id: number;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  location: string;
  subject: string;
  is_active: boolean;
}

interface IndividualLessonFormData {
  title: string;
  description: string;
  instructor_id: number;
  student_id: number;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  location: string;
  subject: string;
  status: "scheduled" | "completed" | "cancelled";
}

const AdminSchedules: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"group" | "individual">("group");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [individualLessons, setIndividualLessons] = useState<IndividualLesson[]>([]);

  // Функция для преобразования title в lesson_type
  const getLessonType = (title: string): "theory" | "practice" | "exam" => {
    console.log("🔍 getLessonType input:", title, typeof title);
    const lowerTitle = title.toLowerCase();
    let result: "theory" | "practice" | "exam";

    if (lowerTitle.includes("практик") || lowerTitle.includes("вожден")) {
      result = "practice";
    } else if (lowerTitle.includes("экзамен") || lowerTitle.includes("тест")) {
      result = "exam";
    } else {
      result = "theory";
    }

    console.log("🎯 getLessonType result:", result);
    return result;
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"group" | "individual">("group");
  const [editingItem, setEditingItem] = useState<Schedule | IndividualLesson | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Данные для форм
  const [instructors, setInstructors] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [scheduleFormData, setScheduleFormData] = useState<ScheduleFormData>({
    title: "",
    description: "",
    instructor_id: 0,
    group_id: 0,
    scheduled_date: "",
    start_time: "",
    end_time: "",
    location: "",
    subject: "",
    is_active: true,
  });

  const [individualFormData, setIndividualFormData] = useState<IndividualLessonFormData>({
    title: "",
    description: "",
    instructor_id: 0,
    student_id: 0,
    scheduled_date: "",
    start_time: "",
    end_time: "",
    location: "",
    subject: "",
    status: "scheduled",
  });

  // Загрузка данных
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Проверяем авторизацию перед загрузкой данных
      const token = TokenStorage.get();
      if (!token) {
        setError("Необходима авторизация для доступа к админ-панели");
        setLoading(false);
        return;
      }

      const [schedulesRes, lessonsRes, instructorsRes, groupsRes, studentsRes] = await Promise.all([AdminAPI.getSchedules(), AdminAPI.getIndividualLessons(), AdminAPI.getAllUsers(), AdminAPI.getGroups(), AdminAPI.getAllUsers()]);

      if (schedulesRes.success && schedulesRes.data) {
        // Сервер возвращает массив расписаний напрямую в data
        setSchedules(schedulesRes.data);
      }

      if (lessonsRes.success && lessonsRes.data) {
        // Сервер возвращает массив занятий напрямую в data
        setIndividualLessons(lessonsRes.data);
      }

      if (instructorsRes.success && instructorsRes.data) {
        console.log("🔍 Полученные данные инструкторов:", instructorsRes);
        console.log("🔍 instructorsRes.data:", instructorsRes.data);

        if (instructorsRes.data.users && Array.isArray(instructorsRes.data.users)) {
          const instructorUsers = instructorsRes.data.users.filter((user: any) => user.role === "instructor");
          console.log("✅ Загружены инструкторы:", instructorUsers);
          setInstructors(instructorUsers);
        } else {
          console.error("❌ Неверная структура данных инструкторов:", instructorsRes.data);
          setInstructors([]);
        }
      } else {
        console.error("❌ Ошибка получения инструкторов:", instructorsRes);
        setInstructors([]);
      }

      if (groupsRes.success && groupsRes.data) {
        // Сервер возвращает массив групп напрямую в data
        setGroups(groupsRes.data);
      }

      if (studentsRes.success && studentsRes.data) {
        console.log("🔍 Полученные данные студентов:", studentsRes);
        console.log("🔍 studentsRes.data:", studentsRes.data);

        if (studentsRes.data.users && Array.isArray(studentsRes.data.users)) {
          const studentUsers = studentsRes.data.users.filter((user: any) => user.role === "student");
          console.log("✅ Загружены студенты:", studentUsers);
          setStudents(studentUsers);
        } else {
          console.error("❌ Неверная структура данных студентов:", studentsRes.data);
          setStudents([]);
        }
      } else {
        console.error("❌ Ошибка получения студентов:", studentsRes);
        setStudents([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      setError((error as Error).message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Логирование изменений в формах
  useEffect(() => {
    console.log("scheduleFormData изменилось:", scheduleFormData);
  }, [scheduleFormData]);

  useEffect(() => {
    console.log("individualFormData изменилось:", individualFormData);
  }, [individualFormData]);

  // Единый обработчик для селектов
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log("handleSelectChange вызван:", { name, value, modalType });

    if (modalType === "group") {
      console.log("Обновление scheduleFormData");
      setScheduleFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      console.log("Обновление individualFormData");
      setIndividualFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    }
  };

  // Обработчики форм
  const handleScheduleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    console.log("handleScheduleInputChange:", { name, value, type });
    setScheduleFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : type === "number" ? Number(value) : name.endsWith("_id") ? Number(value) : value,
    }));
  };

  const handleIndividualInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    console.log("handleIndividualInputChange:", { name, value, type });
    setIndividualFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : name.endsWith("_id") ? Number(value) : value,
    }));
  };

  const resetForms = () => {
    setScheduleFormData({
      title: "",
      description: "",
      instructor_id: 0,
      group_id: 0,
      scheduled_date: "",
      start_time: "",
      end_time: "",
      location: "",
      subject: "",
      is_active: true,
    });

    setIndividualFormData({
      title: "",
      description: "",
      instructor_id: 0,
      student_id: 0,
      scheduled_date: "",
      start_time: "",
      end_time: "",
      location: "",
      subject: "",
      status: "scheduled",
    });

    setEditingItem(null);
  };

  const openCreateModal = (type: "group" | "individual") => {
    resetForms();
    setModalType(type);
    setShowModal(true);
  };

  const openEditModal = (item: Schedule | IndividualLesson, type: "group" | "individual") => {
    if (type === "group" && "group_id" in item) {
      setScheduleFormData({
        title: item.title,
        description: item.description || "",
        instructor_id: item.instructor_id,
        group_id: item.group_id || 0,
        scheduled_date: formatDateForInput(item.scheduled_date),
        start_time: item.start_time,
        end_time: item.end_time,
        location: item.location || "",
        subject: item.subject || "",
        is_active: item.is_active,
      });
    } else if (type === "individual" && "student_id" in item) {
      setIndividualFormData({
        title: item.title,
        description: item.description || "",
        instructor_id: item.instructor_id,
        student_id: item.student_id,
        scheduled_date: formatDateForInput(item.scheduled_date),
        start_time: item.start_time,
        end_time: item.end_time,
        location: item.location || "",
        subject: item.subject || "",
        status: item.status,
      });
    }

    setEditingItem(item);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      resetForms();
    }, 300);
  };

  // Функция для форматирования даты в формат yyyy-MM-dd
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Получение заголовков аутентификации
  const getAuthHeaders = () => {
    const token = TokenStorage.get();
    console.log("Токен из TokenStorage:", token ? "Существует" : "Отсутствует");
    console.log("Длина токена:", token ? token.length : 0);

    if (!token) {
      console.error("Токен авторизации не найден");
      throw new Error("Access token is required");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Прямые методы API для расписаний
  const directAPICall = {
    createSchedule: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/admin/schedules`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Ошибка при создании расписания");
      }

      return await response.json();
    },

    updateSchedule: async (id: number, data: any) => {
      const response = await fetch(`${API_BASE_URL}/admin/schedules/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Ошибка при обновлении расписания");
      }

      return await response.json();
    },

    createOneTimeGroupLesson: async (data: any) => {
      console.log("🆕 Создание разового группового занятия:", data);
      console.log("📡 URL:", `${API_BASE_URL}/admin/schedules/one-time-group`);

      const response = await fetch(`${API_BASE_URL}/admin/schedules/one-time-group`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      console.log("📊 Response status:", response.status);

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Ошибка при создании группового занятия");
      }

      return await response.json();
    },

    updateOneTimeGroupLesson: async (id: number, data: any) => {
      console.log("✏️ Обновление разового группового занятия:", { id, data });
      console.log("📡 URL:", `${API_BASE_URL}/admin/schedules/one-time-group/${id}`);

      const response = await fetch(`${API_BASE_URL}/admin/schedules/one-time-group/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      console.log("📊 Response status:", response.status);

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Ошибка при обновлении группового занятия");
      }

      return await response.json();
    },

    deleteSchedule: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/admin/schedules/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Ошибка при удалении расписания");
      }

      return { success: true, message: "Расписание успешно удалено" };
    },

    createIndividualLesson: async (data: any) => {
      console.log("🆕 Создание индивидуального занятия:", data);
      console.log("📡 URL:", `${API_BASE_URL}/admin/individual-lessons`);

      const response = await fetch(`${API_BASE_URL}/admin/individual-lessons`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      console.log("📊 Response status:", response.status);

      if (!response.ok) {
        const result = await response.json();
        console.error("❌ Ошибка сервера:", result);
        throw new Error(result.message || "Ошибка при создании индивидуального занятия");
      }

      return await response.json();
    },

    updateIndividualLesson: async (id: number, data: any) => {
      console.log("🔄 Обновление индивидуального занятия:", { id, data });
      console.log("📡 URL:", `${API_BASE_URL}/admin/individual-lessons/${id}`);

      const response = await fetch(`${API_BASE_URL}/admin/individual-lessons/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      console.log("📊 Response status:", response.status);

      if (!response.ok) {
        const result = await response.json();
        console.error("❌ Ошибка сервера:", result);
        throw new Error(result.message || "Ошибка при обновлении индивидуального занятия");
      }

      return await response.json();
    },

    deleteIndividualLesson: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/admin/individual-lessons/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Ошибка при удалении индивидуального занятия");
      }

      return { success: true, message: "Индивидуальное занятие успешно удалено" };
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      let response;

      if (modalType === "group") {
        // Валидация для группового занятия
        if (scheduleFormData.instructor_id === 0) {
          setError("Выберите инструктора");
          return;
        }
        if (scheduleFormData.group_id === 0) {
          setError("Выберите группу");
          return;
        }
        if (!scheduleFormData.title.trim()) {
          setError("Введите название занятия");
          return;
        }
        if (!scheduleFormData.scheduled_date) {
          setError("Выберите дату");
          return;
        }
        if (!scheduleFormData.start_time || !scheduleFormData.end_time) {
          setError("Укажите время начала и окончания");
          return;
        }

        console.log("Отправка данных группового расписания:", scheduleFormData);

        if (editingItem && "group_id" in editingItem) {
          // Проверяем, является ли это одноразовым групповым занятием
          if (editingItem.is_one_time) {
            // Обновляем одноразовое групповое занятие
            const oneTimeGroupData = {
              group_id: scheduleFormData.group_id,
              instructor_id: scheduleFormData.instructor_id,
              scheduled_date: scheduleFormData.scheduled_date,
              start_time: scheduleFormData.start_time,
              end_time: scheduleFormData.end_time,
              subject: scheduleFormData.subject,
              location: scheduleFormData.location,
              description: scheduleFormData.description,
              title: scheduleFormData.title,
              is_active: scheduleFormData.is_active,
            };
            response = await directAPICall.updateOneTimeGroupLesson(editingItem.id, oneTimeGroupData);
          } else {
            // Обновляем обычное расписание - преобразуем данные в нужный формат
            const date = new Date(scheduleFormData.scheduled_date);
            const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const dayOfWeek = dayNames[date.getDay()];

            const regularScheduleData = {
              instructor_id: scheduleFormData.instructor_id,
              day_of_week: dayOfWeek,
              start_time: scheduleFormData.start_time,
              end_time: scheduleFormData.end_time,
              lesson_type: getLessonType(scheduleFormData.title),
              location: scheduleFormData.location || null,
              subject: scheduleFormData.subject || null,
              notes: scheduleFormData.description || null,
              is_active: scheduleFormData.is_active !== undefined ? scheduleFormData.is_active : true,
            };
            console.log("🔧 Regular schedule data:", regularScheduleData);
            response = await directAPICall.updateSchedule(editingItem.id, regularScheduleData);
          }
        } else {
          // Создаем данные для одноразового группового занятия
          const oneTimeGroupData = {
            group_id: scheduleFormData.group_id,
            instructor_id: scheduleFormData.instructor_id,
            scheduled_date: scheduleFormData.scheduled_date,
            start_time: scheduleFormData.start_time,
            end_time: scheduleFormData.end_time,
            subject: scheduleFormData.subject,
            location: scheduleFormData.location,
            description: scheduleFormData.description,
          };
          response = await directAPICall.createOneTimeGroupLesson(oneTimeGroupData);
        }
      } else {
        // Валидация для индивидуального занятия
        if (individualFormData.instructor_id === 0) {
          setError("Выберите инструктора");
          return;
        }
        if (individualFormData.student_id === 0) {
          setError("Выберите студента");
          return;
        }
        if (!individualFormData.title.trim()) {
          setError("Введите название занятия");
          return;
        }
        if (!individualFormData.scheduled_date) {
          setError("Выберите дату");
          return;
        }
        if (!individualFormData.start_time || !individualFormData.end_time) {
          setError("Укажите время начала и окончания");
          return;
        }

        console.log("Отправка данных индивидуального занятия:", individualFormData);

        if (editingItem && "student_id" in editingItem) {
          response = await directAPICall.updateIndividualLesson(editingItem.id, individualFormData);
        } else {
          response = await directAPICall.createIndividualLesson(individualFormData);
        }
      }

      if (response.success) {
        console.log("Успешно сохранено:", response.message);
        await loadData();
        closeModal();
      } else {
        setError(response.message || "Ошибка при сохранении");
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      setError((error as Error).message || "Неизвестная ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, type: "group" | "individual") => {
    if (!confirm("Вы уверены, что хотите удалить это занятие?")) return;

    try {
      let response;
      if (type === "group") {
        console.log("Удаление расписания:", id);
        response = await directAPICall.deleteSchedule(id);
      } else {
        console.log("Удаление индивидуального занятия:", id);
        response = await directAPICall.deleteIndividualLesson(id);
      }

      if (response.success) {
        console.log("Успешно удалено:", response.message);
        await loadData();
      } else {
        setError(response.message || "Ошибка при удалении");
      }
    } catch (error) {
      console.error("Ошибка при удалении:", error);
      setError((error as Error).message || "Неизвестная ошибка");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-2xl text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Управление расписанием</h2>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => openCreateModal("group")} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <FaPlus />
            <span>Групповое занятие</span>
          </button>
          <button onClick={() => openCreateModal("individual")} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            <FaPlus />
            <span>Индивидуальное занятие</span>
          </button>
        </div>
      </div>

      {/* Ошибки */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button onClick={() => setError(null)} className="text-sm font-medium text-red-800 hover:text-red-600">
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Вкладки */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button onClick={() => setActiveTab("group")} className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === "group" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              <FaUsers className="inline mr-2" />
              Групповые занятия ({schedules.length})
            </button>
            <button onClick={() => setActiveTab("individual")} className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === "individual" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              <FaUser className="inline mr-2" />
              Индивидуальные занятия ({individualLessons.length})
            </button>
          </nav>
        </div>

        {/* Содержимое вкладок */}
        <div className="p-6">
          {activeTab === "group" ? (
            <div className="space-y-4">
              {schedules.length === 0 ? (
                <div className="text-center py-12">
                  <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Нет групповых занятий</h3>
                  <p className="mt-1 text-sm text-gray-500">Начните с создания первого группового занятия.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">{schedule.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${schedule.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{schedule.is_active ? "Активно" : "Неактивно"}</span>
                          </div>
                          {schedule.description && <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>}
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <FaCalendarAlt className="mr-1" />
                              {new Date(schedule.scheduled_date).toLocaleDateString("ru-RU")}
                            </span>
                            <span className="flex items-center">
                              <FaClock className="mr-1" />
                              {schedule.start_time} - {schedule.end_time}
                            </span>
                            <span className="flex items-center">
                              <FaUsers className="mr-1" />
                              {schedule.group_name || "Без группы"}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">Инструктор: {schedule.instructor_name}</div>
                          {(schedule.location || schedule.subject) && (
                            <div className="mt-1 text-sm text-gray-500">
                              {schedule.subject && `Предмет: ${schedule.subject}`}
                              {schedule.location && ` • Место: ${schedule.location}`}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button onClick={() => openEditModal(schedule, "group")} className="text-blue-600 hover:text-blue-800">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete(schedule.id, "group")} className="text-red-600 hover:text-red-800">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {individualLessons.length === 0 ? (
                <div className="text-center py-12">
                  <FaUser className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Нет индивидуальных занятий</h3>
                  <p className="mt-1 text-sm text-gray-500">Начните с создания первого индивидуального занятия.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {individualLessons.map((lesson) => (
                    <div key={lesson.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${lesson.status === "scheduled" ? "bg-blue-100 text-blue-800" : lesson.status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{lesson.status === "scheduled" ? "Запланировано" : lesson.status === "completed" ? "Завершено" : "Отменено"}</span>
                          </div>
                          {lesson.description && <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>}
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <FaCalendarAlt className="mr-1" />
                              {new Date(lesson.scheduled_date).toLocaleDateString("ru-RU")}
                            </span>
                            <span className="flex items-center">
                              <FaClock className="mr-1" />
                              {lesson.start_time} - {lesson.end_time}
                            </span>
                            <span className="flex items-center">
                              <FaUser className="mr-1" />
                              {lesson.student_name}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">Инструктор: {lesson.instructor_name}</div>
                          {(lesson.location || lesson.subject) && (
                            <div className="mt-1 text-sm text-gray-500">
                              {lesson.subject && `Предмет: ${lesson.subject}`}
                              {lesson.location && ` • Место: ${lesson.location}`}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button onClick={() => openEditModal(lesson, "individual")} className="text-blue-600 hover:text-blue-800">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete(lesson.id, "individual")} className="text-red-600 hover:text-red-800">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{editingItem ? `Редактировать ${modalType === "group" ? "групповое" : "индивидуальное"} занятие` : `Добавить ${modalType === "group" ? "групповое" : "индивидуальное"} занятие`}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название *</label>
                <input type="text" name="title" value={modalType === "group" ? scheduleFormData.title : individualFormData.title} onChange={modalType === "group" ? handleScheduleInputChange : handleIndividualInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                <textarea name="description" value={modalType === "group" ? scheduleFormData.description : individualFormData.description} onChange={modalType === "group" ? handleScheduleInputChange : handleIndividualInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Инструктор * (Тест)</label>
                  <select
                    name="instructor_id"
                    value={modalType === "group" ? scheduleFormData.instructor_id : individualFormData.instructor_id}
                    onChange={(e) => {
                      console.log("ПРЯМОЙ onChange вызван:", e.target.name, e.target.value);
                      const value = Number(e.target.value);
                      if (modalType === "group") {
                        setScheduleFormData((prev) => ({ ...prev, instructor_id: value }));
                      } else {
                        setIndividualFormData((prev) => ({ ...prev, instructor_id: value }));
                      }
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                  >
                    <option value={0}>
                      Выберите инструктора ({instructors.length} доступно) - Текущий: {modalType === "group" ? scheduleFormData.instructor_id : individualFormData.instructor_id}
                    </option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.first_name} {instructor.last_name} (ID: {instructor.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{modalType === "group" ? "Группа *" : "Студент *"}</label>
                  {modalType === "group" ? (
                    <select name="group_id" value={scheduleFormData.group_id} onChange={handleSelectChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                      <option value={0} className="text-gray-900 bg-white">
                        Выберите группу
                      </option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id} className="text-gray-900 bg-white">
                          {group.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      name="student_id"
                      value={individualFormData.student_id}
                      onChange={(e) => {
                        console.log("ПРЯМОЙ onChange студент вызван:", e.target.name, e.target.value);
                        const value = Number(e.target.value);
                        setIndividualFormData((prev) => ({ ...prev, student_id: value }));
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                    >
                      <option value={0}>
                        Выберите студента ({students.length} доступно) - Текущий: {individualFormData.student_id}
                      </option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} (ID: {student.id})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Дата *</label>
                  <input type="date" name="scheduled_date" value={modalType === "group" ? scheduleFormData.scheduled_date : individualFormData.scheduled_date} onChange={modalType === "group" ? handleScheduleInputChange : handleIndividualInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Время начала *</label>
                  <input type="time" name="start_time" value={modalType === "group" ? scheduleFormData.start_time : individualFormData.start_time} onChange={modalType === "group" ? handleScheduleInputChange : handleIndividualInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Время окончания *</label>
                  <input type="time" name="end_time" value={modalType === "group" ? scheduleFormData.end_time : individualFormData.end_time} onChange={modalType === "group" ? handleScheduleInputChange : handleIndividualInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Предмет</label>
                  <input type="text" name="subject" value={modalType === "group" ? scheduleFormData.subject : individualFormData.subject} onChange={modalType === "group" ? handleScheduleInputChange : handleIndividualInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Место проведения</label>
                  <input type="text" name="location" value={modalType === "group" ? scheduleFormData.location : individualFormData.location} onChange={modalType === "group" ? handleScheduleInputChange : handleIndividualInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>

              {modalType === "group" ? (
                <div className="flex items-center">
                  <input type="checkbox" name="is_active" checked={scheduleFormData.is_active} onChange={handleScheduleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label className="ml-2 block text-sm text-gray-700">Активное занятие</label>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                  <select name="status" value={individualFormData.status} onChange={handleIndividualInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                    <option value="scheduled" className="text-gray-900 bg-white">
                      Запланировано
                    </option>
                    <option value="completed" className="text-gray-900 bg-white">
                      Завершено
                    </option>
                    <option value="cancelled" className="text-gray-900 bg-white">
                      Отменено
                    </option>
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Отмена
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? "Сохранение..." : editingItem ? "Обновить занятие" : "Создать занятие"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;
