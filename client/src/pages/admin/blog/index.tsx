import React, { useState, useEffect } from "react";
import Layout from "../../../components/layout/Layout";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaEyeSlash, FaArrowLeft, FaCalendar, FaUser, FaTags, FaGlobe } from "react-icons/fa";
import { TokenStorage } from "../../../services/api";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_name: string;
  status: "draft" | "published" | "archived";
  meta_title?: string;
  meta_description?: string;
  tags: string[];
  view_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const AdminBlogPage: React.FC = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<BlogPost | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, searchTerm, statusFilter]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const token = TokenStorage.get();

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`http://localhost:3001/api/blog?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPosts(data.data.posts);
          setPagination(data.data.pagination);
        }
      }
    } catch (error) {
      console.error("Ошибка при загрузке блог постов:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    try {
      const token = TokenStorage.get();
      const response = await fetch(`http://localhost:3001/api/blog/${post.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await fetchPosts(); // Обновляем список
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Ошибка при удалении поста:", error);
    }
  };

  const handleStatusChange = async (post: BlogPost, newStatus: "draft" | "published" | "archived") => {
    try {
      const token = TokenStorage.get();
      const response = await fetch(`http://localhost:3001/api/blog/${post.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        await fetchPosts(); // Обновляем список
      }
    } catch (error) {
      console.error("Ошибка при изменении статуса:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: "bg-green-100 text-green-800", text: "Опубликован" },
      draft: { color: "bg-yellow-100 text-yellow-800", text: "Черновик" },
      archived: { color: "bg-gray-100 text-gray-800", text: "Архив" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>;
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <Link href="/admin" className="text-blue-600 hover:text-blue-700 mr-3">
                        <FaArrowLeft className="w-5 h-5" />
                      </Link>
                      <h1 className="text-2xl font-bold text-gray-900">Управление блогом</h1>
                    </div>
                    <p className="text-gray-600">Создание, редактирование и управление блог постами</p>
                  </div>

                  <Link href="/admin/blog/create" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <FaPlus className="mr-2" />
                    Создать пост
                  </Link>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Поиск по заголовку или содержимому..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>

                  {/* Status Filter */}
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">Все статусы</option>
                    <option value="published">Опубликованные</option>
                    <option value="draft">Черновики</option>
                    <option value="archived">Архивные</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Posts List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-4">{searchTerm || statusFilter !== "all" ? "По вашему запросу ничего не найдено" : "Пока нет блог постов"}</div>
                    <Link href="/admin/blog/create" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <FaPlus className="mr-2" />
                      Создать первый пост
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                                <Link href={`/blog/${post.slug}`} target="_blank">
                                  {post.title}
                                </Link>
                              </h3>
                              {getStatusBadge(post.status)}
                            </div>

                            {post.excerpt && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>}

                            <div className="flex flex-wrap items-center text-xs text-gray-500 gap-4">
                              <div className="flex items-center">
                                <FaUser className="mr-1" />
                                {post.author_name}
                              </div>
                              <div className="flex items-center">
                                <FaCalendar className="mr-1" />
                                {formatDate(post.created_at)}
                              </div>
                              <div className="flex items-center">
                                <FaEye className="mr-1" />
                                {post.view_count} просмотров
                              </div>
                              {post.tags.length > 0 && (
                                <div className="flex items-center">
                                  <FaTags className="mr-1" />
                                  {post.tags.slice(0, 2).join(", ")}
                                  {post.tags.length > 2 && ` +${post.tags.length - 2}`}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mt-4 lg:mt-0 lg:ml-4">
                            {/* Status Toggle */}
                            <select value={post.status} onChange={(e) => handleStatusChange(post, e.target.value as any)} className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                              <option value="draft">Черновик</option>
                              <option value="published">Опубликован</option>
                              <option value="archived">Архив</option>
                            </select>

                            {/* Actions */}
                            <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 text-gray-500 hover:text-blue-600 transition-colors" title="Просмотреть">
                              <FaGlobe />
                            </Link>
                            <Link href={`/admin/blog/edit/${post.id}`} className="p-2 text-gray-500 hover:text-blue-600 transition-colors" title="Редактировать">
                              <FaEdit />
                            </Link>
                            <button onClick={() => setDeleteConfirm(post)} className="p-2 text-gray-500 hover:text-red-600 transition-colors" title="Удалить">
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: prev.page - 1,
                          }))
                        }
                        disabled={pagination.page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Предыдущая
                      </button>

                      {[...Array(pagination.pages)].map((_, index) => {
                        const pageNum = index + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: pageNum,
                              }))
                            }
                            className={`px-3 py-2 border rounded-lg ${pageNum === pagination.page ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: prev.page + 1,
                          }))
                        }
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Следующая
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Подтвердите удаление</h3>
              <p className="text-gray-600 mb-6">Вы уверены, что хотите удалить пост "{deleteConfirm.title}"? Это действие нельзя отменить.</p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Отмена
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
};

export default AdminBlogPage;
