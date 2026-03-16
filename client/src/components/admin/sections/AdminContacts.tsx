import React, { useState, useEffect } from "react";
import { FaEnvelope, FaEnvelopeOpen, FaPhone, FaUser, FaCalendar, FaReply, FaTrash, FaSearch, FaFilter, FaEye, FaCheck, FaTimes, FaExclamationCircle } from "react-icons/fa";
import { API_BASE_URL } from "@/constants/api";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  admin_response?: string;
  responded_at?: string;
  responded_by?: number;
  created_at: string;
  updated_at: string;
}

interface ContactStats {
  total: number;
  unread: number;
  responded: number;
  pending: number;
}

const AdminContacts: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, unread, read, responded
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    unread: 0,
    responded: 0,
    pending: 0,
  });

  // Пагинация
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Сообщения об успехе/ошибке
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [pagination.page, filterStatus, searchTerm]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        filter: filterStatus,
        search: searchTerm,
      });

      const response = await fetch(`${API_BASE_URL}/contact?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Contact messages response:", result);

        if (result.success && result.data) {
          setMessages(result.data.messages || []);
          if (result.data.pagination) {
            setPagination((prev) => ({
              ...prev,
              total: result.data.pagination.total,
              totalPages: result.data.pagination.totalPages,
            }));
          }
        }
      } else {
        throw new Error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      showMessage("error", "Ошибка при загрузке сообщений");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/contact/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const statsData = result.data;
          setStats({
            total: statsData.total || 0,
            unread: statsData.unread || 0,
            responded: statsData.responded || 0,
            pending: (statsData.total || 0) - (statsData.responded || 0),
          });
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/contact/${messageId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Обновляем состояние сообщения
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg)));
        fetchStats(); // Обновляем статистику
        showMessage("success", "Сообщение отмечено как прочитанное");
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      showMessage("error", "Ошибка при обновлении статуса сообщения");
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!confirm("Вы уверены, что хотите удалить это сообщение?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/contact/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        fetchStats();
        showMessage("success", "Сообщение удалено");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      showMessage("error", "Ошибка при удалении сообщения");
    }
  };

  const sendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/contact/${selectedMessage.id}/respond`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_response: responseText,
        }),
      });

      if (response.ok) {
        // Обновляем сообщение в состоянии
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === selectedMessage.id
              ? {
                  ...msg,
                  admin_response: responseText,
                  responded_at: new Date().toISOString(),
                  is_read: true,
                }
              : msg
          )
        );

        setShowResponseModal(false);
        setResponseText("");
        setSelectedMessage(null);
        fetchStats();
        showMessage("success", "Ответ отправлен");
      }
    } catch (error) {
      console.error("Error sending response:", error);
      showMessage("error", "Ошибка при отправке ответа");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU");
  };

  const getStatusBadge = (message: ContactMessage) => {
    if (message.admin_response) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Отвечено</span>;
    } else if (message.is_read) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Прочитано</span>;
    } else {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Новое</span>;
    }
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) || message.email.toLowerCase().includes(searchTerm.toLowerCase()) || message.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" || (filterStatus === "unread" && !message.is_read) || (filterStatus === "read" && message.is_read && !message.admin_response) || (filterStatus === "responded" && message.admin_response);

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Обратная связь</h1>
        <p className="text-gray-600">Управление сообщениями от клиентов</p>
      </div>

      {/* Уведомления */}
      {message && <div className={`mb-4 p-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.text}</div>}

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaEnvelope className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Всего сообщений</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaExclamationCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-gray-900">{stats.unread}</div>
              <div className="text-sm text-gray-500">Непрочитанных</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaCheck className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-gray-900">{stats.responded}</div>
              <div className="text-sm text-gray-500">Отвеченных</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FaTimes className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-semibold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-500">Ожидают ответа</div>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Поиск по имени, email или теме..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Все</option>
              <option value="unread">Непрочитанные</option>
              <option value="read">Прочитанные</option>
              <option value="responded">Отвеченные</option>
            </select>
          </div>
        </div>
      </div>

      {/* Список сообщений */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Отправитель</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тема</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Загрузка...
                  </td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Сообщения не найдены
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => (
                  <tr key={message.id} className={`hover:bg-gray-50 ${!message.is_read ? "bg-blue-50" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-gray-100">
                          <FaUser className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{message.name}</div>
                          <div className="text-sm text-gray-500">{message.email}</div>
                          {message.phone && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <FaPhone className="mr-1 h-3 w-3" />
                              {message.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{message.subject}</div>
                      <div className="text-sm text-gray-500">{message.message.length > 50 ? message.message.substring(0, 50) + "..." : message.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(message)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendar className="mr-1 h-3 w-3" />
                        {formatDate(message.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setSelectedMessage(message)} className="text-blue-600 hover:text-blue-900" title="Просмотреть">
                          <FaEye />
                        </button>
                        {!message.is_read && (
                          <button onClick={() => markAsRead(message.id)} className="text-green-600 hover:text-green-900" title="Отметить как прочитанное">
                            <FaCheck />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowResponseModal(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Ответить"
                        >
                          <FaReply />
                        </button>
                        <button onClick={() => deleteMessage(message.id)} className="text-red-600 hover:text-red-900" title="Удалить">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Показано {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total} результатов
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page - 1,
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Назад
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-md">{pagination.page}</span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page + 1,
                    }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Вперед
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно просмотра сообщения */}
      {selectedMessage && !showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">Сообщение от {selectedMessage.name}</h2>
                <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700">От:</span>
                  <p className="text-gray-900">
                    {selectedMessage.name} ({selectedMessage.email})
                  </p>
                  {selectedMessage.phone && <p className="text-gray-600">Телефон: {selectedMessage.phone}</p>}
                </div>

                <div>
                  <span className="font-medium text-gray-700">Тема:</span>
                  <p className="text-gray-900">{selectedMessage.subject}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Сообщение:</span>
                  <div className="bg-gray-50 p-4 rounded-md mt-2">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Дата отправки:</span>
                  <p className="text-gray-900">{formatDate(selectedMessage.created_at)}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Статус:</span>
                  <div className="mt-1">{getStatusBadge(selectedMessage)}</div>
                </div>

                {selectedMessage.admin_response && (
                  <div>
                    <span className="font-medium text-gray-700">Ваш ответ:</span>
                    <div className="bg-blue-50 p-4 rounded-md mt-2">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.admin_response}</p>
                    </div>
                    {selectedMessage.responded_at && <p className="text-sm text-gray-500 mt-1">Отвечено: {formatDate(selectedMessage.responded_at)}</p>}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                {!selectedMessage.admin_response && (
                  <button onClick={() => setShowResponseModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Ответить
                  </button>
                )}
                <button onClick={() => setSelectedMessage(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно ответа */}
      {showResponseModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Ответ на сообщение от {selectedMessage.name}</h2>
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseText("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-medium text-gray-700">Исходное сообщение:</p>
                  <p className="text-gray-900 mt-1">"{selectedMessage.message}"</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ваш ответ:</label>
                <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Введите ваш ответ клиенту..." />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponseText("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button onClick={sendResponse} disabled={!responseText.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  Отправить ответ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
