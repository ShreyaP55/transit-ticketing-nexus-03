
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PassUsage, PassUsageFilter } from "@/types/passUsage";

export const usePassUsageVerification = (userId: string | null) => {
  const [passUsages, setPassUsages] = useState<PassUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<PassUsageFilter>('all');

  const fetchPassUsages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pass-usage/admin', {
        headers: {
          'Authorization': `Bearer ${userId}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPassUsages(data);
      }
    } catch (error) {
      console.error('Error fetching pass usages:', error);
      toast.error('Failed to load pass usage data');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUsage = async (usageId: string, approve: boolean) => {
    try {
      const response = await fetch(`/api/pass-usage/${usageId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
        },
        body: JSON.stringify({
          isVerified: approve,
          verifiedBy: userId,
        }),
      });
      
      if (response.ok) {
        toast.success(`Usage ${approve ? 'approved' : 'rejected'} successfully`);
        fetchPassUsages();
      } else {
        throw new Error('Failed to verify usage');
      }
    } catch (error) {
      console.error('Error verifying usage:', error);
      toast.error('Failed to verify usage');
    }
  };

  const filteredUsages = passUsages.filter(usage => {
    if (filter === 'verified') return usage.isVerified;
    if (filter === 'unverified') return !usage.isVerified;
    return true;
  });

  useEffect(() => {
    fetchPassUsages();
  }, []);

  return {
    passUsages,
    filteredUsages,
    isLoading,
    filter,
    setFilter,
    verifyUsage,
    fetchPassUsages
  };
};
