import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";

interface Review {
  id: number;
  user_id: number;
  reason?: string;
  author_name: string;
  author_email: string;
  author_phone?: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  is_approved: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
}

const TestReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log("Starting to fetch reviews...");
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:3001/api/reviews/public");
        console.log("Response received:", response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data received:", data);

        if (data.success && data.data && data.data.reviews) {
          setReviews(data.data.reviews);
          console.log("Reviews set:", data.data.reviews.length);
        } else {
          setError("No reviews data received");
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
        console.log("Loading finished");
      }
    };

    fetchReviews();
  }, []);

  console.log("Render state:", {
    loading,
    reviewsCount: reviews.length,
    error,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Тест страницы отзывов</h1>

        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p>Loading: {loading.toString()}</p>
          <p>Reviews count: {reviews.length}</p>
          <p>Error: {error || "none"}</p>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p>Загрузка...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-600">
            <p>Ошибка: {error}</p>
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-8">
            <p>Отзывы не найдены</p>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Найдено отзывов: {reviews.length}</h2>
            {reviews.map((review) => (
              <div key={review.id} className="border p-4 rounded">
                <h3 className="font-bold">{review.author_name}</h3>
                <p className="text-sm text-gray-600">Рейтинг: {review.rating}/5</p>
                {review.reason && <p className="text-sm text-gray-600">Тема: {review.reason}</p>}
                <p className="mt-2">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString("ru-RU")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestReviewsPage;
