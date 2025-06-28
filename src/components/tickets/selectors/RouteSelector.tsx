
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface RouteSelectorProps {
  routes: any[];
  selectedRouteId: string;
  loading: boolean;
  onRouteChange: (routeId: string) => void;
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  routes,
  selectedRouteId,
  loading,
  onRouteChange
}) => {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-white">Route</label>
      <Select value={selectedRouteId} onValueChange={onRouteChange} disabled={loading}>
        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
          <SelectValue placeholder="Select a route" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {loading ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          ) : (
            routes.length
              ? routes.map(route =>
                <SelectItem key={route._id} value={route._id} className="text-white">
                  {route.start} - {route.end} (₹{route.fare})
                </SelectItem>)
              : <SelectItem value="none" disabled>No routes available</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
