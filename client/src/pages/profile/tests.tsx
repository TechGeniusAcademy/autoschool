import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaUser,
  FaCalendarAlt,
  FaGraduationCap,
  FaFileAlt,
  FaClipboardList,
  FaUserCog,
  FaSignOutAlt,
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaMedal,
  FaHistory,
} from "react-icons/fa";

// Тип для представления навигационных вкладок
interface NavTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Тип для представления теста
interface Test {
  id: number;
  title: string;
  description: string;
  questionsCount: number;
  timeLimit: number; // в минутах
  category: "Теория" | "ПДД" | "Экзамен" | "Практика";
  difficulty: "Легкий" | "Средний" | "Сложный";
  completed?: boolean;
  lastScore?: number;
  lastAttempt?: string;
  imageSrc: string;
}

// Тип для представления вопроса
interface Question {
  id: number;
  text: string;
  imageSrc?: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
}

// Тип для представления ответа пользователя
interface UserAnswer {
  questionId: number;
  selectedOption: string | null;
}

const ProfileTestsPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tests");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Навигационные вкладки
  const navTabs: NavTab[] = [
    { id: "dashboard", label: "Дашборд", icon: <FaUser /> },
    { id: "schedule", label: "Расписание", icon: <FaCalendarAlt /> },
    { id: "progress", label: "Прогресс", icon: <FaGraduationCap /> },
    { id: "materials", label: "Материалы", icon: <FaFileAlt /> },
    { id: "tests", label: "Тесты", icon: <FaClipboardList /> },
    // { id: "settings", label: "Настройки", icon: <FaUserCog /> },
  ];

  // Моковые данные тестов
  const tests: Test[] = [
    {
      id: 1,
      title: "Основы ПДД",
      description: "Базовые знания правил дорожного движения",
      questionsCount: 20,
      timeLimit: 20,
      category: "ПДД",
      difficulty: "Легкий",
      completed: true,
      lastScore: 85,
      lastAttempt: "10.09.2023",
      imageSrc: "/images/tests/pdd-basic.jpg",
    },
    {
      id: 2,
      title: "Дорожные знаки",
      description: "Тест на знание дорожных знаков и их значения",
      questionsCount: 15,
      timeLimit: 15,
      category: "ПДД",
      difficulty: "Средний",
      completed: true,
      lastScore: 90,
      lastAttempt: "12.09.2023",
      imageSrc: "/images/tests/road-signs.jpg",
    },
    {
      id: 3,
      title: "Маневрирование",
      description: "Правила выполнения маневров на дороге",
      questionsCount: 10,
      timeLimit: 15,
      category: "Теория",
      difficulty: "Средний",
      imageSrc: "/images/tests/maneuvering.jpg",
    },
    {
      id: 4,
      title: "Проезд перекрестков",
      description: "Правила проезда перекрестков и приоритеты",
      questionsCount: 12,
      timeLimit: 15,
      category: "ПДД",
      difficulty: "Сложный",
      imageSrc: "/images/tests/intersections.jpg",
    },
    {
      id: 5,
      title: "Пробный экзамен",
      description: "Полноценный пробный экзамен по всем темам",
      questionsCount: 30,
      timeLimit: 30,
      category: "Экзамен",
      difficulty: "Сложный",
      imageSrc: "/images/tests/exam.jpg",
    },
    {
      id: 6,
      title: "Первая помощь",
      description: "Основы оказания первой помощи при ДТП",
      questionsCount: 15,
      timeLimit: 15,
      category: "Теория",
      difficulty: "Средний",
      imageSrc: "/images/tests/first-aid.jpg",
    },
    {
      id: 7,
      title: "Техническое устройство автомобиля",
      description: "Основные узлы и системы автомобиля",
      questionsCount: 15,
      timeLimit: 20,
      category: "Теория",
      difficulty: "Средний",
      imageSrc: "/images/tests/car-tech.jpg",
    },
    {
      id: 8,
      title: "Разбор сложных ситуаций",
      description: "Анализ нестандартных дорожных ситуаций",
      questionsCount: 8,
      timeLimit: 15,
      category: "Практика",
      difficulty: "Сложный",
      imageSrc: "/images/tests/complex-situations.jpg",
    },
  ];

  // Моковые данные вопросов
  const questions: Question[] = [
    {
      id: 1,
      text: "Какой знак предупреждает о приближении к железнодорожному переезду без шлагбаума?",
      imageSrc: "/images/tests/question1.jpg",
      options: [
        { id: "A", text: "Знак A" },
        { id: "B", text: "Знак B" },
        { id: "C", text: "Знак C" },
        { id: "D", text: "Знак D" },
      ],
      correctAnswer: "A",
    },
    {
      id: 2,
      text: "При каком уровне алкоголя в крови запрещено управлять транспортным средством?",
      options: [
        { id: "A", text: "0.0 промилле" },
        { id: "B", text: "0.3 промилле" },
        { id: "C", text: "0.5 промилле" },
        { id: "D", text: "1.0 промилле" },
      ],
      correctAnswer: "A",
    },
    {
      id: 3,
      text: "В каком случае водитель может продолжить движение при желтом сигнале светофора?",
      options: [
        { id: "A", text: "Если нет других участников движения" },
        {
          id: "B",
          text: "Если он не может остановиться без экстренного торможения",
        },
        { id: "C", text: "Если включен режим 'желтый мигающий'" },
        {
          id: "D",
          text: "Водитель не может продолжать движение при желтом сигнале",
        },
      ],
      correctAnswer: "B",
    },
    {
      id: 4,
      text: "Какое расстояние должно быть между транспортными средствами при движении в плотном потоке?",
      imageSrc: "/images/tests/question4.jpg",
      options: [
        { id: "A", text: "Не менее 1 метра" },
        { id: "B", text: "Не менее 5 метров" },
        { id: "C", text: "Безопасная дистанция, чтобы избежать столкновения" },
        { id: "D", text: "Не менее длины автомобиля" },
      ],
      correctAnswer: "C",
    },
    {
      id: 5,
      text: "При движении на автомагистрали, какая минимальная скорость установлена для легковых автомобилей?",
      options: [
        { id: "A", text: "40 км/ч" },
        { id: "B", text: "50 км/ч" },
        { id: "C", text: "60 км/ч" },
        { id: "D", text: "Минимальная скорость не установлена" },
      ],
      correctAnswer: "B",
    },
  ];

  // Категории тестов
  const categories = ["Все", "ПДД", "Теория", "Практика", "Экзамен"];

  // Сложности тестов
  const difficulties = ["Все", "Легкий", "Средний", "Сложный"];

  // Фильтрация тестов
  const filteredTests = tests.filter((test) => {
    let matchesCategory = true;
    let matchesSearch = true;

    if (selectedCategory && selectedCategory !== "Все") {
      matchesCategory = test.category === selectedCategory;
    }

    if (searchQuery) {
      matchesSearch =
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return matchesCategory && matchesSearch;
  });

  // Обработчик старта теста
  const handleStartTest = (test: Test) => {
    setActiveTest(test);
    setActiveQuestionIndex(0);
    setUserAnswers(
      Array(test.questionsCount)
        .fill(null)
        .map((_, idx) => ({ questionId: idx + 1, selectedOption: null }))
    );
    setTestCompleted(false);
    setTimeLeft(test.timeLimit * 60); // Конвертация в секунды
    setTimerActive(true);
  };

  // Обработчик выбора ответа
  const handleAnswerSelect = (questionId: number, optionId: string) => {
    setUserAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, selectedOption: optionId }
          : answer
      )
    );
  };

  // Обработчик навигации по вопросам
  const handleNavigateQuestion = (direction: "prev" | "next") => {
    if (direction === "prev" && activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    } else if (
      direction === "next" &&
      activeTest &&
      activeQuestionIndex < activeTest.questionsCount - 1
    ) {
      setActiveQuestionIndex((prev) => prev + 1);
    }
  };

  // Обработчик завершения теста
  const handleCompleteTest = () => {
    setTestCompleted(true);
    setTimerActive(false);
  };

  // Получение результата теста
  const getTestResult = () => {
    if (!activeTest) return { score: 0, correctAnswers: 0, totalQuestions: 0 };

    const correctAnswers = userAnswers.filter(
      (answer, idx) =>
        idx < questions.length &&
        answer.selectedOption === questions[idx].correctAnswer
    ).length;

    const score = Math.round(
      (correctAnswers / Math.min(activeTest.questionsCount, questions.length)) *
        100
    );

    return {
      score,
      correctAnswers,
      totalQuestions: Math.min(activeTest.questionsCount, questions.length),
    };
  };

  // Обработчик возврата к списку тестов
  const handleBackToTests = () => {
    setActiveTest(null);
    setTestCompleted(false);
    setTimerActive(false);
  };

  // Эффект для таймера
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      handleCompleteTest();
    }

    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Форматирование времени
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <Layout
      title="Онлайн-тестирование - Автошкола"
      description="Проходите тесты по ПДД и другим темам для подготовки к экзаменам."
    >
      <div className="bg-gray-100 py-10">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Боковая навигация */}
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src="/images/profile/avatar.jpg"
                      alt="Аватар пользователя"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-bold">Александр Иванов</h2>
                  <p className="text-gray-600">Ученик</p>
                </div>

                <nav className="space-y-1">
                  {navTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id !== "tests") {
                          router.push(
                            tab.id === "dashboard"
                              ? "/profile"
                              : `/profile/${tab.id}`
                          );
                        } else {
                          setActiveTab(tab.id);
                        }
                      }}
                      className={`w-full flex items-center p-3 rounded-lg transition ${
                        activeTab === tab.id
                          ? "bg-red-100 text-red-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <button
                      className="w-full flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                      onClick={() => router.push("/login")}
                    >
                      <FaSignOutAlt className="mr-3" />
                      <span>Выйти</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Основной контент */}
            <div className="md:w-3/4">
              {!activeTest ? (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-6">
                    Онлайн-тестирование
                  </h2>

                  {/* Фильтры и поиск */}
                  <div className="flex flex-col md:flex-row justify-between mb-6">
                    <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() =>
                            setSelectedCategory(
                              category === "Все" ? null : category
                            )
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            (category === "Все" && !selectedCategory) ||
                            category === selectedCategory
                              ? "bg-red-600 text-white"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="w-full md:w-auto">
                      <input
                        type="text"
                        placeholder="Поиск теста..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>

                  {/* Список тестов */}
                  {filteredTests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTests.map((test) => (
                        <div
                          key={test.id}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition"
                        >
                          <div className="relative h-40">
                            <Image
                              src={test.imageSrc}
                              alt={test.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-lg mb-1">
                              {test.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {test.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  test.category === "ПДД"
                                    ? "bg-blue-100 text-blue-800"
                                    : test.category === "Теория"
                                    ? "bg-green-100 text-green-800"
                                    : test.category === "Практика"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {test.category}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  test.difficulty === "Легкий"
                                    ? "bg-green-100 text-green-800"
                                    : test.difficulty === "Средний"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {test.difficulty}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                              <span>{test.questionsCount} вопросов</span>
                              <span>{test.timeLimit} минут</span>
                            </div>
                            {test.completed && (
                              <div className="flex items-center mb-3">
                                <FaCheckCircle className="text-green-500 mr-1" />
                                <span className="text-sm">
                                  Пройден: {test.lastScore}% ({test.lastAttempt}
                                  )
                                </span>
                              </div>
                            )}
                            <button
                              onClick={() => handleStartTest(test)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                            >
                              <FaPlay className="mr-2" />
                              {test.completed ? "Пройти снова" : "Начать тест"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        Тесты не найдены. Попробуйте изменить параметры поиска.
                      </p>
                    </div>
                  )}

                  {/* Статистика */}
                  <div className="mt-8 border-t pt-6">
                    <h3 className="font-bold text-lg mb-4">Ваша статистика</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <FaClipboardList className="text-blue-600 mr-2" />
                          <h4 className="font-semibold">Пройдено тестов</h4>
                        </div>
                        <p className="text-2xl font-bold">
                          {tests.filter((t) => t.completed).length}/
                          {tests.length}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <FaMedal className="text-green-600 mr-2" />
                          <h4 className="font-semibold">Средний балл</h4>
                        </div>
                        <p className="text-2xl font-bold">
                          {tests.filter((t) => t.completed).length > 0
                            ? Math.round(
                                tests
                                  .filter((t) => t.completed && t.lastScore)
                                  .reduce(
                                    (acc, t) => acc + (t.lastScore || 0),
                                    0
                                  ) /
                                  tests.filter(
                                    (t) => t.completed && t.lastScore
                                  ).length
                              )
                            : 0}
                          %
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <FaHistory className="text-purple-600 mr-2" />
                          <h4 className="font-semibold">Последний тест</h4>
                        </div>
                        <p className="text-lg font-bold">
                          {tests.filter((t) => t.completed).length > 0
                            ? tests
                                .filter((t) => t.completed)
                                .sort((a, b) => {
                                  if (!a.lastAttempt || !b.lastAttempt)
                                    return 0;
                                  return (
                                    new Date(
                                      b.lastAttempt
                                        .split(".")
                                        .reverse()
                                        .join("-")
                                    ).getTime() -
                                    new Date(
                                      a.lastAttempt
                                        .split(".")
                                        .reverse()
                                        .join("-")
                                    ).getTime()
                                  );
                                })[0].title
                            : "Нет пройденных тестов"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  {testCompleted ? (
                    // Результаты теста
                    <div className="text-center">
                      <h2 className="text-xl font-bold mb-4">
                        Результаты теста
                      </h2>
                      <h3 className="text-lg font-medium mb-6">
                        {activeTest.title}
                      </h3>

                      <div className="mb-8">
                        <div className="inline-flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 border-blue-500 mb-4">
                          <span className="text-3xl font-bold text-blue-600">
                            {getTestResult().score}%
                          </span>
                        </div>
                        <p className="text-gray-600">
                          Правильных ответов: {getTestResult().correctAnswers}{" "}
                          из {getTestResult().totalQuestions}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-lg mb-6">
                        <h4 className="font-semibold mb-4">
                          Подробные результаты
                        </h4>
                        <div className="space-y-4">
                          {questions
                            .slice(
                              0,
                              Math.min(
                                activeTest.questionsCount,
                                questions.length
                              )
                            )
                            .map((question, idx) => {
                              const userAnswer =
                                userAnswers[idx]?.selectedOption;
                              const isCorrect =
                                userAnswer === question.correctAnswer;

                              return (
                                <div
                                  key={question.id}
                                  className="text-left border rounded-lg p-4"
                                >
                                  <div className="flex items-start">
                                    <div
                                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                                        isCorrect
                                          ? "bg-green-100"
                                          : "bg-red-100"
                                      }`}
                                    >
                                      {isCorrect ? (
                                        <FaCheckCircle className="text-green-600" />
                                      ) : (
                                        <FaTimesCircle className="text-red-600" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium mb-2">
                                        {idx + 1}. {question.text}
                                      </p>

                                      {question.options.map((option) => (
                                        <div
                                          key={option.id}
                                          className={`p-2 mb-1 rounded-lg text-sm ${
                                            option.id === question.correctAnswer
                                              ? "bg-green-100 text-green-800"
                                              : option.id === userAnswer &&
                                                option.id !==
                                                  question.correctAnswer
                                              ? "bg-red-100 text-red-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {option.id}: {option.text}
                                        </div>
                                      ))}

                                      {!isCorrect && (
                                        <p className="text-sm text-gray-600 mt-2">
                                          <span className="font-semibold">
                                            Правильный ответ:
                                          </span>{" "}
                                          {question.correctAnswer}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={handleBackToTests}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                          Вернуться к списку
                        </button>
                        <button
                          onClick={() => handleStartTest(activeTest)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                          Пройти еще раз
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Прохождение теста
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <button
                          onClick={handleBackToTests}
                          className="text-gray-600 hover:text-gray-800 flex items-center"
                        >
                          <FaChevronLeft className="mr-1" />
                          Назад к списку
                        </button>
                        <div className="flex items-center">
                          <FaClock className="text-red-600 mr-2" />
                          <span className="font-bold">
                            {formatTime(timeLeft)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h2 className="text-xl font-bold">
                          {activeTest.title}
                        </h2>
                        <p className="text-gray-600">
                          Вопрос {activeQuestionIndex + 1} из{" "}
                          {Math.min(
                            activeTest.questionsCount,
                            questions.length
                          )}
                        </p>
                      </div>

                      {/* Текущий вопрос */}
                      {activeQuestionIndex < questions.length && (
                        <div className="bg-gray-50 p-6 rounded-lg mb-6">
                          <h3 className="font-semibold mb-4">
                            {questions[activeQuestionIndex].text}
                          </h3>

                          {questions[activeQuestionIndex].imageSrc && (
                            <div className="relative h-56 mb-4">
                              <Image
                                src={questions[activeQuestionIndex].imageSrc}
                                alt="Изображение к вопросу"
                                fill
                                className="object-contain rounded-lg"
                              />
                            </div>
                          )}

                          <div className="space-y-3">
                            {questions[activeQuestionIndex].options.map(
                              (option) => (
                                <button
                                  key={option.id}
                                  onClick={() =>
                                    handleAnswerSelect(
                                      activeQuestionIndex + 1,
                                      option.id
                                    )
                                  }
                                  className={`w-full p-3 rounded-lg text-left ${
                                    userAnswers[activeQuestionIndex]
                                      ?.selectedOption === option.id
                                      ? "bg-blue-100 border border-blue-300"
                                      : "bg-white border hover:bg-gray-50"
                                  }`}
                                >
                                  <span className="font-semibold mr-2">
                                    {option.id}.
                                  </span>
                                  {option.text}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Навигация по вопросам */}
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => handleNavigateQuestion("prev")}
                          disabled={activeQuestionIndex === 0}
                          className={`px-4 py-2 rounded-lg flex items-center ${
                            activeQuestionIndex === 0
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                          }`}
                        >
                          <FaChevronLeft className="mr-1" />
                          Предыдущий
                        </button>

                        <div className="flex flex-wrap justify-center">
                          {Array.from({
                            length: Math.min(
                              activeTest.questionsCount,
                              questions.length
                            ),
                          }).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveQuestionIndex(idx)}
                              className={`w-8 h-8 m-1 rounded-full flex items-center justify-center ${
                                idx === activeQuestionIndex
                                  ? "bg-red-600 text-white"
                                  : userAnswers[idx]?.selectedOption
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>

                        {activeQuestionIndex <
                        Math.min(activeTest.questionsCount, questions.length) -
                          1 ? (
                          <button
                            onClick={() => handleNavigateQuestion("next")}
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 flex items-center"
                          >
                            Следующий
                            <FaChevronRight className="ml-1" />
                          </button>
                        ) : (
                          <button
                            onClick={handleCompleteTest}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
                          >
                            Завершить тест
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileTestsPage;
