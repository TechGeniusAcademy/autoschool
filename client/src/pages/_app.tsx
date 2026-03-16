import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { LanguageProvider } from "../contexts/LanguageContext";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Подавляем предупреждение findDOMNode от React Quill (известная проблема библиотеки)
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.("findDOMNode is deprecated")) {
        return; // Игнорируем это предупреждение
      }
      originalConsoleError.apply(console, args);
    };

    // Предварительная загрузка изображений и данных
    console.log("Приложение инициализировано");

    return () => {
      console.error = originalConsoleError; // Восстанавливаем оригинальный console.error
    };
  }, []);

  return (
    <LanguageProvider>
      <Component {...pageProps} />
    </LanguageProvider>
  );
}
