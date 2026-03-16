import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../../components/layout/Layout";
import TokenStorage from "../../../../utils/tokenStorage";
import { ArrowLeft, Upload, Save, Eye, AlertCircle } from "lucide-react";

interface CourseFormData {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  featured_image: string;
  price: number;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration_weeks: number;
  is_active: boolean;
  prerequisites: string;
  learning_outcomes: string;
  instructor_id: number;
}

const EditCourse: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    slug: "",
    short_description: "",
    description: "",
    featured_image: "",
    price: 0,
    category: "theory",
    difficulty: "beginner",
    duration_weeks: 4,
    is_active: true,
    prerequisites: "",
    learning_outcomes: "",
    instructor_id: 0,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(false);

  // Загрузка данных курса при монтировании компонента
  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setInitialLoading(true);
      const token = TokenStorage.getToken();

      const response = await fetch(`http://localhost:3001/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log("Ошибка при загрузке данных курса:", data);

      if (data.success && (data.course || data.data)) {
        const course = data.course || data.data;
        setFormData({
          title: course.title || "",
          slug: course.slug || "",
          short_description: course.short_description || "",
          description: course.description || "",
          featured_image: course.featured_image || "",
          price: course.price || 0,
          category: course.category || "theory",
          difficulty: course.difficulty || "beginner",
          duration_weeks: course.duration_weeks || 4,
          is_active: course.is_active ?? true,
          prerequisites: course.prerequisites || "",
          learning_outcomes: course.learning_outcomes || "",
          instructor_id: course.instructor_id || 0,
        });
      } else {
        console.error("Ошибка при загрузке данных курса:", data);
        setErrors({ general: "Не удалось загрузить данные курса" });
      }
    } catch (error) {
      console.error("Ошибка при загрузке курса:", error);
      setErrors({ general: "Ошибка сети при загрузке курса" });
    } finally {
      setInitialLoading(false);
    }
  };

  // Генерация slug из заголовка
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9а-я]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Автоматическая генерация slug при изменении заголовка
    if (field === "title") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }

    // Очистка ошибки при изменении поля
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // В реальном проекте здесь была бы загрузка на сервер
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange("featured_image", e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Название курса обязательно";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug обязателен";
    }

    if (!formData.short_description.trim()) {
      newErrors.short_description = "Краткое описание обязательно";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Полное описание обязательно";
    }

    if (formData.price < 0) {
      newErrors.price = "Цена не может быть отрицательной";
    }

    if (formData.duration_weeks < 1) {
      newErrors.duration_weeks = "Длительность должна быть минимум 1 неделя";
    }

    if (!formData.learning_outcomes.trim()) {
      newErrors.learning_outcomes = "Результаты обучения обязательны";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = TokenStorage.getToken();

      const response = await fetch(`http://localhost:3001/api/courses/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Успешное обновление - просто переходим на страницу курса
        router.push(`/admin/courses/${id}`);
      } else {
        setErrors({ general: data.message || "Ошибка при обновлении курса" });
      }
    } catch (error) {
      console.error("Ошибка при обновлении курса:", error);
      setErrors({ general: "Ошибка сети при обновлении курса" });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Начинающий";
      case "intermediate":
        return "Средний";
      case "advanced":
        return "Продвинутый";
      default:
        return difficulty;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "theory":
        return "Теория";
      case "practice":
        return "Практика";
      case "exam":
        return "Экзамен";
      case "special":
        return "Специальный";
      default:
        return category;
    }
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка данных курса...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Отображение ошибки загрузки
  if (errors.general) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-800 mb-2">Ошибка загрузки</h2>
              <p className="text-red-600 mb-4">{errors.general}</p>
              <div className="space-x-4">
                <button
                  onClick={() => {
                    setErrors({});
                    fetchCourseData();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Попробовать снова
                </button>
                <button onClick={() => router.push("/admin/courses")} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                  Вернуться к списку курсов
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (previewMode) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Заголовок превью */}
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Предварительный просмотр</h1>
              <button onClick={() => setPreviewMode(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Вернуться к редактированию
              </button>
            </div>

            {/* Превью курса */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {formData.featured_image && <img src={formData.featured_image} alt={formData.title} className="w-full h-64 object-cover" />}

              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      {
                        beginner: "bg-green-100 text-green-800",
                        intermediate: "bg-yellow-100 text-yellow-800",
                        advanced: "bg-red-100 text-red-800",
                      }[formData.difficulty]
                    }`}
                  >
                    {getDifficultyLabel(formData.difficulty)}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{getCategoryLabel(formData.category)}</span>
                  <span className="text-sm text-gray-500">{formData.duration_weeks} недель</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{formData.title || "Название курса"}</h1>

                <p className="text-xl text-gray-600 mb-6">{formData.short_description || "Краткое описание курса"}</p>

                <div className="text-2xl font-bold text-red-600 mb-8">{formData.price > 0 ? `${formData.price} ₸` : "Бесплатно"}</div>

                <div className="prose max-w-none mb-8">
                  <h3>Описание курса</h3>
                  <div className="whitespace-pre-line">{formData.description || "Полное описание курса"}</div>
                </div>

                {formData.prerequisites && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Предварительные требования</h3>
                    <div className="whitespace-pre-line text-gray-600">{formData.prerequisites}</div>
                  </div>
                )}

                {formData.learning_outcomes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Что вы изучите</h3>
                    <div className="whitespace-pre-line text-gray-600">{formData.learning_outcomes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Заголовок */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Редактирование курса</h1>
                <p className="mt-2 text-gray-600">Измените информацию о курсе</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => router.push(`/admin/courses/${id}/assign-students`)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Назначить студентов
                </button>
                <button onClick={() => router.push(`/admin/courses/${id}`)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" />
                  Назад
                </button>
              </div>
            </div>
          </div>

          {/* Отображение общих ошибок */}
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-800">{errors.general}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Основная форма */}
              <div className="lg:col-span-2 space-y-6">
                {/* Базовая информация */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Базовая информация</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Название курса *</label>
                      <input type="text" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} className={`w-full border rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500 ${errors.title ? "border-red-300" : "border-gray-300"}`} placeholder="Введите название курса" />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL (slug) *</label>
                      <input type="text" value={formData.slug} onChange={(e) => handleInputChange("slug", e.target.value)} className={`w-full border rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500 ${errors.slug ? "border-red-300" : "border-gray-300"}`} placeholder="url-kursa" />
                      {errors.slug && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.slug}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание *</label>
                      <textarea value={formData.short_description} onChange={(e) => handleInputChange("short_description", e.target.value)} rows={3} className={`w-full border rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500 ${errors.short_description ? "border-red-300" : "border-gray-300"}`} placeholder="Краткое описание курса для превью" />
                      {errors.short_description && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.short_description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Полное описание */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Полное описание *</h3>
                  <textarea value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} rows={8} className={`w-full border rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500 ${errors.description ? "border-red-300" : "border-gray-300"}`} placeholder="Подробное описание курса, его содержания и целей" />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Дополнительная информация */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Дополнительная информация</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Предварительные требования</label>
                      <textarea value={formData.prerequisites} onChange={(e) => handleInputChange("prerequisites", e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500" placeholder="Что должен знать студент перед началом курса" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Результаты обучения *</label>
                      <textarea value={formData.learning_outcomes} onChange={(e) => handleInputChange("learning_outcomes", e.target.value)} rows={4} className={`w-full border rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500 ${errors.learning_outcomes ? "border-red-300" : "border-gray-300"}`} placeholder="Что изучит студент после прохождения курса" />
                      {errors.learning_outcomes && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.learning_outcomes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Боковая панель */}
              <div className="space-y-6">
                {/* Изображение */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Обложка курса</h3>

                  <div className="space-y-4">
                    {formData.featured_image && <img src={formData.featured_image} alt="Preview" className="w-full h-40 object-cover rounded-lg" />}

                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Нажмите для загрузки изображения</p>
                    </button>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>
                </div>

                {/* Настройки */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Настройки курса</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Цена (₸)</label>
                      <input type="number" min="0" value={formData.price} onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)} className={`w-full border rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500 ${errors.price ? "border-red-300" : "border-gray-300"}`} />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                      <select value={formData.category} onChange={(e) => handleInputChange("category", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500">
                        <option value="theory">Теория</option>
                        <option value="practice">Практика</option>
                        <option value="exam">Экзамен</option>
                        <option value="special">Специальный</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Сложность</label>
                      <select value={formData.difficulty} onChange={(e) => handleInputChange("difficulty", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500">
                        <option value="beginner">Начинающий</option>
                        <option value="intermediate">Средний</option>
                        <option value="advanced">Продвинутый</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Длительность (недели)</label>
                      <input type="number" min="1" value={formData.duration_weeks} onChange={(e) => handleInputChange("duration_weeks", parseInt(e.target.value) || 1)} className={`w-full border rounded-lg px-4 py-2 focus:ring-red-500 focus:border-red-500 ${errors.duration_weeks ? "border-red-300" : "border-gray-300"}`} />
                      {errors.duration_weeks && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.duration_weeks}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center">
                      <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => handleInputChange("is_active", e.target.checked)} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                        Активный курс
                      </label>
                    </div>
                  </div>
                </div>

                {/* Действия */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="space-y-3">
                    <button type="button" onClick={() => setPreviewMode(true)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <Eye className="w-5 h-5" />
                      Предварительный просмотр
                    </button>

                    <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Сохранить изменения
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditCourse;
