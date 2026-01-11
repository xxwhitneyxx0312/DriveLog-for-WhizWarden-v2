
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DriveTrip, TripType, DistanceUnit, ViewFilter } from './types';
import { getMockTrips } from './services/mockData';
import { fetchIntactTrips, parseGoogleHistory, fetchGoogleBackgroundData } from './services/intactApi';
import { TripCard } from './components/TripCard';
import { Summary } from './components/Summary';

const App: React.FC = () => {
  const [trips, setTrips] = useState<DriveTrip[]>(() => {
    const saved = localStorage.getItem('drivelog_data');
    return saved ? JSON.parse(saved) : getMockTrips();
  });
  const [unit, setUnit] = useState<DistanceUnit>(DistanceUnit.KM);
  const [filter, setFilter] = useState<ViewFilter>('month');
  const [activeTab, setActiveTab] = useState<'log' | 'summary' | 'settings'>('log');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('intact_api_key') || '');

  const [isTracking, setIsTracking] = useState(false);
  const [trackingStart, setTrackingStart] = useState<Date | null>(null);
  const [trackingDistance, setTrackingDistance] = useState(0);
  const lastPos = useRef<GeolocationCoordinates | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('drivelog_data', JSON.stringify(trips));
  }, [trips]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("您的設備不支持 GPS 定位");
      return;
    }
    setIsTracking(true);
    setTrackingStart(new Date());
    setTrackingDistance(0);
    lastPos.current = null;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (lastPos.current) {
          const R = 6371;
          const dLat = (pos.coords.latitude - lastPos.current.latitude) * Math.PI / 180;
          const dLon = (pos.coords.longitude - lastPos.current.longitude) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lastPos.current.latitude * Math.PI / 180) * Math.cos(pos.coords.latitude * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const d = R * c;
          if (d > 0.005) setTrackingDistance(prev => prev + d);
        }
        lastPos.current = pos.coords;
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  };

  const stopTracking = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    setIsTracking(false);
    const endTime = new Date();
    const duration = trackingStart ? Math.round((endTime.getTime() - trackingStart.getTime()) / 60000) : 0;
    const newTrip: DriveTrip = {
      id: `manual-${Date.now()}`,
      startLocation: "手動錄製起點",
      endLocation: "手動錄製終點",
      distance: trackingDistance,
      startTime: trackingStart?.toISOString() || endTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes: duration,
      type: TripType.UNCLASSIFIED,
      notes: "實時錄製行程"
    };
    setTrips(prev => [newTrip, ...prev]);
    setTrackingDistance(0);
  };

  const syncGoogleData = async () => {
    setLoading(true);
    try {
      const newTrips = await fetchGoogleBackgroundData();
      const existingTimes = new Set(trips.map(t => t.startTime));
      const uniqueNewTrips = newTrips.filter(t => !existingTimes.has(t.startTime));
      
      if (uniqueNewTrips.length > 0) {
        setTrips(prev => [...uniqueNewTrips, ...prev]);
        alert(`已從 Google 自動取得 ${uniqueNewTrips.length} 條新行程！`);
      } else {
        alert("目前已是最新狀態。");
      }
    } catch (e) {
      alert("同步失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTrip = (id: string, updates: Partial<DriveTrip>) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const filteredTrips = useMemo(() => {
    const now = new Date();
    return trips.filter(trip => {
      const tripDate = new Date(trip.startTime);
      if (filter === 'day') return tripDate.toDateString() === now.toDateString();
      if (filter === 'month') return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
      return tripDate.getFullYear() === now.getFullYear();
    }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [trips, filter]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">DriveLog<span className="text-indigo-600">.</span></h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Google Sync Active</p>
        </div>
        <button 
          onClick={syncGoogleData} 
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm hover:border-indigo-300 transition-all active:scale-95 disabled:opacity-50"
        >
          <svg className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span className="text-xs font-bold text-gray-600">{loading ? '同步中...' : '同步 Google'}</span>
        </button>
      </header>

      {/* Tracking Console */}
      <div className={`mb-6 p-6 rounded-[2.5rem] border transition-all duration-500 ${isTracking ? 'bg-indigo-600 border-indigo-400 shadow-2xl text-white' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isTracking ? 'text-indigo-200' : 'text-gray-400'}`}>
              {isTracking ? 'Recording Drive' : 'Ready'}
            </p>
            <div className="flex items-baseline">
              <span className="text-5xl font-black tracking-tighter">
                {(unit === DistanceUnit.KM ? trackingDistance : trackingDistance * 0.621371).toFixed(2)}
              </span>
              <span className={`ml-2 text-lg font-bold ${isTracking ? 'text-indigo-200' : 'text-gray-400'}`}>{unit}</span>
            </div>
          </div>
          <button 
            onClick={isTracking ? stopTracking : startTracking}
            className={`p-6 rounded-3xl transition-all shadow-xl active:scale-90 ${isTracking ? 'bg-white text-red-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {isTracking ? <div className="w-6 h-6 bg-red-600 rounded-sm"></div> : <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex-1 mr-4">
          <button onClick={() => setActiveTab('log')} className={`flex-1 py-2 text-xs font-bold rounded-xl ${activeTab === 'log' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>日誌</button>
          <button onClick={() => setActiveTab('summary')} className={`flex-1 py-2 text-xs font-bold rounded-xl ${activeTab === 'summary' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>統計</button>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setUnit(DistanceUnit.KM)} className={`px-3 py-1 text-[10px] font-black rounded-lg ${unit === DistanceUnit.KM ? 'bg-white shadow-sm' : 'text-gray-400'}`}>KM</button>
          <button onClick={() => setUnit(DistanceUnit.MILES)} className={`px-3 py-1 text-[10px] font-black rounded-lg ${unit === DistanceUnit.MILES ? 'bg-white shadow-sm' : 'text-gray-400'}`}>MI</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {(['day', 'month', 'year'] as ViewFilter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${filter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
            {f === 'day' ? '今日' : f === 'month' ? '本月' : '年度'}
          </button>
        ))}
      </div>

      {activeTab === 'log' ? (
        <div className="space-y-4">
          {filteredTrips.map(trip => <TripCard key={trip.id} trip={trip} unit={unit} onUpdate={handleUpdateTrip} />)}
        </div>
      ) : (
        <Summary trips={filteredTrips} unit={unit} filter={filter} />
      )}

      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-gray-900/90 backdrop-blur-xl p-2 rounded-3xl flex justify-around shadow-2xl border border-white/10">
        <button onClick={() => setActiveTab('log')} className={`flex-1 py-3 flex flex-col items-center ${activeTab === 'log' ? 'text-white' : 'text-gray-500'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
        </button>
        <button onClick={() => setActiveTab('summary')} className={`flex-1 py-3 flex flex-col items-center ${activeTab === 'summary' ? 'text-white' : 'text-gray-500'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path></svg>
        </button>
      </footer>
    </div>
  );
};

export default App;
