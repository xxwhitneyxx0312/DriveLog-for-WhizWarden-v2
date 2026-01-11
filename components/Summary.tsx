
import React from 'react';
import { DriveTrip, TripType, DistanceUnit, ViewFilter } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SummaryProps {
  trips: DriveTrip[];
  unit: DistanceUnit;
  filter: ViewFilter;
}

export const Summary: React.FC<SummaryProps> = ({ trips, unit, filter }) => {
  const businessTrips = trips.filter(t => t.type === TripType.BUSINESS);
  const personalTrips = trips.filter(t => t.type === TripType.PERSONAL);
  const unclassified = trips.filter(t => t.type === TripType.UNCLASSIFIED);

  const getDist = (tripList: DriveTrip[]) => {
    const km = tripList.reduce((acc, t) => acc + t.distance, 0);
    return unit === DistanceUnit.KM ? km : km * 0.621371;
  };

  const data = [
    { name: 'Business', value: businessTrips.length, color: '#4F46E5' },
    { name: 'Personal', value: personalTrips.length, color: '#10B981' },
    { name: 'Unclassified', value: unclassified.length, color: '#94A3B8' },
  ];

  const exportToSheet = () => {
    const headers = ["Start Location", "End Location", "Distance (" + unit + ")", "Start Time", "End Time", "Duration (mins)", "Type", "Notes"];
    const rows = trips.map(t => [
      t.startLocation,
      t.endLocation,
      unit === DistanceUnit.KM ? t.distance.toFixed(1) : (t.distance * 0.621371).toFixed(1),
      new Date(t.startTime).toLocaleString(),
      new Date(t.endTime).toLocaleString(),
      t.durationMinutes,
      t.type,
      t.notes
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `drive_log_${filter}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Simulation: Exporting to Google Sheet compatible CSV...");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Summary Statistics</h2>
          <button 
            onClick={exportToSheet}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Export to Google Sheet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-indigo-50 p-4 rounded-xl">
            <p className="text-sm text-indigo-600 font-semibold mb-1">Business</p>
            <p className="text-2xl font-bold text-indigo-900">{getDist(businessTrips).toFixed(1)} {unit}</p>
            <p className="text-sm text-indigo-700">{businessTrips.length} trips</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl">
            <p className="text-sm text-emerald-600 font-semibold mb-1">Personal</p>
            <p className="text-2xl font-bold text-emerald-900">{getDist(personalTrips).toFixed(1)} {unit}</p>
            <p className="text-sm text-emerald-700">{personalTrips.length} trips</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600 font-semibold mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{getDist(trips).toFixed(1)} {unit}</p>
            <p className="text-sm text-gray-700">{trips.length} trips</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Ratio Analysis</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Business Distance</span>
              <span>{trips.length > 0 ? ((getDist(businessTrips) / getDist(trips)) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${trips.length > 0 ? (getDist(businessTrips) / getDist(trips)) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Personal Distance</span>
              <span>{trips.length > 0 ? ((getDist(personalTrips) / getDist(trips)) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${trips.length > 0 ? (getDist(personalTrips) / getDist(trips)) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
