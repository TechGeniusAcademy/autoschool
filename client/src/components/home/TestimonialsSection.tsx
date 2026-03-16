import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

interface TestimonialProps {
  text: string;
  author: string;
  position: string;
  rating: number;
  imageSrc: string;
}

const TestimonialCard: React.FC<TestimonialProps> = ({
  text,
  author,
  position,
  rating,
  imageSrc,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8 relative">
      <FaQuoteLeft className="text-red-100 absolute top-6 left-6 text-4xl" />
      <div className="mb-6 flex">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${
              i < rating ? "text-yellow-400" : "text-gray-300"
            } text-xl`}
          />
        ))}
      </div>
      <p className="text-gray-600 mb-6 relative z-10">{text}</p>
      <div className="flex items-center">
        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
          {/* ПРИМЕЧАНИЕ: Для каждого отзыва необходимо добавить фото автора, рекомендуемое разрешение 96x96px */}
          <Image src={imageSrc} alt={author} fill className="object-cover" />
        </div>
        <div>
          <h4 className="font-bold">{author}</h4>
          <p className="text-sm text-gray-500">{position}</p>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const testimonials = [
    {
      text: "Отличная автошкола! Инструкторы очень терпеливые и внимательные. Я сдала экзамен с первого раза и очень благодарна за качественное обучение!",
      author: "Анна Иванова",
      position: "Категория B",
      rating: 5,
      imageSrc: "/images/testimonial-1.jpg",
    },
    {
      text: "Учился в этой автошколе на категорию C. Очень понравился формат обучения, удобное расписание и профессиональный подход к делу. Рекомендую всем!",
      author: "Иван Петров",
      position: "Категория C",
      rating: 5,
      imageSrc: "/images/testimonial-2.jpg",
    },
    {
      text: "Проходил обучение на категорию А. Отличные преподаватели, современные мотоциклы и хорошая атмосфера. Сдал экзамен без проблем.",
      author: "Максим Сидоров",
      position: "Категория A",
      rating: 4,
      imageSrc: "/images/testimonial-3.jpg",
    },
    {
      text: "Очень удобно, что есть возможность проходить теорию онлайн. Практика тоже на высоте - инструкторы профессионалы своего дела.",
      author: "Елена Смирнова",
      position: "Категория B",
      rating: 5,
      imageSrc: "/images/testimonial-4.jpg",
    },
    {
      text: "Отличная организация учебного процесса, современные автомобили, вежливый персонал. Всем рекомендую эту автошколу.",
      author: "Дмитрий Козлов",
      position: "Категория D",
      rating: 5,
      imageSrc: "/images/testimonial-5.jpg",
    },
    {
      text: "Обучался на категорию B. Понравился индивидуальный подход к обучению и гибкий график. Сдал экзамены с первого раза.",
      author: "Алексей Николаев",
      position: "Категория B",
      rating: 4,
      imageSrc: "/images/testimonial-6.jpg",
    },
  ];

  // Отображаем по 3 отзыва на десктопе и по 1 на мобильных
  const visibleTestimonials = testimonials.slice(activeSlide, activeSlide + 3);

  // Функции для слайдера
  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 3 >= testimonials.length ? 0 : prev + 3));
  };

  const prevSlide = () => {
    setActiveSlide((prev) =>
      prev - 3 < 0 ? Math.max(0, testimonials.length - 3) : prev - 3
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-fluid">
        <h2 className="section-title">Отзывы наших учеников</h2>

        <div className="relative">
          {/* Десктоп версия - 3 отзыва в ряд */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {visibleTestimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>

          {/* Мобильная версия - 1 отзыв с возможностью листать */}
          <div className="md:hidden mt-12">
            <TestimonialCard {...testimonials[activeSlide]} />
          </div>

          {/* Навигация для слайдера */}
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(Math.ceil(testimonials.length / 3))].map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i * 3)}
                className={`w-3 h-3 rounded-full ${
                  Math.floor(activeSlide / 3) === i
                    ? "bg-red-600"
                    : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Кнопки навигации */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-6 bg-white rounded-full shadow-md p-3 hover:bg-gray-100 transition-colors hidden lg:block"
            aria-label="Previous testimonials"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-6 bg-white rounded-full shadow-md p-3 hover:bg-gray-100 transition-colors hidden lg:block"
            aria-label="Next testimonials"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="text-center mt-12">
          <div className="font-bold text-xl mb-2">Общий рейтинг</div>
          <div className="flex justify-center mb-6">
            <FaStar className="text-yellow-400 text-2xl" />
            <FaStar className="text-yellow-400 text-2xl" />
            <FaStar className="text-yellow-400 text-2xl" />
            <FaStar className="text-yellow-400 text-2xl" />
            <FaStar className="text-yellow-400 text-2xl mx-1" />
            <span className="text-2xl font-bold">4.8</span>
          </div>
          <Link
            href="/reviews"
            className="btn-secondary py-3 px-8 inline-block"
          >
            Все отзывы
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
