'use client';

import { useSession } from 'next-auth/react';
import EnhancedHealthTracker from '@/components/chat/EnhancedHealthTracker';

export default function MetricsTab() {
  const { data: session } = useSession();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">📊</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Health Metrics</h2>
            <p className="text-gray-600">Track your health data</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium">Active</span>
          </div>
          <span className="text-sm text-gray-500">
            Real-time tracking
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <EnhancedHealthTracker />
      </div>
    </div>
  );
}
