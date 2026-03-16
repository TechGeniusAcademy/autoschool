import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import {
  AuthAPI,
  TokenStorage,
  User,
  handleAuthError,
} from "../../services/api";

// Константы для ролей чтобы избежать создания новых массивов при каждом рендере
const DEFAULT_ALLOWED_ROLES = ["student", "instructor", "admin"];
const ADMIN_ONLY_ROLES = ["admin"];
const INSTRUCTOR_ROLES = ["instructor"];
const INSTRUCTOR_ADMIN_ROLES = ["instructor", "admin"];
const STUDENT_ADMIN_ROLES = ["student", "admin"];

export {
  ADMIN_ONLY_ROLES,
  INSTRUCTOR_ROLES,
  INSTRUCTOR_ADMIN_ROLES,
  STUDENT_ADMIN_ROLES,
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = DEFAULT_ALLOWED_ROLES,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Мемоизируем allowedRoles чтобы избежать бесконечных ре-рендеров
  const memoizedAllowedRoles = useMemo(
    () => allowedRoles,
    [allowedRoles.join(",")]
  );

  useEffect(() => {
    const checkAuth = async () => {
      const token = TokenStorage.get();

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await AuthAPI.verifyToken();

        if (response.success && response.data?.user) {
          const userData = response.data.user;

          // Проверяем роль пользователя
          if (!memoizedAllowedRoles.includes(userData.role)) {
            router.push("/access-denied");
            return;
          }

          setUser(userData);
        } else {
          TokenStorage.remove();
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        handleAuthError(error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, memoizedAllowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Пользователь будет перенаправлен
  }

  return <>{children}</>;
};

export default ProtectedRoute;
