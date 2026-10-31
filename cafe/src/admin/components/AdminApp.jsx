
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { account } from "../../lib/appwrite";

import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import Orders from "./Orders";
import Products from "./Products";
import Settings from "./Settings";
import AdminLogin from "./AdminLogin";
import Profile from "./Profile";

function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      setIsChecking(true);

      try {
        await account.get();

        if (isMounted) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F1E7]">
        <p className="text-[#40291F]">
          Checking admin session...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="login"
        element={
          isAuthenticated ? (
            <Navigate to="/admin" replace />
          ) : (
            <AdminLogin />
          )
        }
      />

      <Route
        element={
          isAuthenticated ? (
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
