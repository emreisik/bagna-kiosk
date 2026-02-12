import { X } from "lucide-react";
import { useI18n } from "../../../contexts/I18nContext";
import { motion, AnimatePresence } from "motion/react";
import { CategoryStructure } from "../../../data/categories";

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryStructure[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  searchQuery: string;
  onCategoryChange: (category: string | null) => void;
  onSubcategoryChange: (subcategory: string | null) => void;
  onSearchChange: (query: string) => void;
}

export function FilterSheet({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  selectedSubcategory,
  searchQuery,
  onCategoryChange,
  onSubcategoryChange,
  onSearchChange,
}: FilterSheetProps) {
  const { t } = useI18n();

  const handleCategoryClick = (category: string | null) => {
    onCategoryChange(category);
    // Kategori değiştiğinde alt kategoriyi temizle
    onSubcategoryChange(null);
    onClose();
  };

  const handleAllCategoriesClick = () => {
    onCategoryChange(null);
    onSubcategoryChange(null);
    onClose();
  };

  const handleSubcategoryClick = (
    subcategory: string | null,
    parentCategory: string,
  ) => {
    // Alt kategori seçildiğinde üst kategoriyi de seç
    onCategoryChange(parentCategory);
    onSubcategoryChange(subcategory);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />

          {/* Sheet - Minimal Design */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 bg-white z-50 shadow-2xl w-full max-w-sm overflow-y-auto"
          >
            <div className="p-6">
              {/* Minimal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-light tracking-[0.2em] uppercase text-gray-900">
                  {t("filters")}
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories - Minimal List */}
              <div className="space-y-1">
                {/* All Categories */}
                <button
                  onClick={handleAllCategoriesClick}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedCategory === null && selectedSubcategory === null
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm font-light tracking-wide uppercase">
                    {t("allCategories")}
                  </span>
                </button>

                {categories.map((categoryGroup) => (
                  <div key={categoryGroup.id} className="space-y-1">
                    {/* Main Category */}
                    <button
                      onClick={() => handleCategoryClick(categoryGroup.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedCategory === categoryGroup.id
                          ? "bg-black text-white"
                          : "text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-normal tracking-wide uppercase">
                        {t(`categories.${categoryGroup.id}`)}
                      </span>
                    </button>

                    {/* Subcategories - Clickable */}
                    {categoryGroup.subcategories && (
                      <div className="pl-4 space-y-1">
                        {categoryGroup.subcategories.map((subcat) => (
                          <button
                            key={subcat}
                            onClick={() =>
                              handleSubcategoryClick(subcat, categoryGroup.id)
                            }
                            className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
                              selectedSubcategory === subcat
                                ? "bg-gray-900 text-white"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <span className="text-sm font-light tracking-wide uppercase">
                              {t(`subcategories.${subcat}`)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
