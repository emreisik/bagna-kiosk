import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Delete, X } from "lucide-react";

interface NumericSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function NumericSearch({
  value,
  onChange,
  placeholder,
}: NumericSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklanınca kapat
  useEffect(() => {
    if (!isOpen) return;

    const handleTouchOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleTouchOutside);
    document.addEventListener("touchstart", handleTouchOutside);
    return () => {
      document.removeEventListener("mousedown", handleTouchOutside);
      document.removeEventListener("touchstart", handleTouchOutside);
    };
  }, [isOpen]);

  const handleKey = (key: string) => {
    onChange(value + key);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange("");
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <div ref={containerRef} className="relative mb-3 md:mb-4">
      {/* Search Display */}
      <div
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center gap-3 pl-12 md:pl-14 pr-12 py-3 md:py-4 text-base md:text-lg rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer select-none ${
          isOpen
            ? "border-black bg-white shadow-lg"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-gray-400" />
        {value ? (
          <span className="text-black font-medium tracking-widest">
            {value}
          </span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        {/* Yanıp sönen cursor */}
        {isOpen && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="w-0.5 h-6 bg-black inline-block"
          />
        )}
      </div>

      {/* Temizle butonu */}
      {value && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Numeric Keypad */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-3 md:p-4 z-50"
          >
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {keys.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className="h-14 md:h-16 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 active:scale-95 text-xl md:text-2xl font-medium text-black transition-all select-none"
                >
                  {key}
                </button>
              ))}

              {/* Sil (backspace) */}
              <button
                onClick={handleBackspace}
                className="h-14 md:h-16 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 active:scale-95 flex items-center justify-center transition-all select-none"
              >
                <Delete className="w-6 h-6 md:w-7 md:h-7 text-gray-700" />
              </button>

              {/* Tamam */}
              <button
                onClick={() => setIsOpen(false)}
                className="h-14 md:h-16 rounded-xl bg-black hover:bg-gray-800 active:bg-gray-700 active:scale-95 text-white text-sm md:text-base font-medium tracking-wide transition-all select-none"
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
