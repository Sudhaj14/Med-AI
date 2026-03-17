'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ChatTab from '@/components/dashboard/ChatTab';
import SymptomTab from '@/components/dashboard/SymptomTab';
import MetricsTab from '@/components/dashboard/MetricsTab';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

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
      case 'chat':
        return <ChatTab />;
      case 'symptoms':
        return <SymptomTab />;
      case 'metrics':
        return <MetricsTab />;
      default:
        return <ChatTab />;
    }
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
                <option value="chat">🤖 AI Chatbot</option>
                <option value="symptoms">🩺 Symptom Checker</option>
                <option value="metrics">📊 Health Metrics</option>
              </select>
            </div>

            {/* Profile Section */}
            <div className="flex items-center space-x-4">
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

      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          
          <div className="flex space-x-2 mb-6">
            {[
              { id: 'chat', label: 'AI Chatbot', icon: '🤖', color: 'blue' },
              { id: 'symptoms', label: 'Symptom Checker', icon: '🩺', color: 'green' },
              { id: 'metrics', label: 'Health Metrics', icon: '📊', color: 'purple' },
            ].map((tab) => (
              <div
                key={tab.id}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  ${activeTab === tab.id 
                    ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg` 
                    : 'bg-white text-gray-700'
                  }
                `}
              >
                <span className="text-lg mr-2">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            ))}
          </div>
        </div>

        
        {renderTabContent()}
      </main>
    </div>
  );
}
