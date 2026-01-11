
import { DriveTrip, TripType } from '../types';

/**
 * 模擬從 Google 地圖背景獲取最新的行車紀錄
 */
export const fetchGoogleBackgroundData = async (): Promise<DriveTrip[]> => {
  // 模擬延遲，增加真實感
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const now = new Date();
  const mockNewTrips: DriveTrip[] = [
    {
      id: `google-${Math.random().toString(36).substr(2, 5)}`,
      startLocation: "住家 (台北市)",
      endLocation: "內湖科學園區",
      distance: 8.5,
      startTime: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(),
      durationMinutes: 30,
      type: TripType.UNCLASSIFIED,
      notes: "Google 自動同步"
    }
  ];
  return mockNewTrips;
};

export const fetchIntactTrips = async (apiKey: string): Promise<DriveTrip[]> => {
  if (!apiKey || apiKey === 'demo') return [];
  return []; // 此處維持 placeholder 邏輯
};

export const parseGoogleHistory = async (file: File): Promise<DriveTrip[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const rawTrips = json.semanticSegments || json.timelineObjects || [];
        const mapped = rawTrips
          .map((s: any) => {
            const activity = s.activitySegment || s;
            if (!activity.distance) return null;
            return {
              id: `imported-${Math.random().toString(36).substr(2, 5)}`,
              startLocation: activity.startLocation?.address || activity.startLocation?.name || '未知起點',
              endLocation: activity.endLocation?.address || activity.endLocation?.name || '未知終點',
              distance: (activity.distance || 0) / 1000,
              startTime: activity.duration?.startTimestampMs ? new Date(parseInt(activity.duration.startTimestampMs)).toISOString() : new Date().toISOString(),
              endTime: activity.duration?.endTimestampMs ? new Date(parseInt(activity.duration.endTimestampMs)).toISOString() : new Date().toISOString(),
              durationMinutes: Math.round(((activity.duration?.endTimestampMs || 0) - (activity.duration?.startTimestampMs || 0)) / 60000),
              type: TripType.UNCLASSIFIED,
              notes: '來自 Google 歷史匯入'
            };
          })
          .filter((t: any) => t !== null);
        resolve(mapped);
      } catch (err) {
        reject("檔案格式錯誤");
      }
    };
    reader.readAsText(file);
  });
};
