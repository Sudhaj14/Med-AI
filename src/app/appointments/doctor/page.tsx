'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('requests'); // requests | slots
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('appointment_user');
    if (!userStr) {
      router.push('/appointments/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'doctor') {
      router.push('/appointments/patient');
      return;
    }

    loadAppointments();
    loadSlots();
  }, [router]);

  const loadAppointments = async () => {
    try {
      const data = await fetchWithAuth('/doctor/appointments');
      setAppointments(data);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes('Token') || err.message.includes('Access denied'))) {
        handleLogout();
      }
    }
  };

  const loadSlots = async () => {
    try {
      const data = await fetchWithAuth('/doctor/slots');
      setSlots(data);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes('Token') || err.message.includes('Access denied'))) {
        handleLogout();
      }
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime) return;

    try {
      await fetchWithAuth('/doctor/slots', {
        method: 'POST',
        body: JSON.stringify({
          date: newDate,
          time_slots: [newTime],
        }),
      });
      loadSlots();
      setNewTime('');
    } catch (err: any) {
      alert(err.message || 'Error adding slot');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await fetchWithAuth(`/doctor/slots/${slotId}`, { method: 'DELETE' });
      loadSlots();
    } catch (err: any) {
      alert(err.message || 'Error deleting slot');
    }
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    if (status === 'rejected' && !rejectionReason) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await fetchWithAuth(`/doctor/appointments/${appId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          rejection_reason: status === 'rejected' ? rejectionReason : undefined,
        }),
      });
      setRejectionReason('');
      loadAppointments();
      loadSlots(); // Refresh slots in case a rejection freed one up
    } catch (err: any) {
      alert(err.message || 'Error updating appointment');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('appointment_token');
    localStorage.removeItem('appointment_user');
    router.push('/appointments/login');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
         <button onClick={handleLogout} className="text-red-600 hover:text-red-800 font-medium">Logout</button>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 pb-2">
        <button 
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium ${activeTab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Appointment Requests
        </button>
        <button 
          onClick={() => setActiveTab('slots')}
          className={`px-4 py-2 font-medium ${activeTab === 'slots' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Manage Slots
        </button>
      </div>

      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((apt: any) => (
                <tr key={apt._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{apt.patient_id?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.date} at {apt.time_slot}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        apt.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apt.status === 'pending' && (
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <button onClick={() => handleUpdateStatus(apt._id, 'accepted')} className="text-green-600 hover:text-green-900 text-xs font-bold">Accept</button>
                          <button onClick={() => handleUpdateStatus(apt._id, 'rejected')} className="text-red-600 hover:text-red-900 text-xs font-bold">Reject</button>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Reason if rejecting" 
                          className="text-xs p-1 border rounded w-full"
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                      </div>
                    )}
                    {apt.status !== 'pending' && <span className="text-xs text-gray-400">Processed</span>}
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'slots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Availability Slot</h2>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input 
                  type="date" 
                  required 
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Slot (e.g. "10:00 AM - 10:30 AM")</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. 10:00 AM - 10:30 AM"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" 
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition">
                Add Slot
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">My Slots</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {slots.map((slot: any) => (
                <div key={slot._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100">
                  <div>
                    <span className="font-medium text-gray-800">{slot.date}</span>
                    <span className="text-sm text-gray-500 ml-2">{slot.time_slot}</span>
                    {slot.is_booked && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Booked</span>}
                    {!slot.is_booked && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Available</span>}
                  </div>
                  {!slot.is_booked && (
                    <button 
                      onClick={() => handleDeleteSlot(slot._id)}
                      className="text-red-500 hover:text-red-700 transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
              {slots.length === 0 && <p className="text-gray-500 text-sm">No slots added yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
