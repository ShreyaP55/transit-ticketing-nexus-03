
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, CreditCard, AlertCircle, ClockIcon, MapPin, Check, CheckCircle, History, QrCode } from "lucide-react";
import { routesAPI, passesAPI, paymentAPI } from "@/services/api";
import MainLayout from "@/components/layout/MainLayout";
import { PassCard } from "@/components/passes/PassCard";
import { PassQRCode } from "@/components/passes/PassQRCode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useUser } from "@/context/UserContext";
import { PassUsageList } from "@/components/passes/PassUsageList";
import { getRouteDisplay } from "@/utils/typeGuards";

const PassPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");
  const queryClient = useQueryClient();
  
  const { userId } = useUser();
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [activeTab, setActiveTab] = useState("current");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Confirm payment after successful checkout
  const confirmPayment = async (sessionId) => {
    try {
      setIsProcessing(true);
      // After successful payment, finalize the pass purchase here
      const result = await passesAPI.confirmPassPayment(sessionId);
      if (result.success) {
        toast.success("Monthly pass purchased successfully!");
        queryClient.invalidateQueries({ queryKey: ["activePass"] });
        navigate("/pass"); // Remove query params
      } else {
        toast.error("Failed to create pass after payment");
      }
    } catch (error) {
      toast.error("Failed to process payment confirmation");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Listen for ?status=success&session_id=X and confirm payment
  useEffect(() => {
    if (status === "success" && sessionId) {
      toast.success("Payment successful! Processing your pass...");
      confirmPayment(sessionId);
    } else if (status === "cancel") {
      toast.error("Payment was canceled.");
    }
  }, [status, sessionId]);
  
  // Fetch routes
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll,
    retry: 2,
    staleTime: 1000 * 60 * 2, // cache for speed
  });
  
  // Fetch active pass
  const {
    data: activePass,
    isLoading: isLoadingPass,
    error: passError,
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
  
  const selectedRoute = routes.find(r => r._id === selectedRouteId);

  // Handle purchase pass
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

      // Updated paymentAPI will throw if backend fails; catch and show specific error
      const response = await paymentAPI.createPassCheckoutSession(
        selectedRouteId,
        selectedRoute.fare * 20 // Monthly pass discount
      );
      
      if (response && response.url) {
        window.location.href = response.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error: any) {
      console.error(error);
      // Show backend message if exists
      toast.error(error?.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout title="Monthly Pass">
      <div className="max-w-4xl mx-auto">
        {isLoadingPass ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        ) : activePass ? (
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
                      onClick={() => refetchPass()}
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
        ) : (
          <div className="animate-fade-in">
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
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PassPage;
