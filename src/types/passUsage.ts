
export interface PassUsage {
  _id: string;
  userId: string;
  passId: string;
  scannedAt: string;
  location?: string;
  verifiedBy?: string;
  busId?: string;
  stationName?: string;
  isVerified: boolean;
}

export type PassUsageFilter = 'all' | 'verified' | 'unverified';
