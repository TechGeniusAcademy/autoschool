import React, { useState, useEffect, useMemo } from "react";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUsers, FaCalendarAlt, FaUser } from "react-icons/fa";
import { AdminAPI } from "../../../services/api";

interface Group {
  id: number;
  name: string;
  description?: string;
  course_id: number | null;
  instructor_id: number | null;
  start_date: string | null;
  end_date?: string | null;
  max_students: number | null;
  current_students: number;
  status: "planning" | "active" | "completed" | "cancelled";
  created_at: string;
  instructor_name?: string;
  course_name?: string;
}

interface GroupFormData {
  name: string;
  description?: string;
  course_id: number;
  instructor_id: number;
  start_date: string;
  end_date?: string;
  max_students: number;
  status: "planning" | "active" | "completed" | "cancelled";
}

interface Course {
  id: number;
  name?: string;
  title?: string;
}

interface Instructor {
  id: number;
  full_name: string;
}

const AdminGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    description: "",
    course_id: 0,
    instructor_id: 0,
    start_date: "",
    end_date: "",
    max_students: 10,
    status: "planning",
  });

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Параллельная загрузка данных
      const [groupsRes, coursesRes, usersRes] = await Promise.all([AdminAPI.getGroups ? AdminAPI.getGroups() : Promise.resolve({ success: false, data: null }), AdminAPI.getAllCourses(), AdminAPI.getAllUsers()]);

      // Обрабатываем группы
      if (groupsRes.success && groupsRes.data) {
        // Сервер возвращает массив групп напрямую в data
        const groupsData = Array.isArray(groupsRes.data) ? groupsRes.data : [];
        setGroups(groupsData);
      }

      // Обрабатываем курсы
      if (coursesRes.success && coursesRes.data) {
        console.log("Courses data:", coursesRes.data);
        setCourses(coursesRes.data.courses || []);
      }

      // Обрабатываем инструкторов
      if (usersRes.success && usersRes.data) {
        const instructorUsers = usersRes.data.users
          .filter((user: any) => user.role === "instructor")
          .map((user: any) => {
            console.log("🔍 Instructor user data:", user);
            const firstName = user.first_name || "";
            const lastName = user.last_name || "";
            const fullName = `${firstName} ${lastName}`.trim();

            return {
              id: user.id,
              full_name: fullName || `Инструктор ID: ${user.id}`,
            };
          });
        console.log("✅ Processed instructors:", instructorUsers);
        setInstructors(instructorUsers);
      }
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      setError((error as Error).message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  // Мемоизированная фильтрация
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesSearch = group.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false || (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || group.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [groups, searchTerm, statusFilter]);

  // Мемоизированная пагинация
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGroups.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGroups, currentPage]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (!formData.name.trim()) {
        setError("Название группы обязательно");
        return;
      }

      if (!formData.course_id || !formData.instructor_id) {
        setError("Выберите курс и инструктора");
        return;
      }

      let response;
      if (editingGroup) {
        if (AdminAPI.updateGroup) {
          response = await AdminAPI.updateGroup(editingGroup.id, formData);
        } else {
          response = {
            success: false,
            message: "Метод обновления групп не реализован",
          };
        }
      } else {
        if (AdminAPI.createGroup) {
          response = await AdminAPI.createGroup(formData);
        } else {
          response = {
            success: false,
            message: "Метод создания групп не реализован",
          };
        }
      }

      if (response.success) {
        await loadData();
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

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      course_id: group.course_id || 0,
      instructor_id: group.instructor_id || 0,
      start_date: group.start_date ? group.start_date.split("T")[0] : "", // Проверяем на null
      end_date: group.end_date ? group.end_date.split("T")[0] : "",
      max_students: group.max_students || 10,
      status: group.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту группу?")) {
      return;
    }

    try {
      setError(null);
      let response;
      if (AdminAPI.deleteGroup) {
        response = await AdminAPI.deleteGroup(id);
      } else {
        response = {
          success: false,
          message: "Метод удаления групп не реализован",
        };
      }

      if (response.success) {
        await loadData();
      } else {
        setError(response.message || "Ошибка удаления");
      }
    } catch (error) {
      console.error("Ошибка удаления:", error);
      setError((error as Error).message || "Неизвестная ошибка");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      course_id: 0,
      instructor_id: 0,
      start_date: "",
      end_date: "",
      max_students: 10,
      status: "planning",
    });
    setEditingGroup(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
    setError(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "planning":
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Планируется</span>;
      case "active":
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Активна</span>;
      case "completed":
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Завершена</span>;
      case "cancelled":
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Отменена</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Неизвестно</span>;
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
        <h2 className="text-2xl font-bold text-gray-900">Управление группами</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <FaPlus />
          Создать группу
        </button>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Поиск по названию или описанию..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">Все статусы</option>
              <option value="planning">Планируются</option>
              <option value="active">Активные</option>
              <option value="completed">Завершенные</option>
              <option value="cancelled">Отмененные</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            Найдено: {filteredGroups.length} из {groups.length} групп
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

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <FaUsers className="text-3xl text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{groups.length}</div>
          <div className="text-sm text-gray-600">Всего групп</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl text-green-600 mb-2">●</div>
          <div className="text-2xl font-bold text-gray-900">{groups.filter((g) => g.status === "active").length}</div>
          <div className="text-sm text-gray-600">Активных</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl text-yellow-600 mb-2">●</div>
          <div className="text-2xl font-bold text-gray-900">{groups.filter((g) => g.status === "planning").length}</div>
          <div className="text-sm text-gray-600">Планируется</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl text-blue-600 mb-2">●</div>
          <div className="text-2xl font-bold text-gray-900">{groups.filter((g) => g.status === "completed").length}</div>
          <div className="text-sm text-gray-600">Завершено</div>
        </div>
      </div>

      {/* Таблица групп */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Группа</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Курс/Инструктор</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Участники</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Даты</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>Группы не найдены</p>
                    <p className="text-sm">Создайте первую группу или измените фильтры поиска</p>
                  </td>
                </tr>
              ) : (
                paginatedGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{group.name}</div>
                        {group.description && <div className="text-sm text-gray-500">{group.description}</div>}
                        <div className="text-xs text-gray-400">ID: {group.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{group.course_name || `Курс #${group.course_id}`}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FaUser className="mr-1" />
                        {group.instructor_name || `Инструктор #${group.instructor_id}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {group.current_students || 0} / {group.max_students}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${((group.current_students || 0) / (group.max_students || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(group.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {group.start_date ? new Date(group.start_date).toLocaleDateString("ru-RU") : "Не указана"}
                      </div>
                      {group.end_date && <div className="text-xs">до {new Date(group.end_date).toLocaleDateString("ru-RU")}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(group)} className="text-blue-600 hover:text-blue-900 mr-4">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(group.id)} className="text-red-600 hover:text-red-900">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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
                  Показано <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> до <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredGroups.length)}</span> из <span className="font-medium">{filteredGroups.length}</span> результатов
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
              <h3 className="text-lg font-medium text-gray-900 text-center">{editingGroup ? "Редактировать группу" : "Создать группу"}</h3>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Название группы</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Описание</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Курс</label>
                  <select
                    required
                    value={formData.course_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        course_id: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Выберите курс</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title || course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Инструктор</label>
                  <select
                    required
                    value={formData.instructor_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instructor_id: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Выберите инструктора</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Дата начала</label>
                    <input type="date" required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Дата окончания</label>
                    <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Макс. студентов</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      required
                      value={formData.max_students}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_students: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
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
                      <option value="planning">Планируется</option>
                      <option value="active">Активна</option>
                      <option value="completed">Завершена</option>
                      <option value="cancelled">Отменена</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                    Отмена
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {editingGroup ? "Сохранить" : "Создать"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGroups;
