import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { studentAPI, authUtils } from "../../utils/apiUtils";
import { getAvatarUrl } from "../../constants/api";
import { FaUsers, FaUser, FaClock, FaCalendarAlt, FaGraduationCap, FaChalkboardTeacher, FaEnvelope, FaUserGraduate } from "react-icons/fa";

interface Group {
  id: number;
  name: string;
  description: string;
  instructor_name: string;
  instructor_email: string;
  instructor_avatar_url?: string;
  course_title: string;
  course_description: string;
  start_date: string;
  end_date: string;
  max_students: number;
  total_students: number;
  enrollment_status: string;
  enrolled_at: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  enrolled_at: string;
}

interface GroupWithStudents extends Group {
  students: Student[];
}

const StudentGroup = () => {
  const router = useRouter();
  const [group, setGroup] = useState<GroupWithStudents | null>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    const isAuthenticated = await authUtils.requireAuth("student");
    if (isAuthenticated) {
      loadStudentGroup();
    }
  };

  const loadStudentGroup = async () => {
    try {
      const result = await studentAPI.getGroup();
      if (result.success && result.data) {
        setGroup(result.data);

        // Если у студента есть группа, загружаем расписание
        try {
          setScheduleLoading(true);
          const scheduleResult = await studentAPI.getGroupSchedule();
          if (scheduleResult.success && scheduleResult.data) {
            setSchedule(scheduleResult.data);
          }
        } catch (scheduleError) {
          console.error("Ошибка загрузки расписания:", scheduleError);
          setSchedule([]);
        } finally {
          setScheduleLoading(false);
        }
      } else {
        setError("Информация о группе недоступна.");
      }
    } catch (error) {
      console.error("Ошибка загрузки группы:", error);
      setError("Не удалось загрузить информацию о группе.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded mr-3"></div>
              <div className="h-8 bg-gray-300 rounded w-48"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-200 rounded-lg p-4">
                  <div className="h-5 bg-gray-300 rounded w-32 mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-28"></div>
                  <div className="h-4 bg-gray-300 rounded w-40 mt-2"></div>
                </div>
                <div className="bg-gray-200 rounded-lg p-4">
                  <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
                  <div className="h-2 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-gray-300 rounded w-48"></div>
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <FaUsers className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Проблема с загрузкой группы</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              loadStudentGroup();
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
            <FaUsers className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Вы не записаны в группу</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">Вы пока не состоите ни в одной учебной группе. Обратитесь к администратору для записи в группу.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">Что делать дальше?</h3>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>• Свяжитесь с администратором автошколы</li>
              <li>• Уточните доступные группы для записи</li>
              <li>• Проверьте статус вашего обучения</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Информация о группе */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center mb-4">
          <FaUsers className="text-blue-600 text-2xl mr-3" />
          <h2 className="text-2xl font-bold text-blue-900">Моя группа</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.name}</h3>
            <p className="text-gray-700 mb-4">{group.description}</p>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <FaGraduationCap className="mr-2 text-blue-500" />
                <span className="font-medium">Курс:</span>
                <span className="ml-1">{group.course_title}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <FaCalendarAlt className="mr-2 text-green-500" />
                <span className="font-medium">Дата записи:</span>
                <span className="ml-1">{new Date(group.enrolled_at).toLocaleDateString("ru-RU")}</span>
              </div>

              {group.start_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <FaClock className="mr-2 text-orange-500" />
                  <span className="font-medium">Период обучения:</span>
                  <span className="ml-1">
                    {new Date(group.start_date).toLocaleDateString("ru-RU")} -{group.end_date ? new Date(group.end_date).toLocaleDateString("ru-RU") : "Не указан"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center mb-3">
                <FaChalkboardTeacher className="text-blue-600 text-lg mr-2" />
                <h4 className="font-semibold text-gray-900">Инструктор</h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 mr-3 flex-shrink-0">
                    {group.instructor_avatar_url ? (
                      <img src={getAvatarUrl(group.instructor_avatar_url) || ""} alt={group.instructor_name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-600 text-sm" />
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{group.instructor_name}</span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-400 mr-2" />
                  <a href={`mailto:${group.instructor_email}`} className="text-blue-600 hover:text-blue-800 text-sm">
                    {group.instructor_email}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaUserGraduate className="text-green-600 text-lg mr-2" />
                  <span className="font-semibold text-gray-900">Участники</span>
                </div>
                <div className="text-sm text-gray-600">
                  {group.total_students}/{group.max_students}
                </div>
              </div>

              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((group.total_students / group.max_students) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {group.course_description && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-1">О курсе:</h5>
            <p className="text-sm text-blue-800">{group.course_description}</p>
          </div>
        )}
      </div>

      {/* Список участников */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <FaUsers className="text-blue-600 mr-2" />
            Участники группы
          </h3>
          <div className="text-sm text-gray-500">
            {group.students.length} {group.students.length === 1 ? "участник" : "участников"}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {group.students.map((student, index) => (
            <div key={student.id} className="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <div className="relative">
                {student.avatar_url ? (
                  <img src={getAvatarUrl(student.avatar_url) || undefined} alt={`${student.first_name} ${student.last_name}`} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {student.first_name.charAt(0)}
                    {student.last_name.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {student.first_name} {student.last_name}
                </p>
                <p className="text-sm text-gray-500 truncate">{student.email}</p>
                <p className="text-xs text-gray-400">с {new Date(student.enrolled_at).toLocaleDateString("ru-RU")}</p>
              </div>

              {index === 0 && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Старший</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {group.students.length === 0 && (
          <div className="text-center py-8">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">В группе пока нет других участников</p>
          </div>
        )}
      </div>

      {/* Расписание группы */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <FaCalendarAlt className="text-green-600 mr-2" />
            Расписание группы
          </h3>
          {!scheduleLoading && schedule.length > 0 && (
            <div className="text-sm text-gray-500">
              {schedule.length} {schedule.length === 1 ? "занятие" : "занятий"} в неделю
            </div>
          )}
        </div>

        {scheduleLoading ? (
          <div className="animate-pulse">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <div className="h-5 bg-gray-300 rounded w-24 mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-28 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        ) : schedule.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schedule.map((lesson, index) => {
              const dayNames: Record<string, string> = {
                monday: "Понедельник",
                tuesday: "Вторник",
                wednesday: "Среда",
                thursday: "Четверг",
                friday: "Пятница",
                saturday: "Суббота",
                sunday: "Воскресенье",
              };

              const typeColors: Record<string, string> = {
                theory: "bg-blue-100 text-blue-800 border-blue-200",
                practice: "bg-green-100 text-green-800 border-green-200",
                exam: "bg-red-100 text-red-800 border-red-200",
              };

              const typeNames: Record<string, string> = {
                theory: "Теория",
                practice: "Практика",
                exam: "Экзамен",
              };

              return (
                <div key={index} className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors duration-200 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{dayNames[lesson.day_of_week] || lesson.day_of_week}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${typeColors[lesson.lesson_type] || "bg-gray-100 text-gray-800 border-gray-200"}`}>{typeNames[lesson.lesson_type] || lesson.lesson_type}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 text-blue-500" />
                      <span>
                        {lesson.start_time.substring(0, 5)} - {lesson.end_time.substring(0, 5)}
                      </span>
                    </div>

                    {lesson.classroom && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaChalkboardTeacher className="mr-2 text-green-500" />
                        <span>{lesson.classroom}</span>
                      </div>
                    )}

                    {lesson.notes && <div className="text-xs text-gray-500 mt-2 p-2 bg-white rounded border">{lesson.notes}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Расписание для группы пока не составлено</p>
            <p className="text-sm text-gray-500 mt-2">Обратитесь к администратору для получения информации о расписании</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGroup;
