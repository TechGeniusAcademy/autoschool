import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaEyeSlash, FaCalendar, FaUser, FaTags, FaGlobe, FaSave, FaTimes } from "react-icons/fa";
import { API_BASE_URL } from "@/constants/api";

// Динамически загружаем ReactQuill для избежания проблем с SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

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

const AdminBlogs: React.FC = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Форма для создания/редактирования
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    status: "draft" as "draft" | "published" | "archived",
    meta_title: "",
    meta_description: "",
    tags: [] as string[],
  });

  // Сообщения
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Конфигурация для React Quill
  const quillModules = {
    toolbar: [[{ header: [1, 2, 3, 4, 5, 6, false] }], ["bold", "italic", "underline", "strike"], [{ list: "ordered" }, { list: "bullet" }], [{ color: [] }, { background: [] }], [{ align: [] }], ["link", "image"], ["clean"]],
  };

  useEffect(() => {
    fetchPosts();
  }, [pagination.page, searchTerm]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      });

      const response = await fetch(`${API_BASE_URL}/blog?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setPosts(result.data.posts || []);
        if (result.data.pagination) {
          setPagination(result.data.pagination);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      showMessage("error", "Ошибка при загрузке постов");
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image: "",
      status: "draft",
      meta_title: "",
      meta_description: "",
      tags: [],
    });
    setShowEditor(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      featured_image: post.featured_image || "",
      status: post.status,
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      tags: post.tags || [],
    });
    setShowEditor(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[а-я]/g, (char) => {
        const rus = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
        const eng = "abvgdeejzijklmnoprstufhc4w64yixeqya";
        const index = rus.indexOf(char);
        return index !== -1 ? eng[index] : char;
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const url = editingPost ? `${API_BASE_URL}/blog/${editingPost.id}` : `${API_BASE_URL}/blog`;

      const method = editingPost ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showMessage("success", editingPost ? "Пост успешно обновлен!" : "Пост успешно создан!");
        setShowEditor(false);
        fetchPosts();
      } else {
        const errorData = await response.json();
        showMessage("error", errorData.message || "Ошибка при сохранении поста");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      showMessage("error", "Ошибка при сохранении поста");
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот пост?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showMessage("success", "Пост успешно удален!");
        fetchPosts();
      } else {
        showMessage("error", "Ошибка при удалении поста");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      showMessage("error", "Ошибка при удалении поста");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-yellow-100 text-yellow-800", text: "Черновик" },
      published: { color: "bg-green-100 text-green-800", text: "Опубликован" },
      archived: { color: "bg-gray-100 text-gray-800", text: "Архивирован" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  if (showEditor) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{editingPost ? "Редактировать пост" : "Создать новый пост"}</h1>
            <button onClick={() => setShowEditor(false)} className="text-gray-500 hover:text-gray-700">
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          {message && <div className={`mb-4 p-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.text}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
                <input type="text" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL (slug)</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание</label>
              <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Содержание</label>
              <div className="bg-white border border-gray-300 rounded-md">
                <ReactQuill theme="snow" value={formData.content} onChange={(content) => setFormData({ ...formData, content })} modules={quillModules} style={{ height: "300px", marginBottom: "42px" }} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Изображение (URL)</label>
                <input type="url" value={formData.featured_image} onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "draft" | "published" | "archived",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Черновик</option>
                  <option value="published">Опубликован</option>
                  <option value="archived">Архивирован</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => setShowEditor(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Отмена
              </button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                <FaSave className="mr-2" />
                {editingPost ? "Обновить" : "Создать"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Управление блогом</h1>
          <p className="text-gray-600">Создание и редактирование постов блога</p>
        </div>
        <button onClick={handleCreatePost} className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
          <FaPlus className="mr-2" />
          Создать пост
        </button>
      </div>

      {message && <div className={`mb-4 p-4 rounded-md ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.text}</div>}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Поиск постов..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пост</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Просмотры</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
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
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Посты не найдены
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.featured_image && <img className="h-10 w-10 rounded-lg mr-4 object-cover" src={post.featured_image} alt={post.title} />}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{post.title}</div>
                          <div className="text-sm text-gray-500">{post.excerpt && post.excerpt.length > 50 ? post.excerpt.substring(0, 50) + "..." : post.excerpt}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(post.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <FaEye className="mr-1 text-gray-400" />
                        {post.view_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendar className="mr-1 text-gray-400" />
                        {formatDate(post.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleEditPost(post)} className="text-blue-600 hover:text-blue-900" title="Редактировать">
                          <FaEdit />
                        </button>
                        <button onClick={() => window.open(`/blog/${post.slug}`, "_blank")} className="text-green-600 hover:text-green-900" title="Просмотреть">
                          <FaEye />
                        </button>
                        <button onClick={() => handleDeletePost(post.id)} className="text-red-600 hover:text-red-900" title="Удалить">
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Показано {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total} результатов
              </div>
              <div className="flex space-x-2">
                <button onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })} disabled={pagination.page === 1} className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  Назад
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-md">{pagination.page}</span>
                <button onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })} disabled={pagination.page === pagination.pages} className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                  Вперед
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogs;
