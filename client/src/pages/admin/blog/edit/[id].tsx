import React, { useState, useEffect } from "react";
import Layout from "../../../../components/layout/Layout";
import ProtectedRoute from "../../../../components/auth/ProtectedRoute";
import Link from "next/link";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { FaArrowLeft, FaSave, FaEye, FaSpinner } from "react-icons/fa";
import { TokenStorage } from "../../../../services/api";
import { API_BASE_URL } from "@/constants/api";

// Динамический импорт React Quill для избежания SSR проблем
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  status: "draft" | "published";
  meta_title: string;
  meta_description: string;
  tags: string[];
  author_id: number;
  created_at: string;
  updated_at: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  status: "draft" | "published";
  meta_title: string;
  meta_description: string;
  tags: string[];
}

const EditBlogPost: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
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
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<(string | any)[]>([]);

  // Конфигурация React Quill
  const quillModules = {
    toolbar: [[{ header: [1, 2, 3, 4, 5, 6, false] }], ["bold", "italic", "underline", "strike"], [{ color: [] }, { background: [] }], [{ list: "ordered" }, { list: "bullet" }], [{ indent: "-1" }, { indent: "+1" }], [{ align: [] }], ["link", "image", "video"], ["blockquote", "code-block"], ["clean"]],
  };

  const quillFormats = ["header", "bold", "italic", "underline", "strike", "color", "background", "list", "bullet", "indent", "align", "link", "image", "video", "blockquote", "code-block"];

  // Загрузка поста при монтировании компонента
  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const token = TokenStorage.get();
      const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const blogPost = data.data;
        setPost(blogPost);
        setFormData({
          title: blogPost.title,
          slug: blogPost.slug,
          excerpt: blogPost.excerpt || "",
          content: blogPost.content,
          featured_image: blogPost.featured_image || "",
          status: blogPost.status,
          meta_title: blogPost.meta_title || "",
          meta_description: blogPost.meta_description || "",
          tags: blogPost.tags || [],
        });
      } else {
        setErrors([data.message || "Ошибка при загрузке поста"]);
      }
    } catch (error) {
      console.error("Ошибка при загрузке поста:", error);
      setErrors(["Ошибка при загрузке поста"]);
    } finally {
      setIsLoadingPost(false);
    }
  };

  // Генерация slug из заголовка
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^а-яё\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: generateSlug(value),
      meta_title: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (status: "draft" | "published") => {
    setIsLoading(true);
    setErrors([]);

    try {
      const token = TokenStorage.get();
      const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push("/admin/blog");
      } else {
        setErrors(data.errors || [data.message || "Произошла ошибка"]);
      }
    } catch (error) {
      console.error("Ошибка при обновлении поста:", error);
      setErrors(["Ошибка при обновлении поста"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    // Открываем превью в новой вкладке
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${formData.title || "Превью поста"}</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
            .content { line-height: 1.6; }
            .tags { margin-top: 20px; }
            .tag { background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${formData.title || "Заголовок поста"}</h1>
          <div class="meta">
            ${formData.excerpt ? `<p><strong>Краткое описание:</strong> ${formData.excerpt}</p>` : ""}
            ${formData.featured_image ? `<img src="${formData.featured_image}" alt="Featured image" style="max-width: 100%; height: auto; margin: 20px 0;">` : ""}
          </div>
          <div class="content">
            ${formData.content || "<p>Содержимое поста...</p>"}
          </div>
          ${
            formData.tags.length > 0
              ? `
            <div class="tags">
              <strong>Теги:</strong>
              ${formData.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
          `
              : ""
          }
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  if (isLoadingPost) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <FaSpinner className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Загрузка поста...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!post) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Пост не найден</h1>
              <Link href="/admin/blog" className="text-blue-600 hover:text-blue-700">
                Вернуться к списку постов
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Link href="/admin/blog" className="text-blue-600 hover:text-blue-700 mr-3">
                      <FaArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Редактировать пост: {post.title}</h1>
                  </div>

                  <div className="flex space-x-3">
                    <button onClick={handlePreview} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      <FaEye className="mr-2" />
                      Превью
                    </button>
                    <button onClick={() => handleSubmit("draft")} disabled={isLoading} className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50">
                      <FaSave className="mr-2" />
                      Сохранить как черновик
                    </button>
                    <button onClick={() => handleSubmit("published")} disabled={isLoading} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                      <FaSave className="mr-2" />
                      {post.status === "published" ? "Обновить" : "Опубликовать"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{typeof error === "string" ? error : error.msg || "Ошибка валидации"}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div className="bg-white rounded-lg shadow p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок поста *</label>
                  <input type="text" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Введите заголовок поста..." required />
                </div>

                {/* Slug */}
                <div className="bg-white rounded-lg shadow p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL (slug) *</label>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="url-friendly-slug" required />
                  <p className="text-xs text-gray-500 mt-1">URL: /blog/{formData.slug || "url-friendly-slug"}</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Содержимое поста *</label>
                  <div className="prose-editor">
                    <ReactQuill value={formData.content} onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))} modules={quillModules} formats={quillFormats} theme="snow" style={{ height: "400px", marginBottom: "50px" }} />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Post Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о посте</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>ID:</strong> {post.id}
                    </p>
                    <p>
                      <strong>Статус:</strong>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${post.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{post.status === "published" ? "Опубликован" : "Черновик"}</span>
                    </p>
                    <p>
                      <strong>Создан:</strong> {new Date(post.created_at).toLocaleString("ru-RU")}
                    </p>
                    <p>
                      <strong>Обновлен:</strong> {new Date(post.updated_at).toLocaleString("ru-RU")}
                    </p>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="bg-white rounded-lg shadow p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        excerpt: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Краткое описание для списка постов..."
                  />
                </div>

                {/* Featured Image */}
                <div className="bg-white rounded-lg shadow p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Изображение поста</label>
                  <input
                    type="url"
                    value={formData.featured_image}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        featured_image: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.featured_image && (
                    <div className="mt-3">
                      <img
                        src={formData.featured_image}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="bg-white rounded-lg shadow p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Теги</label>
                  <div className="flex mb-3">
                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={handleKeyPress} className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Добавить тег..." />
                    <button onClick={handleAddTag} className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700">
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-blue-600 hover:text-blue-800">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* SEO */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">SEO настройки</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta заголовок</label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          meta_title: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SEO заголовок страницы..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta описание</label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          meta_description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Описание для поисковых систем..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default EditBlogPost;
