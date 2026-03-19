'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      try {
        // Wait for i18n to be ready
        if (i18n.isInitialized) {
          setIsReady(true);
        } else {
          // Wait for initialization
          i18n.on('initialized', () => {
            setIsReady(true);
          });
        }
      } catch (error) {
        console.error('Error initializing i18n:', error);
        setIsReady(true); // Continue even if there's an error
      }
    };

    initI18n();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-white font-bold text-2xl">🌍</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
