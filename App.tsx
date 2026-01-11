
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DriveTrip, TripType, DistanceUnit, ViewFilter } from './types.ts';
import { getMockTrips } from './services/mockData.ts';
import { fetchGoogleBackgroundData } from './services/intactApi.ts';
import { TripCard } from './components/TripCard.tsx';
import { Summary } from './components/Summary.tsx';

const App: React.FC = () => {
  const [trips, setTrips] = useState<DriveTrip[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [unit, setUnit] = useState<DistanceUnit>(DistanceUnit.KM);
  const [filter, setFilter] = useState<ViewFilter>('month');
  const [activeTab, setActiveTab] = useState<'log' | 'summary'>('log');
  const [loading, setLoading] = useState(false);

  const [isTracking, setIsTracking] = useState(false);
  const [trackingDistance, setTrackingDistance] = useState(0);
  const watchId = useRef<number | null>(null);

  // 初始化資料
  useEffect(() => {
    const saved = localStorage.getItem('drivelog_data');
    if (saved) {
      setTrips(JSON.parse(saved));
    } else {
      setTrips(getMockTrips());
    }
    setInitialized(true);
  }, []);

  // 儲存資料
  useEffect(() => {
    if (initialized) {
      localStorage.setItem('drivelog_data', JSON.stringify(trips));
    }
  }, [trips, initialized]);

  const startTracking = () => {
    if (!navigator.geolocation) return alert("不支援 GPS");
    setIsTracking(true);
    setTrackingDistance(0);
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => setTrackingDistance(prev => prev + 0.01), // 簡化模擬
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  };

  const stopTracking = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    setIsTracking(false);
    const newTrip: DriveTrip = {
      id: `manual-${Date.now()}`,
      startLocation: "手動記錄",
      endLocation: "結束點",
      distance: trackingDistance,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: 1,
      type: TripType.UNCLASSIFIED,
      notes: ""
    };
    setTrips(prev => [newTrip, ...prev]);
  };

  const handleUpdateTrip = (id: string, updates: Partial<DriveTrip>) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const filteredTrips = useMemo(() => {
    return trips.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [trips]);

  if (!initialized) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">DriveLog<span className="text-indigo-600">.</span></h1>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setUnit(DistanceUnit.KM)} className={`px-3 py-1 text-[10px] font-black rounded-lg ${unit === DistanceUnit.KM ? 'bg-white shadow-sm' : 'text-gray-400'}`}>KM</button>
          <button onClick={() => setUnit(DistanceUnit.MILES)} className={`px-3 py-1 text-[10px] font-black rounded-lg ${unit === DistanceUnit.MILES ? 'bg-white shadow-sm' : 'text-gray-400'}`}>MI</button>
        </div>
      </header>

      {/* Tracking Console */}
      <div className={`mb-6 p-6 rounded-[2.5rem] border transition-all ${isTracking ? 'bg-indigo-600 text-white' : 'bg-white border-gray-100'}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">Status: {isTracking ? 'Recording' : 'Standby'}</p>
            <div className="flex items-baseline">
              <span className="text-5xl font-black tracking-tighter">{trackingDistance.toFixed(2)}</span>
              <span className="ml-2 text-lg font-bold opacity-70">{unit}</span>
            </div>
          </div>
          <button onClick={isTracking ? stopTracking : startTracking} className={`p-6 rounded-3xl ${isTracking ? 'bg-white text-red-600' : 'bg-indigo-600 text-white'}`}>
            {isTracking ? <div className="w-6 h-6 bg-red-600"></div> : 'START'}
          </button>
        </div>
      </div>

      <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 mb-6">
        <button onClick={() => setActiveTab('log')} className={`flex-1 py-3 text-sm font-bold rounded-xl ${activeTab === 'log' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>日誌</button>
        <button onClick={() => setActiveTab('summary')} className={`flex-1 py-3 text-sm font-bold rounded-xl ${activeTab === 'summary' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>統計</button>
      </div>

      {activeTab === 'log' ? (
        <div className="space-y-4">
          {filteredTrips.map(trip => <TripCard key={trip.id} trip={trip} unit={unit} onUpdate={handleUpdateTrip} />)}
        </div>
      ) : (
        <Summary trips={filteredTrips} unit={unit} filter={filter} />
      )}
    </div>
  );
};

export default App;
