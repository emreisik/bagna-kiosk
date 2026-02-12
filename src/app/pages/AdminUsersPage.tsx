import { useState, useEffect } from "react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { apiClient } from "../../services/api";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "brand_admin",
    requiresApproval: true,
    brandIds: [] as string[],
  });

  const token = localStorage.getItem("adminToken") || "";

  useEffect(() => {
    fetchUsers();
    fetchBrands();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiClient.adminGetUsers(token);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await apiClient.adminGetBrands(token);
      setBrands(data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          requiresApproval: formData.requiresApproval,
          brandIds: formData.brandIds,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await apiClient.adminUpdateUser(editingUser.id, updateData, token);
      } else {
        await apiClient.adminCreateUser(formData, token);
      }
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "brand_admin",
        requiresApproval: true,
        brandIds: [],
      });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      alert("İşlem başarısız oldu");
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      requiresApproval: user.requiresApproval ?? true,
      brandIds: user.brands?.map((b: any) => b.brandId) || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;
    try {
      await apiClient.adminDeleteUser(id, token);
      fetchUsers();
    } catch (error) {
      alert("Silme işlemi başarısız oldu");
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcılar</h1>
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({
                name: "",
                email: "",
                password: "",
                role: "brand_admin",
                requiresApproval: true,
                brandIds: [],
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-5 h-5" />
            Yeni Kullanıcı
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  İsim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Markalar
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Onay Gerektirir
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        user.role === "super_admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "super_admin"
                        ? "Super Admin"
                        : "Brand Admin"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.brands?.map((b: any) => b.brand.name).join(", ") ||
                      "Tümü"}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        user.requiresApproval
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.requiresApproval ? "Evet" : "Hayır"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">İsim</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Şifre {editingUser && "(Değiştirmek için doldurun)"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="brand_admin">Brand Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                {formData.role === "brand_admin" && (
                  <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requiresApproval}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requiresApproval: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">
                        Eklediği ürünler onay gerektirsin
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      İşaretli ise: Ürünler "Beklemede" durumunda oluşturulur
                      <br />
                      İşaretli değilse: Ürünler "Onaylandı" durumunda
                      oluşturulur
                    </p>
                  </div>
                )}
                {formData.role === "brand_admin" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Markalar (Çoklu Seçim)
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                      {brands.map((brand) => (
                        <label
                          key={brand.id}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={formData.brandIds.includes(brand.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  brandIds: [...formData.brandIds, brand.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  brandIds: formData.brandIds.filter(
                                    (id) => id !== brand.id,
                                  ),
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{brand.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
