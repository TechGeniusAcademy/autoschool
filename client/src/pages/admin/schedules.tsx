import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import { adminAPI, authUtils } from "../../utils/apiUtils";
import { API_BASE_URL } from "../../constants/api";

interface Group {
  id: number;
  name: string;
  description: string;
  instructor_name: string;
}

interface Schedule {
  id: number;
  group_id: number;
  group_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
  subject: string;
  instructor_name: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface IndividualLesson {
  id: number;
  student_id: number;
  student_name: string;
  instructor_id: number;
  instructor_name: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  location: string;
  subject: string;
  status: string;
}

const SchedulesManagement = () => {
  const router = useRouter();

  // Translation objects
  const daysOfWeekRus = {
    monday: "Понедельник",
    tuesday: "Вторник",
    wednesday: "Среда",
    thursday: "Четверг",
    friday: "Пятница",
    saturday: "Суббота",
    sunday: "Воскресенье",
  };

  const statusRus = {
    scheduled: "Запланировано",
    completed: "Завершено",
    cancelled: "Отменено",
  };

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [individualLessons, setIndividualLessons] = useState<IndividualLesson[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"schedules" | "lessons">("schedules");

  const [newSchedule, setNewSchedule] = useState({
    group_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    location: "",
    subject: "",
  });

  const [newLesson, setNewLesson] = useState({
    student_id: "",
    instructor_id: "",
    lesson_date: "",
    start_time: "",
    end_time: "",
    location: "",
    subject: "",
  });

  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    const isAuthenticated = await authUtils.requireAdmin();
    if (isAuthenticated) {
      loadData();
    }
  };

  const loadData = async () => {
    await Promise.all([
      loadSchedules(), // Теперь эта функция загружает и групповые, и индивидуальные занятия
      loadGroups(),
      loadStudents(),
      loadInstructors(),
    ]);
    setLoading(false);
  };

  const loadSchedules = async () => {
    try {
      // Загружаем групповые расписания
      const schedulesResult = await adminAPI.getAllSchedules();
      if (schedulesResult.success && schedulesResult.data) {
        setSchedules(schedulesResult.data);
      }

      // Загружаем индивидуальные занятия
      const lessonsResult = await adminAPI.getIndividualLessons();
      if (lessonsResult.success && lessonsResult.data) {
        setIndividualLessons(lessonsResult.data);
      }
    } catch (error) {
      console.error("Failed to load schedules:", error);
    }
  };

  const loadGroups = async () => {
    try {
      const result = await adminAPI.getAllGroups();
      if (result.success && result.data) {
        setGroups(result.data);
      }
    } catch (error) {
      console.error("Failed to load groups:", error);
    }
  };

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      } else {
        console.warn("Students data is not in expected format:", data);
        setStudents([]);
      }
    } catch (error) {
      console.error("Failed to load students:", error);
      setStudents([]);
    }
  };

  const loadInstructors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/instructor/list`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setInstructors(data.data);
      } else {
        console.warn("Instructors data is not in expected format:", data);
        setInstructors([]);
      }
    } catch (error) {
      console.error("Failed to load instructors:", error);
      setInstructors([]);
    }
  };

  const createSchedule = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newSchedule,
          group_id: parseInt(newSchedule.group_id),
        }),
      });

      if (response.ok) {
        setNewSchedule({
          group_id: "",
          day_of_week: "",
          start_time: "",
          end_time: "",
          location: "",
          subject: "",
        });
        setShowCreateSchedule(false);
        loadSchedules();
      } else {
        const error = await response.json();
        alert(error.message || "Не удалось создать расписание");
      }
    } catch (error) {
      console.error("Failed to create schedule:", error);
      alert("Не удалось создать расписание");
    }
  };

  const updateSchedule = async () => {
    if (!selectedSchedule) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/schedules/${selectedSchedule.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          group_id: selectedSchedule.group_id,
          day_of_week: selectedSchedule.day_of_week,
          start_time: selectedSchedule.start_time,
          end_time: selectedSchedule.end_time,
          location: selectedSchedule.location,
          subject: selectedSchedule.subject,
        }),
      });

      if (response.ok) {
        setShowEditSchedule(false);
        setSelectedSchedule(null);
        loadSchedules();
      } else {
        const error = await response.json();
        alert(error.message || "Не удалось обновить расписание");
      }
    } catch (error) {
      console.error("Failed to update schedule:", error);
      alert("Не удалось обновить расписание");
    }
  };

  const deleteSchedule = async (scheduleId: number) => {
    if (!confirm("Вы уверены, что хотите удалить это расписание?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        loadSchedules();
      } else {
        const error = await response.json();
        alert(error.message || "Не удалось удалить расписание");
      }
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      alert("Не удалось удалить расписание");
    }
  };

  const createIndividualLesson = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/schedules/individual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newLesson,
          student_id: parseInt(newLesson.student_id),
          instructor_id: parseInt(newLesson.instructor_id),
        }),
      });

      if (response.ok) {
        setNewLesson({
          student_id: "",
          instructor_id: "",
          lesson_date: "",
          start_time: "",
          end_time: "",
          location: "",
          subject: "",
        });
        setShowCreateLesson(false);
        loadSchedules();
      } else {
        const error = await response.json();
        alert(error.message || "Не удалось создать индивидуальный урок");
      }
    } catch (error) {
      console.error("Failed to create individual lesson:", error);
      alert("Не удалось создать индивидуальный урок");
    }
  };

  const updateLessonStatus = async (lessonId: number, status: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/schedules/individual/${lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        loadSchedules();
      } else {
        const error = await response.json();
        alert(error.message || "Не удалось обновить статус урока");
      }
    } catch (error) {
      console.error("Failed to update lesson status:", error);
      alert("Не удалось обновить статус урока");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex justify-center items-center">
          <div className="text-xl">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Управление расписанием</h1>
          <div className="space-x-2">
            <button onClick={() => setShowCreateSchedule(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Создать групповое расписание
            </button>
            <button onClick={() => setShowCreateLesson(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Создать индивидуальное занятие
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1">
            <button onClick={() => setActiveTab("schedules")} className={`px-4 py-2 rounded-lg ${activeTab === "schedules" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
              Групповые занятия ({schedules.length})
            </button>
            <button onClick={() => setActiveTab("lessons")} className={`px-4 py-2 rounded-lg ${activeTab === "lessons" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
              Индивидуальные занятия ({individualLessons.length})
            </button>
          </div>
        </div>

        {/* Group Schedules Tab */}
        {activeTab === "schedules" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Групповые занятия</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Группа</th>
                    <th className="px-4 py-2 text-left">День</th>
                    <th className="px-4 py-2 text-left">Время</th>
                    <th className="px-4 py-2 text-left">Предмет</th>
                    <th className="px-4 py-2 text-left">Место</th>
                    <th className="px-4 py-2 text-left">Инструктор</th>
                    <th className="px-4 py-2 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id} className="border-t">
                      <td className="px-4 py-2">{schedule.group_name}</td>
                      <td className="px-4 py-2">{daysOfWeekRus[schedule.day_of_week as keyof typeof daysOfWeekRus] || schedule.day_of_week}</td>
                      <td className="px-4 py-2">
                        {schedule.start_time} - {schedule.end_time}
                      </td>
                      <td className="px-4 py-2">{schedule.subject}</td>
                      <td className="px-4 py-2">{schedule.location}</td>
                      <td className="px-4 py-2">{schedule.instructor_name}</td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setShowEditSchedule(true);
                            }}
                            className="bg-yellow-600 text-white px-2 py-1 rounded text-sm hover:bg-yellow-700"
                          >
                            Изменить
                          </button>
                          <button onClick={() => deleteSchedule(schedule.id)} className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700">
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Individual Lessons Tab */}
        {activeTab === "lessons" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Индивидуальные занятия</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Студент</th>
                    <th className="px-4 py-2 text-left">Инструктор</th>
                    <th className="px-4 py-2 text-left">Дата</th>
                    <th className="px-4 py-2 text-left">Время</th>
                    <th className="px-4 py-2 text-left">Предмет</th>
                    <th className="px-4 py-2 text-left">Место</th>
                    <th className="px-4 py-2 text-left">Статус</th>
                    <th className="px-4 py-2 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {individualLessons.map((lesson) => (
                    <tr key={lesson.id} className="border-t">
                      <td className="px-4 py-2">{lesson.student_name}</td>
                      <td className="px-4 py-2">{lesson.instructor_name}</td>
                      <td className="px-4 py-2">{new Date(lesson.lesson_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        {lesson.start_time} - {lesson.end_time}
                      </td>
                      <td className="px-4 py-2">{lesson.subject}</td>
                      <td className="px-4 py-2">{lesson.location}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${lesson.status === "completed" ? "bg-green-100 text-green-800" : lesson.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{statusRus[lesson.status as keyof typeof statusRus] || lesson.status}</span>
                      </td>
                      <td className="px-4 py-2">
                        <select value={lesson.status} onChange={(e) => updateLessonStatus(lesson.id, e.target.value)} className="text-sm border rounded px-2 py-1">
                          <option value="scheduled">Запланировано</option>
                          <option value="completed">Завершено</option>
                          <option value="cancelled">Отменено</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Schedule Modal */}
        {showCreateSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Создать групповое расписание</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Группа</label>
                  <select
                    value={newSchedule.group_id}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        group_id: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Выберите группу</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">День недели</label>
                  <select
                    value={newSchedule.day_of_week}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        day_of_week: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Выберите день</option>
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {daysOfWeekRus[day as keyof typeof daysOfWeekRus]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Время начала</label>
                    <input
                      type="time"
                      value={newSchedule.start_time}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          start_time: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Время окончания</label>
                    <input
                      type="time"
                      value={newSchedule.end_time}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          end_time: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Предмет</label>
                  <input
                    type="text"
                    value={newSchedule.subject}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        subject: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Введите предмет"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Место проведения</label>
                  <input
                    type="text"
                    value={newSchedule.location}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        location: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Введите место проведения"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button onClick={() => setShowCreateSchedule(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Отмена
                </button>
                <button onClick={createSchedule} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Individual Lesson Modal */}
        {showCreateLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Создать индивидуальное занятие</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Студент</label>
                  <select value={newLesson.student_id} onChange={(e) => setNewLesson({ ...newLesson, student_id: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Выберите студента</option>
                    {Array.isArray(students) &&
                      students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.first_name} {student.last_name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Инструктор</label>
                  <select
                    value={newLesson.instructor_id}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        instructor_id: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Выберите инструктора</option>
                    {Array.isArray(instructors) &&
                      instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.name || `${instructor.first_name} ${instructor.last_name}`}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Дата</label>
                  <input
                    type="date"
                    value={newLesson.lesson_date}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        lesson_date: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Время начала</label>
                    <input
                      type="time"
                      value={newLesson.start_time}
                      onChange={(e) =>
                        setNewLesson({
                          ...newLesson,
                          start_time: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Время окончания</label>
                    <input type="time" value={newLesson.end_time} onChange={(e) => setNewLesson({ ...newLesson, end_time: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Предмет</label>
                  <input type="text" value={newLesson.subject} onChange={(e) => setNewLesson({ ...newLesson, subject: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Введите предмет" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Место проведения</label>
                  <input type="text" value={newLesson.location} onChange={(e) => setNewLesson({ ...newLesson, location: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Введите место проведения" />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button onClick={() => setShowCreateLesson(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Отмена
                </button>
                <button onClick={createIndividualLesson} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Schedule Modal */}
        {showEditSchedule && selectedSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Изменить расписание</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">День недели</label>
                  <select
                    value={selectedSchedule.day_of_week}
                    onChange={(e) =>
                      setSelectedSchedule({
                        ...selectedSchedule,
                        day_of_week: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {daysOfWeekRus[day as keyof typeof daysOfWeekRus]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Время начала</label>
                    <input
                      type="time"
                      value={selectedSchedule.start_time}
                      onChange={(e) =>
                        setSelectedSchedule({
                          ...selectedSchedule,
                          start_time: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Время окончания</label>
                    <input
                      type="time"
                      value={selectedSchedule.end_time}
                      onChange={(e) =>
                        setSelectedSchedule({
                          ...selectedSchedule,
                          end_time: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Предмет</label>
                  <input
                    type="text"
                    value={selectedSchedule.subject}
                    onChange={(e) =>
                      setSelectedSchedule({
                        ...selectedSchedule,
                        subject: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Место проведения</label>
                  <input
                    type="text"
                    value={selectedSchedule.location}
                    onChange={(e) =>
                      setSelectedSchedule({
                        ...selectedSchedule,
                        location: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button onClick={() => setShowEditSchedule(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Отмена
                </button>
                <button onClick={updateSchedule} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Обновить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SchedulesManagement;
