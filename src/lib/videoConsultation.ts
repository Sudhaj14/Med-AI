import { useCallback, useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { io, type Socket } from 'socket.io-client';

export interface VideoCallState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCallActive: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  error: string | null;
}

export interface UseVideoCallOptions {
  appointmentId: string;
  role: 'doctor' | 'patient';
}

export function useVideoCall({ appointmentId, role }: UseVideoCallOptions) {
  const [state, setState] = useState<VideoCallState>({
    localStream: null,
    remoteStream: null,
    isCallActive: false,
    isMuted: false,
    isVideoOff: false,
    error: null,
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const signalQueueRef = useRef<Peer.SignalData[]>([]);

  const initializeLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      setState(prev => ({ ...prev, localStream: stream }));
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to access camera/microphone. Please check permissions.' 
      }));
      return null;
    }
  };

  type SignalPayload = {
    signalData: Peer.SignalData;
    senderRole: 'doctor' | 'patient';
  };

  const emitSignal = (signalData: Peer.SignalData) => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('signal', { appointmentId, signalData, senderRole: role });
    } else {
      signalQueueRef.current.push(signalData);
    }
  };

  // Initialize WebSocket connection (and wait for connect)
  const initializeSocket = useCallback(async () => {
    if (socketRef.current?.connected) return socketRef.current;

    const signalingUrl = (
      process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:5000'
    ).replace(/\/$/, '');

    if (process.env.NODE_ENV === 'development') {
      console.log('[videoConsultation] Connecting to signaling server:', signalingUrl);
    }
      

    const socket =
      socketRef.current ??
      io(signalingUrl, {
        // Allow polling as a fallback in case websocket is blocked or unavailable.
        transports: ['websocket', 'polling'],
        path: process.env.NEXT_PUBLIC_SIGNALING_PATH || '/socket.io',
      });

    socketRef.current = socket;

    // Ensure we only bind listeners once per socket instance
    socket.off('connect_error');
    socket.off('connect');
    socket.off('signal');

    socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err);
      setState((prev) => ({
        ...prev,
        error: 'Unable to connect to video signaling server. Please try again.',
      }));
    });

    socket.on('signal', ({ signalData, senderRole }: SignalPayload) => {
      if (peerRef.current && senderRole !== role && signalData) {
        peerRef.current.signal(signalData);
      }
    });

    const waitForConnect = () =>
      new Promise<void>((resolve) => {
        if (socket.connected) return resolve();
        socket.once('connect', () => resolve());
      });

    await waitForConnect();

    // Join the appointment room only after connected.
    socket.emit('join-appointment', { appointmentId, role });

    // Flush any queued signals that happened pre-connect.
    if (signalQueueRef.current.length > 0) {
      const queued = [...signalQueueRef.current];
      signalQueueRef.current = [];
      queued.forEach((sig) => {
        socket.emit('signal', { appointmentId, signalData: sig, senderRole: role });
      });
    }

    return socket;
  }, [appointmentId, role]);

  // End call (stable; uses refs to avoid stale closures)
  const endCall = useCallback(() => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Close socket connection
    if (socketRef.current) {
      socketRef.current.emit('leave-appointment', { appointmentId, role });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    signalQueueRef.current = [];

    // Reset state
    setState({
      localStream: null,
      remoteStream: null,
      isCallActive: false,
      isMuted: false,
      isVideoOff: false,
      error: null,
    });

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [appointmentId, role]);

  const startCall = async () => {
    const stream = localStreamRef.current ?? state.localStream ?? (await initializeLocalStream());
    if (!stream) return;

    try {
      // Bug 2 fix: ensure socket is connected before peer can emit SDP.
      await initializeSocket();

      const peer = new Peer({
        initiator: role === 'doctor',
        trickle: false,
        stream,
      });

      peerRef.current = peer;

      peer.on('signal', (data: Peer.SignalData) => {
        emitSignal(data);
      });

      peer.on('stream', (remoteStream: MediaStream) => {
        setState((prev) => ({ ...prev, remoteStream }));
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      peer.on('connect', () => {
        setState((prev) => ({ ...prev, isCallActive: true, error: null }));
      });

      peer.on('close', () => {
        endCall();
      });

      peer.on('error', (error: Error) => {
        console.error('Peer connection error:', error);
        setState((prev) => ({
          ...prev,
          error: 'Connection error. Please try again.',
        }));
        endCall();
      });

      setState(prev => ({ ...prev, isCallActive: true }));
    } catch (error) {
      console.error('Error starting call:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start call. Please try again.' 
      }));
    }
  };

  // Join call (for patient)
  const joinCall = async () => {
    const stream = localStreamRef.current ?? state.localStream ?? (await initializeLocalStream());
    if (!stream) return;

    try {
      // Bug 2 fix: ensure socket is connected before peer can emit SDP.
      await initializeSocket();

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });

      peerRef.current = peer;

      // Handle peer events
      peer.on('signal', (data: Peer.SignalData) => {
        emitSignal(data);
      });

      peer.on('stream', (remoteStream: MediaStream) => {
        setState(prev => ({ ...prev, remoteStream }));
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      peer.on('connect', () => {
        setState(prev => ({ ...prev, isCallActive: true, error: null }));
      });

      peer.on('close', () => {
        endCall();
      });

      peer.on('error', (error: Error) => {
        console.error('Peer connection error:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Connection error. Please try again.' 
        }));
        endCall();
      });

      setState(prev => ({ ...prev, isCallActive: true }));
    } catch (error) {
      console.error('Error joining call:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to join call. Please try again.' 
      }));
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const stream = localStreamRef.current ?? state.localStream;
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }
  };

  // Toggle video
  const toggleVideo = () => {
    const stream = localStreamRef.current ?? state.localStream;
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setState(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    ...state,
    localVideoRef,
    remoteVideoRef,
    startCall,
    joinCall,
    endCall,
    toggleMute,
    toggleVideo,
    initializeLocalStream,
  };
}

// Video session management API
export const videoSessionAPI = {
  // Create a new video session
  createSession: async (appointmentId: string) => {
    try {
      const response = await fetch('/api/video-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.sessionId;
      }
      throw new Error('Failed to create video session');
    } catch (error) {
      console.error('Error creating video session:', error);
      throw error;
    }
  },

  // Get existing session
  getSession: async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/video-sessions?appointmentId=${appointmentId}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.session;
      }
      return null;
    } catch (error) {
      console.error('Error getting video session:', error);
      return null;
    }
  },

  // End session
  endSession: async (sessionId: string) => {
    try {
      const response = await fetch(`/api/video-sessions/${sessionId}`, {
        method: 'DELETE',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error ending video session:', error);
      return false;
    }
  },
};
