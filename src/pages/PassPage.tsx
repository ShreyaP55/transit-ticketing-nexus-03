
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { routesAPI, passesAPI } from "@/services/api";
import MainLayout from "@/components/layout/MainLayout";
import { PassPurchaseForm } from "@/components/passes/PassPurchaseForm";
import { CurrentPassDisplay } from "@/components/passes/CurrentPassDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { usePassPaymentConfirmation } from "@/hooks/usePassPaymentConfirmation";

const PassPage = () => {
  const [activeTab, setActiveTab] = useState("current");
  
  // Handle payment confirmation
  usePassPaymentConfirmation();
  
  // Fetch routes
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll,
    retry: 2,
    staleTime: 1000 * 60 * 2,
  });
  
  // Fetch active pass
  const {
    data: activePass,
    isLoading: isLoadingPass,
    refetch: refetchPass
  } = useQuery({
    queryKey: ["activePass"],
    queryFn: passesAPI.getActivePass,
    retry: (failureCount, error) => {
      if (error.message.includes("404")) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 2,
  });

  // Fetch pass usage history
  const {
    data: usageHistory = [],
    isLoading: isLoadingUsage
  } = useQuery({
    queryKey: ["passUsage"],
    queryFn: passesAPI.getPassUsage,
    enabled: !!activePass,
    retry: 2,
    staleTime: 1000 * 60,
  });

  return (
    <MainLayout title="Monthly Pass">
      <div className="max-w-4xl mx-auto">
        {isLoadingPass ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        ) : activePass ? (
          <CurrentPassDisplay
            activePass={activePass}
            usageHistory={usageHistory}
            isLoadingUsage={isLoadingUsage}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onRefreshPass={refetchPass}
          />
        ) : (
          <div className="animate-fade-in">
            <PassPurchaseForm
              routes={routes}
              isLoadingRoutes={isLoadingRoutes}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PassPage;
