'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ChatTab from '@/components/dashboard/ChatTab';
import SymptomTab from '@/components/dashboard/SymptomTab';
import MetricsTab from '@/components/dashboard/MetricsTab';
import AppointmentSummary from '@/components/dashboard/AppointmentSummary';
import OfflineIndicator from '@/components/ui/OfflineIndicator';
import PharmacySearch from '@/components/pharmacy/PharmacySearch';
import DashboardShell from '@/components/layout/DashboardShell';

export default function PatientDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not authenticated or not a patient
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login/patient');
    } else if (status === 'authenticated' && session?.user?.role !== 'patient') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-white font-bold text-2xl">🏥</span>
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
    { id: 'chatbot', label: t('chatbot', 'AI Chatbot'), icon: '🤖' },
    { id: 'symptoms', label: t('symptomChecker', 'Symptom Checker'), icon: '🩺' },
    { id: 'metrics', label: t('healthMetrics', 'Health Metrics'), icon: '📈' },
    { id: 'appointments', label: t('appointments', 'Appointments'), icon: '📅' },
    { id: 'pharmacy', label: t('pharmacy', 'Pharmacy'), icon: '🏪' },
    { id: 'video', label: t('videoConsultation', 'Video Consultation'), icon: '📹' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chatbot':
        return <ChatTab />;
      case 'symptoms':
        return <SymptomTab />;
      case 'metrics':
        return <MetricsTab />;
      case 'appointments':
        return <AppointmentSummary />;
      case 'pharmacy':
        return <PharmacySearch />;
      case 'video':
        return (
          <div className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Consultation</h3>
              <p className="text-gray-600 mb-6">Start a video call with your doctor for professional healthcare consultation.</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <h4 className="font-medium text-blue-900 mb-2">📹 How it works:</h4>
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>• Book an appointment first</li>
                  <li>• Wait for doctor to start the call</li>
                  <li>• Join video call at appointment time</li>
                  <li>• Healthcare-grade encryption</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    // Check for active appointments and redirect to video call
                    router.push('/video-consultation');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  Enter Video Consultation
                </button>
                
                <div className="text-sm text-gray-500">
                  <p>Click to enter the video consultation room.</p>
                  <p>If you have an active appointment, you can join the call.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <AppointmentSummary />;
    }
  };

  return (
    <>
      <DashboardShell
        title="MediCare AI"
        subtitle="Patient"
        navItems={tabs}
        activeId={activeTab}
        onSelect={setActiveTab}
      >
        {renderTabContent()}
      </DashboardShell>
      <OfflineIndicator />
    </>
  );
}
