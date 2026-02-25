import { createBrowserRouter, Navigate } from "react-router";
import { KioskLayout } from "./components/kiosk/KioskLayout";
import { BrandsListPage } from "./pages/BrandsListPage";
import { BrandPage } from "./pages/BrandPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminProductsPage } from "./pages/AdminProductsPage";
import { AdminProductFormPage } from "./pages/AdminProductFormPage";
import { AdminBulkUploadPage } from "./pages/AdminBulkUploadPage";
import { AdminBrandsPage } from "./pages/AdminBrandsPage";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminSettingsPage } from "./pages/AdminSettingsPage";
import { AdminTranslationsPage } from "./pages/AdminTranslationsPage";
import { AdminOrdersPage } from "./pages/AdminOrdersPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { I18nProvider } from "../contexts/I18nContext";
import { CartProvider } from "../contexts/CartContext";

function Root() {
  return (
    <I18nProvider>
      <CartProvider>
        <KioskLayout>
          <BrandsListPage />
        </KioskLayout>
      </CartProvider>
    </I18nProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute requireSuperAdmin>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/products",
    element: <AdminProductsPage />, // Tüm adminler erişebilir
  },
  {
    path: "/admin/products/new",
    element: <AdminProductFormPage />, // Tüm adminler erişebilir
  },
  {
    path: "/admin/products/bulk-upload",
    element: <AdminBulkUploadPage />, // Toplu ürün yükleme
  },
  {
    path: "/admin/products/:id/edit",
    element: <AdminProductFormPage />, // Tüm adminler erişebilir
  },
  {
    path: "/admin/brands",
    element: (
      <ProtectedRoute requireSuperAdmin>
        <AdminBrandsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/categories",
    element: (
      <ProtectedRoute requireSuperAdmin>
        <AdminCategoriesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute requireSuperAdmin>
        <AdminUsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <ProtectedRoute requireSuperAdmin>
        <AdminSettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/translations",
    element: (
      <ProtectedRoute requireSuperAdmin>
        <AdminTranslationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/orders",
    element: (
      <ProtectedRoute requireSuperAdmin>
        <AdminOrdersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/:brandSlug",
    element: (
      <I18nProvider>
        <CartProvider>
          <KioskLayout>
            <BrandPage />
          </KioskLayout>
        </CartProvider>
      </I18nProvider>
    ),
  },
  {
    path: "/:brandSlug/product/:productId",
    element: (
      <I18nProvider>
        <CartProvider>
          <KioskLayout>
            <ProductDetailPage />
          </KioskLayout>
        </CartProvider>
      </I18nProvider>
    ),
  },
  {
    path: "/:brandSlug/checkout",
    element: (
      <I18nProvider>
        <CartProvider>
          <KioskLayout>
            <CheckoutPage />
          </KioskLayout>
        </CartProvider>
      </I18nProvider>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
