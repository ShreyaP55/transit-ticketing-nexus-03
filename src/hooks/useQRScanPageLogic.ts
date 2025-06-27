
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { tripsAPI } from "@/services/api/trips";
import { useUser } from "@/context/UserContext";

export const useQRScanPageLogic = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, userId: currentUserId } = useUser();

  // Check if current user is authorized to perform actions
  const isAuthorized = isAuthenticated && (currentUserId === userId || currentUserId === 'admin');

  // Get current location with high accuracy
  useEffect(() => {
    if (!userId) return;
    
    const getLocation = () => {
      setIsLoading(true);
      setError(null);
      
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setIsLoading(false);
        return;
      }
      
      console.log("Requesting high-accuracy location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log("Location obtained:", coords, "Accuracy:", position.coords.accuracy, "meters");
          setLocation(coords);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError(`Failed to get your current location: ${error.message}`);
          setIsLoading(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    };
    
    getLocation();
    
    // Check if there's an active trip
    const checkActiveTrip = async () => {
      try {
        if (userId && isAuthenticated) {
          console.log("Checking for active trip for user:", userId);
          const trip = await tripsAPI.getActiveTrip(userId);
          console.log("Active trip result:", trip);
          setActiveTrip(trip);
          
          // Automatically perform action based on trip status
          if (isAuthorized && location) {
            if (trip) {
              // User has active trip, auto check-out
              console.log("Auto-checking out user with active trip");
              setTimeout(() => handleCheckOut(), 2000);
            } else {
              // No active trip, auto check-in
              console.log("Auto-checking in user without active trip");
              setTimeout(() => handleCheckIn(), 2000);
            }
          }
        }
      } catch (error) {
        console.error("Error checking active trip:", error);
      }
    };
    
    checkActiveTrip();
  }, [userId, isAuthenticated, location, isAuthorized]);

  // Handle check-in
  const handleCheckIn = async () => {
    if (!userId || !location) return;
    
    if (!isAuthorized) {
      toast.error("Access Denied", {
        description: "You are not authorized to perform this action",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      console.log("Starting check-in process for user:", userId, "at location:", location);
      
      // Start a new trip
      const result = await tripsAPI.startTrip(userId, location.lat, location.lng);
      console.log("Trip started successfully:", result);
      
      setActiveTrip(result.trip || result);
      
      toast.success("Check-in Successful", {
        description: `Your trip has started at ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("Check-in Failed", {
        description: error instanceof Error ? error.message : "Failed to start trip",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    if (!userId || !location || !activeTrip) return;
    
    if (!isAuthorized) {
      toast.error("Access Denied", {
        description: "You are not authorized to perform this action",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      console.log("Starting check-out process for trip:", activeTrip._id, "at location:", location);
      
      // End the trip
      const result = await tripsAPI.endTrip(activeTrip._id, location.lat, location.lng);
      console.log("Trip ended successfully:", result);
      
      const trip = result.trip || result;
      
      setActiveTrip(null);
      
      // Show success message with trip details
      const distance = trip.distance || 0;
      const fare = trip.fare || 0;
      
      if (result.deduction?.status === 'success') {
        toast.success("Check-out Successful", {
          description: `Trip completed! Distance: ${distance.toFixed(2)}km, Fare: ₹${fare.toFixed(2)}. ${result.deduction.message}`,
          duration: 6000,
        });
      } else {
        toast.warning("Trip Completed", {
          description: `Distance: ${distance.toFixed(2)}km, Fare: ₹${fare.toFixed(2)}. ${result.deduction?.message || 'Payment processing issue.'}`,
          duration: 8000,
        });
      }
      
      // Navigate to wallet page after a delay
      setTimeout(() => {
        navigate(`/wallet`);
      }, 3000);
    } catch (error) {
      console.error("Check-out error:", error);
      toast.error("Check-out Failed", {
        description: error instanceof Error ? error.message : "Failed to end trip",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(-1);
  };

  return {
    userId,
    isLoading,
    location,
    error,
    activeTrip,
    isProcessing,
    isAuthenticated: isAuthorized,
    handleCheckIn,
    handleCheckOut,
    handleCancel,
  };
};
