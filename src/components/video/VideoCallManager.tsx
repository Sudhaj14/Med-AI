'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import SimplePeer from 'simple-peer';
import { Appointment } from '@/types/video';

interface VideoCallManagerProps {
  appointmentId?: string;
  isDoctor?: boolean;
}

export default function VideoCallManager({ appointmentId, isDoctor = false }: VideoCallManagerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<any>(null);

  const currentAppointmentId = appointmentId || searchParams.get('appointmentId');

  useEffect(() => {
    if (currentAppointmentId) {
      fetchAppointmentDetails();
    }
  }, [currentAppointmentId]);

  useEffect(() => {
    // Initialize local video
    initializeLocalVideo();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const initializeLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const fetchAppointmentDetails = async () => {
    try {
      const response = await fetch(`/api/appointments/${currentAppointmentId}`);
      if (response.ok) {
        const data = await response.json();
        setAppointment(data.appointment as Appointment);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const initializePeer = (isInitiator: boolean) => {
    const newPeer = new SimplePeer({
      initiator: isInitiator,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    newPeer.on('signal', (data) => {
      // Send signal through WebSocket or Socket.io
      if (socketRef.current) {
        socketRef.current.emit('signal', {
          appointmentId: currentAppointmentId,
          signal: data,
          isDoctor: isDoctor
        });
      }
    });

    newPeer.on('stream', (stream) => {
      setRemoteStream(stream);
      setIsConnected(true);
      setCallStatus('connected');
    });

    newPeer.on('connect', () => {
      setIsConnected(true);
      setCallStatus('connected');
    });

    newPeer.on('close', () => {
      setIsConnected(false);
      setCallStatus('ended');
      cleanup();
    });

    newPeer.on('error', (error) => {
      console.error('Peer connection error:', error);
      setCallStatus('ended');
      alert('Connection failed. Please try again.');
    });

    setPeer(newPeer);
    return newPeer;
  };

  const startCall = async () => {
    if (!localStream || !currentAppointmentId) return;

    setCallStatus('connecting');
    setIsCallActive(true);

    try {
      // Initialize peer as initiator (doctor starts the call)
      const newPeer = initializePeer(true);
      
      if (localStream) {
        newPeer.addStream(localStream);
      }

      // Notify backend that call is starting
      await fetch('/api/video/start-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: currentAppointmentId,
          doctorId: session?.user?.id
        })
      });

    } catch (error) {
      console.error('Error starting call:', error);
      setCallStatus('ended');
      alert('Failed to start call. Please try again.');
    }
  };

  const joinCall = async () => {
    if (!localStream || !currentAppointmentId) return;

    setCallStatus('connecting');
    setIsCallActive(true);

    try {
      // Initialize peer as non-initiator (patient joins the call)
      const newPeer = initializePeer(false);
      
      if (localStream) {
        newPeer.addStream(localStream);
      }

      // Notify backend that patient is joining
      await fetch('/api/video/join-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: currentAppointmentId,
          patientId: session?.user?.id
        })
      });

    } catch (error) {
      console.error('Error joining call:', error);
      setCallStatus('ended');
      alert('Failed to join call. Please try again.');
    }
  };

  const endCall = async () => {
    if (peer) {
      peer.destroy();
    }
    
    setCallStatus('ended');
    setIsCallActive(false);
    setIsConnected(false);
    setRemoteStream(null);

    // Notify backend that call has ended
    if (currentAppointmentId) {
      await fetch('/api/video/end-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: currentAppointmentId
        })
      });
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peer) {
      peer.destroy();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              {isDoctor ? 'Doctor Video Consultation' : 'Patient Video Consultation'}
            </h1>
            {appointment && (
              <p className="text-gray-400">
                Appointment with {isDoctor ? appointment.doctor?.name : appointment.doctor?.name} • 
                {appointment.date} at {appointment.time}
              </p>
            )}
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            End Call
          </button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Local Video */}
          <div className="relative">
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-2 rounded">
              <p className="text-sm">You ({isDoctor ? 'Doctor' : 'Patient'})</p>
            </div>
          </div>

          {/* Remote Video */}
          <div className="relative">
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-gray-400">
                      {callStatus === 'connecting' ? 'Connecting...' : 
                       callStatus === 'connected' ? 'Connected' : 
                       'Waiting for other participant...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {remoteStream && (
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-2 rounded">
                <p className="text-sm">
                  {appointment?.doctor?.name || 'Remote Participant'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center space-x-4">
          {!isCallActive && (
            <>
              {isDoctor ? (
                <button
                  onClick={startCall}
                  disabled={callStatus === 'connecting'}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {callStatus === 'connecting' ? 'Starting...' : 'Start Call'}
                </button>
              ) : (
                <button
                  onClick={joinCall}
                  disabled={callStatus === 'connecting'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {callStatus === 'connecting' ? 'Joining...' : 'Join Call'}
                </button>
              )}
            </>
          )}

          {isCallActive && (
            <>
              <button
                onClick={toggleMute}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                🎤
              </button>
              <button
                onClick={toggleVideo}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                📹
              </button>
              <button
                onClick={endCall}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                📞 End
              </button>
            </>
          )}
        </div>

        {/* Status Indicator */}
        <div className="mt-8 text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${
            callStatus === 'connected' ? 'bg-green-600' : 
            callStatus === 'connecting' ? 'bg-yellow-600' : 
            'bg-gray-600'
          }`}>
            <div className={`w-3 h-3 rounded-full mr-2 ${
              callStatus === 'connected' ? 'bg-green-300' : 
              callStatus === 'connecting' ? 'bg-yellow-300 animate-pulse' : 
              'bg-gray-300'
            }`} />
            <span className="text-sm font-medium">
              {callStatus === 'connected' ? 'Connected' : 
               callStatus === 'connecting' ? 'Connecting...' : 
               'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
