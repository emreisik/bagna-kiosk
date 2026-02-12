import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireSuperAdmin = false,
}: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const adminUserStr = localStorage.getItem("adminUser");
    const adminUser = adminUserStr ? JSON.parse(adminUserStr) : null;

    if (!adminUser) {
      // Kullanıcı giriş yapmamış
      navigate("/admin/login");
      return;
    }

    if (requireSuperAdmin && adminUser.role !== "super_admin") {
      // Super admin yetkisi gerekiyor ama kullanıcı super admin değil
      navigate("/admin/products"); // İçerik yöneticilerini ürünler sayfasına yönlendir
    }
  }, [navigate, requireSuperAdmin]);

  return <>{children}</>;
}
