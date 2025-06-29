
import React, { useState } from 'react';
import { AlertCircle, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { paymentAPI } from '@/services/api';
import { toast } from 'sonner';
import { IRoute } from '@/types';

interface PassPurchaseFormProps {
  routes: IRoute[];
  isLoadingRoutes: boolean;
}

export const PassPurchaseForm: React.FC<PassPurchaseFormProps> = ({
  routes,
  isLoadingRoutes
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const selectedRoute = routes.find(r => r._id === selectedRouteId);

  const handlePurchasePass = async () => {
    if (!selectedRouteId) {
      toast.error("Please select a route");
      return;
    }
    
    if (!selectedRoute) {
      toast.error("Invalid route selected");
      return;
    }
    
    try {
      setIsProcessing(true);
      const response = await paymentAPI.createPassCheckoutSession(
        selectedRouteId,
        selectedRoute.fare * 20
      );
      
      if (response && response.url) {
        window.location.href = response.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Monthly Pass</CardTitle>
        <CardDescription>
          Select a route to purchase a monthly transit pass
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-6">
          <div>
            <label htmlFor="route" className="block text-sm font-medium mb-1">
              Select Route
            </label>
            <Select
              value={selectedRouteId}
              onValueChange={setSelectedRouteId}
              disabled={isLoadingRoutes}
            >
              <SelectTrigger id="route" className="w-full">
                <SelectValue placeholder="Choose a route" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingRoutes ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : routes.length > 0 ? (
                  routes.map((route) => (
                    <SelectItem key={route._id} value={route._id}>
                      {route.start} - {route.end} (₹{route.fare})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No routes available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {selectedRouteId && selectedRoute && (
            <div className="rounded-lg p-4 bg-transit-light-blue/10">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-transit-blue" />
                Monthly Pass Details
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <span className="text-muted-foreground">Route:</span>
                  <span className="font-medium">{selectedRoute.start} - {selectedRoute.end}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <span className="text-muted-foreground">Regular fare:</span>
                  <span>₹{selectedRoute.fare.toFixed(2)} per trip</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <span className="text-muted-foreground">Monthly pass price:</span>
                  <span className="font-medium">₹{(selectedRoute.fare * 20).toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <span className="text-muted-foreground">Validity:</span>
                  <span>30 days from purchase</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-transit-yellow mt-0.5 flex-shrink-0" />
                <p>
                  A monthly pass is perfect if you travel more than 20 times per month on this route,
                  giving you unlimited rides and saving you money.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={handlePurchasePass}
          disabled={!selectedRouteId || isProcessing}
          className="px-6"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Purchase Pass
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
