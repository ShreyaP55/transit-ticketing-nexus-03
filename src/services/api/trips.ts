
import { fetchAPI } from "./base";

// Trips API for QR Scanner
export const tripsAPI = {
  startTrip: async (userId: string, latitude: number, longitude: number): Promise<any> => {
    return fetchAPI("/trips/start", {
      method: "POST",
      body: JSON.stringify({ 
        userId, 
        latitude, 
        longitude,
        busId: "default_bus_id",
        startCoords: { lat: latitude, lng: longitude }
      }),
    });
  },

  endTrip: async (tripId: string, latitude: number, longitude: number): Promise<any> => {
    return fetchAPI(`/trips/${tripId}/end`, {
      method: "PUT",
      body: JSON.stringify({ 
        latitude, 
        longitude,
        endCoords: { lat: latitude, lng: longitude }
      }),
    });
  },

  getActiveTrip: async (userId: string): Promise<any> => {
    try {
      const response: any = await fetchAPI(`/trips/active/${userId}`);
      return (response && typeof response === 'object' && response.active) ? response.trip : null;
    } catch (error: any) {
      // If it's a 404 or access denied, return null instead of throwing
      if (error.message.includes('404') || error.message.includes('Access denied')) {
        return null;
      }
      throw error;
    }
  },

  getUserTrips: async (userId: string): Promise<any[]> => {
    try {
      return await fetchAPI(`/trips/user/${userId}`);
    } catch (error) {
      console.error('Error getting user trips:', error);
      return [];
    }
  },
};
