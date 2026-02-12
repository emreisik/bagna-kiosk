import { useEffect, useState } from "react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { apiClient } from "../../services/api";
import { Package, Layers, Tag, Users } from "lucide-react";

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    brands: 0,
    categories: 0,
    users: 0,
  });

  const token = localStorage.getItem("adminToken") || "";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, brandsRes, categoriesRes, usersRes] =
          await Promise.all([
            apiClient.getProducts(),
            apiClient.adminGetBrands(token),
            apiClient.getCategories(),
            apiClient.adminGetUsers(token).catch(() => []),
          ]);

        setStats({
          products: productsRes.products.length,
          brands: brandsRes.length,
          categories: categoriesRes.length,
          users: Array.isArray(usersRes) ? usersRes.length : 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, [token]);

  const statCards = [
    {
      name: "Toplam Ürün",
      value: stats.products,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      name: "Markalar",
      value: stats.brands,
      icon: Layers,
      color: "bg-green-500",
    },
    {
      name: "Kategoriler",
      value: stats.categories,
      icon: Tag,
      color: "bg-purple-500",
    },
    {
      name: "Kullanıcılar",
      value: stats.users,
      icon: Users,
      color: "bg-orange-500",
    },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Hoşgeldiniz!
          </h2>
          <p className="text-gray-600">
            Kiosk QR Admin Panel'e hoşgeldiniz. Sol menüden istediğiniz bölüme
            geçebilirsiniz.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
