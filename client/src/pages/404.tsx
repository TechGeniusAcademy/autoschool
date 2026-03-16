import React, { useState } from "react";
import Layout from "@/components/layout/Layout";

export default function Custom404() {
  return (
    <Layout
      title="Страница не найдена - Автошкола"
      description="Запрашиваемая страница не найдена."
    >
      <div className="bg-black max-w-full h-full max-h-full h-full flex justify-center items-center flex-col pb-10 pt-10">
        <div className="flex justify-center items-center gap-12">
          <span className="text-white text-7xl">404</span>
          <p className="text-white">Страница не найдена</p>
        </div>
        <div>
          <img src="/images/404error.png" alt="404error" className="w-20" />
        </div>
      </div>
    </Layout>
  );
}
