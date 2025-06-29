
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";

export const TicketModalHeader: React.FC = () => {
  return (
    <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
      <DialogTitle className="flex items-center text-xl">
        <MapPin className="mr-2 h-6 w-6" />
        🎟️ Bus Ticket Booking
      </DialogTitle>
      <DialogDescription className="text-blue-100">
        Select your route, bus, and boarding station
      </DialogDescription>
    </DialogHeader>
  );
};
