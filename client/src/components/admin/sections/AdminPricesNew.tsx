import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCar, FaMotorcycle, FaTruck, FaBus, FaTrailer, FaPercent, FaToggleOn, FaToggleOff, FaTimes, FaSave } from "react-icons/fa";
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
  const [activeTab, setActiveTab] = useState<"categories" | "plans" | "services" | "discounts">("categories");

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

      const [categoriesRes, plansRes, servicesRes, discountsRes] = await Promise.all([AdminAPI.getPriceCategories(), AdminAPI.getPricePlans(), AdminAPI.getAdditionalServices(), AdminAPI.getPriceDiscounts()]);

      console.log("Результаты загрузки:", {
        categoriesRes,
        plansRes,
        servicesRes,
        discountsRes,
      });

      if (categoriesRes.success) {
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
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

  // CRUD операции для категорий
  const handleAddCategory = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  // Универсальная функция добавления в зависимости от активной вкладки
  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case "categories":
        return "Добавить категорию";
      case "plans":
        return "Добавить план";
      case "services":
        return "Добавить услугу";
      case "discounts":
        return "Добавить скидку";
      default:
        return "Добавить";
    }
  };

  const handleEditCategory = (category: PriceCategory) => {
    setEditingItem(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту категорию?")) return;

    try {
      const result = await AdminAPI.deletePriceCategory(Number(id));
      if (result.success) {
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        setError(result.message || "Ошибка удаления");
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleSaveCategory = async (data: any) => {
    try {
      if (editingItem) {
        const result = await AdminAPI.updatePriceCategory(Number(editingItem.id), data);
        if (result.success) {
          setCategories(categories.map((c) => (c.id === editingItem.id ? { ...c, ...data } : c)));
        }
      } else {
        const result = await AdminAPI.createPriceCategory(data);
        if (result.success && result.data) {
          const newCategory = typeof result.data === "object" && "category" in result.data ? result.data.category : result.data;
          setCategories([...categories, newCategory]);
        }
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleSavePlan = async (data: any) => {
    try {
      if (editingItem) {
        const result = await AdminAPI.updatePricePlan(editingItem.id, data);
        if (result.success) {
          setPlans(plans.map((p) => (p.id === editingItem.id ? { ...p, ...data } : p)));
        }
      } else {
        const result = await AdminAPI.createPricePlan(data);
        if (result.success && result.data) {
          const newPlan = typeof result.data === "object" && "plan" in result.data ? result.data.plan : result.data;
          setPlans([...plans, newPlan]);
        }
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleSaveService = async (data: any) => {
    try {
      if (editingItem) {
        const result = await AdminAPI.updateAdditionalService(editingItem.id, data);
        if (result.success) {
          setServices(services.map((s) => (s.id === editingItem.id ? { ...s, ...data } : s)));
        }
      } else {
        const result = await AdminAPI.createAdditionalService(data);
        if (result.success && result.data) {
          const newService = typeof result.data === "object" && "service" in result.data ? result.data.service : result.data;
          setServices([...services, newService]);
        }
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleSaveDiscount = async (data: any) => {
    try {
      if (editingItem) {
        const result = await AdminAPI.updatePriceDiscount(editingItem.id, data);
        if (result.success) {
          setDiscounts(discounts.map((d) => (d.id === editingItem.id ? { ...d, ...data } : d)));
        }
      } else {
        const result = await AdminAPI.createPriceDiscount(data);
        if (result.success && result.data) {
          const newDiscount = typeof result.data === "object" && "discount" in result.data ? result.data.discount : result.data;
          setDiscounts([...discounts, newDiscount]);
        }
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleEditPlan = (plan: PricePlan) => {
    setEditingItem(plan);
    setShowModal(true);
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот план?")) return;

    try {
      const result = await AdminAPI.deletePricePlan(id);
      if (result.success) {
        setPlans(plans.filter((p) => p.id !== id));
      } else {
        setError(result.message || "Ошибка удаления");
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // Обработчики для дополнительных услуг
  const handleEditService = (service: AdditionalService) => {
    setEditingItem(service);
    setShowModal(true);
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту услугу?")) return;

    try {
      const result = await AdminAPI.deleteAdditionalService(id);
      if (result.success) {
        setServices(services.filter((s) => s.id !== id));
      } else {
        setError(result.message || "Ошибка удаления");
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // Обработчики для скидок
  const handleEditDiscount = (discount: Discount) => {
    setEditingItem(discount);
    setShowModal(true);
  };

  const handleDeleteDiscount = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту скидку?")) return;

    try {
      const result = await AdminAPI.deletePriceDiscount(id);
      if (result.success) {
        setDiscounts(discounts.filter((d) => d.id !== id));
      } else {
        setError(result.message || "Ошибка удаления");
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  // Рендер таблиц
  const renderCategoriesTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Иконка</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Активность</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Порядок</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="flex items-center">
                  {getIconComponent(category.icon)}
                  <span className="ml-2">{category.icon}</span>
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{category.is_active ? "Активная" : "Неактивная"}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.sort_order}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onClick={() => handleEditCategory(category)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                  <FaEdit />
                </button>
                <button onClick={() => handleDeleteCategory(category.id)} className="text-red-600 hover:text-red-900">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPlansTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Старая цена</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Длительность</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Занятия</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Популярный</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Активность</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {plans.map((plan) => (
            <tr key={plan.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{plan.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.price.toLocaleString("ru-RU")} ₸</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.old_price ? `${plan.old_price.toLocaleString("ru-RU")} ₸` : "-"}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.duration}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.lessons_count}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${plan.is_popular ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>{plan.is_popular ? "Популярный" : "Обычный"}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${plan.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{plan.is_active ? "Активный" : "Неактивный"}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onClick={() => handleEditPlan(plan)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                  <FaEdit />
                </button>
                <button onClick={() => handleDeletePlan(plan.id)} className="text-red-600 hover:text-red-900">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderServicesTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Активность</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {services.map((service) => (
            <tr key={service.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{service.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.price.toLocaleString("ru-RU")} ₸</td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{service.description || "-"}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${service.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{service.is_active ? "Активная" : "Неактивная"}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-indigo-600 hover:text-indigo-900 mr-3" onClick={() => handleEditService(service)}>
                  <FaEdit />
                </button>
                <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteService(service.id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDiscountsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Размер скидки</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Условия</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Активность</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {discounts.map((discount) => (
            <tr key={discount.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{discount.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{discount.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{discount.discount_value}</td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{discount.description || "-"}</td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{discount.conditions || "-"}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${discount.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{discount.is_active ? "Активная" : "Неактивная"}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-indigo-600 hover:text-indigo-900 mr-3" onClick={() => handleEditDiscount(discount)}>
                  <FaEdit />
                </button>
                <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteDiscount(discount.id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
        <button onClick={handleAdd} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center">
          <FaPlus className="mr-2" />
          {getAddButtonText()}
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Табы */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            {
              id: "categories",
              label: "Категории",
              icon: <FaCar />,
              count: categories.length,
            },
            {
              id: "plans",
              label: "Тарифные планы",
              icon: <FaTrailer />,
              count: plans.length,
            },
            {
              id: "services",
              label: "Доп. услуги",
              icon: <FaPlus />,
              count: services.length,
            },
            {
              id: "discounts",
              label: "Скидки",
              icon: <FaPercent />,
              count: discounts.length,
            },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              <span className="ml-2 bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs">{tab.count}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Поиск */}
      <div className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Поиск..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-red-500 focus:border-red-500" />
        </div>
      </div>

      {/* Контент */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === "categories" && renderCategoriesTable()}
        {activeTab === "plans" && renderPlansTable()}
        {activeTab === "services" && renderServicesTable()}
        {activeTab === "discounts" && renderDiscountsTable()}
      </div>

      {/* Модальное окно для категорий */}
      {showModal && activeTab === "categories" && (
        <CategoryModal
          editingItem={editingItem}
          onSave={handleSaveCategory}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Модальное окно для планов */}
      {showModal && activeTab === "plans" && (
        <PlanModal
          editingItem={editingItem}
          categories={categories}
          onSave={handleSavePlan}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Модальное окно для дополнительных услуг */}
      {showModal && activeTab === "services" && (
        <ServiceModal
          editingItem={editingItem}
          onSave={handleSaveService}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Модальное окно для скидок */}
      {showModal && activeTab === "discounts" && (
        <DiscountModal
          editingItem={editingItem}
          onSave={handleSaveDiscount}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

// Компонент модального окна для категорий
const CategoryModal: React.FC<{
  editingItem: PriceCategory | null;
  onSave: (data: any) => void;
  onClose: () => void;
}> = ({ editingItem, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    id: editingItem?.id || "",
    name: editingItem?.name || "",
    icon: editingItem?.icon || "FaCar",
    description: editingItem?.description || "",
    sort_order: editingItem?.sort_order || 0,
    is_active: editingItem?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{editingItem ? "Редактировать категорию" : "Добавить категорию"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID категории</label>
            <input type="text" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required disabled={!!editingItem} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Иконка</label>
            <select value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500">
              <option value="FaCar">🚗 Легковой автомобиль</option>
              <option value="FaMotorcycle">🏍️ Мотоцикл</option>
              <option value="FaTruck">🚚 Грузовой автомобиль</option>
              <option value="FaBus">🚌 Автобус</option>
              <option value="FaTrailer">🚛 Прицеп</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Порядок сортировки</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sort_order: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Активная категория
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded">
              Отмена
            </button>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center">
              <FaSave className="mr-2" />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Компонент модального окна для планов
const PlanModal: React.FC<{
  editingItem: PricePlan | null;
  categories: PriceCategory[];
  onSave: (data: any) => void;
  onClose: () => void;
}> = ({ editingItem, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    category_id: editingItem?.category_id || (categories.length > 0 ? categories[0].id : 1),
    title: editingItem?.title || "",
    price: editingItem?.price || 0,
    old_price: editingItem?.old_price || "",
    duration: editingItem?.duration || "",
    lessons_count: editingItem?.lessons_count || 0,
    description: editingItem?.description || "",
    features: editingItem?.features || "",
    is_popular: editingItem?.is_popular ?? false,
    is_active: editingItem?.is_active ?? true,
    sort_order: editingItem?.sort_order || 0,
  });

  // Обновляем category_id если категории изменились и текущий ID недоступен
  useEffect(() => {
    if (categories.length > 0 && !categories.find((cat) => cat.id === formData.category_id)) {
      setFormData((prev) => ({
        ...prev,
        category_id: categories[0].id,
      }));
    }
  }, [categories, formData.category_id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{editingItem ? "Редактировать план" : "Добавить план"}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название плана</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₸)</label>
              <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Старая цена (₸)</label>
              <input type="number" value={formData.old_price} onChange={(e) => setFormData({ ...formData, old_price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Длительность</label>
              <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="3 месяца" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Количество занятий</label>
              <input
                type="number"
                value={formData.lessons_count}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lessons_count: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Особенности (каждая с новой строки)</label>
            <textarea
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              rows={6}
              placeholder="Теоретический курс - 134 часа&#10;Практические занятия - 68 часов&#10;Индивидуальный график занятий"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Порядок сортировки</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sort_order: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input type="checkbox" id="is_popular" checked={formData.is_popular} onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
              <label htmlFor="is_popular" className="ml-2 block text-sm text-gray-900">
                Популярный план
              </label>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="is_active_plan" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
              <label htmlFor="is_active_plan" className="ml-2 block text-sm text-gray-900">
                Активный план
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded">
              Отмена
            </button>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center">
              <FaSave className="mr-2" />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Модальное окно для дополнительных услуг
const ServiceModal: React.FC<{
  editingItem: any;
  onSave: (data: any) => void;
  onClose: () => void;
}> = ({ editingItem, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: editingItem?.title || "",
    price: editingItem?.price || "",
    description: editingItem?.description || "",
    is_active: editingItem?.is_active !== undefined ? editingItem.is_active : true,
    sort_order: editingItem?.sort_order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price.toString()),
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">{editingItem ? "Редактировать услугу" : "Добавить услугу"}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название услуги</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Цена (₸)</label>
            <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" />
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="mr-2" />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Активная услуга
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Порядок сортировки</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sort_order: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded">
              Отмена
            </button>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center">
              <FaSave className="mr-2" />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Модальное окно для скидок
const DiscountModal: React.FC<{
  editingItem: any;
  onSave: (data: any) => void;
  onClose: () => void;
}> = ({ editingItem, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: editingItem?.title || "",
    discount_value: editingItem?.discount_value || "",
    description: editingItem?.description || "",
    conditions: editingItem?.conditions || "",
    is_active: editingItem?.is_active !== undefined ? editingItem.is_active : true,
    start_date: editingItem?.start_date ? editingItem.start_date.split("T")[0] : "",
    end_date: editingItem?.end_date ? editingItem.end_date.split("T")[0] : "",
    sort_order: editingItem?.sort_order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      discount_value: parseFloat(formData.discount_value.toString()),
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">{editingItem ? "Редактировать скидку" : "Добавить скидку"}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название скидки</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Размер скидки (%)</label>
            <input type="number" step="0.01" min="0" max="100" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Условия получения</label>
            <textarea value={formData.conditions} onChange={(e) => setFormData({ ...formData, conditions: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата начала</label>
              <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата окончания</label>
              <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500" />
            </div>
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="discount_is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="mr-2" />
            <label htmlFor="discount_is_active" className="text-sm font-medium text-gray-700">
              Активная скидка
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Порядок сортировки</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sort_order: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded">
              Отмена
            </button>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center">
              <FaSave className="mr-2" />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPrices;
