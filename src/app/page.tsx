'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Medical Chatbot
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your AI-powered healthcare assistant for personalized health guidance, symptom analysis, and health tracking.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI-Powered Chat</h3>
                  <p className="text-gray-600">Get intelligent health responses from Gemini AI</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">🩺</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Symptom Checker</h3>
                  <p className="text-gray-600">Analyze your symptoms and get health insights</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Health Tracking</h3>
                  <p className="text-gray-600">Monitor your health metrics with interactive charts</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-x-4">
              <Link
                href="/auth/signin"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/auth/signup"
                className="inline-block px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏥</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to Your Health Assistant</h2>
              </div>
              <p className="text-gray-600 text-center">
                Experience the future of healthcare with our intelligent chatbot that provides personalized health guidance and monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
