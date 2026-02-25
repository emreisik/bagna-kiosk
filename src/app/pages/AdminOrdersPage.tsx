import { useState, useEffect, useCallback } from "react";
import { Eye, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AdminLayout } from "../components/admin/AdminLayout";
import { apiClient, type OrderResponse } from "../../services/api";
import { normalizeImageUrl } from "../../utils/imageUrl";

const ORDER_STATUSES = [
  {
    value: "pending",
    label: "Beklemede",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "confirmed",
    label: "Onaylandi",
    color: "bg-blue-100 text-blue-800",
  },
  {
    value: "shipped",
    label: "Kargoda",
    color: "bg-purple-100 text-purple-800",
  },
  {
    value: "delivered",
    label: "Teslim Edildi",
    color: "bg-green-100 text-green-800",
  },
  { value: "cancelled", label: "Iptal", color: "bg-red-100 text-red-800" },
];

function getStatusStyle(status: string) {
  return ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parsePrice(priceStr: string): number {
  return parseFloat(priceStr.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0;
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const token = localStorage.getItem("adminToken") || "";

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.adminGetOrders(token, page, 20);
      setOrders(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err) {
      console.error("Siparisler yuklenemedi:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const updated = await apiClient.adminUpdateOrderStatus(
        orderId,
        newStatus,
        token,
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      console.error("Status guncellenemedi:", err);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Bu siparisi silmek istediginizden emin misiniz?")) return;
    try {
      await apiClient.adminDeleteOrder(orderId, token);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setTotal((prev) => prev - 1);
    } catch (err) {
      console.error("Siparis silinemedi:", err);
    }
  };

  // Client-side filtering
  const filteredOrders = orders.filter((order) => {
    if (statusFilter && order.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(q) ||
        order.firstName.toLowerCase().includes(q) ||
        order.lastName.toLowerCase().includes(q) ||
        order.phone.includes(q) ||
        order.items.some((item) => item.productCode.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Siparisler</h1>
          <p className="text-sm text-gray-500 mt-1">Toplam {total} siparis</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Siparis no, musteri adi, telefon, urun kodu..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
          >
            <option value="">Tum Durumlar</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            Siparis bulunamadi
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      Siparis No
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      Musteri
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      Telefon
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      Urunler
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      Toplam
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      Durum
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">
                      Tarih
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">
                      Islemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const orderTotal = order.items.reduce(
                      (sum, item) =>
                        sum + parsePrice(item.price) * item.quantity,
                      0,
                    );
                    const isExpanded = expandedOrderId === order.id;
                    const statusStyle = getStatusStyle(order.status);

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-medium text-gray-900">
                            {order.orderNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">
                            {order.firstName} {order.lastName}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">
                            {order.address}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {order.phone}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              setExpandedOrderId(isExpanded ? null : order.id)
                            }
                            className="flex items-center gap-1 text-gray-600 hover:text-black transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{order.items.length} urun</span>
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {orderTotal.toLocaleString("tr-TR")} $
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusStyle.color}`}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Expanded Order Details */}
            {expandedOrderId && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Siparis Detaylari
                </h3>
                <div className="space-y-2">
                  {orders
                    .find((o) => o.id === expandedOrderId)
                    ?.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-white rounded-lg p-3"
                      >
                        <img
                          src={normalizeImageUrl(item.imageUrl)}
                          alt={item.title}
                          className="w-12 h-14 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.productCode} | Beden: {item.sizeRange}
                            {item.color ? ` | Renk: ${item.color}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            x{item.quantity}
                          </p>
                          <p className="text-xs text-gray-500">{item.price}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Sayfa {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
