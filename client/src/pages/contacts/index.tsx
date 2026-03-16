import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import Image from "next/image";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useLanguage } from "../../contexts/LanguageContext";
import { ContactAPI, CreateContactMessageData } from "../../services/api";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaVk, FaTelegram, FaWhatsapp, FaInstagram } from "react-icons/fa";

const ContactsPage: React.FC = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const ContactSchema = Yup.object().shape({
    name: Yup.string().min(2, t("name_too_short")).max(50, t("name_too_long")).required(t("required_field")),
    email: Yup.string().email(t("contact_invalid_email")).required(t("required_field")),
    phone: Yup.string()
      .matches(/^(\+7|8)[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/, t("contact_invalid_phone"))
      .required(t("required_field")),
    subject: Yup.string().required(t("required_field")),
    message: Yup.string().min(10, t("message_too_short")).required(t("required_field")),
    agreement: Yup.boolean().oneOf([true], t("agreement_required")).required(t("agreement_required")),
  });

  const handleSubmit = async (values: any, { resetForm, setSubmitting }: any) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage(null);

      console.log("Отправка сообщения:", values);

      // Подготавливаем данные для отправки
      const messageData: CreateContactMessageData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        subject: values.subject,
        message: values.message,
      };

      // Отправляем сообщение через API
      const response = await ContactAPI.sendMessage(messageData);

      if (response.success) {
        setSubmitMessage(t("success_message"));
        resetForm();
      } else {
        throw new Error(response.message || "Ошибка при отправке сообщения");
      }
    } catch (error: any) {
      console.error("Ошибка отправки сообщения:", error);
      setSubmitMessage(error.message || t("error_message"));
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const locations = [
    {
      id: 1,
      name: t("central_office"),
      address: t("central_office_address"),
      phone: t("central_office_phone"),
      email: t("central_office_email"),
      hours: t("working_hours"),
      image: "/images/office-1.jpg",
      coordinates: [55.75, 37.6],
    },
    {
      id: 2,
      name: t("branch_west"),
      address: t("branch_west_address"),
      phone: t("branch_west_phone"),
      email: t("branch_west_email"),
      hours: t("working_hours"),
      image: "/images/office-2.jpg",
      coordinates: [55.72, 37.48],
    },
    {
      id: 3,
      name: t("branch_east"),
      address: t("branch_east_address"),
      phone: t("branch_east_phone"),
      email: t("branch_east_email"),
      hours: t("working_hours"),
      image: "/images/office-3.jpg",
      coordinates: [55.78, 37.85],
    },
  ];

  const faqs = [
    {
      id: 1,
      question: t("contact_faq_q1"),
      answer: t("contact_faq_a1"),
    },
    {
      id: 2,
      question: t("contact_faq_q2"),
      answer: t("contact_faq_a2"),
    },
    {
      id: 3,
      question: t("contact_faq_q3"),
      answer: t("contact_faq_a3"),
    },
    {
      id: 4,
      question: t("contact_faq_q4"),
      answer: t("contact_faq_a4"),
    },
  ];

  return (
    <Layout title={t("contacts_page_title")} description={t("contacts_page_description")}>
      <div className="bg-gray-100 py-12">
        <div className="container-fluid">
          {/* Заголовок секции */}
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">{t("contacts_page_heading")}</h1>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-12">{t("contacts_page_subtitle")}</p>

          {/* Карта */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">{t("our_branches_map")}</h2>
            <div className="w-full h-96 bg-gray-300 rounded-lg mb-4 relative overflow-hidden">
              {/* Здесь будет интерактивная карта. В реальном проекте используйте Google Maps, Яндекс Карты или другие сервисы */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <iframe src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d705.127063495476!2d78.35732726968625!3d45.014606998191915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDXCsDAwJzUyLjYiTiA3OMKwMjEnMjguNyJF!5e0!3m2!1sru!2skz!4v1758632401098!5m2!1sru!2skz" loading="eager" className="max-w-full max-h-full" width={"100%"} height={"100%"}></iframe>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{t("map_navigation_note")}</p>
          </div>

          {/* !!! важно */}
          {/* Список филиалов !!!  исправить при деплое */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={location.image}
                    alt={location.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">{location.name}</h3>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="text-red-600 mt-1 mr-3" />
                      <p>{location.address}</p>
                    </div>

                    <div className="flex items-start">
                      <FaPhone className="text-red-600 mt-1 mr-3" />
                      <p>
                        <a
                          href={`tel:${location.phone.replace(/\D/g, "")}`}
                          className="hover:text-red-600"
                        >
                          {location.phone}
                        </a>
                      </p>
                    </div>

                    <div className="flex items-start">
                      <FaEnvelope className="text-red-600 mt-1 mr-3" />
                      <p>
                        <a
                          href={`mailto:${location.email}`}
                          className="hover:text-red-600"
                        >
                          {location.email}
                        </a>
                      </p>
                    </div>

                    <div className="flex items-start">
                      <FaClock className="text-red-600 mt-1 mr-3" />
                      <p className="text-sm">{location.hours}</p>
                    </div>
                  </div>

                  <button className="mt-6 w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-200">
                    Проложить маршрут
                  </button>
                </div>
              </div>
            ))}
          </div> */}

          {/* Раздел с формой и информацией */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Информация и соц.сети */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6">{t("contact_info")}</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <FaPhone className="text-red-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">{t("phone")}</p>
                      <a href="tel:+772822345678" className="text-lg font-bold hover:text-red-600">
                        {t("branch_east_phone")}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FaEnvelope className="text-red-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">{t("email_address")}</p>
                      <a href="mailto:tld-autoschool@mail.ru" className="hover:text-red-600">
                        {t("central_office_email")}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FaClock className="text-red-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">{t("working_hours")}</p>
                      <p>{t("company_working_days_weekdays")}</p>
                    </div>
                  </div>
                </div>
                {/* <div className="flex space-x-4">
                  <a href="https://vk.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition">
                    <FaVk size={20} />
                  </a>
                  <a href="https://telegram.org/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition">
                    <FaTelegram size={20} />
                  </a>
                  <a href="https://www.whatsapp.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition">
                    <FaWhatsapp size={20} />
                  </a>
                  <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white hover:bg-pink-700 transition">
                    <FaInstagram size={20} />
                  </a>
                </div> */}
              </div>

              {/* FAQ блок */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6">{t("faq_title")}</h2>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <h3 className="font-bold mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Форма обратной связи */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">{t("contact_form_title")}</h2>
              <p className="text-gray-600 mb-6">{t("contact_form_subtitle")}</p>

              {/* Сообщение о статусе отправки */}
              {submitMessage && <div className={`p-4 rounded-lg mb-6 ${submitMessage.includes("успешно") ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>{submitMessage}</div>}

              <Formik
                initialValues={{
                  name: "",
                  email: "",
                  phone: "",
                  subject: "",
                  message: "",
                  agreement: false,
                }}
                validationSchema={ContactSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                          {t("full_name")}
                        </label>
                        <Field type="text" id="name" name="name" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.name && touched.name ? "border-red-500" : "border-gray-300"}`} placeholder={t("name_placeholder")} />
                        <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                          {t("email_address")}
                        </label>
                        <Field type="email" id="email" name="email" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.email && touched.email ? "border-red-500" : "border-gray-300"}`} placeholder="example@mail.ru" />
                        <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                          {t("phone_number")}
                        </label>
                        <Field type="tel" id="phone" name="phone" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.phone && touched.phone ? "border-red-500" : "border-gray-300"}`} placeholder="+7 (___) ___-__-__" />
                        <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                          {t("message_subject")}
                        </label>
                        <Field as="select" id="subject" name="subject" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.subject && touched.subject ? "border-red-500" : "border-gray-300"}`}>
                          <option value="">{t("choose_subject")}</option>
                          <option value="training_question">{t("training_question")}</option>
                          <option value="cost_payment">{t("cost_payment")}</option>
                          <option value="schedule">{t("lesson_schedule")}</option>
                          <option value="documents">{t("documents")}</option>
                          <option value="cooperation">{t("cooperation")}</option>
                          <option value="other">{t("other")}</option>
                        </Field>
                        <ErrorMessage name="subject" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                        {t("contact_your_message")}
                      </label>
                      <Field as="textarea" id="message" name="message" rows={5} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.message && touched.message ? "border-red-500" : "border-gray-300"}`} placeholder={t("message_placeholder")} />
                      <ErrorMessage name="message" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <Field type="checkbox" id="agreement" name="agreement" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="agreement" className="text-gray-600">
                          {t("privacy_agreement_text")}{" "}
                          <a href="/Privacy" className="text-blue-600 hover:underline">
                            {t("privacy_policy")}
                          </a>{" "}
                          {t("personal_data_consent")}
                        </label>
                        <ErrorMessage name="agreement" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className={`font-bold py-3 px-6 rounded-lg transition-colors ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-white`}>
                      {isSubmitting ? t("sending") : t("contact_send_message")}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>

          {/* Сертификаты и документы */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">{t("licenses_certificates")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="relative h-40 mb-3">
                  <Image src="/license.jpg" alt={t("education_license")} fill className="object-contain" />
                </div>
                <h3 className="font-semibold text-center">{t("education_license")}</h3>
              </div>

              {/* <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="relative h-40 mb-3">
                  <Image src="/images/certificate-2.jpg" alt={t("gibdd_accreditation")} fill className="object-contain" />
                </div>
                <h3 className="font-semibold text-center">{t("gibdd_accreditation")}</h3>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="relative h-40 mb-3">
                  <Image src="/images/certificate-3.jpg" alt={t("iso_certificate")} fill className="object-contain" />
                </div>
                <h3 className="font-semibold text-center">{t("iso_certificate")}</h3>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="relative h-40 mb-3">
                  <Image src="/images/certificate-4.jpg" alt={t("best_school_award")} fill className="object-contain" />
                </div>
                <h3 className="font-semibold text-center">{t("best_school_award")}</h3>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactsPage;
