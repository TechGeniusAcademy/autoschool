import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { API_BASE_URL } from "@/constants/api";

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

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка отзывов
  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log("Fetching reviews...");

      const response = await fetch(`${API_BASE_URL}/reviews/public`);
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        console.log("Setting reviews:", data.data.reviews);
        setReviews(data.data.reviews);
      } else {
        console.error("API returned error:", data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
      console.log("Loading set to false");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  console.log("Current state - Loading:", loading, "Reviews count:", reviews.length);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Отзывы о нашей автошколе</h1>

        {/* Debug info */}
        <div className="mb-4 p-4 bg-yellow-100 rounded">
          <p>Loading: {loading.toString()}</p>
          <p>Reviews count: {reviews.length}</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка отзывов...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Отзывы не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-800 mb-2">{review.author_name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-500">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                    <span className="text-sm text-gray-500">{review.rating}/5</span>
                  </div>
                  {review.reason && <p className="text-sm text-gray-600 mb-2">Тема: {review.reason}</p>}
                  <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString("ru-RU")}</p>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Лайков: {review.likes_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReviewsPage;
