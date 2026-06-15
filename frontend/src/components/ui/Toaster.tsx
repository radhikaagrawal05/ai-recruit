import { Toaster as HotToaster } from "react-hot-toast";

export default function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "hsl(240 10% 8%)",
          color: "hsl(0 0% 98%)",
          border: "1px solid hsl(240 3.7% 15.9%)",
          borderRadius: "12px",
          fontSize: "13px",
          padding: "12px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        },
        success: {
          iconTheme: { primary: "#34d399", secondary: "hsl(240 10% 8%)" },
        },
        error: {
          iconTheme: { primary: "#fb7185", secondary: "hsl(240 10% 8%)" },
        },
      }}
    />
  );
}
