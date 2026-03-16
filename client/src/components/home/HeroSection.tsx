import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* ПРИМЕЧАНИЕ: Необходимо добавить фоновое видео или изображение, 
          рекомендуемое разрешение фонового изображения 1920x1080px, 
          видео должно быть в формате MP4, оптимизированное для веб, не более 10MB */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image src="/images/hero-background.jpg" alt="Автошкола" fill className="object-cover" priority />
        {/* Альтернативный вариант с видео:
        <video 
          autoPlay 
          loop 
          muted 
          className="object-cover w-full h-full"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        */}
      </div>

      {/* Темный оверлей для лучшей читаемости текста */}
      <div className="absolute inset-0 bg-black opacity-60 z-10"></div>

      {/* Контент */}
      <div className="container-fluid h-full flex items-center relative z-20">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{t("hero_main_title")}</h1>
          <p className="text-lg md:text-xl mb-8">{t("hero_main_subtitle")}</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/courses" className="btn-primary text-center py-3 px-8 text-lg">
              {t("our_courses")}
            </Link>
            <Link href="/courses#sign-up" className="btn-secondary text-center py-3 px-8 text-lg">
              {t("sign_up")}
            </Link>
          </div>

          {/* Преимущества - иконки с текстом */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="flex flex-col items-center text-center">
              <div className="bg-white rounded-full p-3 mb-2">
                <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">Гибкий график занятий</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-white rounded-full p-3 mb-2">
                <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">Быстрое обучение</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-white rounded-full p-3 mb-2">
                <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <span className="text-sm">Опытные инструкторы</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-white rounded-full p-3 mb-2">
                <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm">Онлайн-обучение</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
