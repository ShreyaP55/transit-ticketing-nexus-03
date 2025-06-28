
import { IPass, IPassUsage } from "@/types";
import { fetchAPI, getAuthToken } from "./base";

// Passes API
export const passesAPI = {
  getActivePass: (): Promise<IPass> => {
    const userId = getAuthToken();
    return fetchAPI(`/passes?userId=${userId}`);
  },

  getByUserId: (userId: string): Promise<IPass[]> => {
    if (!userId) {
      return Promise.resolve([]);
    }
    return fetchAPI(`/passes?userId=${userId}`);
  },
    
  createPass: (pass: { routeId: string; fare: number; sessionId: string }): Promise<{ success: boolean; pass: IPass }> => {
    const userId = getAuthToken();
    return fetchAPI("/passes", {
      method: "POST",
      body: JSON.stringify({ ...pass, userId }),
    });
  },
    
  confirmPassPayment: (sessionId: string): Promise<{ success: boolean; pass: IPass }> => {
    const userId = getAuthToken();
    return fetchAPI("/payments", {
      method: "POST",
      body: JSON.stringify({ sessionId, userId }),
    });
  },
    
  getPassUsage: (): Promise<IPassUsage[]> => {
    const userId = getAuthToken();
    return fetchAPI(`/pass-usage?userId=${userId}`);
  },

  getAllPassUsages: (): Promise<IPassUsage[]> => {
    return fetchAPI("/pass-usage/admin");
  },

  verifyPassUsage: (usageId: string, isVerified: boolean, verifiedBy: string): Promise<{ success: boolean; message: string }> => {
    return fetchAPI(`/pass-usage/${usageId}/verify`, {
      method: "POST",
      body: JSON.stringify({ isVerified, verifiedBy }),
    });
  },
    
  recordPassUsage: (passData: { 
    passId: string; 
    location?: string; 
    busId?: string; 
    stationName?: string; 
  }): Promise<{ message: string; usage: IPassUsage }> => {
    const userId = getAuthToken();
    return fetchAPI("/pass-usage", {
      method: "POST",
      body: JSON.stringify({ ...passData, userId }),
    });
  },
};
