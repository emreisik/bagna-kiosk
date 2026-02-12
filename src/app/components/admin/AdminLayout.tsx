import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  Tag,
  Users,
  Settings,
  LogOut,
  Layers,
  Languages,
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: typeof LayoutDashboard;
  superAdminOnly?: boolean; // Sadece super_admin görebilir
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    superAdminOnly: true,
  },
  { name: "Ürünler", path: "/admin/products", icon: Package }, // Tüm adminler görebilir
  {
    name: "Markalar",
    path: "/admin/brands",
    icon: Layers,
    superAdminOnly: true,
  },
  {
    name: "Kategoriler",
    path: "/admin/categories",
    icon: Tag,
    superAdminOnly: true,
  },
  {
    name: "Kullanıcılar",
    path: "/admin/users",
    icon: Users,
    superAdminOnly: true,
  },
  {
    name: "Çeviriler",
    path: "/admin/translations",
    icon: Languages,
    superAdminOnly: true,
  },
  {
    name: "Ayarlar",
    path: "/admin/settings",
    icon: Settings,
    superAdminOnly: true,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const adminUser = localStorage.getItem("adminUser");
  const admin = adminUser ? JSON.parse(adminUser) : null;
  const isSuperAdmin = admin?.role === "super_admin";

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  if (!admin) {
    navigate("/admin/login");
    return null;
  }

  // İçerik yöneticileri (brand_admin) sadece Ürünler sayfasını görebilir
  const visibleNavItems = navItems.filter(
    (item) => !item.superAdminOnly || isSuperAdmin,
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Kiosk QR</h1>
          <p className="text-xs text-gray-400 mb-3">v1.0.0 • kioskqr.com</p>
          <p className="text-sm text-gray-600 mt-1">{admin.name}</p>
          <p className="text-xs text-gray-500">{admin.email}</p>
          {isSuperAdmin && (
            <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
              Super Admin
            </span>
          )}
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
