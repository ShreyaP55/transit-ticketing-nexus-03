
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, CreditCard } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { stripeService } from "@/services/stripeService";
import { useTicketModal } from "@/hooks/useTicketModal";
import { RouteSelector } from "./selectors/RouteSelector";
import { BusSelector } from "./selectors/BusSelector";
import { StationSelector } from "./selectors/StationSelector";
import { PriceDisplay } from "./display/PriceDisplay";

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ open, onOpenChange }) => {
  const { userId } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

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
    price
  } = useTicketModal(open);

  // Proceed to Stripe checkout
  const handleProceedToCheckout = async () => {
    if (!selectedRouteId || !selectedBusId || !selectedStationId || !userId) return;

    try {
      setIsProcessing(true);
      toast.info("Redirecting to payment...");

      const session = await stripeService.createTicketCheckoutSession(
        selectedStationId,
        selectedBusId,
        price
      );

      if (session && session.url) {
        // Redirect to Stripe checkout
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] p-0 overflow-visible bg-gray-900 border-gray-700">
        <form
          className="bg-gray-900 rounded-lg shadow overflow-hidden"
          onSubmit={e => {
            e.preventDefault();
            handleProceedToCheckout();
          }}>
          <DialogHeader className="bg-gradient-to-r from-blue-600/20 to-transparent px-6 py-4 border-b border-gray-700">
            <DialogTitle className="flex items-center text-lg sm:text-xl text-white">
              <MapPin className="mr-2 text-blue-400 h-5 w-5" />
              Buy a New Ticket
            </DialogTitle>
            <DialogDescription className="text-gray-400">Select route, bus, and station to purchase</DialogDescription>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <RouteSelector
              routes={routes}
              selectedRouteId={selectedRouteId}
              loading={loadingRoutes}
              onRouteChange={setSelectedRouteId}
            />

            <BusSelector
              buses={buses}
              selectedBusId={selectedBusId}
              selectedRouteId={selectedRouteId}
              loading={loadingBuses}
              onBusChange={setSelectedBusId}
            />

            <StationSelector
              stations={stations}
              selectedStationId={selectedStationId}
              selectedBusId={selectedBusId}
              loading={loadingStations}
              onStationChange={setSelectedStationId}
            />

            <PriceDisplay price={price} />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-700 p-4 bg-gray-800">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto bg-gray-700 border-gray-600 text-white hover:bg-gray-600">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!selectedRouteId || !selectedBusId || !selectedStationId || isProcessing}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isProcessing ? "Redirecting..." : "Proceed to Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
