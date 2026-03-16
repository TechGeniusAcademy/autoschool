import React from "react";
import { useRouter } from "next/router";
import { FaHome, FaUsers, FaCalendarAlt, FaCar, FaUserTie, FaDollarSign, FaChartBar, FaCog, FaSignOutAlt, FaGraduationCap, FaStar, FaBlog, FaEnvelope } from "react-icons/fa";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeSection, onSectionChange }) => {
  const router = useRouter();

  const menuItems = [
    {
      category: "Главная",
      items: [{ icon: <FaHome />, label: "Панель управления", section: "dashboard" }],
    },
    {
      category: "Пользователи",
      items: [
        { icon: <FaUsers />, label: "Студенты", section: "students" },
        {
          icon: <FaUserTie />,
          label: "Инструкторы",
          section: "instructors",
        },
      ],
    },
    {
      category: "Обучение",
      items: [
        { icon: <FaGraduationCap />, label: "Курсы", section: "courses" },
        {
          icon: <FaCalendarAlt />,
          label: "Расписание",
          section: "schedules",
        },
        { icon: <FaCar />, label: "Группы", section: "groups" },
      ],
    },
    {
      category: "Финансы",
      items: [
        {
          icon: <FaDollarSign />,
          label: "Управление ценами",
          section: "prices",
        },
      ],
    },
    {
      category: "Система",
      items: [
        { icon: <FaBlog />, label: "Блог", section: "blog" },
        { icon: <FaEnvelope />, label: "Обратная связь", section: "contacts" },
        { icon: <FaStar />, label: "Отзывы", section: "reviews" },
        { icon: <FaChartBar />, label: "Отчеты", section: "reports" },
        { icon: <FaCog />, label: "Настройки", section: "settings" },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      {/* Overlay для мобильных устройств */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* Сайдбар */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:shadow-none`}>
        {/* Заголовок */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Админ панель</h2>
            <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
        </div>

        {/* Навигация */}
        <nav className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {menuItems.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{category.category}</h3>
                <div className="space-y-1">
                  {category.items.map((item, itemIndex) => {
                    const isActive = activeSection === item.section;
                    return (
                      <button
                        key={itemIndex}
                        onClick={() => {
                          onSectionChange(item.section);
                          onClose(); // Закрыть sidebar на мобильных устройствах
                        }}
                        className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium ${isActive ? "bg-red-100 text-red-700" : "text-gray-700 bg-gray-50"}`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Кнопка выхода */}
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg bg-gray-50">
            <FaSignOutAlt className="mr-3" />
            Выйти
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
