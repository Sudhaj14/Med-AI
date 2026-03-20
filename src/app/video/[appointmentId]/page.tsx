'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import VideoCallScreen from '@/components/video/VideoCallScreen';

export default function VideoAppointmentPage() {
  const router = useRouter();
  const params = useParams<{ appointmentId: string }>();
  const { data: session, status } = useSession();

  const appointmentId = params?.appointmentId;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Loading video session…</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.role) {
    router.push('/');
    return null;
  }

  if (!appointmentId || typeof appointmentId !== 'string') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Missing appointment id.</p>
      </div>
    );
  }

  return (
    <VideoCallScreen
      appointmentId={appointmentId}
role={session.user.role as 'patient' | 'doctor'}      onEndCall={() => {
        if (session.user.role === 'doctor') router.push('/doctor/dashboard');
        else router.push('/patient/dashboard');
      }}
    />
  );
}

