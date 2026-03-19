'use client';

import { useSearchParams } from 'next/navigation';
import VideoCallManager from '@/components/video/VideoCallManager';

export default function VideoCallPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const role = searchParams.get('role'); // 'doctor' or 'patient'

  if (!appointmentId || !role) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Video Call Link</h1>
          <p className="text-gray-400">Please check your video call link and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <VideoCallManager 
      appointmentId={appointmentId}
      isDoctor={role === 'doctor'}
    />
  );
}
