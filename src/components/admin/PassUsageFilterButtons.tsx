
import React from "react";
import { Button } from "@/components/ui/button";
import { PassUsageFilter } from "@/types/passUsage";

interface PassUsageFilterButtonsProps {
  filter: PassUsageFilter;
  setFilter: (filter: PassUsageFilter) => void;
  totalCount: number;
  verifiedCount: number;
  unverifiedCount: number;
}

export const PassUsageFilterButtons: React.FC<PassUsageFilterButtonsProps> = ({
  filter,
  setFilter,
  totalCount,
  verifiedCount,
  unverifiedCount
}) => {
  return (
    <div className="flex gap-2 mt-4">
      <Button
        variant={filter === 'all' ? 'default' : 'outline'}
        onClick={() => setFilter('all')}
        size="sm"
      >
        All ({totalCount})
      </Button>
      <Button
        variant={filter === 'unverified' ? 'default' : 'outline'}
        onClick={() => setFilter('unverified')}
        size="sm"
      >
        Unverified ({unverifiedCount})
      </Button>
      <Button
        variant={filter === 'verified' ? 'default' : 'outline'}
        onClick={() => setFilter('verified')}
        size="sm"
      >
        Verified ({verifiedCount})
      </Button>
    </div>
  );
};
