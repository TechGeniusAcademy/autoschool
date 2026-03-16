import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import Link from "next/link";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { FaArrowLeft, FaSave, FaEye } from "react-icons/fa";
import { TokenStorage } from "../../../services/api";

// Динамический импорт React Quill для избежания SSR проблем
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

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

const CreateBlogPost: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
    console.log("Starting blog post creation with:", { ...formData, status });
    setIsLoading(true);
    setErrors([]);

    try {
      const token = TokenStorage.get();
      console.log("Token available:", !!token);

      const requestBody = {
        ...formData,
        status,
      };
      console.log("Request body:", requestBody);

      const response = await fetch(`http://localhost:3001/api/blog`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        console.log("Blog post created successfully, redirecting...");
        router.push("/admin/blog");
      } else {
        console.log("Error creating blog post:", data);

        // Обработка специфических ошибок
        if (response.status === 413 || data.error === "PAYLOAD_TOO_LARGE") {
          setErrors([data.message || "Размер данных слишком большой. Уменьшите размер изображений или количество контента."]);
        } else if (data.error === "INVALID_JSON") {
          setErrors([data.message || "Ошибка в формате данных. Проверьте корректность заполнения полей."]);
        } else {
          setErrors(data.errors || [data.message || "Произошла ошибка при создании поста"]);
        }
      }
    } catch (error) {
      console.error("Ошибка при создании поста:", error);
      setErrors(["Ошибка сети. Проверьте подключение к интернету."]);
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
                    <h1 className="text-2xl font-bold text-gray-900">Создать новый пост</h1>
                    <p className="text-sm text-gray-600 mt-1">Максимальный размер контента: 50MB (включая изображения)</p>
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
                      Опубликовать
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
                    <li key={index}>{typeof error === "string" ? error : error.msg || JSON.stringify(error)}</li>
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
                  <p className="text-sm text-gray-500 mb-3">⚠️ Ограничения: общий размер поста (включая изображения) не должен превышать 50MB</p>
                  <div className="prose-editor">
                    <ReactQuill value={formData.content} onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))} modules={quillModules} formats={quillFormats} theme="snow" style={{ height: "400px", marginBottom: "50px" }} />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
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
                  <p className="text-sm text-gray-500 mt-1">Рекомендуемый размер: до 2MB. Поддерживаемые домены: images.unsplash.com, png.pngtree.com, via.placeholder.com, picsum.photos, *.pexels.com, *.freepik.com и другие популярные сервисы изображений.</p>
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

export default CreateBlogPost;
