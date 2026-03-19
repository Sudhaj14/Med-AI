'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Doctor, TimeSlot, AppointmentBookingData } from '@/types';

export default function BookAppointment() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Get passed data from previous modules
  const [passedData, setPassedData] = useState({
    symptoms: [] as string[],
    chatHistory: '',
    suggestedSpecialization: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Get data from localStorage (passed from other modules)
    const savedSymptoms = localStorage.getItem('appointmentSymptoms');
    const savedChatHistory = localStorage.getItem('appointmentChatHistory');
    const savedSpecialization = localStorage.getItem('appointmentSuggestedSpecialization');

    if (savedSymptoms) {
      const symptomsArray = JSON.parse(savedSymptoms);
      setSymptoms(symptomsArray);
      setPassedData(prev => ({ ...prev, symptoms: symptomsArray }));
      
      // Auto-fill reason based on symptoms
      if (symptomsArray.length > 0) {
        setReason(`Consultation for: ${symptomsArray.join(', ')}`);
      }
    }

    if (savedChatHistory) {
      setPassedData(prev => ({ ...prev, chatHistory: savedChatHistory }));
    }

    if (savedSpecialization) {
      setPassedData(prev => ({ ...prev, suggestedSpecialization: savedSpecialization }));
    }

    fetchDoctors();
  }, [status, router]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      const data = await response.json();
      setDoctors(data.doctors);

      // Auto-select doctor based on suggested specialization
      if (passedData.suggestedSpecialization) {
        const matchedDoctor = data.doctors.find((doc: Doctor) => 
          doc.specialization.toLowerCase().includes(passedData.suggestedSpecialization.toLowerCase())
        );
        if (matchedDoctor) {
          setSelectedDoctor(matchedDoctor);
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedSlot || !reason) {
      alert('Please select a doctor, time slot, and provide a reason for the appointment.');
      return;
    }

    setIsBooking(true);

    try {
      const bookingData: AppointmentBookingData = {
        doctorId: selectedDoctor.id,
        date: selectedSlot.date,
        time: selectedSlot.time,
        reason,
        symptoms: passedData.symptoms,
        chatHistory: passedData.chatHistory,
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        // Clear passed data after successful booking
        localStorage.removeItem('appointmentSymptoms');
        localStorage.removeItem('appointmentChatHistory');
        localStorage.removeItem('appointmentSuggestedSpecialization');
        
        alert('Appointment booked successfully!');
        // Redirect to the correct unified dashboard by role
        if (session?.user?.role === 'doctor') router.push('/doctor/dashboard');
        else router.push('/patient/dashboard');
      } else {
        const error = await response.json();
        alert(`Failed to book appointment: ${error.error}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-white font-bold text-2xl">🏥</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-xl border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🏥</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MediCare AI
                </h1>
                <p className="text-sm text-gray-600">Book Your Appointment</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Passed Data Summary */}
        {(passedData.symptoms.length > 0 || passedData.chatHistory) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Pre-filled Information</h3>
            {passedData.symptoms.length > 0 && (
              <p className="text-sm text-blue-800 mb-1">
                <strong>Symptoms:</strong> {passedData.symptoms.join(', ')}
              </p>
            )}
            {passedData.suggestedSpecialization && (
              <p className="text-sm text-blue-800 mb-1">
                <strong>Recommended:</strong> {passedData.suggestedSpecialization}
              </p>
            )}
            {passedData.chatHistory && (
              <p className="text-sm text-blue-800">
                <strong>Chat History:</strong> Available for doctor review
              </p>
            )}
          </div>
        )}

        {/* Doctor Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Doctor</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => handleDoctorSelect(doctor)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedDoctor?.id === doctor.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">👨‍⚕️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">
                        ⭐ {doctor.rating} ({doctor.experience} years)
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        ${doctor.consultationFee}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{doctor.education}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Slot Selection */}
        {selectedDoctor && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Available Time Slots - {selectedDoctor.name}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {selectedDoctor.availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={!slot.available}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    selectedSlot?.id === slot.id
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : slot.available
                      ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div>{slot.date}</div>
                  <div>{slot.time}</div>
                  {!slot.available && <div className="text-xs">Booked</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Appointment Form */}
        {selectedDoctor && selectedSlot && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Appointment Details</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please describe the reason for your appointment..."
                  required
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Appointment Summary</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Doctor:</strong> {selectedDoctor.name}</p>
                  <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
                  <p><strong>Date:</strong> {selectedSlot.date}</p>
                  <p><strong>Time:</strong> {selectedSlot.time}</p>
                  <p><strong>Consultation Fee:</strong> ${selectedDoctor.consultationFee}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isBooking}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
              >
                {isBooking ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
