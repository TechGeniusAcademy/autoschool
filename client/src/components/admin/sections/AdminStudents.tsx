import React, { useState, useEffect, useMemo } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaUser, FaUsers } from "react-icons/fa";
import { AdminAPI, User, Course } from "../../../services/api";
import { getAvatarUrl } from "../../../constants/api";

interface Student {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  createdAt: string;
  role: "student";
  course_id?: number;
  progress?: number;
  status?: "active" | "inactive" | "graduated";
}

interface Group {
  id: number;
  name: string;
  description: string;
  max_students: number;
  student_count: number;
}

interface StudentFormData {
  email: string;
  full_name: string;
  phone: string;
  password?: string;
  course_id: number;
  status?: "active" | "inactive" | "graduated";
}

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    email: "",
    full_name: "",
    phone: "",
    password: "",
    course_id: 0,
    status: "active",
  });

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Состояния для модального окна назначения курса
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Состояния для модального окна назначения в группу
  const [showAssignGroupModal, setShowAssignGroupModal] = useState(false);
  const [selectedStudentForGroup, setSelectedStudentForGroup] = useState<Student | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminAPI.getAllUsers();
      if (response.success && response.data) {
        // Фильтруем только студентов и преобразуем AdminUser в Student
        const studentUsers = response.data.users
          .filter((user: User) => user.role === "student")
          .map((user: User) => ({
            ...user,
            full_name: `${user.firstName} ${user.lastName}`.trim(),
            avatar_url: user.avatarUrl,
            createdAt: user.createdAt,
            status: "active" as const, // По умолчанию активный статус
          }));
        setStudents(studentUsers as Student[]);
      } else {
        setError(response.message || "Ошибка загрузки студентов");
      }
    } catch (error) {
      console.error("Ошибка загрузки студентов:", error);
      setError((error as Error).message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      setLoadingGroups(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("http://localhost:3001/api/admin/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.data)) {
        setGroups(data.data);
      } else {
        console.error("Ошибка загрузки групп:", data);
        setGroups([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки групп:", error);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Мемоизированная фильтрация
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false || student.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false || student.phone?.includes(searchTerm) || false;

      const matchesStatus = statusFilter === "all" || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  // Мемоизированная пагинация
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      let response;
      if (editingStudent) {
        // Разделяем full_name на first_name и last_name
        const nameParts = formData.full_name.trim().split(" ");
        const first_name = nameParts[0] || "";
        const last_name = nameParts.slice(1).join(" ") || "";

        response = await AdminAPI.updateUser(editingStudent.id, {
          first_name,
          last_name,
          email: formData.email,
          phone: formData.phone,
          role: "student",
        });
      } else {
        if (!formData.password) {
          setError("Пароль обязателен для нового пользователя");
          return;
        }

        // Разделяем full_name на first_name и last_name
        const nameParts = formData.full_name.trim().split(" ");
        const first_name = nameParts[0] || "";
        const last_name = nameParts.slice(1).join(" ") || "";

        response = await AdminAPI.createUser({
          first_name,
          last_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: "student",
        });
      }
      if (response.success) {
        await loadStudents();
        setShowModal(false);
        resetForm();
      } else {
        setError(response.message || "Ошибка сохранения");
      }
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      setError((error as Error).message || "Неизвестная ошибка");
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      email: student.email || "",
      full_name: student.full_name || "",
      phone: student.phone || "",
      course_id: student.course_id || 0,
      status: student.status || "active",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого студента?")) {
      return;
    }

    try {
      setError(null);
      const response = await AdminAPI.deleteUser(id);
      if (response.success) {
        await loadStudents();
      } else {
        setError(response.message || "Ошибка удаления");
      }
    } catch (error) {
      console.error("Ошибка удаления:", error);
      setError((error as Error).message || "Неизвестная ошибка");
    }
  };

  const handleAssignCourse = (student: Student) => {
    setSelectedStudent(student);
    setShowAssignModal(true);
  };

  const handleAssignGroup = (student: Student) => {
    setSelectedStudentForGroup(student);
    setShowAssignGroupModal(true);
    loadGroups(); // Загружаем группы при открытии модального окна
  };

  const assignStudentToGroup = async (groupId: number) => {
    if (!selectedStudentForGroup) return;

    try {
      setError(null);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`http://localhost:3001/api/admin/groups/${groupId}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ student_id: selectedStudentForGroup.id }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowAssignGroupModal(false);
        setSelectedStudentForGroup(null);
        alert(data.message || "Студент успешно добавлен в группу");
      } else {
        alert(data.message || "Ошибка при назначении студента в группу");
      }
    } catch (error) {
      console.error("Ошибка при назначении студента в группу:", error);
      alert("Ошибка при назначении студента в группу");
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      full_name: "",
      phone: "",
      password: "",
      course_id: 0,
      status: "active",
    });
    setEditingStudent(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
    setError(null);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Активен</span>;
      case "inactive":
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Неактивен</span>;
      case "graduated":
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Выпускник</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Не указан</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Управление студентами</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <FaPlus />
          Добавить студента
        </button>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Поиск по имени, email или телефону..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
              <option value="graduated">Выпускники</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            Найдено: {filteredStudents.length} из {students.length} студентов
          </div>
        </div>
      </div>

      {/* Ошибки */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button onClick={() => setError(null)} className="text-sm font-medium text-red-800 hover:text-red-600">
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Таблица студентов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Студент</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Контакты</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата регистрации</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {student.avatar_url ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={getAvatarUrl(student.avatar_url) || ""} alt={student.full_name || "Аватар студента"} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaUser className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.full_name || "Не указано"}</div>
                        <div className="text-sm text-gray-500">ID: {student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email || "Не указан"}</div>
                    <div className="text-sm text-gray-500">{student.phone || "Не указан"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(student.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.createdAt ? new Date(student.createdAt).toLocaleDateString("ru-RU") : "Не указана"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleAssignCourse(student)} className="text-green-600 hover:text-green-900 mr-4" title="Назначить курс">
                      <FaPlus />
                    </button>
                    <button onClick={() => handleAssignGroup(student)} className="text-purple-600 hover:text-purple-900 mr-4" title="Назначить в группу">
                      <FaUsers />
                    </button>
                    <button onClick={() => handleEdit(student)} className="text-blue-600 hover:text-blue-900 mr-4">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-900">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                Предыдущая
              </button>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                Следующая
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Показано <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> до <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> из <span className="font-medium">{filteredStudents.length}</span> результатов
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage ? "z-10 bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                    ›
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center">{editingStudent ? "Редактировать студента" : "Добавить студента"}</h3>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ФИО</label>
                  <input type="text" required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Телефон</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>

                {!editingStudent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Пароль</label>
                    <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Статус</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Активен</option>
                    <option value="inactive">Неактивен</option>
                    <option value="graduated">Выпускник</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                    Отмена
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {editingStudent ? "Сохранить" : "Создать"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно назначения курса */}
      {showAssignModal && (
        <AssignCourseModal
          student={selectedStudent}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedStudent(null);
          }}
          onAssign={async (courseId: number) => {
            if (!selectedStudent) return;

            try {
              setError(null);
              const response = await AdminAPI.assignCourseToStudent(courseId, selectedStudent.id);

              if (response.success) {
                setShowAssignModal(false);
                setSelectedStudent(null);
                // Можно добавить уведомление об успешном назначении
                alert("Курс успешно назначен студенту!");
              } else {
                setError(response.message || "Ошибка при назначении курса");
              }
            } catch (error) {
              console.error("Ошибка назначения курса:", error);
              setError((error as Error).message || "Неизвестная ошибка");
            }
          }}
        />
      )}

      {/* Модальное окно назначения в группу */}
      {showAssignGroupModal && (
        <AssignGroupModal
          student={selectedStudentForGroup}
          groups={groups}
          loading={loadingGroups}
          onClose={() => {
            setShowAssignGroupModal(false);
            setSelectedStudentForGroup(null);
          }}
          onAssign={assignStudentToGroup}
        />
      )}
    </div>
  );
};

// Компонент модального окна назначения курса
const AssignCourseModal: React.FC<{
  student: Student | null;
  onClose: () => void;
  onAssign: (courseId: number) => void;
}> = ({ student, onClose, onAssign }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminAPI.getAllCourses();

      if (response.success && response.data) {
        // API возвращает { courses, pagination }
        const coursesData = response.data.courses || response.data;
        setCourses(coursesData.filter((course: Course) => course.is_active));
      } else {
        setError(response.message || "Ошибка загрузки курсов");
      }
    } catch (error) {
      console.error("Ошибка загрузки курсов:", error);
      setError((error as Error).message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (selectedCourseId) {
      onAssign(selectedCourseId);
    }
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 text-center">Назначить курс студенту</h3>
          <p className="text-sm text-gray-600 text-center mt-2">Студент: {student.full_name}</p>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Загрузка курсов...</div>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Нет доступных курсов</div>
              </div>
            ) : (
              <div>
                <label htmlFor="course-select" className="block text-sm font-medium text-gray-700">
                  Выберите курс
                </label>
                <select id="course-select" value={selectedCourseId || ""} onChange={(e) => setSelectedCourseId(Number(e.target.value) || null)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="">-- Выберите курс --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} - {course.price}₸
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                Отмена
              </button>
              <button type="button" onClick={handleAssign} disabled={!selectedCourseId || loading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                Назначить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент модального окна назначения в группу
const AssignGroupModal: React.FC<{
  student: Student | null;
  groups: Group[];
  loading: boolean;
  onClose: () => void;
  onAssign: (groupId: number) => void;
}> = ({ student, groups, loading, onClose, onAssign }) => {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const handleAssign = () => {
    if (selectedGroupId) {
      onAssign(selectedGroupId);
    }
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 text-center">Назначить студента в группу</h3>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-4">
              Студент: <span className="font-medium">{student.full_name}</span>
            </p>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Выберите группу:</label>
                {groups.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">Нет доступных групп</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                    {groups.map((group) => (
                      <label key={group.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                        <input type="radio" name="group" value={group.id} checked={selectedGroupId === group.id} onChange={() => setSelectedGroupId(group.id)} className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300" />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900">{group.name}</div>
                          <div className="text-xs text-gray-500">{group.description}</div>
                          <div className="text-xs text-gray-400">
                            Студентов: {group.student_count} / {group.max_students || "без лимита"}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                Отмена
              </button>
              <button type="button" onClick={handleAssign} disabled={!selectedGroupId || loading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed">
                Назначить в группу
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
