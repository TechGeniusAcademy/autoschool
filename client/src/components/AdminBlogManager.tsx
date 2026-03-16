import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Динамически загружаем ReactQuill для избежания проблем с SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  status: "draft" | "published" | "archived";
  meta_title: string;
  meta_description: string;
  tags: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
}

const AdminBlogManager: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  // Конфигурация для React Quill
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "color",
    "background",
    "align",
  ];

  // Загрузка всех постов
  const fetchBlogPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/blog", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBlogPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  // Создание slug из заголовка
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9а-я]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Обработка изменений в форме
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Автогенерация slug при изменении заголовка
    if (field === "title") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  // Сохранение поста
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingPost
        ? `http://localhost:3001/api/blog/${editingPost.id}`
        : "http://localhost:3001/api/blog";

      const method = editingPost ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: editingPost ? "Пост обновлен!" : "Пост создан!",
        });
        setShowEditor(false);
        setEditingPost(null);
        resetForm();
        fetchBlogPosts();
        // Скрываем сообщение через 3 секунды
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: "Ошибка: " + error.message,
        });
      }
    } catch (error) {
      console.error("Error saving post:", error);
      setMessage({
        type: "error",
        text: "Ошибка при сохранении поста",
      });
    }
    setLoading(false);
  };

  // Удаление поста
  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/blog/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Пост удален!");
        fetchBlogPosts();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Ошибка при удалении поста");
    }
  };

  // Редактирование поста
  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featured_image: post.featured_image,
      status: post.status,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      tags: post.tags,
    });
    setShowEditor(true);
  };

  // Сброс формы
  const resetForm = () => {
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
  };

  // Обработка тегов
  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    handleInputChange("tags", tags);
  };

  return (
    <div className="admin-blog-manager">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Управление блогом</h2>
          <button
            onClick={() => {
              setShowEditor(true);
              setEditingPost(null);
              resetForm();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Создать пост
          </button>
        </div>

        {showEditor ? (
          <div className="blog-editor mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Заголовок
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Введите заголовок поста"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="url-slug"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Краткое описание
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Краткое описание поста"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Содержание
              </label>
              <div style={{ height: "400px" }}>
                <ReactQuill
                  value={formData.content}
                  onChange={(value) => handleInputChange("content", value)}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ height: "350px" }}
                  placeholder="Напишите содержание поста..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  URL изображения
                </label>
                <input
                  type="text"
                  value={formData.featured_image}
                  onChange={(e) =>
                    handleInputChange("featured_image", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Статус</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="draft">Черновик</option>
                  <option value="published">Опубликовано</option>
                  <option value="archived">Архив</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Теги (через запятую)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(", ")}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="тег1, тег2, тег3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta заголовок
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) =>
                    handleInputChange("meta_title", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                  placeholder="SEO заголовок"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Meta описание
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) =>
                    handleInputChange("meta_description", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                  rows={2}
                  placeholder="SEO описание"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading
                  ? "Сохранение..."
                  : editingPost
                  ? "Обновить"
                  : "Создать"}
              </button>
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingPost(null);
                  resetForm();
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : null}

        <div className="blog-posts-list">
          <h3 className="text-xl font-semibold mb-4">Все посты</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Заголовок</th>
                  <th className="border p-2 text-left">Статус</th>
                  <th className="border p-2 text-left">Просмотры</th>
                  <th className="border p-2 text-left">Дата создания</th>
                  <th className="border p-2 text-left">Действия</th>
                </tr>
              </thead>
              <tbody>
                {blogPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="border p-2">{post.title}</td>
                    <td className="border p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          post.status === "published"
                            ? "bg-green-200 text-green-800"
                            : post.status === "draft"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {post.status === "published"
                          ? "Опубликовано"
                          : post.status === "draft"
                          ? "Черновик"
                          : "Архив"}
                      </span>
                    </td>
                    <td className="border p-2">{post.view_count}</td>
                    <td className="border p-2">
                      {new Date(post.created_at).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="border p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        >
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
      </div>
    </div>
  );
};

export default AdminBlogManager;
