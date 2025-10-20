import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { ControlStatus } from "@shared/iso";

interface StatusBadgeProps {
  status: ControlStatus;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = {
    ready: {
      icon: CheckCircle2,
      label: "Ready",
      className: "bg-green-500/10 text-green-500 border-green-500/20"
    },
    partial: {
      icon: AlertCircle,
      label: "Partial",
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    },
    missing: {
      icon: XCircle,
      label: "Missing",
      className: "bg-red-500/10 text-red-500 border-red-500/20"
    }
  };

  const { icon: Icon, label, className } = config[status];
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${className} ${sizeClasses[size]}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

