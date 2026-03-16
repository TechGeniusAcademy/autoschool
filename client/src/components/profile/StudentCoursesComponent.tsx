import React, { useState, useEffect } from "react";
import { TokenStorage } from "../../services/api";
import { API_BASE_URL } from "../../constants/api";
import { FaUser, FaCalendarAlt, FaBook, FaTrophy, FaPlay, FaCheckCircle, FaEye, FaClock, FaGraduationCap, FaVideo, FaFileAlt, FaQuestionCircle, FaBroadcastTower, FaArrowLeft, FaPaperPlane } from "react-icons/fa";

// Тип для представления курса студента
interface StudentCourse {
  id: number;
  title: string;
  description: string;
  instructor_name: string;
  progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
  is_active: boolean;
  enrolled_at: string;
  completion_date?: string;
  status: "active" | "completed" | "paused";
}

// Тип для представления урока курса
interface CourseLesson {
  id: number;
  title: string;
  description: string;
  content: string;
  lesson_type: "video" | "text" | "live_stream" | "test";
  video_url?: string;
  video_duration?: number;
  order_index: number;
  is_completed: boolean;
  completed_at?: string;
  isAccessible: boolean; // Поле из API, указывающее доступность урока
}

// Интерфейсы для тестирования
interface TestQuestion {
  id: string;
  question: string;
  type: "single" | "multiple" | "text";
  options?: string[];
  correct_answers: string[];
  points: number;
}

interface LessonTest {
  id: number;
  lesson_id: number;
  title: string;
  description?: string;
  passing_score: number;
  time_limit: number; // в секундах, 0 = без ограничений
  max_attempts: number;
  questions: TestQuestion[];
}

const StudentCoursesComponent: React.FC = () => {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [courseLessons, setCourseLessons] = useState<CourseLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [activeView, setActiveView] = useState<"list" | "course" | "lesson" | "test">("list");

  // Состояние для тестирования
  const [currentTest, setCurrentTest] = useState<LessonTest | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, string[]>>({});
  const [isTestLoading, setIsTestLoading] = useState(false);

  // Загрузка курсов студента
  const fetchCourses = async () => {
    try {
      console.log("StudentCoursesComponent: Fetching student courses...");

      const token = TokenStorage.get();
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/courses/my-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      console.log("Courses response:", result);

      if (result.success) {
        console.log("Courses data:", result.data);
        setCourses(result.data || []);
      } else {
        console.error("Failed to fetch courses:", result.message);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка курсов при монтировании компонента
  useEffect(() => {
    fetchCourses();
  }, []);

  // Загрузка уроков курса
  const loadCourseLessons = async (courseId: number) => {
    setIsLoadingLessons(true);
    try {
      console.log("Loading lessons for course:", courseId);

      const token = TokenStorage.get();
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/lessons/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      console.log("Lessons response:", result);

      if (result.success) {
        console.log("Lessons data with accessibility:", result.data);
        result.data.forEach((lesson: any, index: number) => {
          console.log(`Lesson ${index + 1}: ${lesson.title}, completed: ${lesson.is_completed}, accessible: ${lesson.isAccessible}`);
        });
        setCourseLessons(result.data || []);
      } else {
        console.error("Failed to fetch lessons:", result.message);
      }
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  // Открытие курса
  const openCourse = async (course: StudentCourse) => {
    console.log("Opening course:", course);
    setSelectedCourse(course);
    console.log("Setting activeView to course");
    setActiveView("course");
    console.log("Loading course lessons for course ID:", course.id);
    await loadCourseLessons(course.id);
  };

  // Открытие урока
  const openLesson = async (lesson: CourseLesson) => {
    console.log("Opening lesson:", lesson);
    setSelectedLesson(lesson);
    setActiveView("lesson");

    // Не отмечаем урок как пройденный автоматически
    // Пользователь должен сам нажать кнопку "Завершить урок"
  };

  // Возврат к курсу
  const backToCourse = () => {
    setSelectedLesson(null);
    setActiveView("course");
  };

  // Функция для рендеринга содержимого урока в зависимости от типа
  const renderLessonContent = (lesson: CourseLesson) => {
    switch (lesson.lesson_type) {
      case "video":
        return (
          <div className="space-y-6">
            {lesson.video_url && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Видеоурок</h3>
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe src={getEmbedUrl(lesson.video_url)} className="absolute top-0 left-0 w-full h-full rounded-lg" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={lesson.title} />
                </div>
                {lesson.video_duration && (
                  <p className="text-sm text-gray-600 mt-2">
                    Длительность: {Math.floor(lesson.video_duration / 60)} мин {lesson.video_duration % 60} сек
                  </p>
                )}
              </div>
            )}
            {lesson.content && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Дополнительные материалы</h3>
                <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            )}
          </div>
        );

      case "text":
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Содержание урока</h3>
            <div
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: lesson.content || "Содержание урока не загружено.",
              }}
            />
          </div>
        );

      case "test":
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Тестовое задание</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800">Этот урок содержит тестовые задания.</p>
            </div>
            {lesson.content && <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: lesson.content }} />}
            <div className="mt-4">
              <button onClick={() => loadTest(lesson.id)} disabled={isTestLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center">
                <FaQuestionCircle className="mr-2" />
                {isTestLoading ? "Загрузка..." : "Пройти тест"}
              </button>
            </div>
          </div>
        );

      case "live_stream":
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Прямая трансляция</h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <p className="text-purple-800">Этот урок будет проводиться в формате прямой трансляции.</p>
            </div>
            {lesson.content && <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: lesson.content }} />}
          </div>
        );

      default:
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Содержание урока</h3>
            <div
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: lesson.content || "Содержание урока не загружено.",
              }}
            />
          </div>
        );
    }
  };

  // Функция для преобразования YouTube URL в embed формат
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // Проверка доступности урока - используем данные из API
  const isLessonAvailable = (lesson: CourseLesson, index: number) => {
    // Используем поле isAccessible из API вместо собственной логики
    return lesson.isAccessible !== undefined ? lesson.isAccessible : false;
  };

  // Функция для получения иконки по типу урока
  const getLessonIcon = (lessonType: string) => {
    switch (lessonType) {
      case "video":
        return <FaVideo className="text-red-600" />;
      case "text":
        return <FaFileAlt className="text-blue-600" />;
      case "test":
        return <FaQuestionCircle className="text-green-600" />;
      case "live_stream":
        return <FaBroadcastTower className="text-purple-600" />;
      default:
        return <FaBook className="text-gray-600" />;
    }
  };

  // Отметка урока как пройденного
  const markLessonAsCompleted = async (lessonId: number) => {
    try {
      console.log("Completing lesson:", lessonId);

      const token = TokenStorage.get();
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timeSpent: 0 }), // Можно добавить логику отслеживания времени
      });

      const result = await response.json();

      if (result.success) {
        console.log("Lesson completed successfully");

        // Обновляем список уроков
        if (selectedCourse) {
          await loadCourseLessons(selectedCourse.id);
          // Также обновляем список курсов для обновления прогресса
          await fetchCourses();
        }

        // Если мы находимся в детальном виде урока, обновляем выбранный урок
        if (selectedLesson && selectedLesson.id === lessonId) {
          setSelectedLesson({
            ...selectedLesson,
            is_completed: true,
            completed_at: new Date().toISOString(),
          });
        }

        // Показываем успешное сообщение
        alert("Урок успешно завершен!");
      } else {
        console.error("Failed to complete lesson:", result.message);
        alert("Ошибка при завершении урока: " + result.message);
      }
    } catch (error) {
      console.error("Failed to complete lesson:", error);
      alert("Ошибка при завершении урока");
    }
  };

  // Функции для работы с тестами
  const loadTest = async (lessonId: number) => {
    setIsTestLoading(true);
    try {
      const token = TokenStorage.get();
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/test`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success) {
        setCurrentTest(result.data);
        setTestAnswers({});
        setActiveView("test");
      } else {
        console.error("Failed to load test:", result.message);
        alert("Ошибка загрузки теста: " + result.message);
      }
    } catch (error) {
      console.error("Failed to load test:", error);
      alert("Ошибка загрузки теста");
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string, isMultiple: boolean = false) => {
    setTestAnswers((prev) => {
      if (isMultiple) {
        const currentAnswers = prev[questionId] || [];
        const updatedAnswers = currentAnswers.includes(answer) ? currentAnswers.filter((a) => a !== answer) : [...currentAnswers, answer];
        return { ...prev, [questionId]: updatedAnswers };
      } else {
        return { ...prev, [questionId]: [answer] };
      }
    });
  };

  const submitTest = async () => {
    if (!currentTest || !selectedLesson) return;

    try {
      const token = TokenStorage.get();
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/lessons/${selectedLesson.id}/test/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: testAnswers,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`Тест завершен! Результат: ${result.data.score}/${result.data.max_score} баллов${result.data.passed ? " (Пройден)" : " (Не пройден)"}`);

        // Обновляем данные урока и возвращаемся к уроку
        if (selectedCourse) {
          await loadCourseLessons(selectedCourse.id);
          await fetchCourses();
        }
        setCurrentTest(null);
        setTestAnswers({});
        setActiveView("lesson");
      } else {
        console.error("Failed to submit test:", result.message);
        alert("Ошибка отправки теста: " + result.message);
      }
    } catch (error) {
      console.error("Failed to submit test:", error);
      alert("Ошибка отправки теста");
    }
  };

  const backToLesson = () => {
    setCurrentTest(null);
    setTestAnswers({});
    setActiveView("lesson");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Загрузка курсов...</div>
      </div>
    );
  }

  console.log("Rendering with activeView:", activeView);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {activeView === "list" ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Мои курсы</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Всего курсов: {courses.length}</span>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <FaGraduationCap className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Курсы не найдены</h3>
              <p className="text-gray-500">Вы еще не записаны ни на один курс</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{course.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${course.status === "completed" ? "bg-green-100 text-green-800" : course.status === "active" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>{course.status === "completed" ? "Завершен" : course.status === "active" ? "Активный" : "Приостановлен"}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUser className="mr-2" />
                      <span>Инструктор: {course.instructor_name}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <FaBook className="mr-2" />
                      <span>
                        Прогресс: {course.completed_lessons}/{course.total_lessons} уроков
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.progress_percentage}%` }}></div>
                    </div>
                    <div className="text-right text-sm text-gray-600">{course.progress_percentage}%</div>

                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2" />
                      <span>Начат: {new Date(course.enrolled_at).toLocaleDateString("ru-RU")}</span>
                    </div>

                    {course.completion_date && (
                      <div className="flex items-center text-sm text-green-600">
                        <FaTrophy className="mr-2" />
                        <span>Завершен: {new Date(course.completion_date).toLocaleDateString("ru-RU")}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex space-x-2">
                    <button onClick={() => openCourse(course)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                      <FaPlay className="mr-2" />
                      {course.status === "completed" ? "Просмотреть" : "Продолжить"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : activeView === "course" ? (
        <>
          {/* Детальный вид курса */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button onClick={() => setActiveView("list")} className="text-blue-600 hover:text-blue-800">
                ← Назад к курсам
              </button>
              <h2 className="text-xl font-bold text-gray-800">{selectedCourse?.title}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Прогресс: {selectedCourse?.progress_percentage}%</span>
            </div>
          </div>

          {selectedCourse && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Информация о курсе */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Информация о курсе</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUser className="mr-2" />
                      <span>Инструктор: {selectedCourse.instructor_name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaBook className="mr-2" />
                      <span>
                        Уроков: {selectedCourse.completed_lessons}/{selectedCourse.total_lessons}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2" />
                      <span>Начат: {new Date(selectedCourse.enrolled_at).toLocaleDateString("ru-RU")}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${selectedCourse.progress_percentage}%` }}></div>
                    </div>
                    <div className="text-right text-sm text-gray-600 mt-1">{selectedCourse.progress_percentage}%</div>
                  </div>
                </div>
              </div>

              {/* Список уроков */}
              <div className="lg:col-span-2">
                <h3 className="font-semibold text-gray-800 mb-4">Уроки курса</h3>

                {isLoadingLessons ? (
                  <div className="text-center py-8">
                    <div className="text-lg">Загрузка уроков...</div>
                  </div>
                ) : courseLessons.length === 0 ? (
                  <div className="text-center py-8">
                    <FaBook className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-500">Уроки не найдены</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courseLessons.map((lesson, index) => {
                      const isAvailable = isLessonAvailable(lesson, index);

                      return (
                        <div key={lesson.id} className={`border rounded-lg p-4 ${lesson.is_completed ? "bg-green-50 border-green-200" : isAvailable ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${lesson.is_completed ? "bg-green-100 text-green-800" : isAvailable ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"}`}>{index + 1}</span>
                                <div className="flex items-center space-x-2">
                                  {getLessonIcon(lesson.lesson_type)}
                                  <h4 className={`font-semibold ${isAvailable ? "text-gray-800" : "text-gray-500"}`}>{lesson.title}</h4>
                                </div>
                                {lesson.is_completed && <FaCheckCircle className="text-green-600" />}
                                {!isAvailable && !lesson.is_completed && <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">Недоступно</span>}
                              </div>

                              <p className={`text-sm mt-2 ml-11 ${isAvailable ? "text-gray-600" : "text-gray-400"}`}>{lesson.description}</p>

                              {lesson.lesson_type === "video" && lesson.video_duration && (
                                <p className="text-xs text-blue-600 mt-1 ml-11">
                                  <FaClock className="inline mr-1" />
                                  {Math.floor(lesson.video_duration / 60)} мин {lesson.video_duration % 60} сек
                                </p>
                              )}

                              {lesson.completed_at && <p className="text-xs text-green-600 mt-2 ml-11">Пройден: {new Date(lesson.completed_at).toLocaleDateString("ru-RU")}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                              <button onClick={() => openLesson(lesson)} disabled={!isAvailable} className={`px-3 py-1 text-sm rounded transition-colors flex items-center ${isAvailable ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                                <FaEye className="mr-1" />
                                {lesson.is_completed ? "Просмотреть" : "Открыть"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Детальный вид урока */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button onClick={backToCourse} className="text-blue-600 hover:text-blue-800">
                ← Назад к курсу
              </button>
              <h2 className="text-xl font-bold text-gray-800">{selectedLesson?.title}</h2>
            </div>
            <div className="flex items-center space-x-4">
              {selectedLesson?.is_completed && (
                <span className="text-green-600 flex items-center">
                  <FaCheckCircle className="mr-2" />
                  Урок пройден
                </span>
              )}
            </div>
          </div>

          {selectedLesson && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Описание урока</h3>
                <p className="text-gray-600 leading-relaxed">{selectedLesson.description}</p>
              </div>

              {/* Используем новую функцию для рендеринга контента */}
              {renderLessonContent(selectedLesson)}

              {selectedLesson.completed_at ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800">
                    <FaTrophy className="mr-2" />
                    <span className="font-semibold">Урок завершен {new Date(selectedLesson.completed_at).toLocaleDateString("ru-RU")}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mt-6">
                  {selectedLesson.lesson_type === "test" && (
                    <button onClick={() => alert("Функционал тестирования в разработке")} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 mr-3">
                      Пройти тест
                    </button>
                  )}
                  <button onClick={() => markLessonAsCompleted(selectedLesson.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                    {selectedLesson.lesson_type === "video" ? "Видео просмотрено" : selectedLesson.lesson_type === "test" ? "Тест завершен" : "Завершить урок"}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeView === "test" && currentTest && (
        <>
          {/* Вид теста */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button onClick={backToLesson} className="text-blue-600 hover:text-blue-800 flex items-center">
                <FaArrowLeft className="mr-2" />
                Назад к уроку
              </button>
              <h2 className="text-xl font-bold text-gray-800">{currentTest.title}</h2>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {currentTest.time_limit > 0 && <span>Время: {Math.floor(currentTest.time_limit / 60)} мин</span>}
              <span>Попыток: {currentTest.max_attempts}</span>
              <span>Мин. балл: {currentTest.passing_score}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {currentTest.description && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Описание теста</h3>
                <p className="text-blue-800">{currentTest.description}</p>
              </div>
            )}

            <div className="space-y-6">
              {currentTest.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">{index + 1}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-3">{question.question}</h4>

                      {question.type === "single" && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                              <input type="radio" name={`question_${question.id}`} value={option} onChange={(e) => handleAnswerChange(question.id, e.target.value)} className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === "multiple" && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                              <input type="checkbox" value={option} onChange={(e) => handleAnswerChange(question.id, e.target.value, true)} className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === "text" && <textarea placeholder="Введите ваш ответ..." onChange={(e) => handleAnswerChange(question.id, e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={3} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button onClick={submitTest} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium flex items-center transition-colors">
                <FaPaperPlane className="mr-2" />
                Отправить тест
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentCoursesComponent;
