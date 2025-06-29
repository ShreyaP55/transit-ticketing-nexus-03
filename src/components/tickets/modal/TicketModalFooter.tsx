
import React from "react";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface TicketModalFooterProps {
  price: number;
  isProcessing: boolean;
  canProceed: boolean;
  onProceedToCheckout: () => void;
}

export const TicketModalFooter: React.FC<TicketModalFooterProps> = ({
  price,
  isProcessing,
  canProceed,
  onProceedToCheckout
}) => {
  return (
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
          onClick={onProceedToCheckout}
          disabled={!canProceed || isProcessing}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {isProcessing ? "Processing..." : `Pay ₹${price}`}
        </Button>
      </div>
    </DialogFooter>
  );
};
