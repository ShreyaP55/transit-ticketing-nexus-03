
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Check, QrCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PassCard } from '@/components/passes/PassCard';
import { PassQRCode } from '@/components/passes/PassQRCode';
import { PassUsageList } from '@/components/passes/PassUsageList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IPass, IPassUsage } from '@/types';
import { getRouteDisplay } from '@/utils/typeGuards';

interface CurrentPassDisplayProps {
  activePass: IPass;
  usageHistory: IPassUsage[];
  isLoadingUsage: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefreshPass: () => void;
}

export const CurrentPassDisplay: React.FC<CurrentPassDisplayProps> = ({
  activePass,
  usageHistory,
  isLoadingUsage,
  activeTab,
  setActiveTab,
  onRefreshPass
}) => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="current" className="flex-1">Current Pass</TabsTrigger>
          <TabsTrigger value="qr-code" className="flex-1">QR Code</TabsTrigger>
          <TabsTrigger value="usage" className="flex-1">Usage History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-6">
          <PassCard pass={activePass} className="mb-8" />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-transit-green" />
                Pass Benefits
              </CardTitle>
              <CardDescription>
                Enjoy unlimited travel on your selected route
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex">
                  <Check className="mr-2 h-4 w-4 text-transit-green mt-1" />
                  <span>Unlimited rides on the {getRouteDisplay(activePass.routeId)} route</span>
                </li>
                <li className="flex">
                  <Check className="mr-2 h-4 w-4 text-transit-green mt-1" />
                  <span>Valid for a full month from date of purchase</span>
                </li>
                <li className="flex">
                  <Check className="mr-2 h-4 w-4 text-transit-green mt-1" />
                  <span>More economical than buying individual tickets</span>
                </li>
                <li className="flex">
                  <Check className="mr-2 h-4 w-4 text-transit-green mt-1" />
                  <span>No need to purchase tickets for every journey</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                Explore Routes
              </Button>
              <Button 
                onClick={onRefreshPass}
                variant="ghost" 
                className="w-full sm:w-auto"
              >
                Refresh Pass Status
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="qr-code">
          <div className="max-w-md mx-auto">
            <PassQRCode pass={activePass} />
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <QrCode className="mx-auto h-8 w-8 text-primary" />
                  <h3 className="font-medium">How to use your pass</h3>
                  <p className="text-sm text-muted-foreground">
                    Show this QR code to the bus conductor or admin for verification. 
                    Each scan will be recorded for tracking your daily travel.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="usage">
          <PassUsageList 
            usageHistory={usageHistory} 
            isLoading={isLoadingUsage} 
            activePass={activePass} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
