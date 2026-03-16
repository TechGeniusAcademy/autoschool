import React from "react";
import Layout from "@/components/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaFileAlt, FaIdCard, FaCamera, FaFileMedical, FaMoneyCheckAlt, FaFileContract, FaFilePdf, FaFileDownload, FaFileUpload, FaQuestionCircle } from "react-icons/fa";

// Типы для категорий документов
interface DocumentCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  items: DocumentItem[];
}

// Тип для каждого документа
interface DocumentItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  note?: string;
  sample?: string;
}

const DocumentsPage: React.FC = () => {
  const { t } = useLanguage();
  // Данные о документах
  const documentCategories: DocumentCategory[] = [
    {
      id: "basic",
      title: t("basic_documents"),
      icon: <FaIdCard className="text-red-600 text-2xl" />,
      description: t("basic_documents_desc"),
      items: [
        {
          id: "passport",
          title: t("passport_rf"),
          description: t("passport_rf_desc"),
          required: true,
          note: t("passport_rf_note"),
        },
        {
          id: "snils",
          title: t("snils_title"),
          description: t("snils_desc"),
          required: true,
        },
        {
          id: "photo",
          title: t("photos_title"),
          description: t("photos_desc"),
          required: true,
          note: t("photos_note"),
        },
        {
          id: "registration",
          title: t("registration_title"),
          description: t("registration_desc"),
          required: false,
        },
        {
          id: "teen",
          title: t("teen_title"),
          description: t("teen_desc"),
          required: false,
        },
      ],
    },
    {
      id: "medical",
      title: t("medical_documents"),
      icon: <FaFileMedical className="text-red-600 text-2xl" />,
      description: t("medical_documents_desc"),
      items: [
        {
          id: "medical_certificate",
          title: t("medical_certificate_title"),
          description: t("medical_certificate_desc"),
          required: true,
        },
        {
          id: "narco_certificate",
          title: t("narco_certificate_title"),
          description: t("narco_certificate_desc"),
          required: true,
        },
        {
          id: "psy_certificate",
          title: t("psy_certificate_title"),
          description: t("psy_certificate_desc"),
          required: true,
        },
      ],
    },
    {
      id: "education",
      title: t("education_documents"),
      icon: <FaFileAlt className="text-red-600 text-2xl" />,
      description: t("education_documents_desc"),
      items: [
        {
          id: "driving_license",
          title: t("driving_license_title"),
          description: t("driving_license_desc"),
          required: false,
          note: t("driving_license_note"),
        },
      ],
    },
    {
      id: "payment",
      title: t("payment_documents"),
      icon: <FaMoneyCheckAlt className="text-red-600 text-2xl" />,
      description: t("payment_documents_desc"),
      items: [
        {
          id: "payment_receipt",
          title: t("payment_receipt_title"),
          description: t("payment_receipt_desc"),
          required: false,
        },
      ],
    },
  ];

  // Этапы подачи документов
  const submissionSteps = [
    {
      id: 1,
      title: t("step_1_title"),
      description: t("step_1_desc"),
      icon: <FaFilePdf className="text-3xl text-red-600" />,
    },
    {
      id: 2,
      title: t("step_2_title"),
      description: t("step_2_desc"),
      icon: <FaFileUpload className="text-3xl text-red-600" />,
    },
    {
      id: 3,
      title: t("step_3_title"),
      description: t("step_3_desc"),
      icon: <FaFileDownload className="text-3xl text-red-600" />,
    },
    {
      id: 4,
      title: t("step_4_title"),
      description: t("step_4_desc"),
      icon: <FaFileContract className="text-3xl text-red-600" />,
    },
  ];

  // Часто задаваемые вопросы
  const documentFAQs = [
    {
      id: 1,
      question: t("faq_q1"),
      answer: t("faq_a1"),
    },
    {
      id: 2,
      question: t("faq_q2"),
      answer: t("faq_a2"),
    },
    {
      id: 3,
      question: t("faq_q3"),
      answer: t("faq_a3"),
    },
    {
      id: 4,
      question: t("faq_q4"),
      answer: t("faq_a4"),
    },
  ];

  return (
    <Layout title={t("documents_page_title")} description={t("documents_page_description")}>
      <div className="bg-gray-100 py-12">
        <div className="container-fluid">
          {/* Заголовок страницы */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("documents_for_school")}</h1>
            <p className="text-gray-600 max-w-3xl mx-auto">{t("documents_page_subtitle")}</p>
          </div>

          {/* Информационный блок */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-12">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
              <div className="relative w-full md:w-1/3 h-60">
                <Image src="/images/documents.jpg" alt={t("documents_image_alt")} fill className="object-cover rounded-lg" />
              </div>

              <div className="w-full md:w-2/3">
                <h2 className="text-2xl font-bold mb-4">{t("important_info")}</h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    <strong>{t("attention_note")}</strong> {t("attention_text")}
                  </p>
                  <p>{t("copies_requirement")}</p>
                  <p>
                    {t("questions_contact")}{" "}
                    <Link href="/contacts" className="text-red-600 hover:underline">
                      {t("contact_for_consultation")}
                    </Link>{" "}
                    {t("for_consultation")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Список требуемых документов */}
          <h2 className="text-2xl font-bold mb-6">{t("document_list")}</h2>

          <div className="space-y-8 mb-12">
            {documentCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    {category.icon}
                    <h3 className="text-xl font-bold ml-3">{category.title}</h3>
                  </div>
                  <p className="text-gray-600 mt-2">{category.description}</p>
                </div>

                <div className="p-6">
                  <div className="divide-y divide-gray-200">
                    {category.items.map((item) => (
                      <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold">{item.title}</h4>
                          <span className={`text-sm px-3 py-1 rounded-full ${item.required ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>{item.required ? t("required") : t("optional")}</span>
                        </div>
                        <p className="text-gray-700 mt-1">{item.description}</p>
                        {item.note && (
                          <div className="mt-2 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                            <strong>{t("note")}</strong> {item.note}
                          </div>
                        )}
                        {item.sample && (
                          <div className="mt-2">
                            <a href={item.sample} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center text-sm">
                              <FaFileDownload className="mr-1" /> {t("download_sample")}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Этапы подачи документов */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">{t("submission_steps")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {submissionSteps.map((step) => (
                <div key={step.id} className="border border-gray-200 rounded-lg p-6 relative">
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">{step.id}</div>
                  <div className="flex flex-col items-center text-center">
                    {step.icon}
                    <h3 className="text-lg font-bold mt-4 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Часто задаваемые вопросы */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">{t("documents_faq_title")}</h2>

            <div className="divide-y divide-gray-200">
              {documentFAQs.map((faq) => (
                <div key={faq.id} className="py-4">
                  <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-700 mb-3">{t("contact_help_text")}</p>
              <div className="flex justify-center space-x-4">
                <Link href="/contacts" className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                  {t("contacts")}
                </Link>
                <Link href="/faq" className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors">
                  {t("faq_page_title")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentsPage;
