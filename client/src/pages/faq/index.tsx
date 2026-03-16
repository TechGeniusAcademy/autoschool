import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaChevronDown, FaChevronUp, FaSearch, FaBookOpen, FaCar, FaMoneyBillWave, FaGraduationCap, FaIdCard, FaCalendarAlt } from "react-icons/fa";

// Интерфейс для FAQ категории
interface FAQCategory {
  id: string;
  title: string;
  icon: JSX.Element;
  description: string;
}

// Интерфейс для FAQ вопроса
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);

  // Категории FAQ
  const categories: FAQCategory[] = [
    {
      id: "general",
      title: t("faq_general"),
      icon: <FaBookOpen className="text-red-600" />,
      description: t("faq_general_desc"),
    },
    {
      id: "courses",
      title: t("faq_courses"),
      icon: <FaCar className="text-red-600" />,
      description: t("faq_courses_desc"),
    },
    {
      id: "payment",
      title: t("faq_payment"),
      icon: <FaMoneyBillWave className="text-red-600" />,
      description: t("faq_payment_desc"),
    },
    {
      id: "exams",
      title: t("faq_exams"),
      icon: <FaGraduationCap className="text-red-600" />,
      description: t("faq_exams_desc"),
    },
    {
      id: "documents",
      title: t("faq_documents"),
      icon: <FaIdCard className="text-red-600" />,
      description: t("faq_documents_desc"),
    },
    {
      id: "schedule",
      title: t("faq_schedule"),
      icon: <FaCalendarAlt className="text-red-600" />,
      description: t("faq_schedule_desc"),
    },
  ];

  // Список вопросов и ответов (сокращенный список)
  const faqItems: FAQItem[] = [
    // Общие вопросы
    {
      id: 1,
      question: "Сколько длится обучение в автошколе?",
      answer: "Продолжительность обучения зависит от выбранной программы и категории прав. В среднем, обучение на категорию B длится 2-3 месяца. Это включает теоретический курс (1-1,5 месяца) и практические занятия (1-1,5 месяца).",
      category: "general",
    },
    {
      id: 2,
      question: "Каков процент сдачи экзаменов с первого раза?",
      answer: "По статистике, около 80% наших учеников успешно сдают теоретический экзамен с первого раза. Практический экзамен сдают с первого раза примерно 65% обучающихся. Эти показатели выше средних по региону.",
      category: "general",
    },
    {
      id: 3,
      question: "Есть ли возрастные ограничения для обучения?",
      answer: "Да, существуют возрастные ограничения: для категории A и B - с 16 лет (получение прав с 18 лет), для категорий A1 и B1 - с 16 лет, для C - с 17 лет, для D - с 20 лет, для E - при наличии открытой базовой категории.",
      category: "general",
    },

    // Учебные курсы
    {
      id: 4,
      question: "Какие категории прав можно получить в вашей автошколе?",
      answer: "В нашей автошколе вы можете пройти обучение на категории A, B, C, D, E, а также подкатегории A1, B1, C1, D1. Мы предлагаем программы для новичков и для опытных водителей, желающих открыть дополнительную категорию.",
      category: "courses",
    },
    {
      id: 5,
      question: "Можно ли пройти только теоретический курс?",
      answer: "Да, мы предлагаем отдельный теоретический курс для углубления знаний ПДД или подготовки к пересдаче экзамена. Но для допуска к экзаменам в спецЦОН необходимо пройти полный курс обучения.",
      category: "courses",
    },
    {
      id: 6,
      question: "Есть ли у вас интенсивные курсы обучения?",
      answer: "Да, мы предлагаем интенсивные курсы с ежедневными занятиями. Это позволяет сократить общую продолжительность обучения, но минимальные сроки регламентированы законодательством.",
      category: "courses",
    },

    // Оплата и скидки
    {
      id: 7,
      question: "Какие способы оплаты вы принимаете?",
      answer: "Мы принимаем наличные, банковские карты, банковский перевод, оплату через онлайн-банкинг, а также оплату по QR-коду. Возможна оплата в рассрочку или в кредит через банки-партнеры.",
      category: "payment",
    },
    {
      id: 8,
      question: "Можно ли оплатить обучение частями?",
      answer: "Да, у нас есть возможность оплаты частями: первоначальный взнос 30% при заключении договора, остальное - равными платежами в течение обучения. Также доступны кредиты и рассрочка через банки-партнеры.",
      category: "payment",
    },
    {
      id: 9,
      question: "Есть ли скидки для определенных категорий граждан?",
      answer: "Да, мы предоставляем скидки студентам (5-10%), пенсионерам (10%), многодетным семьям (15%), военнослужащим (15%). Также действуют сезонные акции и групповые скидки.",
      category: "payment",
    },

    // Экзамены
    {
      id: 10,
      question: "Как проходит внутренний экзамен в автошколе?",
      answer: "Внутренний экзамен состоит из теоретической части (компьютерное тестирование, аналогичное экзамену в спецЦОН) и практической части (вождение на площадке и в городе). К экзамену в спецЦОН допускаются только после успешной сдачи внутренних экзаменов.",
      category: "exams",
    },
    {
      id: 11,
      question: "Что делать, если я не сдал экзамен в спецЦОН?",
      answer: "Вы имеете право на пересдачу. Теорию можно пересдать через 7 дней, практику — через 7-30 дней в зависимости от количества попыток. Мы предлагаем дополнительные занятия для подготовки к пересдаче.",
      category: "exams",
    },
    {
      id: 12,
      question: "Как записаться на экзамен в спецЦОН?",
      answer: "Запись организуется автошколой централизованно для групп выпускников. После внутренних экзаменов мы формируем группу и согласовываем дату с спецЦОН. Также можно записаться самостоятельно через Госуслуги.",
      category: "exams",
    },

    // Документы
    {
      id: 13,
      question: "Какие документы нужны для поступления?",
      answer: "Необходимы: паспорт, медицинская справка №073/у, фотографии 3x4 (3-4 шт), СНИЛС. Иностранным гражданам требуется нотариальный перевод документов, несовершеннолетним - согласие родителей.",
      category: "documents",
    },
    {
      id: 14,
      question: "Где получить медицинскую справку?",
      answer: "Справку формы №073/у можно получить в любом медицинском учреждении с соответствующей лицензией. Необходим осмотр терапевта, офтальмолога, психиатра, нарколога и других специалистов. Мы сотрудничаем с медцентрами, где можно пройти комиссию со скидкой.",
      category: "documents",
    },
    {
      id: 15,
      question: "Сколько действует медицинская справка?",
      answer: "Медицинская справка №073/у действительна 1 год с момента выдачи. Важно, чтобы срок не истек к моменту сдачи экзаменов в спецЦОН. Рекомендуем получать справку ближе к окончанию теоретического курса.",
      category: "documents",
    },

    // Расписание
    {
      id: 16,
      question: "Какое расписание занятий в автошколе?",
      answer: "Мы предлагаем гибкое расписание: утренние (10:00-13:00), дневные (14:00-17:00) и вечерние (18:00-21:00) группы в будни, а также занятия в выходные (10:00-15:00). Практические занятия согласовываются индивидуально с инструктором.",
      category: "schedule",
    },
    {
      id: 17,
      question: "Можно ли совмещать обучение с работой или учебой?",
      answer: "Да, наше гибкое расписание разработано для совмещения с работой или учебой. Доступны утренние, дневные, вечерние и выходные группы, онлайн-курсы теории. Практические занятия планируются с учетом вашего графика.",
      category: "schedule",
    },
    {
      id: 18,
      question: "Что делать, если я пропустил занятие?",
      answer: "Пропущенное теоретическое занятие можно восполнить, посетив его с другой группой, изучив материал самостоятельно через онлайн-ресурсы или договорившись с преподавателем о консультации. Практические занятия необходимо отменять за 24 часа, иначе они могут быть списаны.",
      category: "schedule",
    },
  ];

  // Обработчик нажатия на категорию
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  // Обработчик нажатия на вопрос
  const handleQuestionClick = (questionId: number) => {
    setOpenQuestions((prev) => (prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]));
  };

  // Фильтрация вопросов
  const filteredFAQs = faqItems.filter((item) => {
    const matchesSearch = searchTerm === "" || item.question.toLowerCase().includes(searchTerm.toLowerCase()) || item.answer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = activeCategory === null || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Layout title="Часто задаваемые вопросы | Автошкола" description="Ответы на популярные вопросы о процессе обучения, экзаменах, документах и оплате в нашей автошколе.">
      <div className="bg-gray-100 py-12">
        <div className="container-fluid">
          {/* Заголовок страницы */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("faq_page_title")}</h1>
            <p className="text-gray-600 max-w-3xl mx-auto">{t("faq_section_description")}</p>
          </div>

          {/* Поиск */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="relative max-w-xl mx-auto">
              <input type="text" placeholder={t("search")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-3 px-5 pl-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400" />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Категории FAQ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {categories.map((category) => (
              <button key={category.id} onClick={() => handleCategoryClick(category.id)} className={`bg-white rounded-lg shadow-sm p-4 text-left transition ${activeCategory === category.id ? "ring-2 ring-red-400 shadow-md" : "hover:shadow-md"}`}>
                <div className="flex items-center">
                  <div className="mr-3">{category.icon}</div>
                  <div>
                    <h3 className="font-bold">{category.title}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {activeCategory && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{categories.find((c) => c.id === activeCategory)?.title}</h2>
              <button onClick={() => setActiveCategory(null)} className="text-sm text-red-600 hover:text-red-800">
                Показать все категории
              </button>
            </div>
          )}

          {/* Список вопросов и ответов */}
          <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item) => (
                <div key={item.id} className="p-6">
                  <button onClick={() => handleQuestionClick(item.id)} className="flex justify-between items-start w-full text-left">
                    <h3 className="text-lg font-medium pr-8">{item.question}</h3>
                    <span className="text-red-600 flex-shrink-0 mt-1">{openQuestions.includes(item.id) ? <FaChevronUp /> : <FaChevronDown />}</span>
                  </button>

                  {openQuestions.includes(item.id) && (
                    <div className="mt-4 text-gray-700">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <h3 className="text-xl font-bold mb-2">Результаты не найдены</h3>
                <p className="text-gray-600 mb-4">К сожалению, по вашему запросу ничего не найдено. Попробуйте изменить поисковый запрос или выбрать другую категорию.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory(null);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>

          {/* Блок с контактами */}
          <div className="bg-gray-50 rounded-lg shadow-md p-6 mt-8 text-center">
            <h3 className="text-xl font-bold mb-3">{t("contact_help_text")}</h3>
            <p className="text-gray-700 mb-4"></p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contacts" className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition-colors">
                {t("contact_info_title")}
              </Link>
              <Link href="/documents" className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg transition-colors">
                {t("faq_documents_desc")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
