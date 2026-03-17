'use client';

import { useSession } from 'next-auth/react';
import SymptomChecker from '@/components/chat/SymptomChecker';

export default function SymptomTab() {
  const { data: session } = useSession();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">🩺</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Symptom Checker</h2>
            <p className="text-gray-600">AI-powered symptom analysis</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium">Ready</span>
          </div>
          <span className="text-sm text-gray-500">
            Advanced AI analysis
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
        <SymptomChecker />
      </div>
    </div>
  );
}
