import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";

// Схема валидации для формы восстановления пароля
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Неверный формат email")
    .required("Обязательное поле"),
});

const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Обработчик отправки формы
  const handleSubmit = (values: any, { setSubmitting }: any) => {
    // Здесь будет логика восстановления пароля
    console.log("Password reset attempt for:", values.email);

    // Имитация запроса к серверу
    setTimeout(() => {
      // В реальном приложении здесь будет запрос к API
      if (values.email === "unknown@example.com") {
        // Ошибка - пользователь не найден
        setSubmitError("Пользователь с указанным email не найден");
        setIsSubmitted(false);
      } else {
        // Успешная отправка
        setSubmitError(null);
        setIsSubmitted(true);
      }
      setSubmitting(false);
    }, 1000);
  };

  return (
    <Layout
      title="Восстановление пароля - Автошкола"
      description="Восстановление пароля для доступа в личный кабинет автошколы."
    >
      <div className="bg-gray-100 py-12">
        <div className="container-fluid">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-8">
              <Link
                href="/login"
                className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
              >
                <FaArrowLeft className="mr-2" />
                Вернуться на страницу входа
              </Link>

              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Восстановление пароля
                </h1>
                <p className="text-gray-600">
                  Введите email, указанный при регистрации, и мы отправим вам
                  инструкции по восстановлению пароля
                </p>
              </div>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <FaEnvelope className="text-green-600 text-xl" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Проверьте вашу электронную почту
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Мы отправили инструкции по восстановлению пароля на
                    указанный email. Если вы не получили письмо в течение 5
                    минут, проверьте папку "Спам".
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Указать другой email
                  </button>
                </div>
              ) : (
                <>
                  {submitError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {submitError}
                    </div>
                  )}

                  <Formik
                    initialValues={{
                      email: "",
                    }}
                    validationSchema={ForgotPasswordSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting, errors, touched }) => (
                      <Form>
                        <div className="mb-6">
                          <label
                            htmlFor="email"
                            className="block text-gray-700 font-medium mb-2"
                          >
                            Email
                          </label>
                          <Field
                            id="email"
                            name="email"
                            type="email"
                            placeholder="email@example.com"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                              errors.email && touched.email
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-300 focus:ring-blue-200"
                            }`}
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
                        >
                          {isSubmitting ? (
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : null}
                          Отправить инструкции
                        </button>
                      </Form>
                    )}
                  </Formik>

                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Вспомнили пароль?{" "}
                      <Link
                        href="/login"
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Вернуться на страницу входа
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
