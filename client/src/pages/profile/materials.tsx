import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaUser,
  FaCalendarAlt,
  FaGraduationCap,
  FaFileAlt,
  FaClipboardList,
  FaUserCog,
  FaSignOutAlt,
  FaDownload,
  FaBookOpen,
  FaVideo,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaSearch,
  FaPlayCircle,
  FaStar,
  FaRegStar,
  FaEye,
  FaFolder,
  FaFolderOpen,
  FaChevronLeft,
} from "react-icons/fa";

// Тип для представления навигационных вкладок
interface NavTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Тип для представления учебного материала
interface Material {
  id: number;
  title: string;
  description: string;
  category: string;
  type: "video" | "pdf" | "doc" | "excel" | "link" | "folder";
  fileSize?: string;
  dateAdded: string;
  views: number;
  rating: number;
  url: string;
  thumbnail?: string;
  duration?: string;
  isNew?: boolean;
  isFavorite?: boolean;
  children?: Material[];
}

const ProfileMaterialsPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("materials");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [expandedFolders, setExpandedFolders] = useState<number[]>([]);

  // Навигационные вкладки
  const navTabs: NavTab[] = [
    { id: "dashboard", label: "Дашборд", icon: <FaUser /> },
    { id: "schedule", label: "Расписание", icon: <FaCalendarAlt /> },
    { id: "progress", label: "Прогресс", icon: <FaGraduationCap /> },
    { id: "materials", label: "Материалы", icon: <FaFileAlt /> },
    { id: "tests", label: "Тесты", icon: <FaClipboardList /> },
    // { id: "settings", label: "Настройки", icon: <FaUserCog /> },
  ];

  // Категории материалов
  const categories = [
    "Все",
    "ПДД",
    "Теория",
    "Практика",
    "Экзамены",
    "Дополнительно",
  ];

  // Моковые данные материалов
  const materials: Material[] = [
    {
      id: 1,
      title: "Основы ПДД для начинающих водителей",
      description: "Полный курс видеоуроков по правилам дорожного движения",
      category: "ПДД",
      type: "folder",
      dateAdded: "01.09.2023",
      views: 256,
      rating: 4.8,
      url: "#",
      thumbnail: "/images/materials/pdd-basics.jpg",
      children: [
        {
          id: 101,
          title: "Урок 1: Основные положения ПДД",
          description: "Базовые правила и термины, используемые в ПДД",
          category: "ПДД",
          type: "video",
          fileSize: "350 MB",
          dateAdded: "01.09.2023",
          views: 220,
          rating: 4.7,
          url: "#",
          thumbnail: "/images/materials/pdd-lesson1.jpg",
          duration: "45:20",
        },
        {
          id: 102,
          title: "Урок 2: Дорожные знаки",
          description: "Классификация и подробный разбор всех дорожных знаков",
          category: "ПДД",
          type: "video",
          fileSize: "420 MB",
          dateAdded: "05.09.2023",
          views: 185,
          rating: 4.9,
          url: "#",
          thumbnail: "/images/materials/pdd-lesson2.jpg",
          duration: "50:15",
        },
        {
          id: 103,
          title: "Таблица дорожных знаков",
          description: "Справочная таблица со всеми дорожными знаками",
          category: "ПДД",
          type: "pdf",
          fileSize: "5.2 MB",
          dateAdded: "05.09.2023",
          views: 310,
          rating: 4.6,
          url: "#",
        },
      ],
    },
    {
      id: 2,
      title: "Контраварийное вождение",
      description: "Техники безопасного вождения в сложных ситуациях",
      category: "Практика",
      type: "video",
      fileSize: "720 MB",
      dateAdded: "10.09.2023",
      views: 145,
      rating: 4.9,
      url: "#",
      thumbnail: "/images/materials/defensive-driving.jpg",
      duration: "1:15:30",
      isNew: true,
    },
    {
      id: 3,
      title: "Правила ПДД 2023",
      description:
        "Актуальная редакция правил дорожного движения с комментариями",
      category: "ПДД",
      type: "pdf",
      fileSize: "12.5 MB",
      dateAdded: "01.08.2023",
      views: 630,
      rating: 4.7,
      url: "#",
      isFavorite: true,
    },
    {
      id: 4,
      title: "Экзаменационные билеты спецЦОН",
      description:
        "Полный комплект билетов для подготовки к теоретическому экзамену",
      category: "Экзамены",
      type: "pdf",
      fileSize: "8.7 MB",
      dateAdded: "15.08.2023",
      views: 720,
      rating: 4.8,
      url: "#",
    },
    {
      id: 5,
      title: "Техническое устройство автомобиля",
      description: "Основные узлы и агрегаты автомобиля, принципы работы",
      category: "Теория",
      type: "folder",
      dateAdded: "20.08.2023",
      views: 230,
      rating: 4.6,
      url: "#",
      thumbnail: "/images/materials/car-tech.jpg",
      children: [
        {
          id: 501,
          title: "Двигатель и его системы",
          description:
            "Устройство и принцип работы двигателя внутреннего сгорания",
          category: "Теория",
          type: "video",
          fileSize: "410 MB",
          dateAdded: "20.08.2023",
          views: 190,
          rating: 4.5,
          url: "#",
          thumbnail: "/images/materials/engine.jpg",
          duration: "52:40",
        },
        {
          id: 502,
          title: "Трансмиссия автомобиля",
          description:
            "Устройство коробки передач, сцепления и других элементов трансмиссии",
          category: "Теория",
          type: "video",
          fileSize: "380 MB",
          dateAdded: "22.08.2023",
          views: 170,
          rating: 4.6,
          url: "#",
          thumbnail: "/images/materials/transmission.jpg",
          duration: "48:15",
        },
      ],
    },
    {
      id: 6,
      title: "Первая помощь при ДТП",
      description: "Инструкция по оказанию первой помощи пострадавшим в ДТП",
      category: "Дополнительно",
      type: "pdf",
      fileSize: "6.3 MB",
      dateAdded: "25.08.2023",
      views: 320,
      rating: 4.9,
      url: "#",
      isNew: true,
    },
    {
      id: 7,
      title: "Шпаргалка для сдачи экзамена",
      description:
        "Краткое изложение основных правил и нюансов для сдачи экзамена",
      category: "Экзамены",
      type: "doc",
      fileSize: "2.1 MB",
      dateAdded: "01.09.2023",
      views: 450,
      rating: 4.7,
      url: "#",
      isFavorite: true,
    },
    {
      id: 8,
      title: "Учебный план категории B",
      description: "Подробный план обучения для получения прав категории B",
      category: "Дополнительно",
      type: "excel",
      fileSize: "1.8 MB",
      dateAdded: "05.09.2023",
      views: 180,
      rating: 4.5,
      url: "#",
    },
  ];

  // Получение иконки для типа материала
  const getTypeIcon = (type: Material["type"]) => {
    switch (type) {
      case "video":
        return <FaVideo className="text-blue-500" />;
      case "pdf":
        return <FaFilePdf className="text-red-500" />;
      case "doc":
        return <FaFileWord className="text-blue-700" />;
      case "excel":
        return <FaFileExcel className="text-green-600" />;
      case "link":
        return <FaBookOpen className="text-purple-500" />;
      case "folder":
        return <FaFolder className="text-yellow-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  // Получение значка для типа материала
  const getTypeBadge = (type: Material["type"]) => {
    switch (type) {
      case "video":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          label: "Видео",
        };
      case "pdf":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          label: "PDF",
        };
      case "doc":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          label: "DOC",
        };
      case "excel":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          label: "Excel",
        };
      case "link":
        return {
          bg: "bg-purple-100",
          text: "text-purple-800",
          label: "Ссылка",
        };
      case "folder":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          label: "Папка",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          label: "Файл",
        };
    }
  };

  // Фильтрация материалов
  const filteredMaterials = materials.filter((material) => {
    let matchesCategory = true;
    let matchesSearch = true;

    if (selectedCategory && selectedCategory !== "Все") {
      matchesCategory = material.category === selectedCategory;
    }

    if (searchQuery) {
      matchesSearch =
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return matchesCategory && matchesSearch;
  });

  // Обработчик просмотра материала
  const handleViewMaterial = (material: Material) => {
    if (material.type === "folder") {
      toggleFolder(material.id);
    } else {
      setSelectedMaterial(material);
    }
  };

  // Обработчик переключения папки
  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  // Обработчик закрытия просмотра материала
  const handleCloseMaterial = () => {
    setSelectedMaterial(null);
  };

  // Обработчик добавления в избранное
  const handleToggleFavorite = (material: Material) => {
    console.log(`Toggling favorite for: ${material.title}`);
    // В реальном приложении здесь будет запрос к API
  };

  // Рендер материалов в виде списка
  const renderMaterialsList = (items: Material[], level = 0) => {
    return items.map((material) => (
      <React.Fragment key={material.id}>
        <div
          className={`border rounded-lg overflow-hidden hover:shadow-md transition mb-4 ${
            level > 0 ? "ml-8" : ""
          }`}
        >
          <div className="flex flex-col md:flex-row">
            {material.thumbnail && (
              <div className="md:w-1/4 relative h-40 md:h-auto">
                <Image
                  src={material.thumbnail}
                  alt={material.title}
                  fill
                  className="object-cover"
                />
                {material.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <FaPlayCircle className="text-white text-4xl" />
                  </div>
                )}
              </div>
            )}
            <div
              className={`p-4 ${material.thumbnail ? "md:w-3/4" : "w-full"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span className="mr-2">
                    {material.type === "folder" ? (
                      expandedFolders.includes(material.id) ? (
                        <FaFolderOpen className="text-yellow-500 text-xl" />
                      ) : (
                        <FaFolder className="text-yellow-500 text-xl" />
                      )
                    ) : (
                      getTypeIcon(material.type)
                    )}
                  </span>
                  <h3 className="font-bold text-lg">{material.title}</h3>
                </div>
                {material.isFavorite && (
                  <FaStar className="text-yellow-500 ml-2 flex-shrink-0" />
                )}
              </div>
              <p className="text-gray-600 text-sm mb-3">
                {material.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800`}
                >
                  {material.category}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    getTypeBadge(material.type).bg
                  } ${getTypeBadge(material.type).text}`}
                >
                  {getTypeBadge(material.type).label}
                </span>
                {material.fileSize && (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                    {material.fileSize}
                  </span>
                )}
                {material.duration && (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                    {material.duration}
                  </span>
                )}
                {material.isNew && (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                    Новое
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="flex items-center mr-4">
                    <FaEye className="mr-1" />
                    <span>{material.views}</span>
                  </div>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-500 mr-1" />
                    <span>{material.rating}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleFavorite(material)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    {material.isFavorite ? (
                      <FaStar className="text-yellow-500" />
                    ) : (
                      <FaRegStar className="text-gray-400" />
                    )}
                  </button>
                  {material.type === "folder" ? (
                    <button
                      onClick={() => toggleFolder(material.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg transition-colors text-sm"
                    >
                      {expandedFolders.includes(material.id)
                        ? "Свернуть"
                        : "Раскрыть"}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleViewMaterial(material)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg transition-colors text-sm"
                      >
                        {material.type === "video" ? "Смотреть" : "Открыть"}
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-lg transition-colors text-sm flex items-center">
                        <FaDownload className="mr-1" />
                        Скачать
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {material.type === "folder" &&
          expandedFolders.includes(material.id) &&
          material.children &&
          renderMaterialsList(material.children, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <Layout
      title="Учебные материалы - Автошкола"
      description="Доступ к учебным материалам, видеоурокам и документам для обучения в автошколе."
    >
      <div className="bg-gray-100 py-10">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Боковая навигация */}
            <div className="md:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src="/images/profile/avatar.jpg"
                      alt="Аватар пользователя"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-bold">Александр Иванов</h2>
                  <p className="text-gray-600">Ученик</p>
                </div>

                <nav className="space-y-1">
                  {navTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id !== "materials") {
                          router.push(
                            tab.id === "dashboard"
                              ? "/profile"
                              : `/profile/${tab.id}`
                          );
                        } else {
                          setActiveTab(tab.id);
                        }
                      }}
                      className={`w-full flex items-center p-3 rounded-lg transition ${
                        activeTab === tab.id
                          ? "bg-red-100 text-red-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <button
                      className="w-full flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                      onClick={() => router.push("/login")}
                    >
                      <FaSignOutAlt className="mr-3" />
                      <span>Выйти</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>

            {/* Основной контент */}
            <div className="md:w-3/4">
              {selectedMaterial ? (
                // Просмотр материала
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <button
                    onClick={handleCloseMaterial}
                    className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
                  >
                    <FaChevronLeft className="mr-1" />
                    Назад к списку материалов
                  </button>

                  <h2 className="text-xl font-bold mb-2">
                    {selectedMaterial.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {selectedMaterial.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                      {selectedMaterial.category}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        getTypeBadge(selectedMaterial.type).bg
                      } ${getTypeBadge(selectedMaterial.type).text}`}
                    >
                      {getTypeBadge(selectedMaterial.type).label}
                    </span>
                    {selectedMaterial.fileSize && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                        {selectedMaterial.fileSize}
                      </span>
                    )}
                    {selectedMaterial.duration && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                        {selectedMaterial.duration}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center mb-6">
                    <div className="flex items-center mr-4">
                      <FaEye className="text-gray-600 mr-1" />
                      <span className="text-gray-600">
                        {selectedMaterial.views} просмотров
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500 mr-1" />
                      <span className="text-gray-600">
                        {selectedMaterial.rating} рейтинг
                      </span>
                    </div>
                  </div>

                  {selectedMaterial.type === "video" &&
                    selectedMaterial.thumbnail && (
                      <div className="relative w-full h-[400px] mb-6">
                        <Image
                          src={selectedMaterial.thumbnail}
                          alt={selectedMaterial.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                          <button className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 flex items-center justify-center">
                            <FaPlayCircle size={32} />
                          </button>
                        </div>
                      </div>
                    )}

                  {selectedMaterial.type === "pdf" && (
                    <div className="bg-gray-100 p-4 rounded-lg text-center mb-6">
                      <FaFilePdf className="text-red-500 text-5xl mx-auto mb-2" />
                      <p className="text-gray-600">
                        PDF-документ готов к просмотру
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center">
                      <FaDownload className="mr-2" />
                      Скачать
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(selectedMaterial)}
                      className="border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      {selectedMaterial.isFavorite ? (
                        <>
                          <FaStar className="text-yellow-500 mr-2" />В избранном
                        </>
                      ) : (
                        <>
                          <FaRegStar className="mr-2" />
                          Добавить в избранное
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Список материалов
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-6">Учебные материалы</h2>

                  {/* Фильтры и поиск */}
                  <div className="flex flex-col md:flex-row justify-between mb-6">
                    <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() =>
                            setSelectedCategory(
                              category === "Все" ? null : category
                            )
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            (category === "Все" && !selectedCategory) ||
                            category === selectedCategory
                              ? "bg-red-600 text-white"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Поиск материалов..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Избранные материалы */}
                  {materials.some((m) => m.isFavorite) && (
                    <div className="mb-6">
                      <h3 className="font-bold text-lg mb-4">Избранное</h3>
                      <div className="space-y-4">
                        {materials
                          .filter((m) => m.isFavorite)
                          .map((material) => (
                            <div
                              key={material.id}
                              className="border rounded-lg p-4 hover:shadow-md transition"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                  <span className="mr-2">
                                    {getTypeIcon(material.type)}
                                  </span>
                                  <div>
                                    <h4 className="font-medium">
                                      {material.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                      {material.category}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleViewMaterial(material)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg transition-colors text-sm"
                                >
                                  {material.type === "video"
                                    ? "Смотреть"
                                    : "Открыть"}
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Новые материалы */}
                  {materials.some((m) => m.isNew) && (
                    <div className="mb-6">
                      <h3 className="font-bold text-lg mb-4">
                        Новые материалы
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materials
                          .filter((m) => m.isNew)
                          .map((material) => (
                            <div
                              key={material.id}
                              className="border rounded-lg overflow-hidden hover:shadow-md transition"
                            >
                              {material.thumbnail && (
                                <div className="relative h-40">
                                  <Image
                                    src={material.thumbnail}
                                    alt={material.title}
                                    fill
                                    className="object-cover"
                                  />
                                  {material.type === "video" && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                      <FaPlayCircle className="text-white text-4xl" />
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="p-4">
                                <h4 className="font-bold">{material.title}</h4>
                                <p className="text-gray-600 text-sm mb-2">
                                  {material.description}
                                </p>
                                <button
                                  onClick={() => handleViewMaterial(material)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg transition-colors text-sm"
                                >
                                  {material.type === "video"
                                    ? "Смотреть"
                                    : "Открыть"}
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Список всех материалов */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">Все материалы</h3>
                    {filteredMaterials.length > 0 ? (
                      <div className="space-y-4">
                        {renderMaterialsList(filteredMaterials)}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">
                        Материалы не найдены. Измените параметры поиска.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileMaterialsPage;
