
import { DriveTrip, TripType } from '../types';

export const getMockTrips = (): DriveTrip[] => {
  const now = new Date();
  const trips: DriveTrip[] = [];
  
  // Create some mock data for the last 30 days
  for (let i = 0; i < 15; i++) {
    const startDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000 - Math.random() * 5 * 60 * 60 * 1000);
    const duration = Math.floor(Math.random() * 45) + 15;
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
    
    trips.push({
      id: `trip-${i}`,
      startLocation: ['Taipei 101', 'Xinyi Dist', 'Da’an Dist', 'Zhongshan Dist'][Math.floor(Math.random() * 4)],
      endLocation: ['Neihu Dist', 'Songshan Airport', 'Tamsui', 'Beitou'][Math.floor(Math.random() * 4)],
      distance: Math.floor(Math.random() * 250) / 10 + 2,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      durationMinutes: duration,
      type: i % 3 === 0 ? TripType.BUSINESS : (i % 3 === 1 ? TripType.PERSONAL : TripType.UNCLASSIFIED),
      notes: i === 0 ? 'Meeting with client' : ''
    });
  }
  return trips;
};
