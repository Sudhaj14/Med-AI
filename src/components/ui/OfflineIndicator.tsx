'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getOfflineStatus, syncAllData } from '@/lib/offlineStorage';
import { useSession } from 'next-auth/react';

export default function OfflineIndicator() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = useState(true);
  const [offlineStatus, setOfflineStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    // Update offline status
    if (session?.user?.id) {
      updateOfflineStatus();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [session]);

  useEffect(() => {
    // Auto-sync when coming back online
    if (isOnline && offlineStatus?.totalUnsynced > 0) {
      handleSync();
    }
  }, [isOnline]);

  const updateOfflineStatus = async () => {
    if (session?.user?.id) {
      const status = await getOfflineStatus(session.user.id);
      setOfflineStatus(status);
    }
  };

  const handleSync = async () => {
    if (!session?.user?.id || !isOnline) return;

    setIsSyncing(true);
    try {
      const success = await syncAllData(session.user.id);
      if (success) {
        await updateOfflineStatus();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!offlineStatus) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm`}>
      <div className={`rounded-lg shadow-lg p-4 ${
        isOnline 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          
          <div className="flex-1">
            <p className={`font-medium text-sm ${
              isOnline ? 'text-green-900' : 'text-red-900'
            }`}>
              {isOnline ? t('online') : t('offline')}
            </p>
            
            {!isOnline && (
              <p className="text-xs text-red-700 mt-1">
                Some features may be unavailable
              </p>
            )}
            
            {isOnline && offlineStatus.totalUnsynced > 0 && (
              <p className="text-xs text-green-700 mt-1">
                {offlineStatus.totalUnsynced} items to sync
              </p>
            )}
          </div>

          {/* Sync Button */}
          {isOnline && offlineStatus.totalUnsynced > 0 && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                isSyncing
                  ? 'bg-gray-200 text-gray-500'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSyncing ? t('syncing') : 'Sync Now'}
            </button>
          )}
        </div>

        {/* Detailed Status */}
        {offlineStatus.totalUnsynced > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">
              {t('offlineRecords')}:
            </p>
            <div className="space-y-1">
              {offlineStatus.unsyncedItems.healthMetrics > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Health Metrics</span>
                  <span className="text-gray-900">{offlineStatus.unsyncedItems.healthMetrics}</span>
                </div>
              )}
              {offlineStatus.unsyncedItems.appointments > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Appointments</span>
                  <span className="text-gray-900">{offlineStatus.unsyncedItems.appointments}</span>
                </div>
              )}
              {offlineStatus.unsyncedItems.chatMessages > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Chat Messages</span>
                  <span className="text-gray-900">{offlineStatus.unsyncedItems.chatMessages}</span>
                </div>
              )}
              {offlineStatus.unsyncedItems.prescriptions > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Prescriptions</span>
                  <span className="text-gray-900">{offlineStatus.unsyncedItems.prescriptions}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
