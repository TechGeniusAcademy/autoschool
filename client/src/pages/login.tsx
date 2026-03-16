import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaGoogle } from "react-icons/fa";
import { SlSocialVkontakte } from "react-icons/sl";
import { FaVk } from "react-icons/fa";
import { AuthAPI, TokenStorage, LoginData } from "../services/api";

// Схема валидации для формы входа
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Неверный формат email")
    .required("Обязательное поле"),
  password: Yup.string()
    .min(6, "Минимум 6 символов")
    .required("Обязательное поле"),
  rememberMe: Yup.boolean(),
});

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);

  // Функция для определения маршрута профиля в зависимости от роли
  const getProfileRoute = (role: string) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "instructor":
        return "/profile/instructor";
      case "student":
      default:
        return "/profile";
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (values: LoginData, { setSubmitting }: any) => {
    setLoginError(null);

    try {
      console.log("Login attempt with:", values);

      const response = await AuthAPI.login(values);

      if (response.success && response.data) {
        // Сохраняем токен
        TokenStorage.set(response.data.token);

        console.log("Login successful, user role:", response.data.user?.role);

        // Перенаправляем в зависимости от роли пользователя
        const profileRoute = getProfileRoute(
          response.data.user?.role || "student"
        );
        router.push(profileRoute);
      } else {
        setLoginError(response.message || "Произошла ошибка при входе");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error?.message || "Неверный email или пароль");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      title="Вход в личный кабинет - Автошкола"
      description="Вход в личный кабинет ученика или инструктора автошколы."
    >
      <div className="bg-gray-100 py-12">
        <div className="container-fluid">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Вход в личный кабинет
                </h1>
                <p className="text-gray-600">
                  Введите свои данные для входа в личный кабинет
                </p>
              </div>

              {loginError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {loginError}
                </div>
              )}

              <Formik
                initialValues={{
                  email: "",
                  password: "",
                  rememberMe: false,
                }}
                validationSchema={LoginSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <div className="mb-4">
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

                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <label
                          htmlFor="password"
                          className="block text-gray-700 font-medium"
                        >
                          Пароль
                        </label>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Забыли пароль?
                        </Link>
                      </div>
                      <Field
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.password && touched.password
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-blue-200"
                        }`}
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="flex items-center mb-6">
                      <Field
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="rememberMe"
                        className="ml-2 block text-gray-700"
                      >
                        Запомнить меня
                      </label>
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
                      Войти
                    </button>
                  </Form>
                )}
              </Formik>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Еще нет аккаунта?{" "}
                  <Link
                    href="/register"
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Зарегистрироваться
                  </Link>
                </p>
              </div>

              {/* <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-center text-gray-600 mb-4">
                  Или войти через
                </h3>
                <div className="flex justify-center space-x-4">
                  <button className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
                      alt="googleLogo"
                      className="w-5 mr-3"
                    />
                    Google
                  </button>
                  <button className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition mr-3">
                      <FaVk size={20} />
                    </div>
                    VK
                  </button>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
