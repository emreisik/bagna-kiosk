import { X, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";

export type NotificationType = "success" | "warning" | "error" | "info";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: NotificationType;
  title: string;
  message: string;
  details?: string[];
  autoClose?: boolean;
  autoCloseDuration?: number;
}

export function NotificationModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  details,
  autoClose = false,
  autoCloseDuration = 3000,
}: NotificationModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDuration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
      case "error":
        return <XCircle className="w-12 h-12 text-red-500" />;
      case "info":
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-800",
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div
                className={`${colors.bg} ${colors.border} border-b px-6 py-5`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {getIcon()}
                    <div>
                      <h3 className={`text-xl font-semibold ${colors.text}`}>
                        {title}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-gray-700 text-base whitespace-pre-line">
                  {message}
                </p>

                {/* Details List */}
                {details && details.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      Detaylar:
                    </p>
                    <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3 space-y-1">
                      {details.map((detail, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Tamam
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
