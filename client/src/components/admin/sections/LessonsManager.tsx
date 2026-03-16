import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { FaPlus, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaVideo, FaFileAlt, FaQuestionCircle, FaTimes } from "react-icons/fa";

// Динамически загружаем React Quill для избежания проблем с SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface Lesson {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  content?: string;
  lesson_type: "video" | "text" | "live_stream" | "test";
  video_url?: string;
  video_duration?: number;
  live_stream_date?: string;
  live_stream_url?: string;
  order_index: number;
  is_preview: boolean;
  has_test?: boolean;
  created_at: string;
  updated_at: string;
}

interface LessonFormData {
  title: string;
  description: string;
  content: string;
  lesson_type: "video" | "text" | "live_stream" | "test";
  video_url: string;
  video_duration: number;
  live_stream_date: string;
  live_stream_url: string;
  is_preview: boolean;
}

interface LessonsManagerProps {
  courseId: number;
  courseName: string;
  isOpen: boolean;
  onClose: () => void;
}

const LessonsManager: React.FC<LessonsManagerProps> = ({ courseId, courseName, isOpen, onClose }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    description: "",
    content: "",
    lesson_type: "text",
    video_url: "",
    video_duration: 0,
    live_stream_date: "",
    live_stream_url: "",
    is_preview: false,
  });

  // Загрузка уроков
  const fetchLessons = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}/lessons`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success) {
        setLessons(result.data || []);
      } else {
        console.error("Ошибка загрузки уроков:", result.message);
      }
    } catch (error) {
      console.error("Ошибка загрузки уроков:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (isOpen) {
      fetchLessons();
    }
  }, [isOpen, fetchLessons]);

  // Сброс формы
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      lesson_type: "text",
      video_url: "",
      video_duration: 0,
      live_stream_date: "",
      live_stream_url: "",
      is_preview: false,
    });
    setEditingLesson(null);
  };

  // Открытие формы создания урока
  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  // Открытие формы редактирования урока
  const openEditForm = (lesson: Lesson) => {
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      content: lesson.content || "",
      lesson_type: lesson.lesson_type,
      video_url: lesson.video_url || "",
      video_duration: lesson.video_duration || 0,
      live_stream_date: lesson.live_stream_date || "",
      live_stream_url: lesson.live_stream_url || "",
      is_preview: lesson.is_preview,
    });
    setEditingLesson(lesson);
    setShowForm(true);
  };

  // Закрытие формы
  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("auth_token");
      const url = editingLesson ? `http://localhost:3001/api/courses/${courseId}/lessons/${editingLesson.id}` : `http://localhost:3001/api/courses/${courseId}/lessons`;

      const method = editingLesson ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        await fetchLessons();
        closeForm();
      } else {
        console.error("Ошибка сохранения урока:", result.message);
      }
    } catch (error) {
      console.error("Ошибка сохранения урока:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Удаление урока
  const handleDelete = async (lessonId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот урок?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        await fetchLessons();
      } else {
        console.error("Ошибка удаления урока:", result.message);
      }
    } catch (error) {
      console.error("Ошибка удаления урока:", error);
    }
  };

  // Изменение порядка уроков
  const moveLesson = async (lessonId: number, direction: "up" | "down") => {
    const currentIndex = lessons.findIndex((l) => l.id === lessonId);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= lessons.length) return;

    // Создаем новый массив с измененным порядком
    const newLessons = [...lessons];
    [newLessons[currentIndex], newLessons[newIndex]] = [newLessons[newIndex], newLessons[currentIndex]];

    // Обновляем order_index для каждого урока
    const lessonOrders = newLessons.map((lesson, index) => ({
      id: lesson.id,
      order_index: index + 1,
    }));

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`http://localhost:3001/api/courses/${courseId}/lessons/reorder`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonOrders }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchLessons();
      } else {
        console.error("Ошибка изменения порядка:", result.message);
      }
    } catch (error) {
      console.error("Ошибка изменения порядка:", error);
    }
  };

  // Получение иконки для типа урока
  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <FaVideo className="text-red-500" />;
      case "text":
        return <FaFileAlt className="text-blue-500" />;
      case "test":
        return <FaQuestionCircle className="text-yellow-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  // Конфигурация для React Quill
  const quillModules = {
    toolbar: [[{ header: [1, 2, 3, 4, 5, 6, false] }], ["bold", "italic", "underline", "strike"], [{ list: "ordered" }, { list: "bullet" }], [{ script: "sub" }, { script: "super" }], [{ indent: "-1" }, { indent: "+1" }], [{ direction: "rtl" }], [{ color: [] }, { background: [] }], [{ align: [] }], ["link", "image", "video"], ["clean"]],
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Уроки курса: {courseName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!showForm ? (
            // Список уроков
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Список уроков ({lessons.length})</h3>
                <button onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <FaPlus /> Добавить урок
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">Загрузка уроков...</div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Уроки не найдены. Создайте первый урок.</div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-sm text-gray-500">#{lesson.order_index}</div>
                        <div className="flex items-center gap-2">
                          {getLessonTypeIcon(lesson.lesson_type)}
                          <div>
                            <h4 className="font-semibold">{lesson.title}</h4>
                            {lesson.description && <p className="text-sm text-gray-600">{lesson.description}</p>}
                          </div>
                        </div>
                        {lesson.is_preview && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Превью</span>}
                        {lesson.has_test && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Есть тест</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => moveLesson(lesson.id, "up")} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50">
                          <FaArrowUp />
                        </button>
                        <button onClick={() => moveLesson(lesson.id, "down")} disabled={index === lessons.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50">
                          <FaArrowDown />
                        </button>
                        <button onClick={() => openEditForm(lesson)} className="p-1 text-blue-500 hover:text-blue-700">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(lesson.id)} className="p-1 text-red-500 hover:text-red-700">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Форма создания/редактирования урока
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{editingLesson ? "Редактировать урок" : "Создать новый урок"}</h3>
                <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Основная информация */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Название урока *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Тип урока *</label>
                    <select value={formData.lesson_type} onChange={(e) => setFormData({ ...formData, lesson_type: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option value="text">Текстовый урок</option>
                      <option value="video">Видео урок</option>
                      <option value="test">Тест</option>
                      <option value="live_stream">Прямой эфир</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* Дополнительные поля в зависимости от типа урока */}
                {formData.lesson_type === "video" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL видео</label>
                      <input type="url" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="https://youtube.com/watch?v=..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Длительность (минуты)</label>
                      <input type="number" value={formData.video_duration} onChange={(e) => setFormData({ ...formData, video_duration: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" min="0" />
                    </div>
                  </div>
                )}

                {formData.lesson_type === "live_stream" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Дата и время эфира</label>
                      <input type="datetime-local" value={formData.live_stream_date} onChange={(e) => setFormData({ ...formData, live_stream_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL трансляции</label>
                      <input type="url" value={formData.live_stream_url} onChange={(e) => setFormData({ ...formData, live_stream_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                )}

                {/* Содержимое урока */}
                {(formData.lesson_type === "text" || formData.lesson_type === "video") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Содержимое урока</label>
                    <div style={{ height: "300px" }}>
                      <ReactQuill theme="snow" value={formData.content} onChange={(content) => setFormData({ ...formData, content })} modules={quillModules} style={{ height: "240px" }} />
                    </div>
                  </div>
                )}

                {/* Настройки */}
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" checked={formData.is_preview} onChange={(e) => setFormData({ ...formData, is_preview: e.target.checked })} className="mr-2" />
                    Доступен для предварительного просмотра
                  </label>
                </div>

                {/* Кнопки */}
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50">
                    {submitting ? "Сохранение..." : editingLesson ? "Обновить урок" : "Создать урок"}
                  </button>
                  <button type="button" onClick={closeForm} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonsManager;
