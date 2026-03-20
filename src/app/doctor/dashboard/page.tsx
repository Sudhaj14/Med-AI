'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OfflineIndicator from '@/components/ui/OfflineIndicator';
import DashboardShell from '@/components/layout/DashboardShell';
import { Appointment } from '@/types/video';

export default function DoctorDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/doctor');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'doctor') {
      router.push('/');
    }
  }, [status, session, router]);

  // Load doctor data
  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role === 'doctor') {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'slots', label: 'Slot Management', icon: '⏰' },
    { id: 'video', label: 'Video Consultation', icon: '📹' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '📝' },
    { id: 'profile', label: 'Profile', icon: '👨‍⚕️' },
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
              <div className="font-semibold text-slate-900 mb-4">Video Consultation</div>
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
                
                {appointments.filter(apt => apt.status === 'in_progress').length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-slate-500">No active calls</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'prescriptions':
        return <PrescriptionsTab appointments={appointments} doctorId={session.user.id} />;
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
        showLanguageSwitcher={false}
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

function PrescriptionsTab({ appointments, doctorId }: any) {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [savedByAppointmentId, setSavedByAppointmentId] = useState<Record<string, boolean>>(
    {}
  );
  const [saving, setSaving] = useState(false);

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [prescriptionsError, setPrescriptionsError] = useState<string | null>(null);

  const loadPrescriptions = async () => {
    try {
      setPrescriptionsLoading(true);
      setPrescriptionsError(null);

      const res = await fetch('/api/prescriptions', { method: 'GET' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to fetch prescriptions');
      }

      const data = await res.json();
      const nextPrescriptions = data?.prescriptions || [];
      setPrescriptions(nextPrescriptions);

      // Keep the "Saved" badges in sync with DB records.
      const byAppointmentId: Record<string, boolean> = {};
      nextPrescriptions.forEach((p: any) => {
        const key = p?.appointmentId?.toString?.() || p?.appointmentId;
        if (key) byAppointmentId[key] = true;
      });
      setSavedByAppointmentId(byAppointmentId);
    } catch (err: any) {
      console.error('Error loading prescriptions:', err);
      setPrescriptionsError(err?.message || 'Failed to load prescriptions');
      setPrescriptions([]);
    } finally {
      setPrescriptionsLoading(false);
    }
  };

  useEffect(() => {
    // Load doctor prescriptions when the tab mounts.
    loadPrescriptions();
  }, [doctorId]);

  const candidateAppointments = (appointments || []).filter(
    (a: any) => a.status === 'scheduled' || a.status === 'completed'
  );

  const selectedAppointment = candidateAppointments.find(
    (a: any) => a.id === selectedAppointmentId || a._id === selectedAppointmentId
  );

  const handleSave = async () => {
    if (!selectedAppointmentId) return;
    if (!draft.trim()) {
      alert('Please write a prescription before saving.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAppointmentId,
          doctorId,
          patientName: selectedAppointment?.patientName,
          content: draft,
        }),
      });

      if (response.ok) {
        setSavedByAppointmentId((p) => ({ ...p, [selectedAppointmentId]: true }));
        setDraft('');
        await loadPrescriptions();
        alert('Prescription saved to records.');
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data?.error || 'Failed to save prescription.');
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Failed to save prescription.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="font-semibold text-slate-900">Write Prescription</div>
        <div className="mt-1 text-sm text-slate-600">
          Appointment → Prescription Form → Save → Store in Records
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h4 className="font-semibold text-gray-900 mb-3">Appointments</h4>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {candidateAppointments.length > 0 ? (
              candidateAppointments.map((apt: any) => {
                const id = apt.id || apt._id;
                const isSelected = id === selectedAppointmentId;
                const isSaved = !!savedByAppointmentId[id];
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedAppointmentId(id);
                      setDraft('');
                    }}
                    className={[
                      'w-full text-left border rounded-lg p-3 transition-colors',
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {apt.patientName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {apt.date} at {apt.time}
                        </div>
                        <div className="text-xs text-gray-500">{apt.reason}</div>
                      </div>
                      {isSaved ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Saved
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No appointments available.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selectedAppointmentId ? (
            <div className="rounded-xl border border-slate-200 p-6 text-center text-slate-600">
              Select an appointment to start writing a prescription.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 p-6 space-y-4">
              <div>
                <div className="font-semibold text-gray-900">Prescription Form</div>
                <div className="text-sm text-gray-600 mt-1">
                  Patient: {selectedAppointment?.patientName || 'Unknown'} • {selectedAppointment?.date}{' '}
                  at {selectedAppointment?.time}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prescription Notes
                </label>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write medicines, dosage, instructions, and any notes..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Prescription'}
                </button>
                {savedByAppointmentId[selectedAppointmentId] ? (
                  <span className="text-sm text-green-700">Already saved (this session).</span>
                ) : null}
              </div>

              <div className="text-xs text-gray-500">
                Placeholder: will store the text in prescription records linked to the appointment.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="font-semibold text-slate-900">Saved Prescriptions</div>
        <div className="mt-1 text-sm text-slate-600">
          These are your previously saved prescriptions (linked to appointments).
        </div>

        {prescriptionsLoading ? (
          <div className="text-center py-6 text-slate-600">Loading...</div>
        ) : prescriptionsError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
            {prescriptionsError}
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-6 text-slate-600">No prescriptions saved yet.</div>
        ) : (
          <div className="space-y-3 mt-4">
            {prescriptions.map((p) => (
              <div key={p.id || p.appointmentId} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-slate-900">
                      {p.patientName || 'Patient'}{' '}
                      {p.appointment?.date ? `• ${p.appointment.date}` : ''}
                      {p.appointment?.time ? ` at ${p.appointment.time}` : ''}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Saved: {p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}
                    </div>
                  </div>
                  <button
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    onClick={() => {
                      if (p.appointmentId) {
                        setSelectedAppointmentId(p.appointmentId);
                        setDraft(p.content || '');
                      }
                    }}
                  >
                    Open
                  </button>
                </div>

                <div className="mt-3 text-sm text-slate-800 whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded p-3">
                  {p.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Doctor Overview Component
function DoctorOverview({ appointments, slots, doctor }: any) {
  const router = useRouter();
  
  const availableSlots = (slots || []).filter((s: any) => !s.isBooked);

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
          <div className="text-2xl font-bold">{availableSlots.length}</div>
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
                    {appointment.patientEmail ? (
                      <p className="text-xs text-gray-500">Email: {appointment.patientEmail}</p>
                    ) : null}
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
                  {appointment.patientEmail ? (
                    <p className="text-xs text-gray-500">Email: {appointment.patientEmail}</p>
                  ) : null}
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
  const availableSlots = (slots || []).filter((s: any) => !s.isBooked);
  const bookedSlots = (slots || []).filter((s: any) => s.isBooked);

  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', time: '' });

  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState({ date: '', time: '' });

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

  const getSlotId = (slot: any) => {
    // Prefer Mongoose virtual `id`, then raw `_id`, then a deterministic fallback.
    const raw =
      slot?.id ||
      slot?._id?.toString?.() ||
      slot?._id ||
      `${slot?.doctorId || ''}_${slot?.date || ''}_${slot?.time || ''}`;

    if (typeof raw === 'string') return raw;
    return raw?.toString?.() || String(raw);
  };

  const handleStartEdit = (slot: any) => {
    setEditingSlotId(getSlotId(slot));
    setEditingSlot({ date: slot.date || '', time: slot.time || '' });
  };

  const handleCancelEdit = () => {
    setEditingSlotId(null);
    setEditingSlot({ date: '', time: '' });
  };

  const handleSaveEdit = async () => {
    if (!editingSlotId) return;

    try {
      const response = await fetch(`/api/slots/${editingSlotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: editingSlot.date, time: editingSlot.time }),
      });

      if (response.ok) {
        handleCancelEdit();
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating slot:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-lg font-semibold text-gray-900">Slot Management</h3>
        <button
          onClick={() => setShowAddSlot(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Add Slot
        </button>
      </div>

      {showAddSlot && (
        <div className="bg-gray-50 rounded-lg p-4">
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

      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Available Slots</h4>
        {availableSlots.length > 0 ? (
          <div className="space-y-3">
            {availableSlots.map((slot: any) => {
              const slotId = getSlotId(slot);
              return (
                <div key={slotId} className="border border-gray-200 rounded-lg p-4">
                  {editingSlotId === slotId ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={editingSlot.date}
                        onChange={(e) =>
                          setEditingSlot((prev) => ({ ...prev, date: e.target.value }))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="time"
                        value={editingSlot.time}
                        onChange={(e) =>
                          setEditingSlot((prev) => ({ ...prev, time: e.target.value }))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{slot.date}</p>
                      <p className="text-sm text-gray-600">{slot.time}</p>
                      <p className="text-xs text-green-600">Available</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStartEdit(slot)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slotId)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No available slots</p>
        )}
      </div>

      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Booked Slots</h4>
        {bookedSlots.length > 0 ? (
          <div className="space-y-3">
            {bookedSlots.map((slot: any) => {
              const slotId = getSlotId(slot);
              return (
                <div
                  key={slotId}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{slot.date}</p>
                    <p className="text-sm text-gray-600">{slot.time}</p>
                    <p className="text-xs text-red-600">Booked</p>
                  </div>
                  <span className="text-xs text-gray-400">Locked</span>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No booked slots yet</p>
        )}
      </div>
    </div>
  );
}

// Doctor Profile Component
function DoctorProfile({ doctor }: any) {
  const [localDoctor, setLocalDoctor] = useState(doctor);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    specialization: doctor?.specialization || '',
    experience: String(doctor?.experience ?? 0),
    consultationFee: String(doctor?.consultationFee ?? 0),
  });

  const handleSave = async () => {
    try {
      const response = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          specialization: formData.specialization,
          experience: Number(formData.experience),
          consultationFee: Number(formData.consultationFee),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLocalDoctor(data.doctor || doctor);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving doctor profile:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Professional Profile</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Edit Profile
          </button>
        ) : null}
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-gray-900">Dr. {localDoctor?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{localDoctor?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization</label>
              <p className="mt-1 text-gray-900">
                {localDoctor?.specialization || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <p className="mt-1 text-gray-900">{localDoctor?.experience || 0} years</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Consultation Fee
              </label>
              <p className="mt-1 text-gray-900">₹{localDoctor?.consultationFee || 0}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={localDoctor?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, specialization: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, experience: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Fee
              </label>
              <input
                type="number"
                min="0"
                value={formData.consultationFee}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, consultationFee: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: doctor?.name || '',
                  specialization: doctor?.specialization || '',
                  experience: String(doctor?.experience ?? 0),
                  consultationFee: String(doctor?.consultationFee ?? 0),
                });
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
