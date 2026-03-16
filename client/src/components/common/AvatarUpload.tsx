import React, { useState, useRef } from "react";
import { User, AvatarAPI } from "../../services/api";
import { FaUser, FaCamera, FaSpinner } from "react-icons/fa";
import { SERVER_URL } from "@/constants/api";

interface AvatarUploadProps {
  user: User | null;
  onAvatarUpdate: (avatarUrl: string | null) => void;
  size?: "small" | "medium" | "large";
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ user, onAvatarUpdate, size = "large" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-20 h-20",
    large: "w-24 h-24",
  };

  const iconSizes = {
    small: "text-sm",
    medium: "text-xl",
    large: "text-3xl",
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      setUploadError("Пожалуйста, выберите изображение");
      return;
    }

    // Проверка размера файла (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Размер файла не должен превышать 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await AvatarAPI.upload(file);

      if (response.success && response.data) {
        onAvatarUpdate(response.data.avatar_url);
      } else {
        setUploadError("Ошибка при загрузке аватарки");
      }
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      setUploadError(error?.message || "Ошибка при загрузке аватарки");
    } finally {
      setIsUploading(false);
      // Очищаем input для возможности повторной загрузки того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      // Если URL начинается с /, добавляем базовый URL сервера
      if (user.avatarUrl.startsWith("/")) {
        return `${SERVER_URL}${user.avatarUrl}`;
      }
      return user.avatarUrl;
    }
    return null;
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer relative group transition-all duration-200 hover:shadow-lg ${isUploading ? "opacity-50" : ""}`} onClick={handleFileSelect}>
        {getAvatarUrl() ? (
          <img
            src={getAvatarUrl()!}
            alt={`${user?.firstName} ${user?.lastName}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Если изображение не загрузилось, показываем иконку по умолчанию
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <FaUser className={`text-gray-600 ${iconSizes[size]}`} />
          </div>
        )}

        {/* Overlay при наведении */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">{isUploading ? <FaSpinner className="text-white animate-spin" /> : <FaCamera className="text-white" />}</div>
        </div>
      </div>

      {/* Скрытый input для выбора файла */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUploading} />

      {/* Сообщение об ошибке */}
      {uploadError && <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 text-red-700 text-sm rounded shadow-lg whitespace-nowrap z-10">{uploadError}</div>}

      {/* Подсказка */}
      {!isUploading && <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">Нажмите для изменения</div>}
    </div>
  );
};

export default AvatarUpload;
