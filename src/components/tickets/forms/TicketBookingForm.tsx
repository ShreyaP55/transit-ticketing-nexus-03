
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, MapPin, Search, ChevronDown } from "lucide-react";

interface TicketBookingFormProps {
  routes: any[];
  buses: any[];
  stations: any[];
  selectedRouteId: string;
  selectedBusId: string;
  selectedStationId: string;
  selectedRoute: any;
  selectedBus: any;
  selectedStation: any;
  loadingRoutes: boolean;
  loadingBuses: boolean;
  loadingStations: boolean;
  searchQuery: string;
  price: number;
  onRouteChange: (routeId: string) => void;
  onBusChange: (busId: string) => void;
  onStationChange: (stationId: string) => void;
  onSearchChange: (query: string) => void;
}

export const TicketBookingForm: React.FC<TicketBookingFormProps> = ({
  routes,
  buses,
  stations,
  selectedRouteId,
  selectedBusId,
  selectedStationId,
  selectedRoute,
  selectedBus,
  selectedStation,
  loadingRoutes,
  loadingBuses,
  loadingStations,
  searchQuery,
  price,
  onRouteChange,
  onBusChange,
  onStationChange,
  onSearchChange
}) => {
  const [isRouteDropdownOpen, setIsRouteDropdownOpen] = useState(false);

  const handleStationSelect = (station: any) => {
    onStationChange(station._id);
    onBusChange(station.busId || selectedBusId);
  };

  return (
    <div className="space-y-6">
      {/* Route Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MapPin className="mr-2 h-5 w-5 text-blue-600" />
            Select Route
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div 
              className="w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => setIsRouteDropdownOpen(!isRouteDropdownOpen)}
            >
              {selectedRoute ? (
                <span className="font-medium">{selectedRoute.start} → {selectedRoute.end}</span>
              ) : (
                <span className="text-gray-500">-- Choose a route --</span>
              )}
              <ChevronDown 
                size={20} 
                className={`transition-transform text-gray-400 ${isRouteDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </div>
            
            {isRouteDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {loadingRoutes ? (
                  <div className="p-3 text-gray-500">Loading routes...</div>
                ) : routes.length > 0 ? (
                  routes.map((route) => (
                    <div 
                      key={route._id} 
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        onRouteChange(route._id);
                        setIsRouteDropdownOpen(false);
                      }}
                    >
                      <div className="font-medium">{route.start} → {route.end}</div>
                      <div className="text-sm text-gray-500">Base fare: ₹{route.fare}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500">No routes available</div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedRoute && (
        <>
          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="Search buses..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Buses and Stations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loadingBuses ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                Loading buses and stations...
              </div>
            ) : buses.length > 0 ? (
              buses.map((bus) => {
                const busStations = stations.filter(
                  (station) => String(station.busId) === String(bus._id)
                );
                
                return (
                  <Card key={bus._id} className={`transition-all ${
                    selectedBusId === bus._id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Bus className="text-blue-600 mr-2" size={20} />
                          <div>
                            <CardTitle className="text-lg">{bus.name}</CardTitle>
                            <p className="text-sm text-gray-500">Capacity: {bus.capacity}</p>
                          </div>
                        </div>
                        {selectedBusId === bus._id && (
                          <Badge className="bg-green-100 text-green-800">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <h4 className="font-medium text-gray-700 mb-3">Available Stations</h4>
                      <div className="space-y-2 mb-4">
                        {busStations.length > 0 ? (
                          busStations.map((station) => (
                            <div
                              key={station._id}
                              onClick={() => handleStationSelect(station)}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                selectedStationId === station._id
                                  ? "bg-blue-100 border-blue-300 shadow-sm"
                                  : "hover:bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{station.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {station.location || 'Station location'}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-blue-600">
                                    ₹{station.fare}
                                  </div>
                                  <div className="text-xs text-gray-500">per ticket</div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            No stations available for this bus
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                {searchQuery ? 'No buses found matching your search.' : 'No buses available for this route.'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
