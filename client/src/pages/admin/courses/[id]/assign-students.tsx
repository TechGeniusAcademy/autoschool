import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../../../components/layout/Layout";
import TokenStorage from "../../../../utils/tokenStorage";
import { ArrowLeft, Search, UserPlus, Check, X } from "lucide-react";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  registration_date: string;
  is_active: boolean;
}

interface AssignedStudent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  enrollment_date: string;
}

const AssignStudents: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = TokenStorage.getToken();

      // Загружаем данные курса, всех студентов и уже назначенных студентов
      const [courseResponse, studentsResponse, assignedResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3001/api/admin/students", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:3001/api/courses/${id}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [courseData, studentsData, assignedData] = await Promise.all([courseResponse.json(), studentsResponse.json(), assignedResponse.json()]);

      if (courseData.success && courseData.course) {
        setCourseTitle(courseData.course.title);
      }

      if (studentsData.success) {
        setAllStudents(studentsData.students);
      }

      if (assignedData.success) {
        setAssignedStudents(assignedData.students || []);
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      alert("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) {
      alert("Выберите хотя бы одного студента");
      return;
    }

    setSubmitting(true);

    try {
      const token = TokenStorage.getToken();

      const response = await fetch(`http://localhost:3001/api/courses/${id}/assign-students`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_ids: selectedStudents,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedStudents([]); // Очищаем выбранных студентов
        await fetchData(); // Обновляем данные

        // Показываем уведомление с результатами
        alert(data.message || `Успешно назначено студентов: ${data.details?.success_count || 0}`);
        console.log("Результат назначения:", data);

        // Не перенаправляем сразу, остаемся на странице
        // router.push(`/admin/courses/${id}`);
      } else {
        console.error("Ошибка при назначении студентов:", data);

        // Показываем подробную информацию об ошибках
        let errorMessage = data.message || "Ошибка при назначении студентов";
        if (data.details && data.details.errors && data.details.errors.length > 0) {
          errorMessage += "\n\nДетали:\n" + data.details.errors.join("\n");
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Ошибка при назначении студентов:", error);
      alert("Ошибка при назначении студентов");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignStudent = async (studentId: number) => {
    try {
      const token = TokenStorage.getToken();

      const response = await fetch(`http://localhost:3001/api/courses/${id}/unassign-student/${studentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Обновляем списки студентов
        setAssignedStudents((prev) => prev.filter((s) => s.id !== studentId));
        alert("Студент отчислен с курса");
      } else {
        alert(data.message || "Ошибка при отчислении студента");
      }
    } catch (error) {
      console.error("Ошибка при отчислении студента:", error);
      alert("Ошибка при отчислении студента");
    }
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents((prev) => (prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]));
  };

  const isStudentAssigned = (studentId: number) => {
    return assignedStudents.some((student) => student.id === studentId);
  };

  const filteredStudents = allStudents.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const email = student.email.toLowerCase();

    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const availableStudents = filteredStudents.filter((student) => !isStudentAssigned(student.id) && student.is_active);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка студентов...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Заголовок */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Управление студентами</h1>
                <p className="mt-2 text-gray-600">Курс: {courseTitle}</p>
              </div>
              <button onClick={() => router.push(`/admin/courses/${id}`)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Назад к курсу
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Доступные студенты */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Доступные студенты ({availableStudents.length})</h3>

                {/* Поиск */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" placeholder="Поиск по имени или email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" />
                </div>

                {selectedStudents.length > 0 && (
                  <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <span className="text-sm text-blue-700">Выбрано студентов: {selectedStudents.length}</span>
                    <button onClick={handleAssignStudents} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Назначение...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Назначить на курс
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6">
                {availableStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Нет доступных студентов</h3>
                    <p className="mt-1 text-sm text-gray-500">{searchTerm ? "Попробуйте изменить поисковый запрос" : "Все активные студенты уже назначены на курс"}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableStudents.map((student) => (
                      <div key={student.id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedStudents.includes(student.id) ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`} onClick={() => toggleStudentSelection(student.id)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {student.first_name} {student.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">{student.email}</p>
                            {student.phone && <p className="text-sm text-gray-500">{student.phone}</p>}
                            <p className="text-xs text-gray-400">Регистрация: {new Date(student.registration_date).toLocaleDateString("ru-RU")}</p>
                          </div>
                          <div className="flex items-center">{selectedStudents.includes(student.id) && <Check className="w-5 h-5 text-blue-600" />}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Назначенные студенты */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Назначенные студенты ({assignedStudents.length})</h3>
              </div>

              <div className="p-6">
                {assignedStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Нет назначенных студентов</h3>
                    <p className="mt-1 text-sm text-gray-500">Назначьте студентов из списка слева</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedStudents.map((student) => (
                      <div key={student.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {student.first_name} {student.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">{student.email}</p>
                            <p className="text-xs text-gray-400">Зачислен: {new Date(student.enrollment_date).toLocaleDateString("ru-RU")}</p>
                          </div>
                          <button onClick={() => handleUnassignStudent(student.id)} className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Отчислить с курса">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssignStudents;
