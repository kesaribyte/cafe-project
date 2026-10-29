
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import Orders from "./Orders";
import Products from "./Products";
import Settings from "./Settings";
import AdminLogin from "./AdminLogin";
import Profile from "./Profile";

function AdminApp() {
  const isLoggedIn =
    sessionStorage.getItem("cafe-admin-session") === "true";

  return (
    <Routes>
      <Route
        path="login"
        element={
          isLoggedIn ? (
            <Navigate to="/admin" replace />
          ) : (
            <AdminLogin />
          )
        }
      />

      <Route
        element={
          isLoggedIn ? (
            <AdminLayout />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/admin" replace />}
      />
    </Routes>
  );
}

export default AdminApp;
