import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

interface CourseCardProps {
  title: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  imageSrc: string;
  href: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ title, category, description, price, duration, imageSrc, href }) => {
  const { t } = useLanguage();

  return (
    <div className="card group hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 md:h-56 overflow-hidden">
        {/* ПРИМЕЧАНИЕ: Для каждой карточки курса необходимо добавить изображение, рекомендуемое разрешение 600x400px */}
        <Image src={imageSrc} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-3 left-3 bg-red-600 text-white py-1 px-3 rounded-full text-sm font-semibold">{category}</div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
          <span>{duration}</span>
          <span className="font-semibold text-gray-900">{price.toLocaleString()} ₸</span>
        </div>
        <Link href={href} className="btn-primary w-full block text-center">
          {t("more_details")}
        </Link>
      </div>
    </div>
  );
};

const CourseSection: React.FC = () => {
  const { t } = useLanguage();

  const courses = [
    {
      title: "A " + t("category") + " - " + t("motorcycles"),
      category: "A",
      description: t("motorcycle_course_desc"),
      price: 15000,
      duration: "1.5 " + t("months"),
      imageSrc: "/images/course-category-a.jpg",
      href: "/courses/category-a",
    },
    {
      title: "B " + t("category") + " - " + t("passenger_cars"),
      category: "B",
      description: t("passenger_car_course_desc"),
      price: 25000,
      duration: "2.5 " + t("months"),
      imageSrc: "/images/course-category-b.jpg",
      href: "/courses/category-b",
    },
    {
      title: "C " + t("category") + " - " + t("trucks"),
      category: "C",
      description: t("truck_course_desc"),
      price: 30000,
      duration: "3 " + t("months"),
      imageSrc: "/images/course-category-c.jpg",
      href: "/courses/category-c",
    },
    {
      title: "D " + t("category") + " - " + t("buses"),
      category: "D",
      description: t("bus_course_desc"),
      price: 35000,
      duration: "3.5 " + t("months"),
      imageSrc: "/images/course-category-d.jpg",
      href: "/courses/category-d",
    },
  ];

  return (
    <section className="py-16">
      <div className="container-fluid">
        <h2 className="section-title">{t("popular_courses")}</h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">{t("choose_suitable_course")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <CourseCard key={index} {...course} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/courses" className="btn-secondary py-3 px-8 inline-block">
            {t("all_courses")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CourseSection;
