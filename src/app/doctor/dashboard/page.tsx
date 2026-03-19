'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import OfflineIndicator from '@/components/ui/OfflineIndicator';
import DashboardShell from '@/components/layout/DashboardShell';

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/doctor');
    } else if (status === 'authenticated' && session?.user?.role !== 'doctor') {
      router.push('/');
    }
  }, [status, session, router]);

  // Load doctor data
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'doctor') {
      loadDoctorData();
    }
  }, [status, session]);

  const loadDoctorData = async () => {
    try {
      if (!session?.user?.id) return;
      setLoading(true);
      
      // Load appointments
      const appointmentsResponse = await fetch('/api/appointments?doctorId=' + session.user.id);
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData.appointments || []);
      }

      // Load slots
      const slotsResponse = await fetch('/api/slots?doctorId=' + session.user.id);
      if (slotsResponse.ok) {
        const slotsData = await slotsResponse.json();
        setSlots(slotsData.slots || []);
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-white font-bold text-2xl">👨‍⚕️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('loading')}</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: t('dashboard', 'Dashboard'), icon: '📊' },
    { id: 'appointments', label: t('appointments'), icon: '📅' },
    { id: 'slots', label: t('slotManagement', 'Slot Management'), icon: '⏰' },
    { id: 'video', label: t('videoConsultation', 'Video Consultation'), icon: '📹' },
    { id: 'prescriptions', label: t('prescription', 'Prescriptions'), icon: '📝' },
    { id: 'profile', label: t('profile'), icon: '👨‍⚕️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DoctorOverview appointments={appointments} slots={slots} doctor={session.user} />;
      case 'appointments':
        return <AppointmentsList appointments={appointments} doctorId={session.user.id} onUpdate={loadDoctorData} />;
      case 'slots':
        return <SlotManagement doctorId={session.user.id} slots={slots} onUpdate={loadDoctorData} />;
      case 'video':
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold text-slate-900 mb-4">{t('videoConsultation', 'Video Consultation')}</div>
              <div className="text-sm text-slate-600 mb-4">
                Start video calls with your scheduled appointments. Click "Start Call" to begin a consultation.
              </div>
              
              {/* Upcoming Appointments for Video Calls */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-800 mb-2">Available for Video Call:</h4>
                {appointments
                  .filter(apt => apt.status === 'scheduled')
                  .map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{appointment.doctor?.name || 'Patient'}</p>
                        <p className="text-sm text-slate-600">{appointment.date} at {appointment.time}</p>
                        <p className="text-xs text-slate-500">{appointment.reason}</p>
                      </div>
                      <button
                        onClick={() => {
                          // Navigate to video call as doctor
                          window.open(`/video-call?appointmentId=${appointment.id}&role=doctor`, '_blank');
                        }}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Start Call
                      </button>
                    </div>
                  ))}
                
                {appointments.filter(apt => apt.status === 'scheduled').length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📅</div>
                    <p className="text-slate-500">No scheduled appointments available for video calls</p>
                  </div>
                )}
              </div>
              
              {/* Active Calls */}
              <div className="mt-6">
                <h4 className="font-medium text-slate-800 mb-2">Active Calls:</h4>
                {appointments
                  .filter(apt => apt.status === 'in_progress')
                  .map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex-1">
                        <p className="font-medium text-green-900">Call with {appointment.doctor?.name || 'Patient'}</p>
                        <p className="text-sm text-green-600">Started at {appointment.callStartTime}</p>
                      </div>
                      <button
                        onClick={() => {
                          // Rejoin active call
                          window.open(`/video-call?appointmentId=${appointment.id}&role=doctor`, '_blank');
                        }}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Rejoin Call
                      </button>
                    </div>
                  ))}
                
                {appointments.filter(apt => apt.status === 'in-progress').length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-slate-500">No active calls</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'prescriptions':
        return (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold text-slate-900">{t('prescription', 'Prescriptions')}</div>
              <div className="mt-1 text-sm text-slate-600">
                Prescription writing UI will be placed here next (linked to appointment → saved in records → shown in pharmacy).
              </div>
            </div>
            <div className="text-sm text-slate-600">
              For now, use the “Start Call” buttons in appointments to open video consultation.
            </div>
          </div>
        );
      case 'profile':
        return <DoctorProfile doctor={session.user} />;
      default:
        return <DoctorOverview appointments={appointments} slots={slots} doctor={session.user} />;
    }
  };

  return (
    <>
      <DashboardShell
        title="MediCare AI"
        subtitle="Doctor Dashboard"
        navItems={tabs}
        activeId={activeTab}
        onSelect={setActiveTab}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your dashboard...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </DashboardShell>
      <OfflineIndicator />
    </>
  );
}

// Doctor Overview Component
function DoctorOverview({ appointments, slots, doctor }: any) {
  const { t } = useTranslation();
  const router = useRouter();
  
  const todayAppointments = appointments.filter((apt: any) => {
    const aptDate = new Date(apt.date).toDateString();
    const today = new Date().toDateString();
    return aptDate === today;
  });

  const upcomingAppointments = appointments.filter((apt: any) => 
    new Date(apt.date) > new Date()
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{appointments.length}</div>
          <div className="text-blue-100">Total Appointments</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{todayAppointments.length}</div>
          <div className="text-green-100">Today's Appointments</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{slots.length}</div>
          <div className="text-purple-100">Available Slots</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{doctor.experience || 0}</div>
          <div className="text-orange-100">Years Experience</div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
        <div className="space-y-3">
          {todayAppointments.length > 0 ? (
            todayAppointments.slice(0, 3).map((appointment: any) => (
              <div key={appointment._id || appointment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      Patient: {appointment.patientName || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">{appointment.reason}</p>
                    <p className="text-xs text-gray-500">{appointment.date} at {appointment.time}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const id = appointment._id || appointment.id;
                        if (id) router.push(`/video/${id}`);
                      }}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                    >
                      Start Call
                    </button>
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Appointments List Component
function AppointmentsList({ appointments, doctorId, onUpdate }: any) {
  const { t } = useTranslation();
  const router = useRouter();
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">All Appointments</h3>
      <div className="space-y-3">
        {appointments.length > 0 ? (
          appointments.map((appointment: any) => (
            <div key={appointment._id || appointment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">
                    Patient: {appointment.patientName || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">{appointment.reason}</p>
                  <p className="text-xs text-gray-500">{appointment.date} at {appointment.time}</p>
                  {appointment.symptoms && (
                    <p className="text-xs text-gray-500 mt-1">
                      Symptoms: {appointment.symptoms.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {appointment.status}
                  </span>
                  {appointment.status === 'scheduled' && (
                    <button
                      onClick={() => {
                        const id = appointment._id || appointment.id;
                        if (id) router.push(`/video/${id}`);
                      }}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                    >
                      Start Call
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No appointments found</p>
        )}
      </div>
    </div>
  );
}

// Slot Management Component
function SlotManagement({ doctorId, slots, onUpdate }: any) {
  const { t } = useTranslation();
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });

  const handleAddSlot = async () => {
    try {
      const response = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSlot, doctorId }),
      });

      if (response.ok) {
        setNewSlot({ date: '', time: '' });
        setShowAddSlot(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding slot:', error);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const response = await fetch(`/api/slots/${slotId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Manage Available Slots</h3>
        <button
          onClick={() => setShowAddSlot(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Add Slot
        </button>
      </div>

      {showAddSlot && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={newSlot.date}
              onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Date"
            />
            <input
              type="time"
              value={newSlot.time}
              onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Time"
            />
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleAddSlot}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddSlot(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {slots.length > 0 ? (
          slots.map((slot: any) => (
            <div key={slot.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{slot.date}</p>
                  <p className="text-sm text-gray-600">{slot.time}</p>
                  <p className={`text-xs ${slot.isBooked ? 'text-red-600' : 'text-green-600'}`}>
                    {slot.isBooked ? 'Booked' : 'Available'}
                  </p>
                </div>
                {!slot.isBooked && (
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No slots available</p>
        )}
      </div>
    </div>
  );
}

// Doctor Profile Component
function DoctorProfile({ doctor }: any) {
  const { t } = useTranslation();
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Profile</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-gray-900">Dr. {doctor.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{doctor.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('specialization')}</label>
            <p className="mt-1 text-gray-900">{doctor.specialization || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('experience')}</label>
            <p className="mt-1 text-gray-900">{doctor.experience || 0} years</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('consultationFee')}</label>
            <p className="mt-1 text-gray-900">₹{doctor.consultationFee || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
