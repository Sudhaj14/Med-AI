'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HealthMetric {
  type: 'weight' | 'blood_pressure' | 'heart_rate' | 'temperature';
  value: number;
  unit: string;
  timestamp: string;
  notes?: string;
}

export default function HealthTracker() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [newMetric, setNewMetric] = useState({
    type: 'weight' as const,
    value: '',
    unit: 'kg',
    notes: '',
  });
  const [isAdding, setIsAdding] = useState(false);

  const addMetric = async () => {
    if (!newMetric.value) return;

    setIsAdding(true);
    try {
      // In a real app, you'd save this to your API
      const metric: HealthMetric = {
        type: newMetric.type,
        value: parseFloat(newMetric.value),
        unit: newMetric.unit,
        timestamp: new Date().toISOString(),
        notes: newMetric.notes,
      };

      setMetrics(prev => [...prev, metric].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));

      setNewMetric({
        type: 'weight',
        value: '',
        unit: 'kg',
        notes: '',
      });
    } catch (error) {
      console.error('Error adding metric:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getChartData = () => {
    const typeMetrics = metrics.filter(m => m.type === newMetric.type);
    return typeMetrics.slice(-7).reverse().map(m => ({
      date: new Date(m.timestamp).toLocaleDateString(),
      value: m.value,
    }));
  };

  const getUnitForType = (type: string) => {
    switch (type) {
      case 'weight': return 'kg';
      case 'blood_pressure': return 'mmHg';
      case 'heart_rate': return 'bpm';
      case 'temperature': return '°C';
      default: return '';
    }
  };

  return (
    <div className="bg-white text-black rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Health Tracker</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <select
            value={newMetric.type}
            onChange={(e) => {
              const type = e.target.value as any;
              setNewMetric(prev => ({
                ...prev,
                type,
                unit: getUnitForType(type),
              }));
            }}
            className="px-3 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weight">Weight</option>
            <option value="blood_pressure">Blood Pressure</option>
            <option value="heart_rate">Heart Rate</option>
            <option value="temperature">Temperature</option>
          </select>
          
          <input
            type="number"
            value={newMetric.value}
            onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
            placeholder={`Value (${newMetric.unit})`}
            className="px-3 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <input
          type="text"
          value={newMetric.notes}
          onChange={(e) => setNewMetric(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Notes (optional)"
          className="w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={addMetric}
          disabled={isAdding || !newMetric.value}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isAdding ? 'Adding...' : 'Add Metric'}
        </button>

        {metrics.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Recent {newMetric.type.replace('_', ' ')} Readings
            </h3>
            
            {getChartData().length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No data available for {newMetric.type.replace('_', ' ')}
              </p>
            )}

            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
              {metrics
                .filter(m => m.type === newMetric.type)
                .slice(0, 5)
                .map((metric, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {new Date(metric.timestamp).toLocaleDateString()}
                    </span>
                    <span className="font-medium">
                      {metric.value} {metric.unit}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
