import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaGraduationCap, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaClock, FaBook } from "react-icons/fa";
import { AdminAPI } from "../../../services/api";
import { useLanguage } from "../../../contexts/LanguageContext";
import LessonsManager from "./LessonsManager";

interface Course {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  featured_image?: string;
  price: number;
  instructor_id?: number;
  instructor_name: string;
  category?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration_weeks: number;
  is_active: boolean;
  lessons_count: number;
  students_count: number;
  created_at: string;
}

interface CourseFormData {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  featured_image: string;
  price: number;
  instructor_id: number;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration_weeks: number;
  is_active: boolean;
  prerequisites: string;
  learning_outcomes: string;
}

// Стили как константы для избежания пересоздания объектов
const BUTTON_STYLES = {
  primary: { backgroundColor: "#059669", color: "white" },
  secondary: { backgroundColor: "#6B7280", color: "white" },
  danger: { backgroundColor: "#EF4444", color: "white" },
  edit: { backgroundColor: "#F59E0B", color: "white" },
  success: { backgroundColor: "#10B981", color: "white" },
  cancel: { backgroundColor: "#6B7280", color: "white" },
};

const AdminCourses: React.FC = () => {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Показывать только 10 курсов за раз

  // Состояния для управления уроками
  const [viewingLessons, setViewingLessons] = useState<Course | null>(null);
  const [showLessonsModal, setShowLessonsModal] = useState(false);
  const [managingLessonsForCourse, setManagingLessonsForCourse] = useState<Course | null>(null);

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    slug: "",
    short_description: "",
    description: "",
    featured_image: "",
    price: 0,
    instructor_id: 0,
    category: "theory",
    difficulty: "beginner",
    duration_weeks: 4,
    is_active: true,
    prerequisites: "",
    learning_outcomes: "",
  });

  // Загрузка курсов - убираем useCallback для предотвращения циклов
  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminAPI.getAllCourses();

      if (response.success && response.data) {
        setCourses(response.data.courses || []);
      } else {
        setError("Ошибка в ответе сервера");
        setCourses([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки курсов:", error);
      setError((error as Error).message || "Неизвестная ошибка");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка инструкторов
  const loadInstructors = async () => {
    try {
      const response = await AdminAPI.getInstructors();
      if (response.success && response.data) {
        // response.data уже содержит массив инструкторов
        setInstructors(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Ошибка загрузки инструкторов:", error);
    }
  };

  useEffect(() => {
    loadCourses();
    loadInstructors();
  }, []); // Пустой массив зависимостей

  // Оптимизированная фильтрация с useMemo
  const filteredCourses = useMemo(() => {
    if (!courses.length) return [];

    return courses.filter((course) => {
      const matchesSearch = !searchTerm || course.title.toLowerCase().includes(searchTerm.toLowerCase()) || (course.short_description && course.short_description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = !categoryFilter || course.category === categoryFilter;

      const matchesDifficulty = !difficultyFilter || course.difficulty === difficultyFilter;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [courses, searchTerm, categoryFilter, difficultyFilter]);

  // Пагинированные курсы для улучшения производительности
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCourses.slice(startIndex, endIndex);
  }, [filteredCourses, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage); // Обработчики форм с useCallback для предотвращения лишних ререндеров
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : type === "number" ? Number(value) : value,
    }));
  }, []);

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9а-я]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, []);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const title = e.target.value;
      setFormData((prev) => ({
        ...prev,
        title,
        slug: generateSlug(title),
      }));
    },
    [generateSlug]
  );

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      slug: "",
      short_description: "",
      description: "",
      featured_image: "",
      price: 0,
      instructor_id: instructors.length > 0 ? instructors[0].id : 0,
      category: "theory",
      difficulty: "beginner",
      duration_weeks: 4,
      is_active: true,
      prerequisites: "",
      learning_outcomes: "",
    });
    setEditingCourse(null);
  }, [instructors]);

  const openCreateModal = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const openEditModal = useCallback((course: Course) => {
    setFormData({
      title: course.title,
      slug: course.slug,
      short_description: course.short_description || "",
      description: course.description || "",
      featured_image: course.featured_image || "",
      price: course.price,
      instructor_id: course.instructor_id || 0,
      category: course.category || "theory",
      difficulty: course.difficulty,
      duration_weeks: course.duration_weeks,
      is_active: course.is_active,
      prerequisites: "",
      learning_outcomes: "",
    });
    setEditingCourse(course);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setTimeout(() => {
      resetForm();
    }, 300);
  }, [resetForm]);

  // Функция для открытия управления уроками
  const openLessonsModal = useCallback((course: Course) => {
    setViewingLessons(course);
    setShowLessonsModal(true);
  }, []);

  const closeLessonsModal = useCallback(() => {
    setShowLessonsModal(false);
    setViewingLessons(null);
  }, []);

  // Функция для открытия менеджера уроков
  const openLessonsManager = useCallback((course: Course) => {
    setManagingLessonsForCourse(course);
  }, []);

  const closeLessonsManager = useCallback(() => {
    setManagingLessonsForCourse(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting) return;

      try {
        setSubmitting(true);
        let response;

        if (editingCourse) {
          // Обновление существующего курса
          response = await AdminAPI.updateCourse(editingCourse.id, formData);
        } else {
          // Создание нового курса
          response = await AdminAPI.createCourse(formData);
        }

        if (response.success) {
          await loadCourses();
          closeModal();
          // Показать сообщение об успехе (можно добавить toast notification)
          console.log(editingCourse ? "Курс успешно обновлен" : "Курс успешно создан");
        }
      } catch (error) {
        console.error("Ошибка при сохранении курса:", error);
        setError((error as Error).message || "Ошибка при сохранении курса");
      } finally {
        setSubmitting(false);
      }
    },
    [editingCourse, formData, submitting, loadCourses, closeModal]
  );

  const handleDelete = useCallback(
    async (courseId: number) => {
      if (!confirm("Вы уверены, что хотите удалить этот курс?")) return;

      try {
        const response = await AdminAPI.deleteCourse(courseId);

        if (response.success) {
          await loadCourses();
          console.log("Курс успешно удален");
        }
      } catch (error) {
        console.error("Ошибка при удалении курса:", error);
        setError((error as Error).message || "Ошибка при удалении курса");
      }
    },
    [loadCourses]
  );

  // Обработчики поиска и фильтров с debounce эффектом
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Сброс на первую страницу
  }, []);

  const handleCategoryFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Сброс на первую страницу
  }, []);

  const handleDifficultyFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficultyFilter(e.target.value);
    setCurrentPage(1); // Сброс на первую страницу
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setCategoryFilter("");
    setDifficultyFilter("");
    setCurrentPage(1); // Сброс на первую страницу
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Заголовок - рендерим сразу для LCP */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaGraduationCap className="text-2xl text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Управление курсами</h2>
          </div>
          <button disabled className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium opacity-50" style={BUTTON_STYLES.primary}>
            <FaPlus />
            <span>Добавить курс</span>
          </button>
        </div>

        {/* Быстрая заглушка */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-center items-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-900">Загрузка курсов...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaGraduationCap className="text-2xl text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Управление курсами</h2>
        </div>
        <button onClick={openCreateModal} className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium" style={BUTTON_STYLES.primary}>
          <FaPlus />
          <span>Добавить курс</span>
        </button>
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
                <button onClick={() => setError(null)} className="text-sm font-medium text-red-800 underline">
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Поиск и фильтры */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Поиск по названию..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <select value={categoryFilter} onChange={handleCategoryFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Все категории</option>
            <option value="theory">Теория</option>
            <option value="practice">Практика</option>
            <option value="exam">Экзамен</option>
          </select>

          <select value={difficultyFilter} onChange={handleDifficultyFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Все уровни</option>
            <option value="beginner">Начинающий</option>
            <option value="intermediate">Средний</option>
            <option value="advanced">Продвинутый</option>
          </select>

          <button onClick={clearFilters} className="px-4 py-2 rounded-lg text-sm font-medium" style={BUTTON_STYLES.secondary}>
            Очистить фильтры
          </button>
        </div>
      </div>

      {/* Список курсов */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Курсы ({filteredCourses.length})</h3>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FaGraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Нет курсов</h3>
            <p className="mt-1 text-sm text-gray-500">{courses.length === 0 ? "Начните с создания первого курса." : "Попробуйте изменить фильтры поиска."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Курс</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория/Сложность</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статистика</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCourses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {course.featured_image ? (
                            <img className="h-12 w-12 rounded-lg object-cover" src={course.featured_image} alt="" />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <FaGraduationCap className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">{course.short_description}</div>
                          <div className="text-xs text-gray-400">Инструктор: {course.instructor_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {course.category === "theory" && "Теория"}
                          {course.category === "practice" && "Практика"}
                          {course.category === "exam" && "Экзамен"}
                        </span>
                        <br />
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {course.difficulty === "beginner" && "Начинающий"}
                          {course.difficulty === "intermediate" && "Средний"}
                          {course.difficulty === "advanced" && "Продвинутый"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">₸{course.price.toLocaleString()}</div>
                      <div className="flex items-center text-xs text-gray-500">
                        <FaClock className="mr-1" />
                        {course.duration_weeks} недель
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>Уроков: {course.lessons_count}</div>
                      <div>Студентов: {course.students_count}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${course.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{course.is_active ? "Активен" : "Неактивен"}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button onClick={() => openLessonsManager(course)} className="p-2 rounded" style={BUTTON_STYLES.primary} title="Управление уроками">
                        <FaBook />
                      </button>
                      <button onClick={() => openEditModal(course)} className="p-2 rounded" style={BUTTON_STYLES.edit} title="Редактировать">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(course.id)} className="p-2 rounded" style={BUTTON_STYLES.danger} title="Удалить">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Пагинация */}
        {filteredCourses.length > itemsPerPage && (
          <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white disabled:opacity-50">
                Назад
              </button>
              <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white disabled:opacity-50">
                Вперед
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Показано <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredCourses.length)}</span> из <span className="font-medium">{filteredCourses.length}</span> результатов
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 disabled:opacity-50">
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? "z-10 bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-300 text-gray-500"}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 disabled:opacity-50">
                    →
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{editingCourse ? "Редактировать курс" : "Добавить новый курс"}</h3>
              <button onClick={closeModal} className="p-2 rounded" style={BUTTON_STYLES.secondary}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название курса *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleTitleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL (slug)</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Категория *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="theory">Теория</option>
                    <option value="practice">Практика</option>
                    <option value="exam">Экзамен</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Сложность *</label>
                  <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="beginner">Начинающий</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Инструктор *</label>
                  <select name="instructor_id" value={formData.instructor_id} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value={0}>Выберите инструктора</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.firstName} {instructor.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Цена (тенге) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Продолжительность (недель) *</label>
                  <input type="number" name="duration_weeks" value={formData.duration_weeks} onChange={handleInputChange} min="1" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание</label>
                <textarea name="short_description" value={formData.short_description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Полное описание</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL изображения</label>
                <input type="url" name="featured_image" value={formData.featured_image} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div className="flex items-center">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label className="ml-2 block text-sm text-gray-700">Активный курс</label>
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md text-sm font-medium" style={BUTTON_STYLES.cancel}>
                  Отмена
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50" style={BUTTON_STYLES.success}>
                  {submitting ? "Сохранение..." : editingCourse ? "Обновить курс" : "Создать курс"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Менеджер уроков */}
      {managingLessonsForCourse && <LessonsManager courseId={managingLessonsForCourse.id} courseName={managingLessonsForCourse.title} isOpen={true} onClose={closeLessonsManager} />}
    </div>
  );
};

export default AdminCourses;
