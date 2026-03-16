import React, { useState, useEffect } from "react";
import {
  FaChartBar,
  FaUsers,
  FaUserTie,
  FaDollarSign,
  FaGraduationCap,
  FaDownload,
  FaCalendarAlt,
  FaStar,
  FaEye,
} from "react-icons/fa";
import { AdminAPI } from "../../../services/api";

interface GeneralStats {
  total_students: number;
  total_instructors: number;
  total_groups: number;
  total_courses: number;
  total_schedules: number;
  total_individual_lessons: number;
  total_reviews: number;
  average_rating: number | string;
}

interface StudentStats {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  group_name: string;
  course_title: string;
  individual_lessons_count: number;
  average_rating: number | string;
}

interface InstructorStats {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  groups_count: number;
  individual_lessons_count: number;
  average_rating: number | string;
  reviews_count: number;
}

interface CourseStats {
  id: number;
  title: string;
  description: string;
  created_at: string;
  groups_count: number;
  students_count: number;
  average_rating: number | string;
  reviews_count: number;
}

interface FinancialStats {
  price_stats: Array<{
    category_name: string;
    plan_name: string;
    price: number;
    students_count: number;
    total_revenue: number;
  }>;
  total_revenue: {
    total_revenue: number;
    active_plans: number;
    average_price: number;
  };
}

const AdminReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "general" | "students" | "instructors" | "courses" | "financial"
  >("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [studentsStats, setStudentsStats] = useState<StudentStats[]>([]);
  const [instructorsStats, setInstructorsStats] = useState<InstructorStats[]>(
    []
  );
  const [coursesStats, setCoursesStats] = useState<CourseStats[]>([]);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(
    null
  );

  useEffect(() => {
    loadGeneralStats();
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case "general":
        loadGeneralStats();
        break;
      case "students":
        loadStudentsStats();
        break;
      case "instructors":
        loadInstructorsStats();
        break;
      case "courses":
        loadCoursesStats();
        break;
      case "financial":
        loadFinancialStats();
        break;
    }
  }, [activeTab]);

  const loadGeneralStats = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getReports("general");
      if (response.success) {
        setGeneralStats(response.data);
      } else {
        setError("Ошибка при загрузке общей статистики");
      }
    } catch (error) {
      console.error("Error loading general stats:", error);
      setError("Ошибка при загрузке общей статистики");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsStats = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getReports("students");
      if (response.success) {
        setStudentsStats(response.data);
      } else {
        setError("Ошибка при загрузке статистики студентов");
      }
    } catch (error) {
      console.error("Error loading students stats:", error);
      setError("Ошибка при загрузке статистики студентов");
    } finally {
      setLoading(false);
    }
  };

  const loadInstructorsStats = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getReports("instructors");
      if (response.success) {
        setInstructorsStats(response.data);
      } else {
        setError("Ошибка при загрузке статистики инструкторов");
      }
    } catch (error) {
      console.error("Error loading instructors stats:", error);
      setError("Ошибка при загрузке статистики инструкторов");
    } finally {
      setLoading(false);
    }
  };

  const loadCoursesStats = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getReports("courses");
      if (response.success) {
        setCoursesStats(response.data);
      } else {
        setError("Ошибка при загрузке статистики курсов");
      }
    } catch (error) {
      console.error("Error loading courses stats:", error);
      setError("Ошибка при загрузке статистики курсов");
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialStats = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getReports("financial");
      if (response.success) {
        setFinancialStats(response.data);
      } else {
        setError("Ошибка при загрузке финансовой статистики");
      }
    } catch (error) {
      console.error("Error loading financial stats:", error);
      setError("Ошибка при загрузке финансовой статистики");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type: string) => {
    try {
      const response = await AdminAPI.exportReport(type);

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const date = new Date().toISOString().split("T")[0];
      const fileName = `${type}_report_${date}.csv`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      setError("Ошибка при скачивании отчета");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "KZT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaChartBar className="mr-3 text-blue-600" />
          Отчеты и Аналитика
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "general", label: "Общая статистика", icon: <FaChartBar /> },
            { key: "students", label: "Студенты", icon: <FaUsers /> },
            { key: "instructors", label: "Инструкторы", icon: <FaUserTie /> },
            { key: "courses", label: "Курсы", icon: <FaGraduationCap /> },
            // { key: "financial", label: "Финансы", icon: <FaDollarSign /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === "general" && generalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <FaUsers className="text-blue-600 text-2xl mr-4" />
              <div>
                <p className="text-blue-600 text-sm font-medium">Студенты</p>
                <p className="text-2xl font-bold text-blue-900">
                  {generalStats.total_students}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <FaUserTie className="text-green-600 text-2xl mr-4" />
              <div>
                <p className="text-green-600 text-sm font-medium">
                  Инструкторы
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {generalStats.total_instructors}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center">
              <FaGraduationCap className="text-purple-600 text-2xl mr-4" />
              <div>
                <p className="text-purple-600 text-sm font-medium">Курсы</p>
                <p className="text-2xl font-bold text-purple-900">
                  {generalStats.total_courses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center">
              <FaUsers className="text-orange-600 text-2xl mr-4" />
              <div>
                <p className="text-orange-600 text-sm font-medium">Группы</p>
                <p className="text-2xl font-bold text-orange-900">
                  {generalStats.total_groups}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <FaCalendarAlt className="text-red-600 text-2xl mr-4" />
              <div>
                <p className="text-red-600 text-sm font-medium">
                  Групповые занятия
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {generalStats.total_schedules}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <FaUserTie className="text-yellow-600 text-2xl mr-4" />
              <div>
                <p className="text-yellow-600 text-sm font-medium">
                  Индивидуальные занятия
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {generalStats.total_individual_lessons}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
            <div className="flex items-center">
              <FaStar className="text-pink-600 text-2xl mr-4" />
              <div>
                <p className="text-pink-600 text-sm font-medium">Отзывы</p>
                <p className="text-2xl font-bold text-pink-900">
                  {generalStats.total_reviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <div className="flex items-center">
              <FaStar className="text-indigo-600 text-2xl mr-4" />
              <div>
                <p className="text-indigo-600 text-sm font-medium">
                  Средний рейтинг
                </p>
                <p className="text-2xl font-bold text-indigo-900">
                  {generalStats.average_rating
                    ? Number(generalStats.average_rating).toFixed(1)
                    : "0.0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Статистика по студентам</h2>
            <button
              onClick={() => downloadReport("students")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <FaDownload className="mr-2" />
              Скачать отчет
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ФИО
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Группа
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Курс
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Инд. занятия
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата регистрации
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentsStats.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.group_name || "Не назначена"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.course_title || "Не назначен"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.individual_lessons_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(student.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "instructors" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Статистика по инструкторам
            </h2>
            <button
              onClick={() => downloadReport("instructors")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <FaDownload className="mr-2" />
              Скачать отчет
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ФИО
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Группы
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Инд. занятия
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Рейтинг
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Отзывы
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {instructorsStats.map((instructor) => (
                    <tr key={instructor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {instructor.first_name} {instructor.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {instructor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {instructor.groups_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {instructor.individual_lessons_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {instructor.average_rating
                          ? Number(instructor.average_rating).toFixed(1)
                          : "0.0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {instructor.reviews_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Статистика по курсам</h2>
            <button
              onClick={() => downloadReport("courses")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <FaDownload className="mr-2" />
              Скачать отчет
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Название
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Группы
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Студенты
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Рейтинг
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Отзывы
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coursesStats.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.groups_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.students_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.average_rating
                          ? Number(course.average_rating).toFixed(1)
                          : "0.0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.reviews_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "financial" && financialStats && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Финансовая статистика</h2>

          {/* Общая финансовая статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <FaDollarSign className="text-green-600 text-2xl mr-4" />
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Общий доход
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(
                      financialStats.total_revenue.total_revenue || 0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <FaChartBar className="text-blue-600 text-2xl mr-4" />
                <div>
                  <p className="text-blue-600 text-sm font-medium">
                    Активные планы
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {financialStats.total_revenue.active_plans}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center">
                <FaDollarSign className="text-purple-600 text-2xl mr-4" />
                <div>
                  <p className="text-purple-600 text-sm font-medium">
                    Средняя цена
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(
                      financialStats.total_revenue.average_price || 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Детальная статистика по планам */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Доходы по тарифным планам
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Категория
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      План
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Цена
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Студенты
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Общий доход
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {financialStats.price_stats.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.category_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.plan_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.students_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        {formatCurrency(item.total_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
