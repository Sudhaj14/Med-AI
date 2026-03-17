'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface TabProps {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

function Tab({ id, label, icon, isActive, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
          : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
        }
      `}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('chat');
  const [showProfile, setShowProfile] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const tabs = [
    { id: 'chat', label: 'AI Chatbot', icon: '🤖' },
    { id: 'symptoms', label: 'Symptom Checker', icon: '🩺' },
    { id: 'metrics', label: 'Health Metrics', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative">
      {/* Header */}
      <header className="bg-white shadow-xl border-b border-purple-100 relative z-50">
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
            <nav className="hidden  text-black md:flex space-x-2">
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </nav>

            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session?.user?.email || 'user@example.com'}
                    </p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {showProfile && (
  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]">
    <div className="p-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {session?.user?.name || 'User'}
          </p>
          <p className="text-sm text-gray-500">
            {session?.user?.email || 'user@example.com'}
          </p>
        </div>
      </div>

      <div className="border-t pt-3 mt-3">
        <button
          onClick={() => router.push('/profile')}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          ⚙️ Profile Settings
        </button>
        <button
          onClick={handleSignOut}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  </div>
)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden text-black bg-white border-b border-purple-100 px-4 py-3">
        <div className="flex space-x-2  text-black overflow-x-auto">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        {children}
      </main>
    </div>
  );
}
