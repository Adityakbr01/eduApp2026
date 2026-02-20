"use client";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Toaster } from "react-hot-toast";

function ReactToast() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Toaster
      position={isMobile ? "bottom-center" : "top-right"}
      gutter={8} // spacing between toasts
      toastOptions={{
        duration: 4000,
        style: {
          background: "#18181b", // zinc-900 for a sleek dark look
          color: "#fff",
          fontSize: "14px",
          padding: "12px 20px",
          borderRadius: "999px", // soft pill shape
          fontWeight: 500,
          border: "1px solid #27272a", // zinc-800
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        },
        success: {
          iconTheme: {
            primary: "#10b981", // elegant emerald green for success
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444", // clear red for errors
            secondary: "#fff",
          },
        },
        loading: {
          iconTheme: {
            primary: "#3b82f6", // clear blue for loading
            secondary: "#fff",
          },
        },
      }}
    />
  );
}

export default ReactToast;
