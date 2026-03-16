import React from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import Image from "next/image";
import { FaCheckCircle, FaEnvelope, FaArrowRight } from "react-icons/fa";

const RegisterSuccessPage: React.FC = () => {
  return (
    <Layout
      title="Регистрация успешно завершена - Автошкола"
      description="Ваша регистрация в автошколе успешно завершена. Вот ваши следующие шаги."
    >
      <div className="bg-gray-100 py-12">
        <div className="container-fluid">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <FaCheckCircle className="text-green-600 text-4xl" />
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Регистрация успешно завершена!
              </h1>

              <p className="text-gray-600 mb-6">
                Спасибо за регистрацию в нашей автошколе. Мы отправили
                подтверждение на указанный вами email. Пожалуйста, проверьте
                вашу электронную почту и подтвердите ваш аккаунт.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-center">
                <FaEnvelope className="text-blue-600 text-xl mr-3 flex-shrink-0" />
                <p className="text-blue-700 text-left text-sm">
                  Если вы не получили письмо в течение 5 минут, проверьте папку
                  "Спам" или нажмите на кнопку "Отправить письмо повторно" ниже.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors">
                  Отправить письмо повторно
                </button>
                <Link
                  href="/profile"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors inline-block"
                >
                  Перейти на страницу входа
                </Link>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Следующие шаги:
                </h2>

                <ol className="text-left space-y-4">
                  <li className="flex">
                    <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-medium">Подтвердите email</p>
                      <p className="text-gray-600 text-sm">
                        Откройте письмо и нажмите на ссылку для подтверждения
                        аккаунта.
                      </p>
                    </div>
                  </li>

                  <li className="flex">
                    <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-medium">Заполните профиль</p>
                      <p className="text-gray-600 text-sm">
                        Войдите в личный кабинет и заполните все необходимые
                        данные.
                      </p>
                    </div>
                  </li>

                  <li className="flex">
                    <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-medium">Выберите курс</p>
                      <p className="text-gray-600 text-sm">
                        Ознакомьтесь с нашими курсами и выберите подходящий для
                        вас.
                      </p>
                    </div>
                  </li>

                  <li className="flex">
                    <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                      4
                    </span>
                    <div>
                      <p className="font-medium">Начните обучение</p>
                      <p className="text-gray-600 text-sm">
                        Оплатите выбранный курс и начните обучение в удобное для
                        вас время.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/courses"
                  className="text-red-600 hover:text-red-800 inline-flex items-center font-medium"
                >
                  Ознакомиться с нашими курсами
                  <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterSuccessPage;
