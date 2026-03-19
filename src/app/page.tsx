'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function RoleSelection() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      // Redirect to appropriate dashboard based on role
      if (session.user.role === 'doctor') {
        router.push('/doctor/dashboard');
      } else {
        router.push('/patient/dashboard');
      }
    }
  }, [status, session, router]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">🏥</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            MediCare AI
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your Intelligent Healthcare Platform
          </p>
          <p className="text-gray-500">
            Choose your role to get started with personalized healthcare experience
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Patient Card */}
          <div 
            onClick={() => router.push('/login/patient')}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-blue-100"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient</h2>
              <p className="text-gray-600 mb-6">
                Access AI-powered health assistant, symptom checker, track health metrics, and book appointments with qualified doctors.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>AI Medical Chatbot</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Symptom Checker</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Health Metrics Tracking</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Appointment Booking</span>
                </div>
              </div>
              
              <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                Login as Patient
              </button>
            </div>
          </div>

          {/* Doctor Card */}
          <div 
            onClick={() => router.push('/login/doctor')}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-purple-100"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">👨‍⚕️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Doctor</h2>
              <p className="text-gray-600 mb-6">
                Manage your practice, set availability slots, view patient appointments, and provide consultations through our platform.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Professional Profile</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Slot Management</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Appointment Dashboard</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <span className="text-green-500">✓</span>
                  <span>Patient Data Access</span>
                </div>
              </div>
              
              <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
                Login as Doctor
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Secure • HIPAA Compliant • Available 24/7
          </p>
        </div>
      </div>
    </div>
  );
}
