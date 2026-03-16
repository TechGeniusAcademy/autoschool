import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import Image from "next/image";
import Link from "next/link";

// Тип для представления уведомления
interface Notification {
  id: number;
  text: string;
  date: string;
  read: boolean;
  type: "info" | "warning" | "success";
}

// Моковые данные для уведомлений
const notifications: Notification[] = [
  {
    id: 1,
    text: "Занятие по вождению перенесено на 17.09.2023",
    date: "12.09.2023",
    read: false,
    type: "info",
  },
  {
    id: 2,
    text: "Вы успешно сдали тест по ПДД!",
    date: "10.09.2023",
    read: true,
    type: "success",
  },
  {
    id: 3,
    text: "Оплатите следующий этап обучения до 20.09.2023",
    date: "05.09.2023",
    read: false,
    type: "warning",
  },
];

// Получение цвета для типа уведомления
const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "info":
      return "border-blue-200 bg-blue-50";
    case "warning":
      return "border-yellow-200 bg-yellow-50";
    case "success":
      return "border-green-200 bg-green-50";
    default:
      return "border-gray-200 bg-gray-50";
  }
};

// Страница уведомлений

const fullNotifications = () => {
  return (
    <div>
      <Layout
        title="Личный кабинет - Автошкола"
        description="Управление обучением, расписание занятий и прогресс в личном кабинете ученика автошколы."
      >
        <div>
          <div className="flex justify-center flex-col items-center">
            <h2 className="text-white text-xl flex">Уведомления</h2>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-3 ${getNotificationColor(
                      notification.type
                    )} ${!notification.read ? "border-l-4" : ""}`}
                  >
                    <div className="flex justify-between">
                      <p
                        className={
                          !notification.read ? "font-semibold" : "font-normal"
                        }
                      >
                        {notification.text}
                      </p>
                      <span className="text-gray-500 text-sm">
                        {notification.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Нет новых уведомлений</p>
            )}
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default fullNotifications;
