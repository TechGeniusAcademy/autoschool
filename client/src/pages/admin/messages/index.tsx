import React, { useState, useEffect } from "react";
import Layout from "../../../components/layout/Layout";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import Link from "next/link";
import // ContactAPI,
// ContactMessage,
// ContactMessagesStats,
// ContactMessagesResponse,
"../../../services/api";

// TODO: Move these types to api.ts
interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "responded";
  is_read?: boolean;
  created_at: string;
  response?: string;
  admin_response?: string;
  responded_at?: string;
  first_name?: string;
  last_name?: string;
}

interface ContactMessagesStats {
  total: number;
  new: number;
  read: number;
  responded: number;
  unread?: number;
}

interface ContactMessagesResponse {
  success: boolean;
  data: ContactMessage[];
  total: number;
  page: number;
  totalPages: number;
}
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaReply,
  FaTrash,
  FaEye,
  FaFilter,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheck,
} from "react-icons/fa";

const ContactMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactMessagesStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<ContactMessage | null>(
    null
  );

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [filter, page]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching messages with params:", { page, filter });
      // const response = await ContactAPI.getAllMessages(page, 10, filter);
      // TODO: Implement ContactAPI.getAllMessages
      console.log("TODO: Load messages for page:", page, "filter:", filter);
      const response = { success: true, data: [], total: 0, totalPages: 0 };
      console.log("Messages response:", response);
      if (response.success && response.data) {
        console.log("Messages data:", response.data);
        // setMessages(response.data.messages);
        // setTotalPages(response.data.pagination.totalPages);
        setMessages(response.data || []);
        setTotalPages(response.totalPages || 0);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // const response = await ContactAPI.getStats();
      // TODO: Implement ContactAPI.getStats
      console.log("TODO: Load contact stats");
      const response = {
        success: true,
        data: { total: 0, new: 0, read: 0, responded: 0, unread: 0 },
      };
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      // await ContactAPI.markAsRead(messageId);
      // TODO: Implement ContactAPI.markAsRead
      console.log("TODO: Mark message as read:", messageId);
      await fetchMessages();
      await fetchStats();
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, is_read: true });
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleRespond = async () => {
    if (!selectedMessage || !responseText.trim()) return;

    try {
      // await ContactAPI.respondToMessage(selectedMessage.id, responseText);
      // TODO: Implement ContactAPI.respondToMessage
      console.log(
        "TODO: Respond to message:",
        selectedMessage.id,
        "with:",
        responseText
      );
      setIsResponseModalOpen(false);
      setResponseText("");
      await fetchMessages();
      await fetchStats();
      // Обновляем выбранное сообщение
      setSelectedMessage({
        ...selectedMessage,
        admin_response: responseText,
        responded_at: new Date().toISOString(),
        is_read: true,
      });
    } catch (error) {
      console.error("Failed to respond:", error);
    }
  };

  const handleDelete = async (messageId: number) => {
    try {
      // await ContactAPI.deleteMessage(messageId);
      // TODO: Implement ContactAPI.deleteMessage
      console.log("TODO: Delete message:", messageId);
      await fetchMessages();
      await fetchStats();
      setDeleteConfirm(null);
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU");
  };

  const getStatusBadge = (message: ContactMessage) => {
    if (message.admin_response) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheck className="mr-1" />
          Отвечено
        </span>
      );
    } else if (message.is_read) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FaEnvelopeOpen className="mr-1" />
          Прочитано
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FaEnvelope className="mr-1" />
          Новое
        </span>
      );
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout title="Управление сообщениями - Админ панель">
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Заголовок и навигация */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Link
                  href="/admin"
                  className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                >
                  <FaArrowLeft className="mr-2" />
                  Назад к админ панели
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Управление сообщениями
              </h1>
            </div>

            {/* Статистика */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaEnvelope className="text-blue-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Всего сообщений
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.total}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FaEnvelope className="text-yellow-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Непрочитанные
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.unread}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaEnvelopeOpen className="text-blue-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Прочитанные
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.read}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaCheck className="text-green-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        С ответами
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.responded}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Список сообщений */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Сообщения
                      </h3>
                      <div className="flex items-center space-x-2">
                        <FaFilter className="text-gray-400" />
                        <select
                          value={filter}
                          onChange={(e) => {
                            setFilter(e.target.value as any);
                            setPage(1);
                          }}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                        >
                          <option value="all">Все сообщения</option>
                          <option value="unread">Непрочитанные</option>
                          <option value="read">Прочитанные</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {isLoading ? (
                      <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Загрузка...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        Сообщения не найдены
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedMessage?.id === message.id
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={() => setSelectedMessage(message)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="text-lg font-medium text-gray-900 mr-3">
                                  {message.name}
                                </h4>
                                {getStatusBadge(message)}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {message.email} • {message.phone}
                              </p>
                              <p className="text-sm font-medium text-gray-900 mb-2">
                                {message.subject}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {message.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatDate(message.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Пагинация */}
                  {totalPages > 1 && (
                    <div className="p-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Предыдущая
                        </button>
                        <span className="text-sm text-gray-700">
                          Страница {page} из {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setPage(Math.min(totalPages, page + 1))
                          }
                          disabled={page === totalPages}
                          className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Следующая
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Детали сообщения */}
              <div className="lg:col-span-1">
                {selectedMessage ? (
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Детали сообщения
                        </h3>
                        <div className="flex items-center space-x-2">
                          {!selectedMessage.is_read && (
                            <button
                              onClick={() =>
                                handleMarkAsRead(selectedMessage.id)
                              }
                              className="p-2 text-blue-600 hover:text-blue-800"
                              title="Отметить как прочитанное"
                            >
                              <FaEye />
                            </button>
                          )}
                          <button
                            onClick={() => setIsResponseModalOpen(true)}
                            className="p-2 text-green-600 hover:text-green-800"
                            title="Ответить"
                          >
                            <FaReply />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(selectedMessage)}
                            className="p-2 text-red-600 hover:text-red-800"
                            title="Удалить"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      {getStatusBadge(selectedMessage)}
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Имя
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedMessage.name}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedMessage.email}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Телефон
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedMessage.phone}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Тема
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedMessage.subject}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Сообщение
                        </label>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {selectedMessage.message}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Дата отправки
                        </label>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedMessage.created_at)}
                        </p>
                      </div>

                      {selectedMessage.admin_response && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ответ администратора
                          </label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">
                              {selectedMessage.admin_response}
                            </p>
                            {selectedMessage.responded_at && (
                              <p className="text-xs text-gray-500 mt-2">
                                {formatDate(selectedMessage.responded_at)}
                                {selectedMessage.first_name &&
                                  selectedMessage.last_name && (
                                    <span>
                                      {" "}
                                      • {selectedMessage.first_name}{" "}
                                      {selectedMessage.last_name}
                                    </span>
                                  )}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-center text-gray-500">
                      <FaEnvelope className="mx-auto text-4xl mb-4" />
                      <p>Выберите сообщение для просмотра деталей</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Модал ответа */}
        {isResponseModalOpen && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Ответить на сообщение
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    От: {selectedMessage.name} ({selectedMessage.email})
                  </p>
                  <p className="text-sm text-gray-600">
                    Тема: {selectedMessage.subject}
                  </p>
                </div>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Введите ваш ответ..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setIsResponseModalOpen(false);
                      setResponseText("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleRespond}
                    disabled={!responseText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Отправить ответ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Модал подтверждения удаления */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <FaExclamationTriangle className="text-red-500 text-xl mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Подтвердите удаление
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Вы уверены, что хотите удалить сообщение от{" "}
                  {deleteConfirm.name}? Это действие нельзя отменить.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
};

export default ContactMessagesPage;
