
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { stripeService } from "@/services/stripeService";
import { useTicketModal } from "@/hooks/useTicketModal";
import { TicketBookingForm } from "./forms/TicketBookingForm";
import { TicketModalHeader } from "./modal/TicketModalHeader";
import { TicketModalFooter } from "./modal/TicketModalFooter";

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

  const canProceed = selectedRouteId && selectedBusId && selectedStationId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 bg-gray-50">
        <div className="bg-white">
          <TicketModalHeader />
          
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

          <TicketModalFooter
            price={price}
            isProcessing={isProcessing}
            canProceed={canProceed}
            onProceedToCheckout={handleProceedToCheckout}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
