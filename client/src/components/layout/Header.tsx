import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { AuthAPI, TokenStorage, User } from "../../services/api";
import AvatarUpload from "../common/AvatarUpload";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { useLanguage } from "../../contexts/LanguageContext";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const checkAuth = async () => {
      const token = TokenStorage.get();
      if (token) {
        try {
          const response = await AuthAPI.verifyToken();
          if (response.success && response.data?.user) {
            console.log("Header: User data loaded:", response.data.user);
            setUser(response.data.user);
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          TokenStorage.remove();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleAvatarUpdate = (avatarUrl: string | null) => {
    console.log("Header: Avatar updated to:", avatarUrl);
    if (user) {
      setUser({
        ...user,
        avatarUrl: avatarUrl || undefined,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      TokenStorage.remove();
      setUser(null);
      router.push("/");
    }
  };

  // Функция для определения маршрута профиля в зависимости от роли
  const getProfileRoute = () => {
    if (!user) return "/profile";

    switch (user.role) {
      case "admin":
        return "/admin";
      case "instructor":
        return "/profile/instructor";
      case "student":
      default:
        return "/profile";
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Навигационные ссылки для переиспользования
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

  // Добавляем ссылку на админ панель для администраторов
  const adminNavLinks =
    user?.role === "admin"
      ? [...navLinks, { href: "/admin", label: t("admin_panel") }]
      : navLinks;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-fluid">
        <div className="flex justify-between items-center py-4">
          {/* Логотип */}
          <Link href="/" className="flex items-center">
            <div className="relative w-40 h-10">
              <Image
                src="/images/logo.png"
                alt="АвтоШкола"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center space-x-6">
            {adminNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium hover:text-red-600 transition ${
                  router.pathname === link.href
                    ? "text-red-600"
                    : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Кнопки для десктопа */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Переключатель языка */}
            <LanguageSwitcher />

            <a
              href="tel:+77282412100"
              className="flex items-center text-gray-700 hover:text-red-600"
            >
              <FaPhone className="mr-2" />
              <span className="font-medium">+7 (7282) 41-21-00</span>
            </a>
            <div className="flex space-x-2">
              {!isLoading &&
                (user ? (
                  <div className="flex items-center space-x-2">
                    <Link
                      href={getProfileRoute()}
                      className="flex items-center btn btn-outline"
                    >
                      <div className="mr-2">
                        <AvatarUpload
                          user={user}
                          onAvatarUpdate={handleAvatarUpdate}
                          size="small"
                        />
                      </div>
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                    >
                      {t("logout")}
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="btn btn-outline">
                    <FaUser className="mr-2" />
                    {t("login")}
                  </Link>
                ))}
            </div>
          </div>

          {/* Кнопка мобильного меню */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 shadow-lg animate-fade-in">
          <div className="container-fluid">
            <nav className="flex flex-col space-y-4">
              {adminNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md font-medium ${
                    router.pathname === link.href
                      ? "bg-red-100 text-red-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!isLoading &&
                (user ? (
                  <div className="space-y-2">
                    <Link
                      href={getProfileRoute()}
                      className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="mr-2">
                        <AvatarUpload
                          user={user}
                          onAvatarUpdate={handleAvatarUpdate}
                          size="small"
                        />
                      </div>
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("admin_panel")}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md flex items-center justify-center"
                    >
                      <FaSignOutAlt className="mr-2" />
                      {t("logout")}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center justify-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="mr-2" />
                    {t("login")}
                  </Link>
                ))}

              {/* Переключатель языка в мобильном меню */}
              <div className="px-4 py-2 flex items-center justify-center">
                <LanguageSwitcher />
              </div>

              <a
                href="tel:+74951234567"
                className="px-4 py-2 border border-gray-300 rounded-md flex items-center justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaPhone className="mr-2" />
                +7 (495) 123-45-67
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
