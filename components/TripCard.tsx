
import React, { useState } from 'react';
import { DriveTrip, TripType, DistanceUnit } from '../types';

interface TripCardProps {
  trip: DriveTrip;
  unit: DistanceUnit;
  onUpdate: (id: string, updates: Partial<DriveTrip>) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, unit, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(trip.notes);

  const displayDistance = unit === DistanceUnit.KM 
    ? trip.distance.toFixed(1) 
    : (trip.distance * 0.621371).toFixed(1);

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {formatDate(trip.startTime)}
          </h3>
          <div className="mt-1 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="font-semibold text-gray-800">{trip.startLocation}</p>
          </div>
          <div className="mt-1 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <p className="font-semibold text-gray-800">{trip.endLocation}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">{displayDistance} {unit}</p>
          <p className="text-sm text-gray-500">{trip.durationMinutes} mins</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
        <button
          onClick={() => onUpdate(trip.id, { type: TripType.BUSINESS })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            trip.type === TripType.BUSINESS 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          商業用途 (Business)
        </button>
        <button
          onClick={() => onUpdate(trip.id, { type: TripType.PERSONAL })}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            trip.type === TripType.PERSONAL 
              ? 'bg-emerald-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          私人用途 (Personal)
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 ml-auto"
        >
          {trip.notes ? 'View Notes' : 'Add Note'}
        </button>
      </div>

      {isEditing && (
        <div className="mt-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="輸入備註 (Enter notes...)"
            rows={2}
          />
          <button
            onClick={() => {
              onUpdate(trip.id, { notes });
              setIsEditing(false);
            }}
            className="mt-2 w-full bg-indigo-50 py-2 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100"
          >
            Save Note
          </button>
        </div>
      )}
      
      {trip.notes && !isEditing && (
        <p className="mt-3 text-sm italic text-gray-500 bg-gray-50 p-2 rounded">
          <span className="font-bold mr-1">Note:</span> {trip.notes}
        </p>
      )}
    </div>
  );
};
