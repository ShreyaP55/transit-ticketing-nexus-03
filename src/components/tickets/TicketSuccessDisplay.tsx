
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MapPin, Bus, Calendar, DollarSign, Ticket } from "lucide-react";
import { ITicket } from "@/types";

interface TicketSuccessDisplayProps {
  ticket: ITicket;
}

export const TicketSuccessDisplay: React.FC<TicketSuccessDisplayProps> = ({ ticket }) => {
  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardHeader className="bg-green-100 border-b border-green-200">
        <CardTitle className="flex items-center text-green-800">
          <CheckCircle className="mr-2 h-6 w-6" />
          ✅ Ticket Booked Successfully!
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start">
            <Ticket className="text-blue-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Ticket ID</p>
              <p className="font-medium text-gray-800">{ticket._id}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="text-blue-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Station</p>
              <p className="font-medium text-gray-800">{ticket.selectedStation}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Bus className="text-blue-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Bus</p>
              <p className="font-medium text-gray-800">
                {typeof ticket.busId === 'object' && ticket.busId?.name 
                  ? ticket.busId.name 
                  : 'Bus Info'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <DollarSign className="text-blue-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Fare Paid</p>
              <p className="font-medium text-green-600">₹{ticket.price}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Calendar className="text-blue-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Purchased At</p>
              <p className="font-medium text-gray-800">
                {new Date(ticket.purchasedAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Calendar className="text-orange-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-sm text-gray-500">Valid Until</p>
              <p className="font-medium text-orange-600">
                {new Date(ticket.expiresAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
