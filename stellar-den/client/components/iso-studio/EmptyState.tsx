import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="iso-card">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold iso-text-primary mb-2">
          {title}
        </h3>
        <p className="text-sm iso-text-secondary mb-6">
          {description}
        </p>
        {action && (
          <Button
            onClick={action.onClick}
            className="bg-primary hover:bg-primary/90"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

