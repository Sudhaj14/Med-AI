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
  const [activeTab, setActiveTab] = useState('appointments');

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
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold text-slate-900">{t('videoConsultation', 'Video Consultation')}</div>
              <div className="mt-1 text-sm text-slate-600">
                Join your scheduled video call from your appointment list. The “Join Call” button uses the appointment ID.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  View Appointments
                </button>
                <button
                  onClick={() => router.push('/book-appointment')}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  Book Appointment
                </button>
              </div>
            </div>
            <AppointmentSummary />
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
