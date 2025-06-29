
import React from "react";
import { Clock } from "lucide-react";
import { PassUsageCard } from "./PassUsageCard";
import { PassUsage } from "@/types/passUsage";

interface PassUsageListProps {
  usages: PassUsage[];
  isLoading: boolean;
  onVerify: (usageId: string, approve: boolean) => void;
}

export const PassUsageList: React.FC<PassUsageListProps> = ({
  usages,
  isLoading,
  onVerify
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2 text-muted-foreground">Loading usage data...</span>
      </div>
    );
  }

  if (usages.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1 text-card-foreground">No Usage Data</h3>
        <p className="text-muted-foreground">
          No pass usage data found for the selected filter
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {usages.map((usage) => (
        <PassUsageCard
          key={usage._id}
          usage={usage}
          onVerify={onVerify}
        />
      ))}
    </div>
  );
};
