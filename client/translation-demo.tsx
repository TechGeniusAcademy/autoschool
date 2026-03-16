// ДЕМО: Пример использования переводов во всех компонентах

import { useLanguage } from "@/contexts/LanguageContext";

// Пример для Hero секции
const HeroExample = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t("hero_main_title")}</h1>
      <p>{t("hero_main_subtitle")}</p>
      <button>{t("our_courses")}</button>
      <button>{t("sign_up")}</button>
    </div>
  );
};

// Пример для секции преимуществ
const AdvantagesExample = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h2>{t("our_advantages")}</h2>
      <div>
        <h3>{t("certified_instructors")}</h3>
        <p>{t("certified_instructors_desc")}</p>
      </div>
      <div>
        <h3>{t("modern_vehicles")}</h3>
        <p>{t("modern_vehicles_desc")}</p>
      </div>
    </div>
  );
};

// Пример для админ панели
const AdminExample = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t("admin_dashboard")}</h1>
      <button>{t("add_course")}</button>
      <button>{t("manage_students")}</button>
      <button>{t("manage_instructors")}</button>

      <table>
        <thead>
          <tr>
            <th>{t("course_title")}</th>
            <th>{t("course_price")}</th>
            <th>{t("course_duration")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
      </table>
    </div>
  );
};

// Пример для профиля
const ProfileExample = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t("my_profile")}</h1>
      <nav>
        <a href="/profile">{t("personal_info")}</a>
        <a href="/profile/courses">{t("my_courses")}</a>
        <a href="/profile/schedule">{t("my_schedule")}</a>
        <a href="/profile/settings">{t("account_settings")}</a>
      </nav>
    </div>
  );
};

// Пример форм
const FormsExample = () => {
  const { t } = useLanguage();

  return (
    <form>
      <div>
        <label>{t("name")}</label>
        <input type="text" placeholder={t("name")} />
      </div>
      <div>
        <label>{t("email")}</label>
        <input type="email" placeholder={t("email")} />
      </div>
      <div>
        <label>{t("phone")}</label>
        <input type="tel" placeholder={t("phone")} />
      </div>
      <button type="submit">{t("submit")}</button>
      <button type="button">{t("cancel")}</button>
    </form>
  );
};

export { HeroExample, AdvantagesExample, AdminExample, ProfileExample, FormsExample };
