import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../../components/layout/Layout";
import TokenStorage from "../../../../utils/tokenStorage";
import { ArrowLeft, Save, Eye, AlertCircle } from "lucide-react";

interface LessonFormData {
  title: string;
  description: string;
  content: string;
  course_id: number;
  lesson_type: "text" | "video" | "live_stream" | "test";
  video_url: string;
  video_duration: number;
  live_stream_date: string;
  live_stream_url: string;
  is_preview: boolean;
}

interface Course {
  id: number;
  title: string;
  instructor_name: string;
}

const EditLessonPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    description: "",
    content: "",
    course_id: 0,
    lesson_type: "text",
    video_url: "",
    video_duration: 0,
    live_stream_date: "",
    live_stream_url: "",
    is_preview: false,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      fetchCourses();
      fetchLesson();
    }
  }, [id]);

  const fetchCourses = async () => {
    try {
      const token = TokenStorage.getToken();
      const response = await fetch("http://localhost:3001/api/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data?.courses || []);
      }
    } catch (error) {
      console.error("Ошибка при загрузке курсов:", error);
    }
  };

  const fetchLesson = async () => {
    try {
      setPageLoading(true);
      const token = TokenStorage.getToken();

      const response = await fetch(`http://localhost:3001/api/lessons/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const lesson = data.data;
          setFormData({
            title: lesson.title || "",
            description: lesson.description || "",
            content: lesson.content || "",
            course_id: lesson.course_id || 0,
            lesson_type: lesson.lesson_type || "text",
            video_url: lesson.video_url || "",
            video_duration: lesson.video_duration || 0,
            live_stream_date: lesson.live_stream_date ? new Date(lesson.live_stream_date).toISOString().slice(0, 16) : "",
            live_stream_url: lesson.live_stream_url || "",
            is_preview: lesson.is_preview || false,
          });
        } else {
          alert("Урок не найден");
          router.push("/admin/lessons");
        }
      } else {
        alert("Ошибка при загрузке урока");
        router.push("/admin/lessons");
      }
    } catch (error) {
      console.error("Ошибка при загрузке урока:", error);
      alert("Ошибка при загрузке урока");
      router.push("/admin/lessons");
    } finally {
      setPageLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Название урока обязательно";
    if (!formData.description.trim()) newErrors.description = "Описание обязательно";
    if (!formData.content.trim()) newErrors.content = "Содержание урока обязательно";
    if (formData.course_id === 0) newErrors.course_id = "Выберите курс";

    if (formData.lesson_type === "video" && !formData.video_url.trim()) {
      newErrors.video_url = "URL видео обязателен для видео-урока";
    }

    if (formData.lesson_type === "live_stream") {
      if (!formData.live_stream_date) {
        newErrors.live_stream_date = "Дата прямого эфира обязательна";
      }
      if (!formData.live_stream_url.trim()) {
        newErrors.live_stream_url = "URL прямого эфира обязателен";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = TokenStorage.getToken();

      const response = await fetch(`http://localhost:3001/api/lessons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          live_stream_date: formData.live_stream_date || null,
          video_duration: formData.video_duration || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert("Урок успешно обновлен!");
          router.push(`/admin/lessons/${id}`);
        } else {
          alert(data.message || "Ошибка при обновлении урока");
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Ошибка при обновлении урока");
      }
    } catch (error) {
      console.error("Ошибка при обновлении урока:", error);
      alert("Ошибка при обновлении урока");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <Layout title="Загрузка..." description="Загрузка урока">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Редактировать урок - Админ панель" description="Редактирование урока">
      <div className="container mx-auto px-4 py-8">
        {/* Навигация */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push(`/admin/lessons/${id}`)} className="flex items-center text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Назад к уроку
            </button>
          </div>
        </div>

        {/* Форма редактирования */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Редактировать урок</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название урока *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={`w-full p-3 border rounded-lg ${errors.title ? "border-red-500" : "border-gray-300"}`} placeholder="Введите название урока" />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Курс *</label>
                <select
                  value={formData.course_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      course_id: parseInt(e.target.value),
                    })
                  }
                  className={`w-full p-3 border rounded-lg ${errors.course_id ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value={0}>Выберите курс</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                {errors.course_id && <p className="text-red-500 text-sm mt-1">{errors.course_id}</p>}
              </div>
            </div>

            {/* Описание */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Описание *</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className={`w-full p-3 border rounded-lg ${errors.description ? "border-red-500" : "border-gray-300"}`} placeholder="Краткое описание урока" />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Тип урока */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тип урока *</label>
              <select
                value={formData.lesson_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lesson_type: e.target.value as any,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="text">Текстовый урок</option>
                <option value="video">Видео урок</option>
                <option value="live_stream">Прямой эфир</option>
                <option value="test">Тест</option>
              </select>
            </div>

            {/* Дополнительные поля в зависимости от типа */}
            {formData.lesson_type === "video" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL видео *</label>
                  <input type="url" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} className={`w-full p-3 border rounded-lg ${errors.video_url ? "border-red-500" : "border-gray-300"}`} placeholder="https://example.com/video" />
                  {errors.video_url && <p className="text-red-500 text-sm mt-1">{errors.video_url}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Длительность (минуты)</label>
                  <input
                    type="number"
                    value={formData.video_duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        video_duration: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
              </div>
            )}

            {formData.lesson_type === "live_stream" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Дата и время эфира *</label>
                  <input
                    type="datetime-local"
                    value={formData.live_stream_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        live_stream_date: e.target.value,
                      })
                    }
                    className={`w-full p-3 border rounded-lg ${errors.live_stream_date ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.live_stream_date && <p className="text-red-500 text-sm mt-1">{errors.live_stream_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL трансляции *</label>
                  <input
                    type="url"
                    value={formData.live_stream_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        live_stream_url: e.target.value,
                      })
                    }
                    className={`w-full p-3 border rounded-lg ${errors.live_stream_url ? "border-red-500" : "border-gray-300"}`}
                    placeholder="https://example.com/stream"
                  />
                  {errors.live_stream_url && <p className="text-red-500 text-sm mt-1">{errors.live_stream_url}</p>}
                </div>
              </div>
            )}

            {/* Содержание */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Содержание урока *</label>
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={10} className={`w-full p-3 border rounded-lg ${errors.content ? "border-red-500" : "border-gray-300"}`} placeholder="Введите содержание урока" />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>

            {/* Настройки доступа */}
            <div>
              <label className="flex items-center">
                <input type="checkbox" checked={formData.is_preview} onChange={(e) => setFormData({ ...formData, is_preview: e.target.checked })} className="mr-2" />
                <span className="text-sm font-medium text-gray-700">Бесплатный урок (доступен без покупки курса)</span>
              </label>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => router.push(`/admin/lessons/${id}`)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button type="submit" disabled={loading} className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Сохранение..." : "Сохранить изменения"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditLessonPage;
