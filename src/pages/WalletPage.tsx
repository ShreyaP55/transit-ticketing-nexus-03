
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard, Navigation, MapPin, Clock } from 'lucide-react';
import { useUser } from "@/context/UserContext";
import UserQRCode from "@/components/wallet/UserQRCode";
import WalletCard from "@/components/wallet/WalletCard";
import { ridesAPI } from "@/services/api";
import { IRide } from "@/types";
import { toast } from "sonner";

const WalletPage = () => {
  const { userId, isAuthenticated } = useUser();
  const [rides, setRides] = useState<IRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId || !isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const userRides = await ridesAPI.getHistory(userId);
        setRides(Array.isArray(userRides) ? userRides : []);
      } catch (error) {
        console.error("Error fetching ride history:", error);
        setError("Failed to load ride history");
        setRides([]);
        toast.error("Failed to load ride history");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
    
    // Refresh history every 30 seconds
    const intervalId = setInterval(fetchHistory, 30000);
    
    return () => clearInterval(intervalId);
  }, [userId, isAuthenticated]);
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  if (!isAuthenticated) {
    return (
      <MainLayout title="My Wallet">
        <div className="max-w-7xl mx-auto p-6 bg-background min-h-screen">
          <Card className="bg-card border-border shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-medium mb-2 text-card-foreground">Please Login</h3>
                <p className="text-muted-foreground">
                  You need to be logged in to use the wallet features
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Wallet">
      <div className="max-w-7xl mx-auto p-6 bg-background min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - QR Code and Wallet */}
          <div className="space-y-6">
            {/* QR Code Card */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center text-card-foreground">
                <CreditCard className="mr-2 h-5 w-5 text-primary" />
                Your Travel Pass
              </h3>
              <UserQRCode />
            </div>
            
            {/* Wallet Card */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center text-card-foreground">
                <Wallet className="mr-2 h-5 w-5 text-primary" />
                Your Balance
              </h3>
              <WalletCard />
            </div>
          </div>
          
          {/* Right Column - Ride History */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border shadow-md h-full">
              <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent border-b border-border">
                <CardTitle className="flex items-center text-card-foreground">
                  <Navigation className="mr-2 h-5 w-5 text-primary" />
                  Ride History
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your recent travel and payments
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading your rides...</p>
                  </div>
                ) : error ? (
                  <div className="py-8 text-center">
                    <Clock className="h-12 w-12 text-red-400 mx-auto" />
                    <p className="mt-4 text-red-400">{error}</p>
                    <p className="text-sm text-muted-foreground">
                      Please try refreshing the page
                    </p>
                  </div>
                ) : rides.length === 0 ? (
                  <div className="py-8 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="mt-4 text-muted-foreground">No ride history found</p>
                    <p className="text-sm text-muted-foreground">
                      Use your QR code to start a ride
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {rides.slice(0, 10).map((ride) => (
                      <Card key={ride._id} className="bg-secondary/50 border-border shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-1">
                                <Badge 
                                  variant={!ride.active ? "default" : "outline"}
                                  className={!ride.active ? "bg-primary text-primary-foreground" : ""}
                                >
                                  {!ride.active ? 'Completed' : 'In Progress'}
                                </Badge>
                                <span className="text-xs text-muted-foreground ml-2 truncate">
                                  {formatDate(ride.createdAt)}
                                </span>
                              </div>
                              
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center text-xs text-card-foreground">
                                  <MapPin className="h-3 w-3 mr-1 text-primary flex-shrink-0" />
                                  <span className="truncate">
                                    Start: {ride.startLocation?.latitude?.toFixed(4) || 'N/A'}, {ride.startLocation?.longitude?.toFixed(4) || 'N/A'}
                                  </span>
                                </div>
                                
                                {ride.endLocation && (
                                  <div className="flex items-center text-xs text-card-foreground">
                                    <MapPin className="h-3 w-3 mr-1 text-primary flex-shrink-0" />
                                    <span className="truncate">
                                      End: {ride.endLocation.latitude.toFixed(4)}, {ride.endLocation.longitude.toFixed(4)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right ml-2 flex-shrink-0">
                              {!ride.active && ride.distance && ride.fare && (
                                <>
                                  <p className="text-xs font-medium text-card-foreground">
                                    {ride.distance.toFixed(2)} km
                                  </p>
                                  <p className="text-sm font-bold text-primary">
                                    ₹{ride.fare}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default WalletPage;
