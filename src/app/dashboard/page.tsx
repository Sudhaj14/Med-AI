'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatTab from '@/components/dashboard/ChatTab';
import SymptomTab from '@/components/dashboard/SymptomTab';
import MetricsTab from '@/components/dashboard/MetricsTab';
import AppointmentSummary from '@/components/dashboard/AppointmentSummary';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentSymptoms, setRecentSymptoms] = useState<string[]>([]);
  const [recommendedDoctor, setRecommendedDoctor] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Get data from localStorage (passed from other modules)
  useEffect(() => {
    const savedSymptoms = localStorage.getItem('recentSymptoms');
    const savedRecommendation = localStorage.getItem('recommendedDoctor');
    
    if (savedSymptoms) {
      setRecentSymptoms(JSON.parse(savedSymptoms));
    }
    if (savedRecommendation) {
      setRecommendedDoctor(savedRecommendation);
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-white font-bold text-2xl">🏥</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading MediCare AI</h2>
          <p className="text-gray-600">Preparing your health dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AppointmentSummary />;
      case 'chat':
        return <ChatTab />;
      case 'symptoms':
        return <SymptomTab />;
      case 'metrics':
        return <MetricsTab />;
      default:
        return <AppointmentSummary />;
    }
  };

  const handleBookAppointment = () => {
    // Pass current data to appointment booking
    if (recentSymptoms.length > 0) {
      localStorage.setItem('appointmentSymptoms', JSON.stringify(recentSymptoms));
    }
    if (recommendedDoctor) {
      localStorage.setItem('appointmentSuggestedSpecialization', recommendedDoctor);
    }
    
    router.push('/book-appointment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-xl border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🏥</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MediCare AI
                </h1>
                <p className="text-sm text-gray-600">Your Intelligent Health Assistant</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: '📋' },
                { id: 'chat', label: 'AI Chatbot', icon: '🤖' },
                { id: 'symptoms', label: 'Symptom Checker', icon: '🩺' },
                { id: 'metrics', label: 'Health Metrics', icon: '📊' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200
                    ${activeTab === tab.id 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
                    }
                  `}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="overview">📋 Overview</option>
                <option value="chat">🤖 AI Chatbot</option>
                <option value="symptoms">🩺 Symptom Checker</option>
                <option value="metrics">📊 Health Metrics</option>
              </select>
            </div>

            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              {/* Book Appointment Button */}
              <button
                onClick={handleBookAppointment}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-teal-700 shadow-lg transition-all duration-200"
              >
                <span className="text-lg">📅</span>
                <span>Book Appointment</span>
              </button>

              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {session?.user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Book Appointment Button */}
      <div className="md:hidden bg-white border-b border-purple-100 px-4 py-3">
        <button
          onClick={handleBookAppointment}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-teal-700 shadow-lg transition-all duration-200"
        >
          <span className="text-lg">📅</span>
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recommended Appointment Alert */}
        {(recentSymptoms.length > 0 || recommendedDoctor) && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">💡</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Recommended Appointment</h3>
                {recentSymptoms.length > 0 && (
                  <p className="text-sm text-blue-800 mb-1">
                    Based on your recent symptoms: <strong>{recentSymptoms.join(', ')}</strong>
                  </p>
                )}
                {recommendedDoctor && (
                  <p className="text-sm text-blue-800 mb-2">
                    Recommended specialist: <strong>{recommendedDoctor}</strong>
                  </p>
                )}
                <button
                  onClick={handleBookAppointment}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Book Now →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Tab Content */}
        {renderTabContent()}
      </main>
    </div>
  );
}
