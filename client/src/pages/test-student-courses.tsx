import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";

const TestStudentCourses: React.FC = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🔑 Token from localStorage:", token);

        if (!token || token === "null" || token === "undefined") {
          setError("No valid token found");
          setLoading(false);
          return;
        }

        console.log("📡 Making request to /api/student/courses");
        const response = await fetch("http://localhost:3001/api/student/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📊 Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Courses data:", data);
          setCourses(data.data || []);
        } else {
          const errorData = await response.json();
          console.error("❌ Error response:", errorData);
          setError(`Error: ${response.status} - ${errorData.message || response.statusText}`);
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
        setError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Тест API студентских курсов</h1>

          {loading && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-center mt-4">Загрузка курсов...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-medium">Ошибка:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Найдено курсов: {courses.length}</h2>

              {courses.length === 0 ? (
                <p className="text-gray-500">У вас пока нет назначенных курсов.</p>
              ) : (
                <div className="space-y-4">
                  {courses.map((course: any) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-lg">{course.title}</h3>
                      <p className="text-gray-600">{course.description}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Инструктор: {course.instructor_name}</p>
                        <p>Прогресс: {course.progress}%</p>
                        <p>
                          Уроков: {course.completed_lessons}/{course.total_lessons}
                        </p>
                        <p>Статус: {course.status}</p>
                        <p>Дата записи: {new Date(course.enrollment_date).toLocaleDateString("ru-RU")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TestStudentCourses;
