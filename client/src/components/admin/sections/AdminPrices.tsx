import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCar,
  FaMotorcycle,
  FaTruck,
  FaBus,
  FaTrailer,
  FaPercent,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaSave,
} from "react-icons/fa";
import { AdminAPI } from "../../../services/api";

// Интерфейсы под реальную структуру БД
interface PriceCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

interface PricePlan {
  id: number;
  category_id: number;
  title: string;
  price: number;
  old_price?: number;
  duration: string;
  lessons_count: number;
  description?: string;
  features?: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

interface AdditionalService {
  id: number;
  title: string;
  price: number;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

interface Discount {
  id: number;
  title: string;
  discount_value: string;
  description?: string;
  conditions?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  sort_order: number;
}

const AdminPrices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "categories" | "plans" | "services" | "discounts"
  >("categories");

  // Состояния для данных
  const [categories, setCategories] = useState<PriceCategory[]>([]);
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  // Общие состояния
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Загрузка данных цен...");

      // Проверяем, есть ли методы в API
      if (!AdminAPI.getPriceCategories) {
        setError("API методы для управления ценами не реализованы");
        return;
      }

      const [categoriesRes, plansRes, servicesRes, discountsRes] =
        await Promise.all([
          AdminAPI.getPriceCategories(),
          AdminAPI.getPricePlans(),
          AdminAPI.getAdditionalServices(),
          AdminAPI.getPriceDiscounts(),
        ]);

      console.log("Результаты загрузки:", {
        categoriesRes,
        plansRes,
        servicesRes,
        discountsRes,
      });

      if (categoriesRes.success) {
        setCategories(
          Array.isArray(categoriesRes.data) ? categoriesRes.data : []
        );
      }

      if (plansRes.success) {
        setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      }

      if (servicesRes.success) {
        setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
      }

      if (discountsRes.success) {
        setDiscounts(Array.isArray(discountsRes.data) ? discountsRes.data : []);
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      setError((error as Error).message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      FaCar: <FaCar />,
      FaMotorcycle: <FaMotorcycle />,
      FaTruck: <FaTruck />,
      FaBus: <FaBus />,
      FaTrailer: <FaTrailer />,
    };
    return icons[iconName] || <FaCar />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Управление ценами</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" />
          Добавить
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Табы */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "categories", label: "Категории", icon: <FaCar /> },
            { id: "plans", label: "Тарифные планы", icon: <FaTrailer /> },
            { id: "services", label: "Доп. услуги", icon: <FaPlus /> },
            { id: "discounts", label: "Скидки", icon: <FaPercent /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Поиск */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Контент */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Данные загружены</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-bold text-blue-600">{categories.length}</div>
              <div className="text-gray-600">Категории</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-bold text-green-600">{plans.length}</div>
              <div className="text-gray-600">Тарифы</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="font-bold text-purple-600">{services.length}</div>
              <div className="text-gray-600">Услуги</div>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <div className="font-bold text-red-600">{discounts.length}</div>
              <div className="text-gray-600">Скидки</div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-bold mb-4">
              {editingItem ? "Редактировать" : "Добавить"} элемент
            </h3>
            <p className="text-gray-600 mb-4">
              Полная функциональность будет реализована после настройки сервера
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded mr-2"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrices;
