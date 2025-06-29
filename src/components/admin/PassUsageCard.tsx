
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { PassUsage } from "@/types/passUsage";

interface PassUsageCardProps {
  usage: PassUsage;
  onVerify: (usageId: string, approve: boolean) => void;
}

export const PassUsageCard: React.FC<PassUsageCardProps> = ({ usage, onVerify }) => {
  return (
    <Card className="bg-secondary/50 border-border shadow-sm">
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
              onClick={() => onVerify(usage._id, true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onVerify(usage._id, false)}
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
  );
};
