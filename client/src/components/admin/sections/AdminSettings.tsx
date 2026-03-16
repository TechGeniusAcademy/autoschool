import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock, FaCamera, FaEdit, FaSave, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { AdminAPI, AuthAPI } from "../../../services/api";
import AvatarUpload from "../../common/AvatarUpload";

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

const AdminSettings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Состояния для редактирования
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  // Данные форм
  const [nameForm, setNameForm] = useState({ firstName: "", lastName: "" });
  const [emailForm, setEmailForm] = useState({ email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Показать пароли
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthAPI.getProfile();
      if (response.success && response.data) {
        const user = response.data.user;
        setProfile({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatarUrl: user.avatarUrl,
        });
        setNameForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
        });
        setEmailForm({ email: user.email || "" });
      } else {
        setError("Не удалось загрузить профиль");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setError("Ошибка загрузки профиля");
    } finally {
      setLoading(false);
    }
  };

  const handleNameSave = async () => {
    try {
      setError(null);
      const response = await AdminAPI.updateUserProfile({
        firstName: nameForm.firstName,
        lastName: nameForm.lastName,
      });

      if (response.success) {
        setSuccess("Имя и фамилия успешно обновлены");
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                firstName: nameForm.firstName,
                lastName: nameForm.lastName,
              }
            : null
        );
        setEditingName(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || "Ошибка обновления имени");
      }
    } catch (error) {
      console.error("Error updating name:", error);
      setError("Ошибка обновления имени");
    }
  };

  const handleEmailSave = async () => {
    try {
      setError(null);
      const response = await AdminAPI.updateUserProfile({
        email: emailForm.email,
      });

      if (response.success) {
        setSuccess("Email успешно обновлен");
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                email: emailForm.email,
              }
            : null
        );
        setEditingEmail(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || "Ошибка обновления email");
      }
    } catch (error) {
      console.error("Error updating email:", error);
      setError("Ошибка обновления email");
    }
  };

  const handlePasswordSave = async () => {
    try {
      setError(null);

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError("Новые пароли не совпадают");
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setError("Новый пароль должен содержать минимум 6 символов");
        return;
      }

      const response = await AdminAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.success) {
        setSuccess("Пароль успешно изменен");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setEditingPassword(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || "Ошибка изменения пароля");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Ошибка изменения пароля");
    }
  };

  const handleAvatarUpdate = async (newAvatarUrl: string | null) => {
    if (newAvatarUrl) {
      setProfile((prev) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : null));
      setSuccess("Аватар успешно обновлен");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Настройки</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Настройки</h2>

      {/* Уведомления */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-green-700">{success}</div>
        </div>
      )}

      {/* Аватарка */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <FaCamera className="text-2xl text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Аватар</h3>
            <p className="text-sm text-gray-600">Обновите свою фотографию профиля</p>
          </div>
        </div>

        <div className="mt-4">
          <AvatarUpload
            user={
              profile
                ? {
                    id: profile.id,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email,
                    phone: "",
                    role: "admin" as const,
                    avatarUrl: profile.avatarUrl,
                  }
                : null
            }
            onAvatarUpdate={handleAvatarUpdate}
          />
        </div>
      </div>

      {/* Имя и фамилия */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <FaUser className="text-2xl text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Имя и фамилия</h3>
              <p className="text-sm text-gray-600">Обновите свое имя и фамилию</p>
            </div>
          </div>
          {!editingName && (
            <button onClick={() => setEditingName(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
              <FaEdit />
              <span>Изменить</span>
            </button>
          )}
        </div>

        {editingName ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                <input type="text" value={nameForm.firstName} onChange={(e) => setNameForm((prev) => ({ ...prev, firstName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Фамилия</label>
                <input type="text" value={nameForm.lastName} onChange={(e) => setNameForm((prev) => ({ ...prev, lastName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex space-x-3">
              <button onClick={handleNameSave} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <FaSave />
                <span>Сохранить</span>
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNameForm({
                    firstName: profile?.firstName || "",
                    lastName: profile?.lastName || "",
                  });
                }}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <FaTimes />
                <span>Отмена</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-900 text-lg">
            {profile?.firstName} {profile?.lastName}
          </div>
        )}
      </div>

      {/* Email */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <FaEnvelope className="text-2xl text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Email</h3>
              <p className="text-sm text-gray-600">Обновите свой адрес электронной почты</p>
            </div>
          </div>
          {!editingEmail && (
            <button onClick={() => setEditingEmail(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
              <FaEdit />
              <span>Изменить</span>
            </button>
          )}
        </div>

        {editingEmail ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value={emailForm.email} onChange={(e) => setEmailForm({ email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex space-x-3">
              <button onClick={handleEmailSave} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <FaSave />
                <span>Сохранить</span>
              </button>
              <button
                onClick={() => {
                  setEditingEmail(false);
                  setEmailForm({ email: profile?.email || "" });
                }}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <FaTimes />
                <span>Отмена</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-900 text-lg">{profile?.email}</div>
        )}
      </div>

      {/* Пароль */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <FaLock className="text-2xl text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Пароль</h3>
              <p className="text-sm text-gray-600">Измените свой пароль для входа</p>
            </div>
          </div>
          {!editingPassword && (
            <button onClick={() => setEditingPassword(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
              <FaEdit />
              <span>Изменить</span>
            </button>
          )}
        </div>

        {editingPassword ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Текущий пароль</label>
              <div className="relative">
                <input type={showCurrentPassword ? "text" : "password"} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))} className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
              <div className="relative">
                <input type={showNewPassword ? "text" : "password"} value={passwordForm.newPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))} className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Подтвердите новый пароль</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button onClick={handlePasswordSave} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <FaSave />
                <span>Сохранить</span>
              </button>
              <button
                onClick={() => {
                  setEditingPassword(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <FaTimes />
                <span>Отмена</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">••••••••</div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
