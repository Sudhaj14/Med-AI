'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Appointment } from '@/types';

export default function AppointmentSummary() {
  const { data: session } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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

  const handleBookAppointment = () => {
    router.push('/book-appointment');
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' && new Date(apt.date) >= new Date()
  );

  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || new Date(apt.date) < new Date()
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
          <button
            onClick={handleBookAppointment}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200"
          >
            + Book New
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 bg-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Upcoming Appointments</h3>
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment, index) => (
                    <div key={`upcoming-${appointment.id || index}`} className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.doctor.name}</h4>
                          <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="text-gray-500">
                              📅 {appointment.date}
                            </span>
                            <span className="text-gray-500">
                              🕐 {appointment.time}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Reason:</strong> {appointment.reason}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            ${appointment.doctor.consultationFee}
                          </p>
                          <button
                            onClick={() => {
                              const id = (appointment as any)._id || appointment.id;
                              if (id) router.push(`/video/${id}`);
                            }}
                            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Join Call
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Past Appointments</h3>
                <div className="space-y-3">
                  {pastAppointments.slice(0, 3).map((appointment, index) => (
                    <div key={`past-${appointment.id || index}`} className="border border-gray-200 bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.doctor.name}</h4>
                          <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="text-gray-500">
                              📅 {appointment.date}
                            </span>
                            <span className="text-gray-500">
                              🕐 {appointment.time}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              appointment.status === 'completed' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-600">
                            ${appointment.doctor.consultationFee}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Appointments */}
            {appointments.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Yet</h3>
                <p className="text-gray-600 mb-4">
                  Book your first appointment to get started with your healthcare journey.
                </p>
                <button
                  onClick={handleBookAppointment}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Book Appointment
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
