import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-lg",
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <button
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close modal"
          />

          <motion.div
            className={[
              "relative w-full rounded-3xl border border-white/50",
              "bg-white/80 backdrop-blur-xl shadow-xl",
              maxWidth,
            ].join(" ")}
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0">
                {title ? (
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {title}
                  </h3>
                ) : null}
              </div>
              <button
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100/70"
                onClick={onClose}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <div className="px-5 pb-5">{children}</div>

            {footer ? (
              <div className="flex items-center justify-end gap-2 border-t border-slate-200/60 px-5 py-4">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
