'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

export default function PatientDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [slots, setSlots] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('appointment_user');
    if (!userStr) {
      router.push('/appointments/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'patient') {
      router.push('/appointments/doctor');
      return;
    }

    loadDoctors();
    loadAppointments();
  }, [router]);

  const loadDoctors = async () => {
    try {
      const data = await fetchWithAuth('/patient/doctors');
      setDoctors(data);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes('Token') || err.message.includes('Access denied'))) {
        handleLogout();
      }
    }
  };

  const loadAppointments = async () => {
    try {
      const data = await fetchWithAuth('/patient/appointments');
      setAppointments(data);
    } catch (err: any) {
      console.error(err);
      if (err.message && (err.message.includes('Token') || err.message.includes('Access denied'))) {
        handleLogout();
      }
    }
  };

  const loadSlots = async (doctorId: string) => {
    try {
      const data = await fetchWithAuth(`/patient/doctors/${doctorId}/slots`);
      setSlots(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    loadSlots(doctor._id);
  };

  const handleBookSlot = async (slot: any) => {
    try {
      await fetchWithAuth('/patient/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctor_id: selectedDoctor._id,
          date: slot.date,
          time_slot: slot.time_slot,
        }),
      });
      alert('Appointment booked successfully!');
      setSelectedDoctor(null);
      loadAppointments();
    } catch (err: any) {
      alert(err.message || 'Error booking slot');
      loadSlots(selectedDoctor._id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('appointment_token');
    localStorage.removeItem('appointment_user');
    router.push('/appointments/login');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Patient Dashboard</h1>
        <button onClick={handleLogout} className="text-red-600 hover:text-red-800 font-medium">Logout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Doctors List */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Doctors</h2>
          <div className="space-y-4">
            {doctors.map((doctor: any) => (
              <div key={doctor._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-md border border-gray-100">
                <div>
                  <div className="font-medium text-gray-900">{doctor.name}</div>
                  <div className="text-sm text-gray-500">{doctor.specialization}</div>
                </div>
                <button 
                  onClick={() => handleDoctorSelect(doctor)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition text-sm"
                >
                  View Slots
                </button>
              </div>
            ))}
            {doctors.length === 0 && <p className="text-gray-500 text-sm">No doctors available.</p>}
          </div>
        </div>

        {/* Selected Doctor Slots */}
        {selectedDoctor && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Available Slots</h2>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Close
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Doctor: {selectedDoctor.name}</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {slots.length === 0 ? (
                <p className="text-gray-500 text-sm">No slots available for this doctor.</p>
              ) : (
                slots.map((slot: any) => (
                  <div key={slot._id} className="flex justify-between items-center p-3 bg-green-50 rounded-md border border-green-100">
                    <div>
                      <div className="font-medium text-green-800">{slot.date}</div>
                      <div className="text-sm text-green-600">{slot.time_slot}</div>
                    </div>
                    <button 
                      onClick={() => handleBookSlot(slot)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                    >
                      Book
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* My Appointments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">My Appointments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((apt: any) => (
                  <tr key={apt._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{apt.doctor_id?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.date} at {apt.time_slot}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          apt.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apt.rejection_reason || '-'}</td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No appointments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
