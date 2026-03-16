import React from "react";
import Image from "next/image";
import { FaUserTie, FaCar, FaCalendarAlt, FaLaptop } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";

const AdvantagesSection: React.FC = () => {
  const { t } = useLanguage();

  const advantages = [
    {
      icon: <FaUserTie className="text-4xl text-red-600" />,
      title: t("certified_instructors"),
      description: t("certified_instructors_desc"),
    },
    {
      icon: <FaCar className="text-4xl text-red-600" />,
      title: t("modern_vehicles"),
      description: t("modern_vehicles_desc"),
    },
    {
      icon: <FaCalendarAlt className="text-4xl text-red-600" />,
      title: t("flexible_schedule"),
      description: t("flexible_schedule_desc"),
    },
    {
      icon: <FaLaptop className="text-4xl text-red-600" />,
      title: t("online_courses"),
      description: t("online_courses_desc"),
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-fluid">
        <h2 className="section-title">{t("our_advantages")}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {advantages.map((advantage, index) => (
            <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">{advantage.icon}</div>
              <h3 className="text-xl font-bold mb-3">{advantage.title}</h3>
              <p className="text-gray-600">{advantage.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Почему стоит выбрать нашу автошколу?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Высокий процент сдачи экзаменов с первого раза</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Индивидуальный подход к каждому ученику</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Удобное расположение в разных районах города</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Возможность оплаты обучения в рассрочку</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Дополнительные часы вождения по доступным ценам</span>
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2 relative min-h-[300px]">
              {/* ПРИМЕЧАНИЕ: Необходимо добавить изображение, рекомендуемое разрешение 600x400px */}
              <Image src="/images/driving-instructor.jpg" alt="Обучение вождению" fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
