import React, { useState, useEffect, useCallback } from "react";
import { FaUserTie, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaPhone, FaEnvelope, FaStar } from "react-icons/fa";
import { AdminAPI } from "../../../services/api";
import { getAvatarUrl } from "../../../constants/api";

interface Instructor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  categories?: string[];
  experience?: string;
  description?: string;
  schedule?: string;
  rating: number;
  reviews_count: number;
  created_at: string;
}

interface InstructorFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  categories: string[];
  experience: string;
  description: string;
  schedule: string;
}

const AdminInstructors: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<InstructorFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    categories: [],
    experience: "",
    description: "",
    schedule: "",
  });

  const loadInstructors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminAPI.getInstructors();

      if (response.success && response.data) {
        setInstructors(response.data);
      } else {
        setError("Ошибка в ответе сервера");
        setInstructors([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки инструкторов:", error);
      setError((error as Error).message || "Неизвестная ошибка");
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstructors();
  }, [loadInstructors]);

  const filteredInstructors = instructors.filter((instructor) => {
    const searchString = `${instructor.firstName || ""} ${instructor.lastName || ""} ${instructor.email || ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, categories: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      categories: [],
      experience: "",
      description: "",
      schedule: "",
    });
    setEditingInstructor(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (instructor: Instructor) => {
    setFormData({
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      email: instructor.email,
      password: "", // Пароль не показываем при редактировании
      phone: instructor.phone || "",
      categories: instructor.categories || [],
      experience: instructor.experience || "",
      description: instructor.description || "",
      schedule: instructor.schedule || "",
    });
    setEditingInstructor(instructor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      resetForm();
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      let response;

      // Преобразуем данные формы в формат, ожидаемый сервером
      const serverData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        categories: formData.categories,
        experience: formData.experience,
        description: formData.description,
        schedule: formData.schedule,
        role: "instructor",
      };

      if (editingInstructor) {
        response = await AdminAPI.updateUser(editingInstructor.id, serverData);
      } else {
        response = await AdminAPI.createUser(serverData);
      }

      if (response.success) {
        await loadInstructors();
        closeModal();
      } else {
        setError("Ошибка при сохранении инструктора");
      }
    } catch (error) {
      console.error("Ошибка при сохранении инструктора:", error);
      setError((error as Error).message || "Неизвестная ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (instructorId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого инструктора?")) return;

    try {
      const response = await AdminAPI.deleteUser(instructorId);
      if (response.success) {
        await loadInstructors();
      } else {
        setError("Ошибка при удалении инструктора");
      }
    } catch (error) {
      console.error("Ошибка при удалении инструктора:", error);
      setError((error as Error).message || "Неизвестная ошибка");
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
        <div className="flex items-center space-x-2">
          <FaUserTie className="text-2xl text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Управление инструкторами</h2>
        </div>
        <button onClick={openCreateModal} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <FaPlus />
          <span>Добавить инструктора</span>
        </button>
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

      {/* Поиск */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input type="text" placeholder="Поиск инструкторов..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      {/* Список инструкторов */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Инструкторы ({filteredInstructors.length})</h3>
        </div>

        {filteredInstructors.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FaUserTie className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Нет инструкторов</h3>
            <p className="mt-1 text-sm text-gray-500">{instructors.length === 0 ? "Начните с добавления первого инструктора." : "Попробуйте изменить критерии поиска."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Инструктор</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Контакты</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Рейтинг</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Опыт</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstructors.map((instructor) => (
                  <tr key={instructor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {instructor.avatarUrl ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={getAvatarUrl(instructor.avatarUrl) || ""} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaUserTie className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{(instructor.firstName || "") + " " + (instructor.lastName || "")}</div>
                          <div className="text-sm text-gray-500">{instructor.schedule || "График не указан"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <FaEnvelope className="mr-2" />
                          {instructor.email || "Не указан"}
                        </div>
                        {instructor.phone && (
                          <div className="flex items-center">
                            <FaPhone className="mr-2" />
                            {instructor.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span>{instructor.rating || 0}</span>
                        <span className="ml-1 text-gray-400">({instructor.reviews_count || 0})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{instructor.experience || "Опыт не указан"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(instructor)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(instructor.id)} className="text-red-600 hover:text-red-900">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{editingInstructor ? "Редактировать инструктора" : "Добавить нового инструктора"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Фамилия *</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              {!editingInstructor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Пароль *</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!editingInstructor} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Опыт работы</label>
                <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="например: 5 лет" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">График работы</label>
                <input type="text" name="schedule" value={formData.schedule} onChange={handleInputChange} placeholder="например: Пн-Пт 9:00-18:00" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Отмена
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? "Сохранение..." : editingInstructor ? "Обновить инструктора" : "Создать инструктора"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInstructors;
