import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const ContactFormSection: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const courses = [
    { value: "category-a", label: "Категория A - Мотоциклы" },
    { value: "category-b", label: "Категория B - Легковые автомобили" },
    { value: "category-c", label: "Категория C - Грузовые автомобили" },
    { value: "category-d", label: "Категория D - Автобусы" },
  ];

  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      course: "",
      agreement: false,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "Минимум 2 символа")
        .max(50, "Максимум 50 символов")
        .required("Обязательное поле"),
      phone: Yup.string()
        .matches(
          /^(\+7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/,
          "Некорректный номер телефона"
        )
        .required("Обязательное поле"),
      course: Yup.string().required("Выберите курс"),
      agreement: Yup.boolean()
        .oneOf([true], "Необходимо согласие с условиями")
        .required("Обязательное поле"),
    }),
    onSubmit: (values, { resetForm }) => {
      // В реальном проекте здесь будет отправка формы на сервер
      console.log("Form submitted:", values);
      setIsSubmitted(true);
      resetForm();

      // Сбрасываем сообщение об успешной отправке через 5 секунд
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    },
  });

  return (
    <section className="py-16 bg-blue-50">
      <div className="container-fluid">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Левая часть с изображением */}
              <div className="relative h-64 md:h-auto bg-gray-300">
                {/* ПРИМЕЧАНИЕ: Необходимо добавить изображение, рекомендуемое разрешение 600x800px */}
                <div className="absolute inset-0 bg-blue-900 bg-opacity-70 flex flex-col justify-center p-8 text-white">
                  <h2 className="text-2xl font-bold mb-4">
                    Запишитесь на курс прямо сейчас
                  </h2>
                  <p className="mb-6">
                    Заполните форму, и наш менеджер свяжется с вами в ближайшее
                    время для подтверждения записи и ответит на все ваши
                    вопросы.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-300 mr-2">✓</span>
                      <span>Удобный график обучения</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-300 mr-2">✓</span>
                      <span>Опытные инструкторы</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-300 mr-2">✓</span>
                      <span>Современные автомобили</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-300 mr-2">✓</span>
                      <span>Онлайн-обучение теории</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Правая часть с формой */}
              <div className="p-8">
                <h3 className="text-xl font-bold mb-6">Форма быстрой записи</h3>

                {isSubmitted && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Спасибо за заявку! Мы свяжемся с вами в ближайшее время.
                  </div>
                )}

                <form onSubmit={formik.handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Ваше имя
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Иван Иванов"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formik.touched.name && formik.errors.name
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      {...formik.getFieldProps("name")}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className="text-red-500 text-sm mt-1">
                        {formik.errors.name}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="phone"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Номер телефона
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formik.touched.phone && formik.errors.phone
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      {...formik.getFieldProps("phone")}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <div className="text-red-500 text-sm mt-1">
                        {formik.errors.phone}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="course"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Выберите курс
                    </label>
                    <select
                      id="course"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formik.touched.course && formik.errors.course
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-200"
                      }`}
                      {...formik.getFieldProps("course")}
                    >
                      <option value="">Выберите категорию</option>
                      {courses.map((course) => (
                        <option key={course.value} value={course.value}>
                          {course.label}
                        </option>
                      ))}
                    </select>
                    {formik.touched.course && formik.errors.course && (
                      <div className="text-red-500 text-sm mt-1">
                        {formik.errors.course}
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="agreement"
                          name="agreement"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={formik.values.agreement}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="agreement" className="text-gray-600">
                          Я согласен с{" "}
                          <a
                            href="/Privacy"
                            className="text-blue-600 hover:underline"
                          >
                            политикой конфиденциальности
                          </a>{" "}
                          и даю согласие на обработку персональных данных
                        </label>
                        {formik.touched.agreement &&
                          formik.errors.agreement && (
                            <div className="text-red-500 text-sm mt-1">
                              {formik.errors.agreement}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    Оставить заявку
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;
