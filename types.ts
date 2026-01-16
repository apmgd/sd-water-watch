
export enum StatusLevel {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  DANGER = 'DANGER'
}

export interface WaterDataPoint {
  date: string; // ISO Date
  value: number; // e.g., Enterococcus MPN/100ml
  threshold: number; // The danger line for this specific location
}

export interface BeachSite {
  id: string;
  name: string;
  currentStatus: StatusLevel;
  lastUpdated: string;
  reason?: string;
  history: WaterDataPoint[];
  latitude: number;
  longitude: number;
}

export interface AreaGroup {
  id: string;
  name: string; // e.g., "Imperial Beach", "Coronado"
  region: string; // e.g., "South Bay", "Central", "North County"
  sites: BeachSite[]; // Individual monitoring sites in this area
  highestReading48h: number; // Highest reading from last 48 hours across all sites
  averageReading48h: number; // Average reading from last 48 hours across all sites
  worstStatus: StatusLevel; // Worst status among all sites
  lastUpdated: string;
}

// Legacy type for backwards compatibility
export interface BeachGroup {
  id: string;
  name: string;
  region: string;
  currentStatus: StatusLevel;
  lastUpdated: string;
  reason?: string;
  history: WaterDataPoint[];
  latitude: number;
  longitude: number;
}
