'use client';

import { useTranslation } from 'react-i18next';
import { useVideoCall } from '@/lib/videoConsultation';

interface VideoCallScreenProps {
  appointmentId: string;
  role: 'doctor' | 'patient';
  onEndCall: () => void;
}

export default function VideoCallScreen({ appointmentId, role, onEndCall }: VideoCallScreenProps) {
  const { t } = useTranslation();
  
  const {
    localStream,
    remoteStream,
    isCallActive,
    isMuted,
    isVideoOff,
    error,
    localVideoRef,
    remoteVideoRef,
    startCall,
    joinCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useVideoCall({ appointmentId, role });

  const handleEndCall = () => {
    endCall();
    onEndCall();
  };

  const handleStartCall = async () => {
    if (role === 'doctor') {
      await startCall();
    } else {
      await joinCall();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">🔴</span>
          </div>
          <div>
            <h2 className="text-white font-semibold">
              {t('videoConsultation')} - {role === 'doctor' ? 'Doctor' : 'Patient'}
            </h2>
            <p className="text-gray-400 text-sm">
              Appointment ID: {appointmentId}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isCallActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isCallActive ? 'bg-white animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span>{isCallActive ? t('callInProgress') : 'Waiting'}</span>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900">
        {/* Remote Video (Large) */}
        <div className="absolute inset-0">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👤</span>
                </div>
                <p className="text-gray-400 text-lg">
                  {role === 'doctor' ? 'Waiting for patient to join...' : 'Waiting for doctor to start...'}
                </p>
                {!isCallActive && (
                  <button
                    onClick={handleStartCall}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {role === 'doctor' ? t('startVideoCall') : t('joinVideoCall')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Small, overlay) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
            />
          ) : null}
          {isVideoOff && (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <span className="text-2xl">📹</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-4 py-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${
              isMuted 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isMuted ? t('unmute') : t('mute')}
          >
            {isMuted ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Video On/Off */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoOff 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isVideoOff ? t('videoOn') : t('videoOff')}
          >
            {isVideoOff ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            title={t('endCall')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
          </button>
        </div>

        {/* Call Info */}
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            {isCallActive ? 'Call connected' : 'Call not started'}
          </p>
          {isCallActive && (
            <p className="text-gray-500 text-xs mt-1">
              Quality: {localStream?.getVideoTracks()[0]?.getSettings().width || 'N/A'}x{localStream?.getVideoTracks()[0]?.getSettings().height || 'N/A'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
