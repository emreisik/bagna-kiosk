import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "../components/admin/AdminLayout";
import { apiClient } from "../../services/api";
import { useCategories } from "../../hooks/useCategories";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categoriesData, refetch } = useCategories();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [selectedCategoryForSub, setSelectedCategoryForSub] =
    useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    displayName: "",
  });
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: "",
    displayName: "",
    categoryId: "",
  });

  const token = localStorage.getItem("adminToken") || "";
  const categories = categoriesData || [];

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await apiClient.adminUpdateCategory(
          editingCategory.id,
          categoryFormData,
          token,
        );
      } else {
        await apiClient.adminCreateCategory(categoryFormData, token);
      }
      setIsCategoryModalOpen(false);
      setCategoryFormData({ name: "", displayName: "" });
      setEditingCategory(null);
      refetch();
      // Invalidate categories cache to refresh all category lists
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      alert("İşlem başarısız oldu");
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubcategory) {
        await apiClient.adminUpdateSubcategory(
          editingSubcategory.id,
          subcategoryFormData,
          token,
        );
      } else {
        await apiClient.adminCreateSubcategory(subcategoryFormData, token);
      }
      setIsSubcategoryModalOpen(false);
      setSubcategoryFormData({ name: "", displayName: "", categoryId: "" });
      setEditingSubcategory(null);
      setSelectedCategoryForSub(null);
      refetch();
      // Invalidate categories cache to refresh all category lists
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      alert("İşlem başarısız oldu");
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      displayName: category.displayName,
    });
    setIsCategoryModalOpen(true);
  };

  const handleEditSubcategory = (subcategory: any, category: any) => {
    setEditingSubcategory(subcategory);
    setSubcategoryFormData({
      name: subcategory.name,
      displayName: subcategory.displayName,
      categoryId: category.id,
    });
    setIsSubcategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      !confirm(
        "Bu kategoriyi ve tüm alt kategorilerini silmek istediğinizden emin misiniz?",
      )
    )
      return;
    try {
      await apiClient.adminDeleteCategory(id, token);
      refetch();
      // Invalidate categories cache to refresh all category lists
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      alert("Silme işlemi başarısız oldu");
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm("Bu alt kategoriyi silmek istediğinizden emin misiniz?"))
      return;
    try {
      await apiClient.adminDeleteSubcategory(id, token);
      refetch();
      // Invalidate categories cache to refresh all category lists
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      alert("Silme işlemi başarısız oldu");
    }
  };

  const handleAddSubcategory = (category: any) => {
    setSelectedCategoryForSub(category);
    setSubcategoryFormData({
      name: "",
      displayName: "",
      categoryId: category.id,
    });
    setIsSubcategoryModalOpen(true);
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kategoriler</h1>
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryFormData({ name: "", displayName: "" });
              setIsCategoryModalOpen(true);
            }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-5 h-5" />
            Yeni Kategori
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {categories.map((category: any) => (
            <div key={category.id} className="border-b last:border-b-0">
              {/* Category Row */}
              <div className="flex items-center px-6 py-4 hover:bg-gray-50">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="mr-3 text-gray-500 hover:text-gray-700"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {category.displayName}
                  </div>
                  <div className="text-sm text-gray-500 font-mono">
                    {category.name}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mr-4">
                  {category.subcategories?.length || 0} alt kategori
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddSubcategory(category)}
                    className="text-green-600 hover:text-green-800 px-2 py-1 text-sm"
                    title="Alt Kategori Ekle"
                  >
                    + Alt Kategori
                  </button>
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {expandedCategories.has(category.id) && (
                <div className="bg-gray-50 px-6 py-2">
                  {category.subcategories &&
                  category.subcategories.length > 0 ? (
                    <div className="space-y-2">
                      {category.subcategories.map((sub: any) => (
                        <div
                          key={sub.id}
                          className="flex items-center py-2 px-4 bg-white rounded border"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {sub.displayName}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {sub.name}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleEditSubcategory(sub, category)
                              }
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubcategory(sub.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-2">
                      Alt kategori yok
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Category Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingCategory ? "Kategori Düzenle" : "Yeni Kategori"}
              </h2>
              <form onSubmit={handleCategorySubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        name: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border rounded"
                    placeholder="ustgiyim"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Görünen İsim *
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.displayName}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        displayName: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Üst Giyim"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Subcategory Modal */}
        {isSubcategoryModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingSubcategory
                  ? "Alt Kategori Düzenle"
                  : "Yeni Alt Kategori"}
              </h2>
              <form onSubmit={handleSubcategorySubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Üst Kategori
                  </label>
                  <select
                    value={subcategoryFormData.categoryId}
                    onChange={(e) =>
                      setSubcategoryFormData({
                        ...subcategoryFormData,
                        categoryId: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Seçiniz</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={subcategoryFormData.name}
                    onChange={(e) =>
                      setSubcategoryFormData({
                        ...subcategoryFormData,
                        name: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border rounded"
                    placeholder="gomlek"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Görünen İsim *
                  </label>
                  <input
                    type="text"
                    value={subcategoryFormData.displayName}
                    onChange={(e) =>
                      setSubcategoryFormData({
                        ...subcategoryFormData,
                        displayName: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Gömlek"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSubcategoryModalOpen(false)}
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
