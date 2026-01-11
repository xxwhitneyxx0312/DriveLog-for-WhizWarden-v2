
export enum TripType {
  BUSINESS = 'Business',
  PERSONAL = 'Personal',
  UNCLASSIFIED = 'Unclassified'
}

export enum DistanceUnit {
  KM = 'km',
  MILES = 'miles'
}

export interface DriveTrip {
  id: string;
  startLocation: string;
  endLocation: string;
  distance: number; // Stored in KM
  startTime: string;
  endTime: string;
  durationMinutes: number;
  type: TripType;
  notes: string;
}

export type ViewFilter = 'day' | 'month' | 'year';
