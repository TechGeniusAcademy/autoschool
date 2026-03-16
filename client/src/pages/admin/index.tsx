import React, { useState } from "react";
import ProtectedRoute, { ADMIN_ONLY_ROLES } from "../../components/auth/ProtectedRoute";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminDashboard from "../../components/admin/sections/AdminDashboard";
import AdminStudents from "../../components/admin/sections/AdminStudents";
import AdminInstructors from "../../components/admin/sections/AdminInstructors";
import AdminCourses from "../../components/admin/sections/AdminCourses";
import AdminSchedules from "../../components/admin/sections/AdminSchedules";
import AdminGroups from "../../components/admin/sections/AdminGroups";
import AdminPrices from "../../components/admin/sections/AdminPricesNew";
import AdminDiscounts from "../../components/admin/sections/AdminDiscounts";
import AdminReports from "../../components/admin/sections/AdminReports";
import AdminReviews from "../../components/admin/sections/AdminReviews";
import AdminSettings from "../../components/admin/sections/AdminSettings";
import AdminBlogs from "../../components/admin/sections/AdminBlogs";
import AdminContacts from "../../components/admin/sections/AdminContacts";

const AdminPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "students":
        return <AdminStudents />;
      case "instructors":
        return <AdminInstructors />;
      case "courses":
        return <AdminCourses />;
      case "schedules":
        return <AdminSchedules />;
      case "groups":
        return <AdminGroups />;
      case "prices":
        return <AdminPrices />;
      case "discounts":
        return <AdminDiscounts />;
      case "blog":
        return <AdminBlogs />;
      case "contacts":
        return <AdminContacts />;
      case "reviews":
        return <AdminReviews />;
      case "reports":
        return <AdminReports />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={ADMIN_ONLY_ROLES}>
      <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection}>
        {renderContent()}
      </AdminLayout>
    </ProtectedRoute>
  );
};

export default AdminPanel;
