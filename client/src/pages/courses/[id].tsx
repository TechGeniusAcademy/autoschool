import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "../../contexts/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { FaClock, FaUsers, FaGraduationCap, FaDesktop, FaCalendarAlt, FaMoneyBillWave, FaPlay, FaLock, FaCheck, FaStar, FaFileAlt, FaVideo } from "react-icons/fa";
import { API_BASE_URL } from "@/constants/api";

// Типы данных для курса
interface Lesson {
  id: number;
  title: string;
  description?: string;
  lesson_type: string;
  video_duration?: number;
  order_index: number;
  is_preview: boolean;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  featured_image?: string;
  price: number;
  category?: string;
  difficulty: string;
  duration_weeks: number;
  prerequisites?: string;
  learning_outcomes?: string;
  instructor_name: string;
  instructor_avatar?: string;
  lessons_count: number;
  students_count: number;
  preview_lessons: Lesson[];
  all_lessons: Lesson[];
  created_at: string;
}

const CourseDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchCourse(id);
    }
  }, [id]);

  const fetchCourse = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/courses/public/${slug}`);
      const data = await response.json();

      if (data.success) {
        setCourse(data.data);
      } else {
        setError(data.message || "Курс не найден");
      }
    } catch (err) {
      console.error("Ошибка при загрузке курса:", err);
      setError("Ошибка при загрузке курса");
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

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <FaVideo className="w-4 h-4 text-blue-500" />;
      case "text":
        return <FaFileAlt className="w-4 h-4 text-green-500" />;
      case "live_stream":
        return <FaCalendarAlt className="w-4 h-4 text-red-500" />;
      case "test":
        return <FaGraduationCap className="w-4 h-4 text-purple-500" />;
      default:
        return <FaDesktop className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Бесплатно";
    return `${price.toLocaleString("ru-RU")} ₸`;
  };

  if (loading) {
    return (
      <Layout title="Загрузка..." description="Загрузка курса">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !course) {
    return (
      <Layout title="Курс не найден" description="Запрашиваемый курс не существует">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{error || "Запрашиваемый курс не существует или был удален."}</h1>
            <Link href="/courses" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 inline-block">
              Вернуться к списку курсов
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${course.title} - AutoSchool`} description={course.short_description}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">{course.category || "Курс"}</span>
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">{getDifficultyLabel(course.difficulty)}</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{course.title}</h1>

              <p className="text-xl mb-6 text-blue-100">{course.short_description}</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <FaClock className="text-2xl mx-auto mb-2" />
                  <div className="text-sm">Длительность</div>
                  <div className="font-semibold">{course.duration_weeks} недель</div>
                </div>

                <div className="text-center">
                  <FaGraduationCap className="text-2xl mx-auto mb-2" />
                  <div className="text-sm">Уроков</div>
                  <div className="font-semibold">{course.lessons_count}</div>
                </div>

                <div className="text-center">
                  <FaUsers className="text-2xl mx-auto mb-2" />
                  <div className="text-sm">Студентов</div>
                  <div className="font-semibold">{course.students_count}</div>
                </div>

                <div className="text-center">
                  <FaMoneyBillWave className="text-2xl mx-auto mb-2" />
                  <div className="text-sm">Цена</div>
                  <div className="font-semibold">{formatPrice(course.price)}</div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button className="bg-yellow-500 text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition">{course.price === 0 ? "Начать обучение" : "Записаться на курс"}</button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-800 transition">Бесплатный урок</button>
              </div>
            </div>

            <div className="text-center">
              {course.featured_image ? (
                <div className="relative w-full h-80 rounded-lg overflow-hidden">
                  <Image src={course.featured_image} alt={course.title} layout="fill" objectFit="cover" className="rounded-lg" />
                </div>
              ) : (
                <div className="w-full h-80 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FaGraduationCap className="text-6xl text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      {course.instructor_name && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-4">
              {course.instructor_avatar ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image src={course.instructor_avatar} alt={course.instructor_name} layout="fill" objectFit="cover" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <FaUsers className="text-white text-xl" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Инструктор</h3>
                <p className="text-blue-600 font-medium">{course.instructor_name}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Course Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Description */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">О курсе</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600 text-lg leading-relaxed">{course.description}</p>
                </div>
              </div>

              {/* Prerequisites */}
              {course.prerequisites && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Требования</h2>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <p className="text-gray-700">{course.prerequisites}</p>
                  </div>
                </div>
              )}

              {/* Learning Outcomes */}
              {course.learning_outcomes && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Что вы изучите</h2>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <p className="text-gray-700">{course.learning_outcomes}</p>
                  </div>
                </div>
              )}

              {/* Course Curriculum */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Программа курса</h2>
                <div className="space-y-4">
                  {course.all_lessons.map((lesson, index) => (
                    <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getLessonIcon(lesson.lesson_type)}
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {index + 1}. {lesson.title}
                            </h3>
                            {lesson.description && <p className="text-sm text-gray-600">{lesson.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {lesson.video_duration && <span className="text-sm text-gray-500">{lesson.video_duration} мин</span>}
                          {lesson.is_preview ? <FaPlay className="text-green-500" /> : <FaLock className="text-gray-400" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {/* Price Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{formatPrice(course.price)}</div>
                    {course.price > 0 && <div className="text-sm text-gray-500">Единоразовый платеж</div>}
                  </div>

                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-4">{course.price === 0 ? "Начать обучение" : "Записаться на курс"}</button>

                  {course.preview_lessons.length > 0 && <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">Бесплатный урок</button>}
                </div>

                {/* Course Stats */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Информация о курсе</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Уроков</span>
                      <span className="font-semibold">{course.lessons_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Длительность</span>
                      <span className="font-semibold">{course.duration_weeks} недель</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Уровень</span>
                      <span className="font-semibold">{getDifficultyLabel(course.difficulty)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Студентов</span>
                      <span className="font-semibold">{course.students_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Создан</span>
                      <span className="font-semibold">{formatDate(course.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CourseDetailPage;
