import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserTie,
  FaGraduationCap,
  FaCalendarAlt,
  FaChartLine,
  FaDollarSign,
  FaClock,
  FaStar,
} from "react-icons/fa";
import { AdminAPI } from "../../../services/api";

interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalSchedules: number;
  monthlyRevenue: number;
  activeSchedules: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalSchedules: 0,
    monthlyRevenue: 0,
    activeSchedules: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем данные параллельно
      const [usersRes, coursesRes] = await Promise.all([
        AdminAPI.getAllUsers(),
        AdminAPI.getAllCourses(),
      ]);

      let totalStudents = 0;
      let totalInstructors = 0;

      if (usersRes.success && usersRes.data) {
        const users = usersRes.data.users || [];
        totalStudents = users.filter(
          (user: any) => user.role === "student"
        ).length;
        totalInstructors = users.filter(
          (user: any) => user.role === "instructor"
        ).length;
      }

      let totalCourses = 0;
      if (coursesRes.success && coursesRes.data) {
        totalCourses = coursesRes.data.courses?.length || 0;
      }

      setStats({
        totalStudents,
        totalInstructors,
        totalCourses,
        totalSchedules: 0, // Пока заглушка до добавления API
        monthlyRevenue: 0, // Пока заглушка
        activeSchedules: 0, // Пока заглушка
      });
    } catch (error) {
      console.error("Ошибка загрузки данных дашборда:", error);
      setError((error as Error).message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: "Студенты",
      value: stats.totalStudents,
      icon: <FaUsers className="text-blue-600" />,
      color: "bg-blue-50 border-blue-200",
      change: "+12% за месяц",
      changeColor: "text-green-600",
    },
    {
      title: "Инструкторы",
      value: stats.totalInstructors,
      icon: <FaUserTie className="text-green-600" />,
      color: "bg-green-50 border-green-200",
      change: "+3% за месяц",
      changeColor: "text-green-600",
    },
    {
      title: "Курсы",
      value: stats.totalCourses,
      icon: <FaGraduationCap className="text-purple-600" />,
      color: "bg-purple-50 border-purple-200",
      change: "+5% за месяц",
      changeColor: "text-green-600",
    },
    {
      title: "Активные занятия",
      value: stats.activeSchedules,
      icon: <FaCalendarAlt className="text-orange-600" />,
      color: "bg-orange-50 border-orange-200",
      change: `из ${stats.totalSchedules} общих`,
      changeColor: "text-gray-600",
    },
  ];

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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Панель управления
          </h2>
          <p className="text-gray-600">
            Добро пожаловать в административную панель
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Последнее обновление: {new Date().toLocaleString("ru-RU")}
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
                <button
                  onClick={() => setError(null)}
                  className="text-sm font-medium text-red-800 hover:text-red-600"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className={`p-6 rounded-lg border-2 ${card.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className={`text-sm ${card.changeColor}`}>{card.change}</p>
              </div>
              <div className="text-3xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Быстрые действия
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg">
              <div className="flex items-center">
                <FaUsers className="text-blue-600 mr-3" />
                <span className="text-gray-900">Добавить студента</span>
              </div>
              <span className="text-blue-600">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg">
              <div className="flex items-center">
                <FaUserTie className="text-green-600 mr-3" />
                <span className="text-gray-900">Добавить инструктора</span>
              </div>
              <span className="text-green-600">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg">
              <div className="flex items-center">
                <FaGraduationCap className="text-purple-600 mr-3" />
                <span className="text-gray-900">Создать курс</span>
              </div>
              <span className="text-purple-600">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg">
              <div className="flex items-center">
                <FaCalendarAlt className="text-orange-600 mr-3" />
                <span className="text-gray-900">Добавить занятие</span>
              </div>
              <span className="text-orange-600">→</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Последняя активность
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-900">
                  Новый студент зарегистрировался
                </span>
              </div>
              <span className="text-xs text-gray-500">2 мин назад</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-900">
                  Занятие завершено успешно
                </span>
              </div>
              <span className="text-xs text-gray-500">15 мин назад</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-900">
                  Новый отзыв получен
                </span>
              </div>
              <span className="text-xs text-gray-500">1 час назад</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-900">Курс обновлен</span>
              </div>
              <span className="text-xs text-gray-500">3 часа назад</span>
            </div>
          </div>
        </div>
      </div>

      {/* Системная информация */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Системная информация
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <FaChartLine className="text-3xl text-blue-600 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-gray-900">
              Производительность
            </h4>
            <p className="text-2xl font-bold text-green-600">98%</p>
            <p className="text-xs text-gray-500">Системы работают нормально</p>
          </div>
          <div className="text-center">
            <FaClock className="text-3xl text-green-600 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-gray-900">Время отклика</h4>
            <p className="text-2xl font-bold text-green-600">124ms</p>
            <p className="text-xs text-gray-500">Среднее время ответа</p>
          </div>
          <div className="text-center">
            <FaStar className="text-3xl text-yellow-600 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-gray-900">Рейтинг</h4>
            <p className="text-2xl font-bold text-yellow-600">4.8</p>
            <p className="text-xs text-gray-500">Средняя оценка школы</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
