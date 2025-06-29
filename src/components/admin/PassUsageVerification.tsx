
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { usePassUsageVerification } from "@/hooks/usePassUsageVerification";
import { PassUsageFilterButtons } from "./PassUsageFilterButtons";
import { PassUsageList } from "./PassUsageList";

const PassUsageVerification: React.FC = () => {
  const { userId, user } = useUser();
  const {
    passUsages,
    filteredUsages,
    isLoading,
    filter,
    setFilter,
    verifyUsage
  } = usePassUsageVerification(userId);

  if (!user || user.role !== 'admin') {
    return (
      <Card className="bg-card border-border shadow-md">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-medium mb-2 text-card-foreground">Access Denied</h3>
            <p className="text-muted-foreground">
              You need admin privileges to access this feature
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const verifiedCount = passUsages.filter(u => u.isVerified).length;
  const unverifiedCount = passUsages.filter(u => !u.isVerified).length;

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-card-foreground">
          <CheckCircle className="mr-2 h-5 w-5 text-primary" />
          Pass Usage Verification
        </CardTitle>
        <PassUsageFilterButtons
          filter={filter}
          setFilter={setFilter}
          totalCount={passUsages.length}
          verifiedCount={verifiedCount}
          unverifiedCount={unverifiedCount}
        />
      </CardHeader>
      
      <CardContent>
        <PassUsageList
          usages={filteredUsages}
          isLoading={isLoading}
          onVerify={verifyUsage}
        />
      </CardContent>
    </Card>
  );
};

export default PassUsageVerification;
