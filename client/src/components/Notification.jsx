import { useEffect } from "react";

export default function Notification({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
    error: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    info: { bg: "#dbeafe", color: "#2563eb", border: "#bfdbfe" },
  };

  const c = colors[type] || colors.success;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "14px 24px",
        borderRadius: "8px",
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        fontSize: "14px",
        fontWeight: "600",
        zIndex: 2000,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        animation: "slideIn 0.3s ease",
      }}
    >
      {type === "success" && "✓ "}
      {type === "error" && "✕ "}
      {message}
    </div>
  );
}
