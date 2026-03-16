import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/layout/Layout";
import TokenStorage from "../../../utils/tokenStorage";
import { ArrowLeft, Upload, Save, Eye, AlertCircle, Plus, Trash2 } from "lucide-react";

interface LessonFormData {
  title: string;
  slug: string;
  short_description: string;
  content: string;
  featured_image: string;
  course_id: number;
  order_number: number;
  content_type: "text" | "video" | "quiz" | "mixed";
  video_url: string;
  duration_minutes: number;
  is_active: boolean;
  is_free: boolean;
}

interface Course {
  id: number;
  title: string;
  instructor_name: string;
}

interface TestQuestion {
  id?: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

const CreateLesson: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    slug: "",
    short_description: "",
    content: "",
    featured_image: "",
    course_id: 0,
    order_number: 1,
    content_type: "text",
    video_url: "",
    duration_minutes: 30,
    is_active: true,
    is_free: false,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(false);

  // Загрузка списка курсов
  useEffect(() => {
    fetchCourses();
  }, []);

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
        console.log("Courses response:", data);
        setCourses(data.data?.courses || []);
      }
    } catch (error) {
      console.error("Ошибка при загрузке курсов:", error);
    }
  };

  // Генерация slug из заголовка
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9а-я]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Обработка изменений в форме
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : type === "number" ? Number(value) : value,
      };

      // Автогенерация slug при изменении заголовка
      if (name === "title" && !prev.slug) {
        updatedData.slug = generateSlug(value);
      }

      return updatedData;
    });

    // Очистка ошибки при изменении поля
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Обработка загрузки изображения
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          featured_image: "Размер файла не должен превышать 5MB",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          featured_image: event.target?.result as string,
        }));
        setErrors((prev) => ({ ...prev, featured_image: "" }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Управление вопросами теста
  const addTestQuestion = () => {
    setTestQuestions((prev) => [
      ...prev,
      {
        question: "",
        options: ["", "", "", ""],
        correct_answer: 0,
        explanation: "",
      },
    ]);
  };

  const updateTestQuestion = (index: number, field: keyof TestQuestion, value: any) => {
    setTestQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    setTestQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, oi) => (oi === optionIndex ? value : opt)),
            }
          : q
      )
    );
  };

  const removeTestQuestion = (index: number) => {
    setTestQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Название урока обязательно";
    if (!formData.slug.trim()) newErrors.slug = "Slug обязателен";
    if (!formData.short_description.trim()) newErrors.short_description = "Краткое описание обязательно";
    if (!formData.content.trim()) newErrors.content = "Содержание урока обязательно";
    if (formData.course_id === 0) newErrors.course_id = "Выберите курс";
    if (formData.duration_minutes <= 0) newErrors.duration_minutes = "Длительность должна быть больше 0";

    if (formData.content_type === "video" && !formData.video_url.trim()) {
      newErrors.video_url = "URL видео обязателен для видео-урока";
    }

    // Валидация вопросов теста
    if (formData.content_type === "quiz" && testQuestions.length === 0) {
      newErrors.test_questions = "Добавьте хотя бы один вопрос для викторины";
    }

    testQuestions.forEach((q, index) => {
      if (!q.question.trim()) {
        newErrors[`question_${index}`] = "Вопрос не может быть пустым";
      }
      if (q.options.some((opt) => !opt.trim())) {
        newErrors[`options_${index}`] = "Все варианты ответов должны быть заполнены";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = TokenStorage.getToken();

      // Создание урока
      const lessonPayload = {
        course_id: formData.course_id,
        title: formData.title,
        description: formData.short_description,
        content: formData.content,
        lesson_type: formData.content_type === "quiz" ? "test" : formData.content_type,
        video_url: formData.video_url || null,
        video_duration: formData.duration_minutes || null,
        is_preview: formData.is_free,
      };

      const lessonResponse = await fetch("http://localhost:3001/api/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(lessonPayload),
      });

      if (!lessonResponse.ok) {
        const errorData = await lessonResponse.json();
        console.error("Server error:", errorData);
        throw new Error(errorData.message || "Ошибка при создании урока");
      }

      const lessonData = await lessonResponse.json();
      console.log("Lesson response:", lessonData);

      if (!lessonData.success || !lessonData.data) {
        throw new Error("Неверный ответ сервера");
      }

      const lessonId = lessonData.data.id;

      // Создание вопросов теста (если есть)
      if (formData.content_type === "quiz" && testQuestions.length > 0) {
        for (const question of testQuestions) {
          const testResponse = await fetch("http://localhost:3001/api/tests", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              lesson_id: lessonId,
              ...question,
            }),
          });

          if (!testResponse.ok) {
            console.error("Ошибка при создании вопроса теста");
          }
        }
      }

      router.push("/admin/lessons");
    } catch (error) {
      console.error("Ошибка при создании урока:", error);
      setErrors({
        submit: error instanceof Error ? error.message : "Произошла ошибка",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Заголовок */}
          <div className="mb-8">
            <button onClick={() => router.push("/admin/lessons")} className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к урокам
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Создать новый урок</h1>
          </div>

          {/* Переключатель режимов */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button onClick={() => setPreviewMode(false)} className={`px-4 py-2 rounded-lg ${!previewMode ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                Редактирование
              </button>
              <button onClick={() => setPreviewMode(true)} className={`px-4 py-2 rounded-lg ${previewMode ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                <Eye className="h-4 w-4 inline mr-2" />
                Предварительный просмотр
              </button>
            </div>
          </div>

          {/* Форма */}
          {!previewMode ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Основная информация */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Основная информация</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Название урока *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Введите название урока" />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                    <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="url-адрес" />
                    {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание *</label>
                  <textarea name="short_description" value={formData.short_description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Краткое описание урока" />
                  {errors.short_description && <p className="mt-1 text-sm text-red-600">{errors.short_description}</p>}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Содержание урока *</label>
                  <textarea name="content" value={formData.content} onChange={handleInputChange} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Полное содержание урока" />
                  {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                </div>
              </div>

              {/* Настройки курса */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Настройки курса</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Курс *</label>
                    <select name="course_id" value={formData.course_id} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                      <option value={0}>Выберите курс</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    {errors.course_id && <p className="mt-1 text-sm text-red-600">{errors.course_id}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Порядковый номер</label>
                    <input type="number" name="order_number" value={formData.order_number} onChange={handleInputChange} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Длительность (мин)</label>
                    <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleInputChange} min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    {errors.duration_minutes && <p className="mt-1 text-sm text-red-600">{errors.duration_minutes}</p>}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип контента</label>
                  <select name="content_type" value={formData.content_type} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                    <option value="text">Текстовый урок</option>
                    <option value="video">Видео урок</option>
                    <option value="quiz">Викторина</option>
                    <option value="mixed">Смешанный</option>
                  </select>
                </div>

                {formData.content_type === "video" && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL видео</label>
                    <input type="url" name="video_url" value={formData.video_url} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="https://youtube.com/watch?v=..." />
                    {errors.video_url && <p className="mt-1 text-sm text-red-600">{errors.video_url}</p>}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} className="mr-2" />
                    Урок активен
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="is_free" checked={formData.is_free} onChange={handleInputChange} className="mr-2" />
                    Бесплатный урок
                  </label>
                </div>
              </div>

              {/* Изображение */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Изображение урока</h2>

                <div className="space-y-4">
                  <div>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить изображение
                    </button>
                    {errors.featured_image && <p className="mt-1 text-sm text-red-600">{errors.featured_image}</p>}
                  </div>

                  {formData.featured_image && (
                    <div className="mt-4">
                      <img src={formData.featured_image} alt="Предварительный просмотр" className="max-w-xs h-auto rounded-lg border" />
                    </div>
                  )}
                </div>
              </div>

              {/* Вопросы теста */}
              {formData.content_type === "quiz" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Вопросы викторины</h2>
                    <button type="button" onClick={addTestQuestion} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить вопрос
                    </button>
                  </div>

                  {errors.test_questions && <p className="mb-4 text-sm text-red-600">{errors.test_questions}</p>}

                  <div className="space-y-6">
                    {testQuestions.map((question, questionIndex) => (
                      <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-medium">Вопрос {questionIndex + 1}</h3>
                          <button type="button" onClick={() => removeTestQuestion(questionIndex)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Текст вопроса</label>
                            <input type="text" value={question.question} onChange={(e) => updateTestQuestion(questionIndex, "question", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Введите вопрос" />
                            {errors[`question_${questionIndex}`] && <p className="mt-1 text-sm text-red-600">{errors[`question_${questionIndex}`]}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Варианты ответов</label>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input type="radio" name={`correct_${questionIndex}`} checked={question.correct_answer === optionIndex} onChange={() => updateTestQuestion(questionIndex, "correct_answer", optionIndex)} className="text-red-600" />
                                  <input type="text" value={option} onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder={`Вариант ${optionIndex + 1}`} />
                                </div>
                              ))}
                            </div>
                            {errors[`options_${questionIndex}`] && <p className="mt-1 text-sm text-red-600">{errors[`options_${questionIndex}`]}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Объяснение ответа</label>
                            <textarea value={question.explanation} onChange={(e) => updateTestQuestion(questionIndex, "explanation", e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Объяснение правильного ответа" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ошибки отправки */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-700">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Кнопки действий */}
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => router.push("/admin/lessons")} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Отмена
                </button>
                <button type="submit" disabled={loading} className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Создание..." : "Создать урок"}
                </button>
              </div>
            </form>
          ) : (
            /* Предварительный просмотр */
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{formData.title}</h2>
              {formData.featured_image && <img src={formData.featured_image} alt={formData.title} className="w-full max-w-md h-auto rounded-lg mb-6" />}
              <p className="text-gray-600 mb-6">{formData.short_description}</p>
              <div className="prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: formData.content.replace(/\n/g, "<br>"),
                  }}
                />
              </div>

              {formData.content_type === "video" && formData.video_url && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Видео урок</h3>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p>Видео: {formData.video_url}</p>
                  </div>
                </div>
              )}

              {formData.content_type === "quiz" && testQuestions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Вопросы викторины</h3>
                  <div className="space-y-4">
                    {testQuestions.map((question, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">
                          {index + 1}. {question.question}
                        </h4>
                        <div className="space-y-1">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className={`p-2 rounded ${optionIndex === question.correct_answer ? "bg-green-100 text-green-800" : "bg-gray-50"}`}>
                              {option}
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <p className="mt-2 text-sm text-gray-600">
                            <strong>Объяснение:</strong> {question.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CreateLesson;
