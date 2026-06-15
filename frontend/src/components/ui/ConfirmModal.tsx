import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-modal-in"
      onClick={onCancel}
    >
      <div
        className="bg-background border border-border rounded-xl w-full max-w-sm p-6 animate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          {confirmVariant === "danger" && (
            <div className="p-2 bg-rose-500/10 rounded-lg shrink-0">
              <AlertTriangle size={16} className="text-rose-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-[15px] font-medium mb-1">{title}</h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{message}</p>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[13px] text-muted-foreground hover:text-foreground rounded-lg border border-border hover:border-muted-foreground/30 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all disabled:opacity-50 ${
              confirmVariant === "danger"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                : "bg-foreground text-background hover:opacity-90"
            }`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
