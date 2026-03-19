'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import VideoCallManager from '@/components/video/VideoCallManager';

export default function VideoConsultationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
  };

  const handleStartCall = () => {
    if (selectedAppointment) {
      // Navigate to video call with appointment ID
      router.push(`/video-call?appointmentId=${selectedAppointment.id}&role=patient`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Consultation</h1>
            <p className="text-gray-600">Select an appointment to start or join a video call</p>
          </div>

          {/* Appointments List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Appointments */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
              <div className="space-y-4">
                {appointments
                  .filter(apt => apt.status === 'scheduled' || apt.status === 'in_progress')
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`bg-white rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all ${
                        selectedAppointment?.id === appointment.id
                          ? 'border-blue-500 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.doctor.name}</h3>
                          <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{appointment.consultationFee} ₹</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span>📅 {appointment.date}</span>
                        <span>🕐 {appointment.time}</span>
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Reason:</strong> {appointment.reason}
                      </div>
                      
                      {appointment.symptoms && appointment.symptoms.length > 0 && (
                        <div className="text-sm text-gray-700">
                          <strong>Symptoms:</strong> {appointment.symptoms.join(', ')}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'in_progress'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {appointment.status === 'in_progress' ? 'Call in Progress' : 'Scheduled'}
                        </span>
                        
                        {appointment.status === 'in_progress' && (
                          <button
                            onClick={() => router.push(`/video-call?appointmentId=${appointment.id}&role=patient`)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Join Call
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                
                {appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'in_progress').length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-gray-500">No upcoming appointments</p>
                    <button
                      onClick={() => router.push('/book-appointment')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Book Appointment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Appointment Details */}
            {selectedAppointment && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Details</h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{selectedAppointment.doctor.name}</h3>
                      <p className="text-gray-600">{selectedAppointment.doctor.specialization}</p>
                      <p className="text-sm text-gray-500">Experience: {selectedAppointment.doctor.experience} years</p>
                      <p className="text-sm text-gray-500">Rating: ⭐ {selectedAppointment.doctor.rating}</p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Date:</span>
                          <p className="text-gray-600">{selectedAppointment.date}</p>
                        </div>
                        <div>
                          <span className="font-medium">Time:</span>
                          <p className="text-gray-600">{selectedAppointment.time}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Reason for Visit</h4>
                      <p className="text-gray-700">{selectedAppointment.reason}</p>
                    </div>
                    
                    {selectedAppointment.symptoms && selectedAppointment.symptoms.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAppointment.symptoms.map((symptom: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <button
                        onClick={handleStartCall}
                        disabled={selectedAppointment.status !== 'in_progress'}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {selectedAppointment.status === 'in_progress' 
                          ? 'Join Video Call' 
                          : 'Wait for Doctor to Start Call'
                        }
                      </button>
                      
                      {selectedAppointment.status !== 'in_progress' && (
                        <p className="text-sm text-gray-500 text-center mt-2">
                          The doctor will start the call at the scheduled time. You'll be able to join when the call is active.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
