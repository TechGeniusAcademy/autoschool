import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import Image from "next/image";
import { AdminAPI } from "../../services/api";
import {
  FaCar,
  FaMotorcycle,
  FaTruck,
  FaBus,
  FaTrailer,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaPercent,
} from "react-icons/fa";

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
}> = ({ price, bordered = false }) => {
  return (
    <div
      className={`bg-white rounded-lg overflow-hidden relative 
      ${bordered ? "ring-2 ring-red-500 shadow-lg" : "shadow-md"}`}
    >
      {price.popular && (
        <div className="absolute top-0 right-0 bg-red-600 text-white py-1 px-4 text-sm font-bold">
          Популярный
        </div>
      )}

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
            <span className="text-3xl font-bold text-red-600">
              {price.price.toLocaleString("ru-RU")} ₸
            </span>
            {price.oldPrice && (
              <span className="ml-2 text-lg text-gray-500 line-through">
                {price.oldPrice.toLocaleString("ru-RU")} ₸
              </span>
            )}
          </div>
          <div className="flex items-center text-gray-600 mt-2">
            <span className="mr-4">📅 {price.duration}</span>
            <span>🎓 {price.lessons} занятий</span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Что включено:</h4>
          <ul className="space-y-2">
            {price.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
          Записаться на курс
        </button>
      </div>
    </div>
  );
};

// Компонент для отображения дополнительных услуг
const ServiceCard: React.FC<{
  service: { title: string; price: number; description: string };
}> = ({ service }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
        <span className="text-xl font-bold text-red-600">
          {service.price.toLocaleString("ru-RU")} ₸
        </span>
      </div>
      <p className="text-gray-600 mb-4">{service.description}</p>
      <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300">
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
          <span className="text-2xl font-bold text-red-600">
            {discount.discount_value}
          </span>
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
  const [activeCategory, setActiveCategory] = useState<string>("1");

  // Состояния для данных из API
  const [categories, setCategories] = useState<any[]>([]);
  const [priceItems, setPriceItems] = useState<any[]>([]);
  const [additionalServices, setAdditionalServices] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных из API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, plansRes, servicesRes, discountsRes] =
          await Promise.all([
            AdminAPI.getPriceCategories(),
            AdminAPI.getPricePlans(),
            AdminAPI.getAdditionalServices(),
            AdminAPI.getPriceDiscounts(),
          ]);

        console.log("API responses:", {
          categoriesRes,
          plansRes,
          servicesRes,
          discountsRes,
        });

        if (categoriesRes.success && categoriesRes.data) {
          const mappedCategories = categoriesRes.data.map((cat: any) => ({
            id: cat.id.toString(),
            name: cat.name,
            icon: getIconComponent(cat.icon),
          }));
          setCategories(mappedCategories);
          if (mappedCategories.length > 0) {
            setActiveCategory(mappedCategories[0].id);
          }
        }

        if (plansRes.success && plansRes.data) {
          const mappedPlans = plansRes.data.map((plan: any) => ({
            id: plan.id,
            title: plan.title,
            icon: <FaCar />, // Используем иконку по умолчанию
            price: plan.price,
            oldPrice: plan.old_price,
            duration: plan.duration,
            lessons: plan.lessons_count,
            features: plan.features
              ? plan.features.split("\n").filter(Boolean)
              : [],
            popular: plan.is_popular,
            description: plan.description || "",
            category: plan.category_id.toString(),
          }));
          setPriceItems(mappedPlans);
        }

        if (servicesRes.success && servicesRes.data) {
          setAdditionalServices(servicesRes.data);
        }

        if (discountsRes.success && discountsRes.data) {
          setDiscounts(discountsRes.data);
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        setError("Ошибка загрузки данных о ценах");
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
    { id: "1", name: "Категория B", icon: <FaCar className="text-xl" /> },
    {
      id: "2",
      name: "Категория A",
      icon: <FaMotorcycle className="text-xl" />,
    },
    { id: "3", name: "Категория C", icon: <FaTruck className="text-xl" /> },
    { id: "4", name: "Категория D", icon: <FaBus className="text-xl" /> },
    { id: "5", name: "Категория E", icon: <FaTrailer className="text-xl" /> },
  ];

  // Исправим проблемы с API данными
  const safeCategories = categories.length > 0 ? categories : defaultCategories;
  const safePriceItems = priceItems || [];
  const safeAdditionalServices = additionalServices || [];
  const safeDiscounts = discounts || [];

  // Фильтрованные тарифные планы по категории
  const filteredPrices = safePriceItems.filter(
    (item) => item.category === activeCategory
  );

  if (loading) {
    return (
      <Layout
        title="Цены на обучение в автошколе"
        description="Стоимость обучения вождению в нашей автошколе. Тарифы, акции, скидки и дополнительные услуги."
      >
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Цены на обучение в автошколе"
        description="Стоимость обучения вождению в нашей автошколе. Тарифы, акции, скидки и дополнительные услуги."
      >
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-red-600 text-center">
            <h2 className="text-2xl font-bold mb-4">Ошибка загрузки</h2>
            <p>{error}</p>
            <p className="mt-4 text-gray-600">Используются тестовые данные</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Цены на обучение в автошколе"
      description="Стоимость обучения вождению в нашей автошколе. Тарифы, акции, скидки и дополнительные услуги."
    >
      <div className="min-h-screen bg-gray-50">
        {/* Hero секция */}
        <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Стоимость обучения в автошколе
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Прозрачные цены, качественное обучение и индивидуальный подход к
              каждому ученику
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Категории */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Выберите категорию
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {safeCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    activeCategory === category.id
                      ? "bg-red-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-md"
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </section>

          {/* Тарифные планы */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Тарифные планы
            </h2>
            {filteredPrices.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPrices.map((price) => (
                  <PriceCard
                    key={price.id}
                    price={price}
                    bordered={price.popular}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  Пока нет тарифных планов для выбранной категории
                </p>
              </div>
            )}
          </section>

          {/* Дополнительные услуги */}
          {safeAdditionalServices.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                Дополнительные услуги
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {safeAdditionalServices.map((service, index) => (
                  <ServiceCard key={index} service={service} />
                ))}
              </div>
            </section>
          )}

          {/* Скидки и акции */}
          {safeDiscounts.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                Скидки и акции
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {safeDiscounts.map((discount, index) => (
                  <DiscountCard key={index} discount={discount} />
                ))}
              </div>
            </section>
          )}

          {/* Информационный блок */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Полезная информация
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaInfoCircle className="text-red-600 mr-2" />
                  Что входит в стоимость обучения
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    Теоретический курс по ПДД
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    Практические занятия с инструктором
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    Учебные материалы и пособия
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    Внутренние экзамены в автошколе
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    Сопровождение на экзамене в спецЦОН
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaClock className="text-red-600 mr-2" />
                  Дополнительные расходы
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <FaTimes className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                    Медицинская справка (2000-3000₸)
                  </li>
                  <li className="flex items-start">
                    <FaTimes className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                    Госпошлина за экзамен в спецЦОН (2000₸)
                  </li>
                  <li className="flex items-start">
                    <FaTimes className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                    Изготовление водительского удостоверения (2000₸)
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Блок записи на обучение */}
          <section className="mt-16 bg-gradient-to-r from-red-600 to-red-800 rounded-lg text-white p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Готовы начать обучение?</h2>
            <p className="text-xl mb-6 opacity-90">
              Записывайтесь на курсы прямо сейчас и получите скидку на первый
              платеж!
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                href="/contacts"
                className="inline-block bg-white text-red-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300"
              >
                Записаться на обучение
              </Link>
              <Link
                href="/contacts"
                className="inline-block border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white hover:text-red-600 transition duration-300"
              >
                Задать вопрос
              </Link>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PricesPage;
