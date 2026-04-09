import React from "react";
import { toast as sonnerToast } from "sonner";

export type ToastType = "success" | "error" | "info" | "warning" | "neutral";

/**
 * showToast - small helper to standardize toast usage and CSS variant mapping
 * @param type - semantic type
 * @param message - text or react node
 * @param variant - optional variant mapped to `.cn-toast--${variant}` class
 * @param duration - ms
 */
export function showToast(
  type: ToastType,
  message: React.ReactNode,
  variant?: string,
  duration = 4000,
) {
  // If a visual variant is requested, render a custom toast so we can attach
  // the `cn-toast--${variant}` class which picks up styles in `index.css`.
  if (variant) {
    const icon =
      type === "success"
        ? "✅"
        : type === "error"
        ? "❌"
        : type === "info"
        ? "ℹ️"
        : type === "warning"
        ? "⚠️"
        : "";

    sonnerToast.custom(() => (
      <div className={`cn-toast cn-toast--${variant}`} role="status">
        <div className="size-4">{icon}</div>
        <div className="flex flex-col min-w-0">
          <div className="title truncate">{message}</div>
        </div>
      </div>
    ), { duration });

    return;
  }

  // Otherwise use built-in semantic helpers which will use the Toaster's
  // icon mapping and className strategies.
  const msg = typeof message === "string" ? message : String(message);

  switch (type) {
    case "success":
      sonnerToast.success(msg, { duration });
      break;
    case "error":
      sonnerToast.error(msg, { duration });
      break;
    case "info":
      // Sonner doesn't always expose `info`; call base toast to show neutral
      sonnerToast(msg, { duration });
      break;
    case "warning":
      sonnerToast(msg, { duration });
      break;
    default:
      sonnerToast(msg, { duration });
  }
}

export default showToast;
