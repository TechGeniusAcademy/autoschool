import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Layout from "../../components/layout/Layout";
import { Calendar, User, Eye, Tag, ArrowLeft, Share2 } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  status: string;
  meta_title: string;
  meta_description: string;
  tags: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

const BlogPostPage: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost(slug as string);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3001/api/blog/slug/${postSlug}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.data);
      } else {
        setError(data.message || "Статья не найдена");
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
      setError("Ошибка при загрузке статьи");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка статьи...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">404 - Статья не найдена</h1>
            <p className="text-gray-600 mb-6">{error || "Запрашиваемая статья не существует"}</p>
            <Link href="/blog" className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
              Вернуться к блогу
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={post.meta_title || post.title} description={post.meta_description || post.excerpt}>
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          {/* Навигация назад */}
          <div className="mb-6">
            <Link href="/blog" className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Вернуться к блогу
            </Link>
          </div>

          {/* Основной контент */}
          <div className="max-w-4xl mx-auto">
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Изображение поста */}
              {post.featured_image && (
                <div className="relative h-96">
                  <Image src={post.featured_image} alt={post.title} fill className="object-cover" />
                </div>
              )}

              <div className="p-8">
                {/* Метаданные */}
                <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6">
                  <div className="flex items-center mr-6">
                    <Calendar className="mr-2 w-4 h-4" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <div className="flex items-center mr-6">
                    <User className="mr-2 w-4 h-4" />
                    <span>{post.author_name || "Администратор"}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="mr-2 w-4 h-4" />
                    <span>{post.view_count} просмотров</span>
                  </div>
                </div>

                {/* Заголовок */}
                <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">{post.title}</h1>

                {/* Краткое описание */}
                {post.excerpt && (
                  <div className="text-lg text-gray-600 mb-8 leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: post.excerpt }} />
                  </div>
                )}

                {/* Содержание */}
                <div className="prose prose-lg max-w-none mb-8">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} className="blog-content" />
                </div>

                {/* Теги */}
                {post.tags.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-3">Теги:</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Навигация */}
                <div className="border-t pt-6 mt-8">
                  <div className="flex justify-between items-center">
                    <Link href="/blog" className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
                      Все статьи
                    </Link>

                    <div className="flex space-x-2">
                      <Link href="/contacts" className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                        Связаться с нами
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <style jsx>{`
        .blog-content {
          line-height: 1.8;
        }

        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .blog-content h1 {
          font-size: 2rem;
        }
        .blog-content h2 {
          font-size: 1.75rem;
        }
        .blog-content h3 {
          font-size: 1.5rem;
        }
        .blog-content h4 {
          font-size: 1.25rem;
        }

        .blog-content p {
          margin-bottom: 1rem;
          color: #4b5563;
        }

        .blog-content ul,
        .blog-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .blog-content li {
          margin-bottom: 0.5rem;
          color: #4b5563;
        }

        .blog-content blockquote {
          border-left: 4px solid #dc2626;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }

        .blog-content a {
          color: #dc2626;
          text-decoration: underline;
        }

        .blog-content a:hover {
          color: #b91c1c;
        }

        .blog-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .blog-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }

        .blog-content th,
        .blog-content td {
          border: 1px solid #d1d5db;
          padding: 0.75rem;
          text-align: left;
        }

        .blog-content th {
          background-color: #f9fafb;
          font-weight: 600;
        }
      `}</style>
    </Layout>
  );
};

export default BlogPostPage;
