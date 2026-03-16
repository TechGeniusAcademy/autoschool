import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import Image from "next/image";
import { AdminAPI } from "../../services/api";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaCar, FaMotorcycle, FaTruck, FaBus, FaTrailer, FaCheck, FaTimes, FaInfoCircle, FaPercent, FaWhatsapp, FaPhone, FaEnvelope } from "react-icons/fa";

// Модальное окно для WhatsApp
const WhatsAppModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  whatsappNumber: string;
}> = ({ isOpen, onClose, serviceName, whatsappNumber }) => {
  if (!isOpen) return null;

  const redirectToWhatsApp = () => {
    const message = encodeURIComponent(`Здравствуйте! Меня интересует "${serviceName}". Хотел бы получить более подробную информацию и записаться.`);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${message}`;
    window.open(whatsappUrl, "_blank");
    onClose();
  };

  const callPhone = () => {
    window.open(`tel:${whatsappNumber}`, "_self");
  };

  const sendEmail = () => {
    const subject = encodeURIComponent(`Запись на ${serviceName}`);
    const body = encodeURIComponent(`Здравствуйте!\n\nМеня интересует "${serviceName}".\nХотел бы получить более подробную информацию и записаться.\n\nС уважением`);
    window.open(`mailto:tld-autoschool@mail.ru?subject=${subject}&body=${body}`, "_self");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors">
            <FaTimes className="text-xl" />
          </button>
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <FaWhatsapp className="text-3xl text-white" />
            </div>
            <h3 className="text-xl font-bold">Связаться с нами</h3>
            <p className="text-green-100 mt-1">Выберите удобный способ</p>
          </div>
        </div>

        {/* Контент */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">Вы выбрали:</p>
            <p className="font-semibold text-lg text-gray-800 mt-1">{serviceName}</p>
          </div>

          {/* Кнопки связи */}
          <div className="space-y-3">
            {/* WhatsApp */}
            <button onClick={redirectToWhatsApp} className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaWhatsapp className="text-xl mr-3" />
              Написать в WhatsApp
            </button>

            {/* Телефон */}
            <button onClick={callPhone} className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaPhone className="text-lg mr-3" />
              Позвонить
            </button>

            {/* Email */}
            <button onClick={sendEmail} className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaEnvelope className="text-lg mr-3" />
              Написать Email
            </button>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 text-center">Наши специалисты свяжутся с вами в течение 15 минут и ответят на все вопросы</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Типы для тарифных планов
interface PriceItem {
  id: string | number;
  title: string;
  icon: React.ReactNode;
  price: number;
  oldPrice?: number;
  duration: string;
  lessons: number;
  features: string[];
  popular?: boolean;
  description: string;
  category: string | number;
}

// Компонент для отображения тарифных планов
const PriceCard: React.FC<{
  price: PriceItem;
  bordered?: boolean;
  t: (key: string) => string;
  onEnrollClick?: (serviceName: string) => void;
}> = ({ price, bordered = false, t, onEnrollClick }) => {
  return (
    <div
      className={`bg-white rounded-lg overflow-hidden relative 
      ${bordered ? "ring-2 ring-red-500 shadow-lg" : "shadow-md"}`}
    >
      {price.popular && <div className="absolute top-0 right-0 bg-red-600 text-white py-1 px-4 text-sm font-bold">{t("popular")}</div>}

      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="mr-3 text-red-600 text-4xl">{price.icon}</div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{price.title}</h3>
            <p className="text-gray-600">{price.description}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-red-600">{price.price.toLocaleString("ru-RU")} ₸</span>
            {price.oldPrice && price.oldPrice > 0 && <span className="ml-2 text-lg text-gray-500 line-through">{price.oldPrice.toLocaleString("ru-RU")} ₸</span>}
          </div>
          <div className="flex items-center text-gray-600 mt-2">
            <span className="mr-4">📅 {price.duration}</span>
            <span>🎓 {price.lessons} занятий</span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">{t("whats_included")}</h4>
          <ul className="space-y-2">
            {price.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={() => onEnrollClick?.(price.title)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
          Записаться на курс
        </button>
      </div>
    </div>
  );
};

// Компонент для отображения дополнительных услуг
const ServiceCard: React.FC<{
  service: { title: string; price: number; description: string };
  onOrderClick?: (serviceName: string) => void;
}> = ({ service, onOrderClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
        <span className="text-xl font-bold text-red-600">{service.price.toLocaleString("ru-RU")} ₸</span>
      </div>
      <p className="text-gray-600 mb-4">{service.description}</p>
      <button onClick={() => onOrderClick?.(service.title)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300">
        Заказать
      </button>
    </div>
  );
};

// Компонент для отображения скидок
const DiscountCard: React.FC<{
  discount: {
    title: string;
    discount_value: string;
    description: string;
    conditions?: string;
  };
}> = ({ discount }) => {
  return (
    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
      <div className="flex items-center mb-3">
        <FaPercent className="text-red-600 mr-3" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">{discount.title}</h3>
          <span className="text-2xl font-bold text-red-600">{discount.discount_value}</span>
        </div>
      </div>
      <p className="text-gray-700 mb-3">{discount.description}</p>
      {discount.conditions && (
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
          <p className="text-sm text-gray-600">{discount.conditions}</p>
        </div>
      )}
    </div>
  );
};

import { FaClock, FaBook } from "react-icons/fa";

const PricesPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("1");

  // Состояния для данных из API
  const [categories, setCategories] = useState<any[]>([]);
  const [priceItems, setPriceItems] = useState<any[]>([]);
  const [additionalServices, setAdditionalServices] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояния для модального окна WhatsApp
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  // Функция для открытия модального окна
  const openWhatsAppModal = (serviceName: string) => {
    setSelectedService(serviceName);
    setShowWhatsAppModal(true);
  };

  // Загрузка данных из API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Используем публичный API
        const response = await fetch("http://localhost:3001/api/admin/prices/public");
        const data = await response.json();

        console.log("API response:", data);

        if (data.success && data.data) {
          const { categories, plans, services, discounts } = data.data;

          // Обрабатываем категории
          if (categories && categories.length > 0) {
            const mappedCategories = categories.map((cat: any) => ({
              id: cat.id.toString(),
              name: cat.name,
              icon: getIconComponent(cat.icon),
            }));
            setCategories(mappedCategories);
            setActiveCategory(mappedCategories[0].id);
          }

          // Обрабатываем планы
          if (plans && plans.length > 0) {
            const mappedPlans = plans.map((plan: any) => ({
              id: plan.id,
              title: plan.title,
              icon: <FaCar />, // Используем иконку по умолчанию
              price: parseFloat(plan.price), // Преобразуем строку в число
              oldPrice: plan.old_price ? parseFloat(plan.old_price) : undefined,
              duration: plan.duration,
              lessons: plan.lessons_count,
              features: Array.isArray(plan.features) ? plan.features : typeof plan.features === "string" ? (plan.features.startsWith("[") ? JSON.parse(plan.features) : plan.features.split("\n").filter(Boolean)) : [],
              popular: Boolean(plan.is_popular),
              description: plan.description || "",
              category: plan.category_id.toString(),
            }));
            console.log("Mapped plans:", mappedPlans);
            setPriceItems(mappedPlans);
          }

          // Обрабатываем дополнительные услуги
          if (services) {
            setAdditionalServices(services);
          }

          // Обрабатываем скидки
          if (discounts) {
            setDiscounts(discounts);
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        setError(t("loading_data_error"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Функция для получения иконки по названию
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "FaCar":
        return <FaCar className="text-xl" />;
      case "FaMotorcycle":
        return <FaMotorcycle className="text-xl" />;
      case "FaTruck":
        return <FaTruck className="text-xl" />;
      case "FaBus":
        return <FaBus className="text-xl" />;
      case "FaTrailer":
        return <FaTrailer className="text-xl" />;
      default:
        return <FaCar className="text-xl" />;
    }
  };

  // Fallback статические данные (если API не работает)
  const defaultCategories = [
    { id: "1", name: t("category_b"), icon: <FaCar className="text-xl" /> },
    {
      id: "2",
      name: "Категория А",
      icon: <FaMotorcycle className="text-xl" />,
    },
    { id: "3", name: t("category_c"), icon: <FaTruck className="text-xl" /> },
    { id: "4", name: t("category_d"), icon: <FaBus className="text-xl" /> },
    { id: "5", name: "Категория E", icon: <FaTrailer className="text-xl" /> },
  ];

  // Исправим проблемы с API данными
  const safeCategories = categories.length > 0 ? categories : defaultCategories;
  const safePriceItems = priceItems || [];
  const safeAdditionalServices = additionalServices || [];
  const safeDiscounts = discounts || [];

  // Фильтрованные тарифные планы по категории
  const filteredPrices = safePriceItems.filter((item) => item.category === activeCategory);

  if (loading) {
    return (
      <Layout title="Цены на обучение в автошколе" description="Стоимость обучения вождению в нашей автошколе. Тарифы, акции, скидки и дополнительные услуги.">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={t("prices_page_title")} description={t("prices_page_description")}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-red-600 text-center">
            <h2 className="text-2xl font-bold mb-4">{t("loading_error")}</h2>
            <p>{error}</p>
            <p className="mt-4 text-gray-600">{t("test_data_used")}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t("prices_page_title")} description={t("prices_page_description")}>
      <div className="min-h-screen bg-gray-50">
        {/* Hero секция */}
        <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("cost_of_training")}</h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">{t("cost_hero_subtitle")}</p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Категории */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{t("choose_category")}</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {safeCategories.map((category) => (
                <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeCategory === category.id ? "bg-red-600 text-white shadow-lg transform scale-105" : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-md"}`}>
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </section>

          {/* Тарифные планы */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{t("price_plans")}</h2>
            {filteredPrices.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPrices.map((price) => (
                  <PriceCard key={price.id} price={price} bordered={price.popular} t={t} onEnrollClick={openWhatsAppModal} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">{t("no_plans_available")}</p>
              </div>
            )}
          </section>

          {/* Дополнительные услуги */}
          {safeAdditionalServices.length > 0 ? (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{t("additional_services")}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-6">
                {safeAdditionalServices.map((service, index) => (
                  <ServiceCard key={index} service={service} onOrderClick={openWhatsAppModal} />
                ))}
              </div>
            </section>
          ) : null}

          {/* Скидки и акции */}
          {safeDiscounts.length > 0 ? (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">{t("discounts_promotions")}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {safeDiscounts.map((discount, index) => (
                  <DiscountCard key={index} discount={discount} />
                ))}
              </div>
            </section>
          ) : null}

          {/* Информационный блок */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t("useful_information")}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaInfoCircle className="text-red-600 mr-2" />
                  {t("whats_included")}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    {t("theory_course")}
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    {t("practical_lessons")}
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    {t("study_materials")}
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    {t("internal_exams")}
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    {t("gibdd_exam_support")}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaClock className="text-red-600 mr-2" />
                  {t("additional_costs")}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <FaTimes className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                    {t("medical_certificate")}
                  </li>
                  <li className="flex items-start">
                    <FaTimes className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                    {t("gibdd_exam_fee")}
                  </li>
                  <li className="flex items-start">
                    <FaTimes className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                    {t("license_production")}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Блок записи на обучение */}
          <section className="mt-16 bg-gradient-to-r from-red-600 to-red-800 rounded-lg text-white p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("ready_to_start")}</h2>
            <p className="text-xl mb-6 opacity-90">{t("enroll_now_discount")}</p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link href="/contacts" className="inline-block bg-white text-red-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300">
                {t("enroll_for_training")}
              </Link>
              <Link href="/contacts" className="inline-block border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white hover:text-red-600 transition duration-300">
                {t("ask_question")}
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Модальное окно WhatsApp */}
      <WhatsAppModal isOpen={showWhatsAppModal} onClose={() => setShowWhatsAppModal(false)} serviceName={selectedService} whatsappNumber="+77282412100" />
    </Layout>
  );
};

export default PricesPage;
