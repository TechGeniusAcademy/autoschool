import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Image from "next/image";
import { TokenStorage } from "@/services/api";
import { API_BASE_URL } from "@/constants/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { FaStar, FaGraduationCap, FaCar, FaMotorcycle, FaTruck, FaBus } from "react-icons/fa";

interface Instructor {
  id: number;
  first_name: string;
  last_name: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  avatarUrl: string | null;
  categories: string[];
  experience: string;
  description: string;
  schedule: string;
  rating: number;
  reviews_count: number;
}

const InstructorsPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("all");
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRatings, setUserRatings] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    checkAuth();
    fetchInstructors();
  }, []);

  useEffect(() => {
    if (isAuthenticated && instructors.length > 0) {
      fetchUserRatings(instructors);
    }
  }, [isAuthenticated, instructors]);

  const checkAuth = () => {
    const token = TokenStorage.get();
    setIsAuthenticated(!!token);
  };

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/instructor/list`);
      const data = await response.json();

      if (data.success) {
        console.log("Загруженные инструкторы:", data.data);
        setInstructors(data.data);
      } else {
        setError(t("error_loading_instructors"));
      }
    } catch (error) {
      console.error(t("error_loading_instructors"), error);
      setError(t("error_loading_instructors"));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async (instructorsList: Instructor[]) => {
    if (!isAuthenticated) return;

    try {
      const token = TokenStorage.get();
      const ratingsPromises = instructorsList.map(async (instructor) => {
        const response = await fetch(`/api/instructor/my-rating/${instructor.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        return { instructorId: instructor.id, rating: data.data?.rating };
      });

      const results = await Promise.all(ratingsPromises);
      const ratingsMap: { [key: number]: number } = {};
      results.forEach(({ instructorId, rating }) => {
        if (rating) {
          ratingsMap[instructorId] = rating;
        }
      });
      setUserRatings(ratingsMap);
    } catch (error) {
      console.error("Ошибка загрузки оценок:", error);
    }
  };

  const handleRateInstructor = async (instructorId: number, rating: number) => {
    if (!isAuthenticated) {
      alert(t("login_required_for_rating"));
      return;
    }

    try {
      const token = TokenStorage.get();
      const response = await fetch("/api/instructor/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instructorId,
          rating,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUserRatings((prev) => ({
          ...prev,
          [instructorId]: rating,
        }));

        fetchInstructors();
        alert("Оценка успешно добавлена!");
      } else {
        alert("Ошибка при добавлении оценки: " + data.message);
      }
    } catch (error) {
      console.error("Ошибка добавления оценки:", error);
      alert(t("rating_error"));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case "A":
        return <FaMotorcycle className="text-blue-600" />;
      case "B":
        return <FaCar className="text-blue-600" />;
      case "C":
        return <FaTruck className="text-blue-600" />;
      case "D":
        return <FaBus className="text-blue-600" />;
      default:
        return <FaCar className="text-blue-600" />;
    }
  };

  const getInstructorAvatarUrl = (instructor: Instructor) => {
    // Проверяем оба варианта: avatarUrl (camelCase) и avatar_url (snake_case)
    const avatarUrl = instructor.avatarUrl || instructor.avatar_url;

    if (avatarUrl) {
      // Если URL начинается с /, это уже правильный путь
      if (avatarUrl.startsWith("/")) {
        return avatarUrl;
      }
      return avatarUrl;
    }
    return "/images/profile/default-instructor.jpg";
  };

  const filteredInstructors = instructors.filter((instructor) => activeFilter === "all" || (Array.isArray(instructor.categories) && instructor.categories.some((cat) => cat.toLowerCase().includes(activeFilter.toLowerCase()))));

  // Компонент звезд для рейтинга
  const StarRating = ({ rating, onRate, userRating }: { rating: number; onRate?: (rating: number) => void; userRating?: number }) => {
    const [hoveredStar, setHoveredStar] = useState(0);

    return (
      <div className="flex items-center flex-wrap">
        {/* Отображение среднего рейтинга */}
        <div className="flex mr-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar key={star} className={`w-4 h-4 ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`} />
          ))}
        </div>
        <span className="text-sm font-medium mr-2">{rating.toFixed(1)}</span>

        {/* Интерактивные звезды для оценки (только для авторизованных) */}
        {isAuthenticated && onRate && (
          <div className="flex ml-2 mt-1">
            <span className="text-xs text-gray-500 mr-1">{t("your_rating")}</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar key={star} className={`w-3 h-3 cursor-pointer transition-colors ${star <= (hoveredStar || userRating || 0) ? "text-yellow-400" : "text-gray-300"}`} onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} onClick={() => onRate(star)} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loading_instructors")}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchInstructors} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              {t("try_again")}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero секция */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{t("our_instructors")}</h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">{t("experienced_professionals_desc")}</p>
            </div>
          </div>
        </section>

        {/* Фильтры */}
        <section className="py-8 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => setActiveFilter("all")} className={`px-6 py-3 rounded-full font-medium transition-colors ${activeFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                {t("all_instructors")}
              </button>
              {["A", "B", "C", "D"].map((category) => (
                <button key={category} onClick={() => setActiveFilter(category)} className={`px-6 py-3 rounded-full font-medium transition-colors flex items-center ${activeFilter === category ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                  {getCategoryIcon(category)}
                  <span className="ml-2">
                    {t("category")} {category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Список инструкторов */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {filteredInstructors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-2">{t("instructors_not_found")}</h3>
                <p className="text-gray-600">{t("try_different_category")}</p>
                <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg" onClick={() => setActiveFilter("all")}>
                  {t("show_all_instructors")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredInstructors.map((instructor) => (
                  <div key={instructor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-64">
                      <Image
                        src={getInstructorAvatarUrl(instructor)}
                        alt={instructor.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== "/images/profile/default-instructor.jpg") {
                            target.src = "/images/profile/default-instructor.jpg";
                          }
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{instructor.name}</h3>

                      {/* Рейтинг с возможностью оценки */}
                      <div className="mb-4">
                        <StarRating rating={Number(instructor.rating)} userRating={userRatings[instructor.id]} onRate={(rating) => handleRateInstructor(instructor.id, rating)} />
                        <div className="text-sm text-gray-500 mt-1">
                          ({instructor.reviews_count} {t("reviews_count")})
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {Array.isArray(instructor.categories) &&
                          instructor.categories.map((category) => (
                            <span key={category} className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {getCategoryIcon(category)}
                              <span className="ml-1">
                                {t("category")} {category}
                              </span>
                            </span>
                          ))}
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <FaGraduationCap className="mr-2" />
                        <span>
                          {t("experience")}: {instructor.experience}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm">{instructor.description}</p>

                      <div className="text-sm text-gray-500 mb-4">
                        <strong>{t("schedule")}</strong>
                        <p>{instructor.schedule}</p>
                      </div>

                      {!isAuthenticated && (
                        <div className="text-center mt-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{t("login_to_rate_instructor")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default InstructorsPage;
