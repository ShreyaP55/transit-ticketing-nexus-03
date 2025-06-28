
import { useState, useEffect } from "react";
import { routesAPI, busesAPI, stationsAPI } from "@/services/api";

export const useTicketModal = (open: boolean) => {
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedStationId, setSelectedStationId] = useState("");

  // Data
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);

  // Load routes on open
  useEffect(() => {
    if (open) {
      setLoadingRoutes(true);
      routesAPI.getAll().then(r => setRoutes(r)).finally(() => setLoadingRoutes(false));
      setSelectedRouteId("");
      setSelectedBusId("");
      setSelectedStationId("");
    }
  }, [open]);

  // Load buses when route changes
  useEffect(() => {
    if (selectedRouteId) {
      setLoadingBuses(true);
      busesAPI.getAll(selectedRouteId).then(b => setBuses(b)).finally(() => setLoadingBuses(false));
      setSelectedBusId("");
      setSelectedStationId("");
    }
  }, [selectedRouteId]);

  // Load stations when bus changes
  useEffect(() => {
    if (selectedRouteId && selectedBusId) {
      setLoadingStations(true);
      stationsAPI.getAll({ routeId: selectedRouteId, busId: selectedBusId }).then(s => setStations(s)).finally(() => setLoadingStations(false));
      setSelectedStationId("");
    }
  }, [selectedBusId, selectedRouteId]);

  const selectedRoute = routes.find(r => r._id === selectedRouteId);
  const selectedBus = buses.find(b => b._id === selectedBusId);
  const selectedStation = stations.find(s => s._id === selectedStationId);

  const price = selectedStation?.fare || 0;

  return {
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
    selectedRoute,
    selectedBus,
    selectedStation,
    price
  };
};
