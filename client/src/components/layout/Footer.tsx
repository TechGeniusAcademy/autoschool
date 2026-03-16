import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaFacebookF, FaTwitter, FaInstagram, FaVk, FaTelegram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  // Массив ссылок для навигации
  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/courses", label: t("courses") },
    { href: "/prices", label: t("prices") },
    { href: "/instructors", label: t("instructors") },
    { href: "/documents", label: t("documents") },
    { href: "/reviews", label: t("reviews") },
    { href: "/blog", label: t("blog") },
    { href: "/faq", label: t("faq") },
    { href: "/contacts", label: t("contacts") },
  ];

  // Массив ссылок для информационных страниц
  const infoLinks = [
    { href: "/Privacy", label: t("privacy_policy") },
    { href: "/terms", label: t("terms_of_use") },
    { href: "/sitemap", label: t("sitemap") },
  ];

  return (
    <footer className="bg-gray-900 text-white pt-10 pb-6">
      <div className="container-fluid">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* О компании */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t("company_name")}</h3>
            <div className="text-2xl font-bold text-red-500 mb-4">{t("company_name")}</div>
            <p className="text-gray-400 mb-4">{t("about_company_experience")}</p>
            {/* <div className="flex space-x-3">
              <a href="https://facebook.com" className="text-gray-400 hover:text-white transition">
                <FaFacebookF />
              </a>
              <a href="https://vk.com" className="text-gray-400 hover:text-white transition">
                <FaVk />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white transition">
                <FaInstagram />
              </a>
              <a href="https://t.me/autoshkola" className="text-gray-400 hover:text-white transition">
                <FaTelegram />
              </a>
              <a href="https://wa.me/74951234567" className="text-gray-400 hover:text-white transition">
                <FaWhatsapp />
              </a>
            </div> */}
          </div>

          {/* Навигация */}
          <div>
            <h3 className="text-lg font-bold mb-4">Навигация</h3>
            <ul className="space-y-2">
              {navLinks.slice(0, 7).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t("contacts")}</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaPhone className="mt-1 mr-3 text-red-500" />
                <div>
                  <p className="font-medium">{t("phone")}</p>
                  <a href="tel:+74951234567" className="text-gray-400 hover:text-white transition">
                    {t("branch_west_phone")}
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <FaEnvelope className="mt-1 mr-3 text-red-500" />
                <div>
                  <p className="font-medium">Email:</p>
                  <a href="mailto:tld-autoschool@mail.ru" className="text-gray-400 hover:text-white transition">
                    tld-autoschool@mail.ru
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-red-500" />
                <div>
                  <p className="font-medium">{t("address")}</p>
                  <p className="text-gray-400">{t("central_office_address")}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Часы работы */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t("company_working_hours")}</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-400">{t("company_working_days_weekdays")}</span>
              </li>
            </ul>
            <div className="mt-4">
              <Link href="/contacts" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded inline-block transition">
                {t("contact_us")}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {currentYear} {t("footer_rights_reserved")}</p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4 text-sm">
                <li>
                  <Link href="/Privacy" className="text-gray-400 hover:text-white transition">
                    {t("footer_privacy_policy")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition">
                    {t("footer_terms_of_use")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
