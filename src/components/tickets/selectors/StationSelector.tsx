
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface StationSelectorProps {
  stations: any[];
  selectedStationId: string;
  selectedBusId: string;
  loading: boolean;
  onStationChange: (stationId: string) => void;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  stations,
  selectedStationId,
  selectedBusId,
  loading,
  onStationChange
}) => {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-white">Station</label>
      <Select
        value={selectedStationId}
        onValueChange={onStationChange}
        disabled={!selectedBusId || loading}
      >
        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
          <SelectValue placeholder={!selectedBusId ? "Select a bus first" : "Select station"} />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {loading ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          ) : (
            stations.length
              ? stations.map(station =>
                <SelectItem key={station._id} value={station._id} className="text-white">
                  {station.name} <Badge className="ml-2 bg-gray-700" variant="outline">₹{station.fare}</Badge>
                </SelectItem>)
              : <SelectItem value="none" disabled>No stations available</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
