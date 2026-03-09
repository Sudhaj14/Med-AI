'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface HealthMetric {
  type: 'weight' | 'blood_pressure' | 'heart_rate' | 'temperature' | 'blood_sugar';
  value: number;
  unit: string;
  timestamp: string;
  notes?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startTime: string;
  taken: boolean;
  notes?: string;
}

export default function EnhancedHealthTracker() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMetric, setNewMetric] = useState({
    type: 'weight' as const,
    value: '',
    unit: 'kg',
    notes: '',
  });
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startTime: '',
    notes: '',
  });
  const [activeTab, setActiveTab] = useState<'metrics' | 'medications'>('metrics');
  const [isAdding, setIsAdding] = useState(false);

  const addMetric = async () => {
    if (!newMetric.value) return;

    setIsAdding(true);
    try {
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

  const addMedication = async () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency || !newMedication.startTime) return;

    setIsAdding(true);
    try {
      const medication: Medication = {
        id: Date.now().toString(),
        ...newMedication,
        taken: false,
      };

      setMedications(prev => [...prev, medication]);
      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        startTime: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error adding medication:', error);
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
      case 'blood_sugar': return 'mg/dL';
      default: return '';
    }
  };

  const toggleMedicationTaken = (id: string) => {
    setMedications(prev => prev.map(med => 
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Health Tracker</h2>
      
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'metrics' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Health Metrics
        </button>
        <button
          onClick={() => setActiveTab('medications')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'medications' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Medications
        </button>
      </div>

      {activeTab === 'metrics' && (
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
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="weight">Weight</option>
              <option value="blood_pressure">Blood Pressure</option>
              <option value="heart_rate">Heart Rate</option>
              <option value="temperature">Temperature</option>
              <option value="blood_sugar">Blood Sugar</option>
            </select>
            
            <input
              type="number"
              value={newMetric.value}
              onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
              placeholder={`Value (${newMetric.unit})`}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <input
            type="text"
            value={newMetric.notes}
            onChange={(e) => setNewMetric(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes (optional)"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      )}

      {activeTab === 'medications' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={newMedication.name}
              onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Medication name"
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newMedication.dosage}
              onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
              placeholder="Dosage (e.g., 10mg)"
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={newMedication.frequency}
              onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
              placeholder="Frequency (e.g., twice daily)"
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="time"
              value={newMedication.startTime}
              onChange={(e) => setNewMedication(prev => ({ ...prev, startTime: e.target.value }))}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <input
            type="text"
            value={newMedication.notes}
            onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes (optional)"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={addMedication}
            disabled={isAdding || !newMedication.name || !newMedication.dosage}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isAdding ? 'Adding...' : 'Add Medication'}
          </button>

          {medications.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Medication Schedule</h3>
              <div className="space-y-3">
                {medications.map((med) => (
                  <div key={med.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{med.name}</h4>
                        <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                        <p className="text-sm text-gray-500">Time: {med.startTime}</p>
                        {med.notes && <p className="text-sm text-gray-500">{med.notes}</p>}
                      </div>
                      <button
                        onClick={() => toggleMedicationTaken(med.id)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          med.taken 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {med.taken ? 'Taken' : 'Pending'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
