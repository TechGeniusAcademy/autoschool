import React from "react";
import Layout from "@/components/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { FaTrophy, FaGraduationCap, FaCar, FaUsers, FaChalkboardTeacher, FaHandshake, FaQuoteLeft, FaBook, FaRoad, FaCheck } from "react-icons/fa";

// Интерфейс для члена команды
interface TeamMember {
  id: number;
  name: string;
  position: string;
  photo: string;
  experience: string;
  description: string;
}

// Интерфейс для статистики
interface StatItem {
  id: number;
  value: string;
  label: string;
  icon: React.ReactNode;
}

// Интерфейс для преимуществ
interface AdvantageItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  // Члены команды
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: t("alexander_petrov"),
      position: t("director_position"),
      photo: "/images/team/director.png",
      experience: "15 " + t("years"),
      description: t("director_description"),
    },
    {
      id: 2,
      name: t("elena_smirnova"),
      position: t("education_head_position"),
      photo: "/images/team/education-head.png",
      experience: "12 " + t("years"),
      description: t("education_head_description"),
    },
    {
      id: 3,
      name: t("dmitry_ivanov"),
      position: t("theory_teacher_position"),
      photo: "/images/team/senior-instructor.png",
      experience: "10 " + t("years"),
      description: t("senior_instructor_description"),
    },
    {
      id: 4,
      name: t("olga_kozlova"),
      position: t("senior_instructor_position"),
      photo: "/images/team/theory-teacher.png",
      experience: "3 " + t("years"),
      description: t("theory_teacher_description"),
    },
  ];

  // Статистика автошколы
  const stats: StatItem[] = [
    {
      id: 1,
      value: "10+",
      label: t("years_of_work"),
      icon: <FaTrophy className="text-red-600 text-3xl" />,
    },
    {
      id: 2,
      value: "15000+",
      label: t("successful_graduates"),
      icon: <FaGraduationCap className="text-red-600 text-3xl" />,
    },
    {
      id: 3,
      value: "25+",
      label: t("qualified_instructors"),
      icon: <FaChalkboardTeacher className="text-red-600 text-3xl" />,
    },
    {
      id: 4,
      value: "30+",
      label: t("modern_cars"),
      icon: <FaCar className="text-red-600 text-3xl" />,
    },
  ];

  // Преимущества автошколы
  const advantages: AdvantageItem[] = [
    {
      id: 1,
      title: t("advantage_modern_fleet"),
      description: t("advantage_modern_fleet_desc"),
      icon: <FaCar className="text-red-600 text-3xl" />,
    },
    {
      id: 2,
      title: t("advantage_experienced_instructors"),
      description: t("advantage_experienced_instructors_desc"),
      icon: <FaUsers className="text-red-600 text-3xl" />,
    },
    {
      id: 3,
      title: t("advantage_flexible_schedule"),
      description: t("advantage_flexible_schedule_desc"),
      icon: <FaBook className="text-red-600 text-3xl" />,
    },
    {
      id: 4,
      title: t("advantage_own_autodrome"),
      description: t("advantage_own_autodrome_desc"),
      icon: <FaRoad className="text-red-600 text-3xl" />,
    },
    {
      id: 5,
      title: t("advantage_high_pass_rate"),
      description: t("advantage_high_pass_rate_desc"),
      icon: <FaGraduationCap className="text-red-600 text-3xl" />,
    },
    {
      id: 6,
      title: t("advantage_affordable_prices"),
      description: t("advantage_affordable_prices_desc"),
      icon: <FaHandshake className="text-red-600 text-3xl" />,
    },
  ];

  // Вехи истории автошколы
  const milestones = [
    {
      year: "2010",
      title: t("milestone_2011_title"),
      description: t("milestone_2011_desc"),
    },
    {
      year: "2012",
      title: t("milestone_2016_title"),
      description: t("milestone_2016_desc"),
    },
    {
      year: "2018",
      title: t("milestone_2018_title"),
      description: t("milestone_2018_desc"),
    },
    {
      year: "2020",
      title: t("milestone_2020_title"),
      description: t("milestone_2020_desc"),
    },
    {
      year: "2025",
      title: t("milestone_2025_modern_title"),
      description: t("milestone_2025_modern_desc"),
    },
    {
      year: "2025",
      title: t("milestone_2025_nurly_title"),
      description: t("milestone_2025_nurly_desc"),
    },
  ];

  return (
    <Layout title={t("about_page_title")} description={t("about_page_description")}>
      <div className="bg-gray-100 py-12">
        <div className="container-fluid">
          {/* Заголовок страницы */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("about_title")}</h1>
            <p className="text-gray-600 max-w-3xl mx-auto">{t("about_subtitle")}</p>
          </div>

          {/* Основная информация */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2">
                <h2 className="text-2xl font-bold mb-4">{t("our_history")}</h2>
                <div className="space-y-4 text-gray-700">
                  <p>{t("history_paragraph_1")}</p>
                  <p>{t("history_paragraph_2")}</p>
                  <p>{t("history_paragraph_3")}</p>
                </div>
                <div className="mt-6">
                  <Link href="/contacts" className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg inline-block transition-colors">
                    {t("contact_us")}
                  </Link>
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <div className="relative h-72 rounded-lg overflow-hidden">
                  <Image src="/images/about/school-building.png" alt={t("school_building_alt")} fill className="object-cover" />
                </div>

                {/* Цитата */}
                <div className="mt-6 bg-gray-50 p-6 rounded-lg relative">
                  <FaQuoteLeft className="text-gray-200 text-4xl absolute top-4 left-4" />
                  <blockquote className="pl-8 pt-4">
                    <p className="text-gray-700 italic mb-4">{t("our_goal_quote")}</p>
                    <footer className="font-medium">{t("director_name")}</footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <div key={stat.id} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Наши преимущества */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center">{t("our_advantages")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advantages.map((advantage) => (
                <div key={advantage.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    {advantage.icon}
                    <h3 className="text-xl font-bold ml-3">{advantage.title}</h3>
                  </div>
                  <p className="text-gray-600">{advantage.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* История автошколы */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center">{t("main_milestones")}</h2>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start">
                  <div className="mr-4 text-center">
                    <div className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg">{milestone.year}</div>
                    {index < milestones.length - 1 && <div className="h-16 w-0.5 bg-gray-300 mx-auto my-2"></div>}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Наша команда */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-center">{t("our_team")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-64">
                    <Image src={member.photo} alt={member.name} fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-red-600 font-medium mb-2">{member.position}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>
                        {t("work_experience")} {member.experience}
                      </span>
                    </div>
                    <p className="text-gray-600">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/instructors" className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg inline-block transition-colors">
                {t("all_instructors")}
              </Link>
            </div>
          </div>

          {/* Лицензии и сертификаты */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">{t("licenses_certificates")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <FaCheck className="text-green-500 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">{t("education_license_title")}</h3>
                  <p className="text-gray-600">{t("education_license_desc")}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <FaCheck className="text-green-500 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">{t("gibdd_accreditation_title")}</h3>
                  <p className="text-gray-600">{t("gibdd_accreditation_desc")}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <FaCheck className="text-green-500 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">{t("iso_certificate_title")}</h3>
                  <p className="text-gray-600">{t("iso_certificate_desc")}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <FaCheck className="text-green-500 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">{t("association_membership_title")}</h3>
                  <p className="text-gray-600">{t("association_membership_desc")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Призыв к действию */}
          <div className="bg-red-600 text-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t("start_today_title")}</h2>
            <p className="max-w-2xl mx-auto mb-6">{t("start_today_desc")}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/courses" className="bg-white text-red-600 hover:bg-gray-100 py-3 px-6 rounded-lg font-bold transition-colors">
                {t("our_courses")}
              </Link>
              <Link href="/contacts" className="bg-transparent hover:bg-red-700 border-2 border-white py-3 px-6 rounded-lg font-bold transition-colors">
                {t("contact_us")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
