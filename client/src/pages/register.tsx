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
import { Category } from "@mui/icons-material";
import { Select } from "@mui/material";
import { AuthAPI, TokenStorage, RegisterData } from "../services/api";

// Схема валидации для формы регистрации
const RegisterSchema = Yup.object().shape({
  first_name: Yup.string()
    .min(2, "Минимум 2 символа")
    .max(50, "Максимум 50 символов")
    .required("Обязательное поле"),
  last_name: Yup.string()
    .min(2, "Минимум 2 символа")
    .max(50, "Максимум 50 символов")
    .required("Обязательное поле"),
  email: Yup.string()
    .email("Неверный формат email")
    .required("Обязательное поле"),
  phone: Yup.string()
    .matches(
      /^(\+7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/,
      "Неверный формат телефона"
    )
    .required("Обязательное поле"),
  password: Yup.string()
    .min(6, "Минимум 6 символов")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру"
    )
    .required("Обязательное поле"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Пароли должны совпадать")
    .required("Обязательное поле"),
  termsAccepted: Yup.boolean()
    .oneOf([true], "Необходимо принять условия")
    .required("Обязательное поле"),
});

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [registerError, setRegisterError] = useState<string | null>(null);

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
  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setRegisterError(null);

    try {
      console.log("Registration attempt with:", values);

      // Подготавливаем данные для отправки
      const registerData: RegisterData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      };

      console.log("Sending registration data:", registerData);

      const response = await AuthAPI.register(registerData);

      if (response.success && response.data) {
        // Сохраняем токен
        TokenStorage.set(response.data.token);

        console.log("Registration successful, redirecting");

        // Перенаправляем на страницу успешной регистрации
        router.push("/login");
      } else {
        setRegisterError(
          response.message || "Произошла ошибка при регистрации"
        );
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error?.message?.includes("already exists")) {
        setRegisterError("Пользователь с таким email уже существует");
      } else {
        setRegisterError(error?.message || "Произошла ошибка при регистрации");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      title="Регистрация - Автошкола"
      description="Регистрация нового ученика в автошколе."
    >
      <div className="bg-gray-100 py-12">
        <div className="container-fluid">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Регистрация нового аккаунта
                </h1>
                <p className="text-gray-600">
                  Заполните форму для создания личного кабинета ученика
                </p>
              </div>

              {registerError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {registerError}
                </div>
              )}

              <Formik
                initialValues={{
                  first_name: "",
                  last_name: "",
                  email: "",
                  phone: "",
                  password: "",
                  confirmPassword: "",
                  termsAccepted: false,
                }}
                validationSchema={RegisterSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          htmlFor="first_name"
                          className="block text-gray-700 font-medium mb-2"
                        >
                          Имя
                        </label>
                        <Field
                          id="first_name"
                          name="first_name"
                          type="text"
                          placeholder="Иван"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.first_name && touched.first_name
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                        />
                        <ErrorMessage
                          name="first_name"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="last_name"
                          className="block text-gray-700 font-medium mb-2"
                        >
                          Фамилия
                        </label>
                        <Field
                          id="last_name"
                          name="last_name"
                          type="text"
                          placeholder="Иванов"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.last_name && touched.last_name
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                        />
                        <ErrorMessage
                          name="last_name"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="categoryClass"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Выберите категорию:{true}
                      </label>
                      <select
                        id="categoryClass"
                        name="categoryClass"
                        className={`rounded-xl w-full border-[1px] border-gray-300 ${
                          touched
                            ? "border-gray-300 focus:ring-blue-200"
                            : "border-gray-300 focus:outline-none"
                        }`}
                      >
                        <option value="categoryA">A</option>
                        <option value="categoryAone">A1</option>
                        <option value="categoryB">B</option>
                        <option value="categoryBone">B1</option>
                        <option value="categoryBCone">BC1</option>
                        <option value="categoryCone">C</option>
                        <option value="categoryCone">C1</option>
                      </select>
                    </div>

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

                    <div className="mb-4">
                      <label
                        htmlFor="phone"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Телефон
                      </label>
                      <Field
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+7 (775) 777-77-77"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.phone && touched.phone
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:ring-blue-200"
                        }`}
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-gray-700 font-medium mb-2"
                        >
                          Пароль
                        </label>
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

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-gray-700 font-medium mb-2"
                        >
                          Подтверждение пароля
                        </label>
                        <Field
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                            errors.confirmPassword && touched.confirmPassword
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-300 focus:ring-blue-200"
                          }`}
                        />
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <Field
                            id="termsAccepted"
                            name="termsAccepted"
                            type="checkbox"
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="termsAccepted"
                            className="text-gray-700"
                          >
                            Я согласен(а) с{" "}
                            <Link
                              href="/Terms"
                              className="text-red-600 hover:text-red-800"
                            >
                              условиями использования
                            </Link>{" "}
                            и{" "}
                            <Link
                              href="Privacy"
                              className="text-red-600 hover:text-red-800"
                            >
                              политикой конфиденциальности
                            </Link>
                          </label>
                          <ErrorMessage
                            name="termsAccepted"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                      </div>
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
                      Зарегистрироваться
                    </button>
                  </Form>
                )}
              </Formik>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Уже есть аккаунт?{" "}
                  <Link
                    href="/login"
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Войти
                  </Link>
                </p>
              </div>

              {/* <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-center text-gray-600 mb-4">
                  Или зарегистрироваться через
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

export default RegisterPage;
