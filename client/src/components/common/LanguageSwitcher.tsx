import React from "react";
import { useLanguage, Language } from "../../contexts/LanguageContext";

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
      <button
        onClick={() => handleLanguageChange("ru")}
        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
          language === "ru"
            ? "bg-red-600 text-white"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        РУС
      </button>
      <button
        onClick={() => handleLanguageChange("kz")}
        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
          language === "kz"
            ? "bg-red-600 text-white"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        ҚАЗ
      </button>
    </div>
  );
};

export default LanguageSwitcher;
