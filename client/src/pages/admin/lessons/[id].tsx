import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/layout/Layout";
import TokenStorage from "../../../utils/tokenStorage";
import { ArrowLeft, Edit, Trash2, Book, Video, FileText, TestTube, Clock, Eye, EyeOff, Calendar, User } from "lucide-react";
import { API_BASE_URL } from "@/constants/api";

interface Lesson {
  id: number;
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
  created_at: string;
  course_id: number;
  course_title?: string;
  instructor_name?: string;
}

const LessonDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const token = TokenStorage.getToken();

      const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLesson(data.data);
        } else {
          setError(data.message || "Урок не найден");
        }
      } else {
        setError("Ошибка при загрузке урока");
      }
    } catch (error) {
      console.error("Ошибка при загрузке урока:", error);
      setError("Ошибка при загрузке урока");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!lesson) {
      return;
    }

    try {
      const token = TokenStorage.getToken();
      const response = await fetch(`${API_BASE_URL}/lessons/${lesson.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Урок успешно удален");
        router.push("/admin/lessons");
      } else {
        const data = await response.json();
        alert(data.message || "Ошибка при удалении урока");
      }
    } catch (error) {
      console.error("Ошибка при удалении урока:", error);
      alert("Ошибка при удалении урока");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "text":
        return <FileText className="w-5 h-5" />;
      case "live_stream":
        return <Calendar className="w-5 h-5" />;
      case "test":
        return <TestTube className="w-5 h-5" />;
      default:
        return <Book className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return "Видео";
      case "text":
        return "Текст";
      case "live_stream":
        return "Прямой эфир";
      case "test":
        return "Тест";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Layout title="Загрузка..." description="Загрузка урока">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !lesson) {
    return (
      <Layout title="Ошибка" description="Урок не найден">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h1 className="text-xl font-bold mb-2">Ошибка</h1>
            <p>{error || "Урок не найден"}</p>
            <button onClick={() => router.push("/admin/lessons")} className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Вернуться к списку уроков
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${lesson.title} - Управление уроками`} description={lesson.description || "Просмотр урока"}>
      <div className="container mx-auto px-4 py-8">
        {/* Навигация */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push("/admin/lessons")} className="flex items-center text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Назад к урокам
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => router.push(`/admin/lessons/edit/${lesson.id}`)} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              <Edit className="w-4 h-4 mr-2" />
              Редактировать
            </button>
            <button onClick={handleDelete} className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Удалить
            </button>
          </div>
        </div>

        {/* Основная информация */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
              {lesson.description && <p className="text-gray-600 mb-4">{lesson.description}</p>}
            </div>
            <div className="flex items-center space-x-2">
              {lesson.is_preview ? (
                <span className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  Бесплатный
                </span>
              ) : (
                <span className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  <EyeOff className="w-4 h-4 mr-1" />
                  Платный
                </span>
              )}
            </div>
          </div>

          {/* Метаинформация */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-600 mb-1">
                {getTypeIcon(lesson.lesson_type)}
                <span className="ml-2 text-sm">Тип</span>
              </div>
              <div className="font-semibold">{getTypeLabel(lesson.lesson_type)}</div>
            </div>

            {lesson.video_duration && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-600 mb-1">
                  <Clock className="w-5 h-5" />
                  <span className="ml-2 text-sm">Длительность</span>
                </div>
                <div className="font-semibold">{lesson.video_duration} мин</div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-600 mb-1">
                <Book className="w-5 h-5" />
                <span className="ml-2 text-sm">Порядок</span>
              </div>
              <div className="font-semibold">#{lesson.order_index}</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-600 mb-1">
                <Calendar className="w-5 h-5" />
                <span className="ml-2 text-sm">Создан</span>
              </div>
              <div className="font-semibold text-sm">{formatDate(lesson.created_at)}</div>
            </div>
          </div>

          {/* Курс информация */}
          {lesson.course_title && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center text-blue-600 mb-1">
                <Book className="w-5 h-5" />
                <span className="ml-2 text-sm">Курс</span>
              </div>
              <div className="font-semibold text-blue-800">{lesson.course_title}</div>
              {lesson.instructor_name && (
                <div className="flex items-center text-blue-600 mt-2">
                  <User className="w-4 h-4" />
                  <span className="ml-2 text-sm">Инструктор: {lesson.instructor_name}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Контент урока */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Содержание урока</h2>

          {lesson.lesson_type === "video" && lesson.video_url && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Видео</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 break-all">
                  {lesson.video_url}
                </a>
              </div>
            </div>
          )}

          {lesson.lesson_type === "live_stream" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Прямой эфир</h3>
              {lesson.live_stream_date && (
                <div className="bg-gray-100 p-4 rounded-lg mb-2">
                  <strong>Дата:</strong> {formatDate(lesson.live_stream_date)}
                </div>
              )}
              {lesson.live_stream_url && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <strong>Ссылка:</strong>{" "}
                  <a href={lesson.live_stream_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 break-all">
                    {lesson.live_stream_url}
                  </a>
                </div>
              )}
            </div>
          )}

          {lesson.content && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Текстовое содержание</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: lesson.content.replace(/\n/g, "<br>"),
                  }}
                />
              </div>
            </div>
          )}

          {lesson.lesson_type === "test" && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center text-yellow-600">
                <TestTube className="w-5 h-5 mr-2" />
                <span className="font-semibold">Тестовый урок</span>
              </div>
              <p className="text-yellow-700 mt-2">Этот урок содержит тестовые вопросы. Вопросы управляются отдельно в разделе тестов.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LessonDetailPage;
