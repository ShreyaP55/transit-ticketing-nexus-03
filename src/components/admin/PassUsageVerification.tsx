
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, MapPin, User } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface PassUsage {
  _id: string;
  userId: string;
  passId: string;
  scannedAt: string;
  location?: string;
  verifiedBy?: string;
  busId?: string;
  stationName?: string;
  isVerified: boolean;
}

const PassUsageVerification: React.FC = () => {
  const { userId, user } = useUser();
  const [passUsages, setPassUsages] = useState<PassUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  useEffect(() => {
    fetchPassUsages();
  }, []);

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
        fetchPassUsages(); // Refresh the data
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

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-card-foreground">
          <CheckCircle className="mr-2 h-5 w-5 text-primary" />
          Pass Usage Verification
        </CardTitle>
        <div className="flex gap-2 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All ({passUsages.length})
          </Button>
          <Button
            variant={filter === 'unverified' ? 'default' : 'outline'}
            onClick={() => setFilter('unverified')}
            size="sm"
          >
            Unverified ({passUsages.filter(u => !u.isVerified).length})
          </Button>
          <Button
            variant={filter === 'verified' ? 'default' : 'outline'}
            onClick={() => setFilter('verified')}
            size="sm"
          >
            Verified ({passUsages.filter(u => u.isVerified).length})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2 text-muted-foreground">Loading usage data...</span>
          </div>
        ) : filteredUsages.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1 text-card-foreground">No Usage Data</h3>
            <p className="text-muted-foreground">
              No pass usage data found for the selected filter
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredUsages.map((usage) => (
              <Card key={usage._id} className="bg-secondary/50 border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium text-card-foreground">
                          User: {usage.userId.substring(0, 8)}...
                        </span>
                        <Badge 
                          variant={usage.isVerified ? "default" : "secondary"}
                          className={usage.isVerified ? "bg-green-100 text-green-800" : ""}
                        >
                          {usage.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">
                            Scanned: {format(new Date(usage.scannedAt), "MMM d, yyyy h:mm a")}
                          </span>
                        </div>
                        
                        {usage.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">
                              Location: {usage.location}
                            </span>
                          </div>
                        )}
                        
                        {usage.stationName && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">
                              Station: {usage.stationName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {!usage.isVerified && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <Button
                        size="sm"
                        onClick={() => verifyUsage(usage._id, true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => verifyUsage(usage._id, false)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  {usage.isVerified && usage.verifiedBy && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        Verified by: {usage.verifiedBy.substring(0, 8)}...
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PassUsageVerification;
