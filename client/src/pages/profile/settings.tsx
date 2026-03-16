import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AuthAPI, User } from "../../services/api";
import { FaUser, FaKey, FaBell, FaShieldAlt, FaTrash, FaArrowLeft, FaCamera } from "react-icons/fa";

// Схема валидации для формы основной информации
const ProfileSchema = Yup.object().shape({
  firstName: Yup.string().min(2, "Минимум 2 символа").max(50, "Максимум 50 символов").required("Обязательное поле"),
  lastName: Yup.string().min(2, "Минимум 2 символа").max(50, "Максимум 50 символов").required("Обязательное поле"),
  email: Yup.string().email("Неверный формат email").required("Обязательное поле"),
  phone: Yup.string()
    .matches(/^(\+7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/, "Неверный формат телефона")
    .required("Обязательное поле"),
});

// Схема валидации для изменения пароля
const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Обязательное поле"),
  newPassword: Yup.string().min(6, "Минимум 6 символов").required("Обязательное поле"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Пароли должны совпадать")
    .required("Обязательное поле"),
});

const ProfileSettingsPage: React.FC = () => {
  const router = useRouter();
  const [activeSettingSection, setActiveSettingSection] = useState("personal");
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Разделы настроек
  const settingSections = [
    { id: "personal", label: "Личные данные", icon: <FaUser /> },
    { id: "security", label: "Безопасность", icon: <FaKey /> },
    { id: "notifications", label: "Уведомления", icon: <FaBell /> },
    { id: "privacy", label: "Конфиденциальность", icon: <FaShieldAlt /> },
    { id: "account", label: "Управление аккаунтом", icon: <FaTrash /> },
  ];

  // Загрузка данных пользователя при монтировании компонента
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await AuthAPI.getProfile();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setUpdateError("Ошибка загрузки профиля");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // Обработчик изменения фото профиля
  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      // Здесь будет логика загрузки фото
      console.log("Загрузка нового фото:", event.target.files[0]);
      setUpdateSuccess("Фото профиля успешно обновлено");
      setTimeout(() => setUpdateSuccess(null), 3000);
    }
  };

  // Обработчик отправки формы профиля
  const handleProfileSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setUpdateError(null);
      const response = await AuthAPI.updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
      });

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setUpdateSuccess("Профиль успешно обновлен");
        setTimeout(() => setUpdateSuccess(null), 3000);
      }
    } catch (error: any) {
      setUpdateError(error.message || "Ошибка при обновлении профиля");
    } finally {
      setSubmitting(false);
    }
  };

  // Обработчик изменения пароля
  const handlePasswordChange = (values: any, { setSubmitting, resetForm }: any) => {
    // Здесь будет логика изменения пароля
    console.log("Изменение пароля:", values);

    // Имитация запроса к серверу
    setTimeout(() => {
      // Проверка текущего пароля (в реальном приложении должна быть на сервере)
      if (values.currentPassword === "oldpassword") {
        setUpdateSuccess("Пароль успешно изменен");
        resetForm();
      } else {
        setUpdateError("Неверный текущий пароль");
      }
      setTimeout(() => {
        setUpdateSuccess(null);
        setUpdateError(null);
      }, 3000);
      setSubmitting(false);
    }, 1000);
  };

  // Рендер содержимого в зависимости от активной вкладки настроек
  const renderSettingsContent = () => {
    switch (activeSettingSection) {
      case "personal":
        return (
          <div>
            <h3 className="text-lg font-bold mb-4">Личные данные</h3>

            {/* Фото профиля */}
            <div className="mb-6">
              <p className="text-gray-700 mb-2">Фото профиля</p>
              <div className="flex items-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mr-6">
                  <Image src="/images/profile/avatar.jpg" alt="Аватар пользователя" fill className="object-cover" />
                  <label htmlFor="profilePhoto" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <FaCamera className="text-white text-xl" />
                  </label>
                </div>
                <div>
                  <input type="file" id="profilePhoto" accept="image/*" className="hidden" onChange={handleProfilePhotoChange} />
                  <label htmlFor="profilePhoto" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded cursor-pointer">
                    Изменить фото
                  </label>
                  <p className="text-gray-600 text-sm mt-1">JPG, PNG или GIF. Максимальный размер 2MB.</p>
                </div>
              </div>
            </div>

            {/* Форма личных данных */}
            {/* Уведомления */}
            {updateSuccess && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">{updateSuccess}</div>}
            {updateError && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{updateError}</div>}

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Загрузка данных...</div>
              </div>
            ) : (
              <Formik
                initialValues={{
                  firstName: user?.firstName || "",
                  lastName: user?.lastName || "",
                  email: user?.email || "",
                  phone: user?.phone || "",
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleProfileSubmit}
                enableReinitialize={true}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                          Имя
                        </label>
                        <Field id="firstName" name="firstName" type="text" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.firstName && touched.firstName ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} />
                        <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                          Фамилия
                        </label>
                        <Field id="lastName" name="lastName" type="text" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.lastName && touched.lastName ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} />
                        <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                        Email
                      </label>
                      <Field id="email" name="email" type="email" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email && touched.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                        Телефон
                      </label>
                      <Field id="phone" name="phone" type="tel" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.phone && touched.phone ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} />
                      <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                      {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
                    </button>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        );

      case "security":
        return (
          <div>
            <h3 className="text-lg font-bold mb-4">Безопасность</h3>

            {/* Форма изменения пароля */}
            <div className="mb-6">
              <h4 className="font-semibold mb-4">Изменение пароля</h4>
              <Formik
                initialValues={{
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                }}
                validationSchema={PasswordSchema}
                onSubmit={handlePasswordChange}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <div className="mb-4">
                      <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
                        Текущий пароль
                      </label>
                      <Field id="currentPassword" name="currentPassword" type="password" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.currentPassword && touched.currentPassword ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} />
                      <ErrorMessage name="currentPassword" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                        Новый пароль
                      </label>
                      <Field id="newPassword" name="newPassword" type="password" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.newPassword && touched.newPassword ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} />
                      <ErrorMessage name="newPassword" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="mb-6">
                      <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                        Подтверждение нового пароля
                      </label>
                      <Field id="confirmPassword" name="confirmPassword" type="password" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.confirmPassword && touched.confirmPassword ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} />
                      <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                      {isSubmitting ? "Сохранение..." : "Изменить пароль"}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>

            {/* Двухфакторная аутентификация */}
            <div className="mt-8 border-t pt-6">
              <h4 className="font-semibold mb-4">Двухфакторная аутентификация</h4>
              <p className="text-gray-600 mb-4">Добавьте дополнительный уровень безопасности, требуя не только пароль, но и код, отправленный на ваш телефон.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Включить двухфакторную аутентификацию</button>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div>
            <h3 className="text-lg font-bold mb-4">Настройки уведомлений</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Email уведомления</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input id="email-schedule" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" defaultChecked />
                    <label htmlFor="email-schedule" className="ml-2 block text-gray-700">
                      Изменения в расписании занятий
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="email-payments" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" defaultChecked />
                    <label htmlFor="email-payments" className="ml-2 block text-gray-700">
                      Напоминания об оплате
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="email-news" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" defaultChecked />
                    <label htmlFor="email-news" className="ml-2 block text-gray-700">
                      Новости и обновления автошколы
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="email-marketing" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                    <label htmlFor="email-marketing" className="ml-2 block text-gray-700">
                      Маркетинговые сообщения и специальные предложения
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">SMS уведомления</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input id="sms-schedule" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" defaultChecked />
                    <label htmlFor="sms-schedule" className="ml-2 block text-gray-700">
                      Напоминания о занятиях (за 24 часа)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="sms-changes" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" defaultChecked />
                    <label htmlFor="sms-changes" className="ml-2 block text-gray-700">
                      Срочные изменения в расписании
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Push-уведомления в браузере</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input id="push-all" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" defaultChecked />
                    <label htmlFor="push-all" className="ml-2 block text-gray-700">
                      Разрешить push-уведомления
                    </label>
                  </div>
                </div>
              </div>

              <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Сохранить настройки</button>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div>
            <h3 className="text-lg font-bold mb-4">Конфиденциальность</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Видимость профиля</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input id="public-profile" type="radio" name="profile-visibility" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300" />
                    <label htmlFor="public-profile" className="ml-2 block text-gray-700">
                      Публичный - другие ученики могут видеть мой профиль
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="private-profile" type="radio" name="profile-visibility" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300" defaultChecked />
                    <label htmlFor="private-profile" className="ml-2 block text-gray-700">
                      Приватный - только инструкторы и администрация могут видеть мой профиль
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Данные и файлы cookie</h4>
                <p className="text-gray-600 mb-4">Мы используем файлы cookie для улучшения работы сайта. Вы можете изменить настройки файлов cookie в любое время.</p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input id="essential-cookies" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" defaultChecked disabled />
                    <label htmlFor="essential-cookies" className="ml-2 block text-gray-700">
                      Необходимые файлы cookie (обязательно)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="analytics-cookies" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" defaultChecked />
                    <label htmlFor="analytics-cookies" className="ml-2 block text-gray-700">
                      Аналитические файлы cookie
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input id="marketing-cookies" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                    <label htmlFor="marketing-cookies" className="ml-2 block text-gray-700">
                      Маркетинговые файлы cookie
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Link href="/Privacy" className="text-red-600 hover:text-red-800 font-medium">
                  Ознакомиться с политикой конфиденциальности
                </Link>
              </div>

              <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Сохранить настройки</button>
            </div>
          </div>
        );

      case "account":
        return (
          <div>
            <h3 className="text-lg font-bold mb-4">Управление аккаунтом</h3>

            <div className="space-y-6">
              <div className="border-b pb-6">
                <h4 className="font-semibold mb-3">Экспорт данных</h4>
                <p className="text-gray-600 mb-4">Вы можете запросить копию всех ваших данных, которые хранятся в нашей системе.</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Запросить экспорт данных</button>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-red-600">Удаление аккаунта</h4>
                <p className="text-gray-600 mb-4">При удалении аккаунта все ваши личные данные будут безвозвратно уничтожены. Это действие нельзя отменить.</p>
                <button
                  className="border border-red-600 text-red-600 hover:bg-red-50 font-bold py-2 px-4 rounded-lg transition-colors"
                  onClick={() => {
                    console.log("Запрос на удаление аккаунта отправлен");
                  }}
                >
                  Удалить аккаунт
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout title="Настройки профиля - Автошкола" description="Управление личными данными, безопасностью и настройками уведомлений.">
      <div className="bg-gray-100 py-10">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Боковая навигация */}
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                    <Image src="/images/profile/avatar.jpg" alt="Аватар пользователя" fill className="object-cover" />
                  </div>
                  <h2 className="text-xl font-bold">{isLoading ? "Загрузка..." : user ? `${user.firstName} ${user.lastName}` : "Пользователь"}</h2>
                  <p className="text-gray-600">{user?.role === "student" ? "Ученик" : user?.role === "instructor" ? "Инструктор" : "Пользователь"}</p>
                </div>

                <nav className="space-y-3">
                  <button onClick={() => router.push("/profile")} className="w-full flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                    <FaArrowLeft className="mr-3" />
                    <span>Назад к личному кабинету</span>
                  </button>

                  <div className="border-t pt-3">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Разделы настроек</h3>
                    {settingSections.map((section) => (
                      <button key={section.id} onClick={() => setActiveSettingSection(section.id)} className={`w-full flex items-center p-2 rounded-lg transition text-sm ${activeSettingSection === section.id ? "bg-red-100 text-red-700" : "text-gray-600 hover:bg-gray-100"}`}>
                        <span className="mr-2">{section.icon}</span>
                        <span>{section.label}</span>
                      </button>
                    ))}
                  </div>
                </nav>
              </div>
            </div>

            {/* Основной контент */}
            <div className="md:w-3/4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Хлебные крошки */}
                <div className="flex items-center mb-4 text-sm text-gray-500">
                  <Link href="/profile" className="hover:text-red-600">
                    Личный кабинет
                  </Link>
                  <span className="mx-2">/</span>
                  <span className="text-gray-800">Настройки</span>
                </div>

                {/* Заголовок текущего раздела */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">{settingSections.find((section) => section.id === activeSettingSection)?.label || "Настройки профиля"}</h1>
                  <p className="text-gray-600">Управление личными данными, безопасностью и настройками уведомлений</p>
                </div>

                {/* Уведомления об успешном обновлении */}
                {updateSuccess && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{updateSuccess}</div>}

                {/* Уведомления об ошибке */}
                {updateError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{updateError}</div>}

                {/* Содержимое настроек */}
                {renderSettingsContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileSettingsPage;
