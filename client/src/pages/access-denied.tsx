import React from "react";
import Layout from "../components/layout/Layout";
import Link from "next/link";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

const AccessDenied: React.FC = () => {
  return (
    <Layout title="Доступ запрещен">
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <FaExclamationTriangle className="text-red-500 text-6xl" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Доступ запрещен
          </h1>

          <p className="text-gray-600 mb-6">
            У вас недостаточно прав для просмотра этой страницы. Обратитесь к
            администратору, если считаете, что это ошибка.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaHome />
            Вернуться на главную
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default AccessDenied;

/*
ВНЕСЕННЫЕ ИЗМЕНЕНИЯ:

1. Создание страницы access-denied.tsx (1 сентября 2025):
   - Добавлена страница для отображения сообщения о недостаточных правах доступа
   - Используется Layout компонент для единообразного дизайна
   - Добавлена иконка предупреждения (FaExclamationTriangle)
   - Добавлена кнопка возврата на главную страницу
   - Применен адаптивный дизайн с центрированием контента

2. Интеграция с системой авторизации:
   - Страница используется в ProtectedRoute компоненте
   - Автоматический редирект при недостаточных правах доступа
   - Связана с системой ролей (student/instructor/admin)

3. Дизайн и стилизация:
   - Использование Tailwind CSS для стилизации
   - Красная цветовая схема для индикации ошибки
   - Центрированная карточка с тенью
   - Иконка и кнопка с hover эффектами

4. Функциональность:
   - Статический компонент без состояния
   - Использование Next.js Link для навигации
   - Поддержка TypeScript с строгой типизацией

История изменений:
- 01.09.2025: Создание базового компонента страницы доступа запрещен
- 01.09.2025: Интеграция с системой ProtectedRoute
- 01.09.2025: Применение финального дизайна и стилизации
*/
