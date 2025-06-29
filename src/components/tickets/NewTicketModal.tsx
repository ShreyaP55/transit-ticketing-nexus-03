
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MapPin, CreditCard, Search, ChevronDown } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { stripeService } from "@/services/stripeService";
import { useTicketModal } from "@/hooks/useTicketModal";
import { TicketBookingForm } from "./forms/TicketBookingForm";

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ open, onOpenChange }) => {
  const { userId } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    selectedRouteId,
    setSelectedRouteId,
    selectedBusId,
    setSelectedBusId,
    selectedStationId,
    setSelectedStationId,
    routes,
    buses,
    stations,
    loadingRoutes,
    loadingBuses,
    loadingStations,
    price,
    selectedRoute,
    selectedBus,
    selectedStation
  } = useTicketModal(open);

  const handleProceedToCheckout = async () => {
    if (!selectedRouteId || !selectedBusId || !selectedStationId || !userId) {
      toast.error("Please select route, bus, and station");
      return;
    }

    try {
      setIsProcessing(true);
      toast.info("Redirecting to payment...");

      const session = await stripeService.createTicketCheckoutSession(
        selectedStationId,
        selectedBusId,
        price
      );

      if (session && session.url) {
        await stripeService.redirectToCheckout(session.url);
      } else {
        toast.error("Failed to create payment session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredBuses = buses.filter(bus => 
    bus.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 bg-gray-50">
        <div className="bg-white">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
            <DialogTitle className="flex items-center text-xl">
              <MapPin className="mr-2 h-6 w-6" />
              🎟️ Bus Ticket Booking
            </DialogTitle>
            <DialogDescription className="text-blue-100">
              Select your route, bus, and boarding station
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            <TicketBookingForm
              routes={routes}
              buses={filteredBuses}
              stations={stations}
              selectedRouteId={selectedRouteId}
              selectedBusId={selectedBusId}
              selectedStationId={selectedStationId}
              selectedRoute={selectedRoute}
              selectedBus={selectedBus}
              selectedStation={selectedStation}
              loadingRoutes={loadingRoutes}
              loadingBuses={loadingBuses}
              loadingStations={loadingStations}
              searchQuery={searchQuery}
              price={price}
              onRouteChange={setSelectedRouteId}
              onBusChange={setSelectedBusId}
              onStationChange={setSelectedStationId}
              onSearchChange={setSearchQuery}
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center mb-4 sm:mb-0">
              {price > 0 && (
                <div className="text-lg font-semibold text-green-600">
                  Total: ₹{price}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <DialogClose asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleProceedToCheckout}
                disabled={!selectedRouteId || !selectedBusId || !selectedStationId || isProcessing}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isProcessing ? "Processing..." : `Pay ₹${price}`}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
