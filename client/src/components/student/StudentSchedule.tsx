import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { StudentAPI, GroupSchedule, IndividualLesson, ScheduleData } from "../../services/api";

const StudentSchedule = () => {
  const router = useRouter();
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"group" | "individual">("group");

  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    // Просто загружаем расписание, проверку авторизации делает сам API
    loadStudentSchedule();
  };

  const loadStudentSchedule = async () => {
    try {
      const result = await StudentAPI.getSchedule();
      if (result.success && result.data) {
        setScheduleData(result.data);
      } else {
        setError("Данные расписания недоступны.");
      }
    } catch (error) {
      console.error("Failed to load student schedule:", error);
      setError("Не удалось загрузить расписание.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDayTranslation = (dayOfWeek: string) => {
    const days: { [key: string]: string } = {
      monday: "Понедельник",
      tuesday: "Вторник",
      wednesday: "Среда",
      thursday: "Четверг",
      friday: "Пятница",
      saturday: "Суббота",
      sunday: "Воскресенье",
    };
    return days[dayOfWeek.toLowerCase()] || dayOfWeek;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusTranslation = (status: string) => {
    const statuses: { [key: string]: string } = {
      scheduled: "Запланировано",
      completed: "Завершено",
      cancelled: "Отменено",
      missed: "Пропущено",
    };
    return statuses[status.toLowerCase()] || status;
  };

  const sortedGroupSchedules =
    scheduleData?.groupSchedules.sort((a, b) => {
      const dayA = daysOrder.indexOf(a.day_of_week);
      const dayB = daysOrder.indexOf(b.day_of_week);
      if (dayA !== dayB) return dayA - dayB;
      return a.start_time.localeCompare(b.start_time);
    }) || [];

  const upcomingLessons =
    scheduleData?.individualLessons
      .filter((lesson) => {
        const lessonDate = new Date(lesson.lesson_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return lessonDate >= today && lesson.status !== "cancelled";
      })
      .sort((a, b) => new Date(a.lesson_date).getTime() - new Date(b.lesson_date).getTime()) || [];

  const pastLessons =
    scheduleData?.individualLessons
      .filter((lesson) => {
        const lessonDate = new Date(lesson.lesson_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return lessonDate < today || lesson.status === "completed";
      })
      .sort((a, b) => new Date(b.lesson_date).getTime() - new Date(a.lesson_date).getTime()) || [];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Моё расписание</h2>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Пожалуйста, обратитесь к администратору для назначения расписания.</p>
        </div>
      </div>
    );
  }

  if (!scheduleData || (scheduleData.groupSchedules.length === 0 && scheduleData.individualLessons.length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Моё расписание</h2>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600">Расписание пока не назначено.</p>
          <p className="text-sm text-gray-500 mt-2">Пожалуйста, обратитесь к администратору для назначения расписания.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Моё расписание</h2>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1">
          <button onClick={() => setActiveTab("group")} className={`px-4 py-2 rounded-lg ${activeTab === "group" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
            Групповые занятия ({sortedGroupSchedules.length})
          </button>
          <button onClick={() => setActiveTab("individual")} className={`px-4 py-2 rounded-lg ${activeTab === "individual" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
            Индивидуальные уроки ({scheduleData.individualLessons.length})
          </button>
        </div>
      </div>

      {/* Group Schedule Tab */}
      {activeTab === "group" && (
        <div>
          {sortedGroupSchedules.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 mb-3">Еженедельное расписание группы</h3>
              {sortedGroupSchedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-blue-900">{schedule.subject}</h4>
                      <p className="text-blue-700 text-sm">{schedule.group_name}</p>
                      <div className="mt-2 space-y-1 text-sm text-blue-600">
                        <p>
                          <span className="font-medium">День:</span> {getDayTranslation(schedule.day_of_week)}
                        </p>
                        <p>
                          <span className="font-medium">Время:</span> {schedule.start_time} - {schedule.end_time}
                        </p>
                        <p>
                          <span className="font-medium">Место:</span> {schedule.location}
                        </p>
                        <p>
                          <span className="font-medium">Инструктор:</span> {schedule.instructor_name} {schedule.instructor_surname}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs">Регулярное</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-600">Групповые занятия не запланированы.</p>
            </div>
          )}
        </div>
      )}

      {/* Individual Lessons Tab */}
      {activeTab === "individual" && (
        <div className="space-y-6">
          {/* Upcoming Lessons */}
          {upcomingLessons.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Предстоящие уроки</h3>
              <div className="space-y-3">
                {upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-green-900">{lesson.subject}</h4>
                        <div className="mt-2 space-y-1 text-sm text-green-600">
                          <p>
                            <span className="font-medium">Дата:</span> {formatDate(lesson.lesson_date)}
                          </p>
                          <p>
                            <span className="font-medium">Время:</span> {lesson.start_time} - {lesson.end_time}
                          </p>
                          <p>
                            <span className="font-medium">Место:</span> {lesson.location}
                          </p>
                          <p>
                            <span className="font-medium">Инструктор:</span> {lesson.instructor_name} {lesson.instructor_surname}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(lesson.status)}`}>{getStatusTranslation(lesson.status)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Lessons */}
          {pastLessons.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Прошедшие уроки</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {pastLessons.map((lesson) => (
                  <div key={lesson.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{lesson.subject}</h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Дата:</span> {formatDate(lesson.lesson_date)}
                          </p>
                          <p>
                            <span className="font-medium">Время:</span> {lesson.start_time} - {lesson.end_time}
                          </p>
                          <p>
                            <span className="font-medium">Место:</span> {lesson.location}
                          </p>
                          <p>
                            <span className="font-medium">Инструктор:</span> {lesson.instructor_name} {lesson.instructor_surname}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(lesson.status)}`}>{getStatusTranslation(lesson.status)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scheduleData.individualLessons.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600">Индивидуальные уроки не запланированы.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentSchedule;
