import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export interface UserVideo {
  userId: string;
  stream: MediaStream;
}

const useVideoCall = (roomId: string, userId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<UserVideo[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'failed' | 'disconnected'>('connecting');
  
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addDebugInfo = useCallback((info: string) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`VideoCall Debug: ${timestamp}: ${info}`);
  }, []);

  // Initialize socket connection with simplified approach
  useEffect(() => {
    const initializeSocket = () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      addDebugInfo(`Connecting to socket: ${apiUrl}`);
      
      const socket = io(apiUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 10000
      });
      
      socketRef.current = socket;

      socket.on('connect', () => {
        addDebugInfo('Socket connected successfully');
        setError(null);
        // Join the chat room for video call signaling
        socket.emit('join-chat', roomId);
        addDebugInfo(`Joined chat room: ${roomId}`);
      });
      
      socket.on('disconnect', (reason) => {
        addDebugInfo(`Socket disconnected: ${reason}`);
        setConnectionState('disconnected');
      });
      
      socket.on('connect_error', (error) => {
        addDebugInfo(`Socket connection error: ${error.message}`);
        setError('Connection error. Please check your internet connection.');
        setConnectionState('failed');
      });

      // Set up video call signaling listeners
      socket.on('video-call-offer', handleOffer);
      socket.on('video-call-answer', handleAnswer);
      socket.on('ice-candidate', handleIceCandidate);
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off('video-call-offer', handleOffer);
        socketRef.current.off('video-call-answer', handleAnswer);
        socketRef.current.off('ice-candidate', handleIceCandidate);
        socketRef.current.disconnect();
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, [roomId]);

  // Get user media
  const getLocalStream = useCallback(async () => {
    try {
      addDebugInfo('Getting user media...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      addDebugInfo(`Got media stream with ${stream.getVideoTracks().length} video and ${stream.getAudioTracks().length} audio tracks`);
      setLocalStream(stream);
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      addDebugInfo(`Error accessing media devices: ${err}`);
      setError('Could not access camera/microphone. Please check permissions.');
      return null;
    }
  }, [addDebugInfo]);

  // Create peer connection with better error handling
  const createPeerConnection = useCallback((stream: MediaStream) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add TURN servers for better connectivity
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
      iceCandidatePoolSize: 10
    });

    peerConnectionRef.current = peerConnection;
    addDebugInfo('Created peer connection with ICE servers');

    // Connection state monitoring
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      addDebugInfo(`Peer connection state: ${state}`);
      setConnectionState(state as any);
      
      if (state === 'connected') {
        setIsCallActive(true);
        setIsLoading(false);
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
        }
        toast.success('Video call connected!');
      } else if (state === 'failed' || state === 'disconnected') {
        setConnectionState('failed');
        addDebugInfo('Peer connection failed');
        toast.error('Connection failed. Please try again.');
      }
    };

    // ICE connection state monitoring
    peerConnection.oniceconnectionstatechange = () => {
      addDebugInfo(`ICE connection state: ${peerConnection.iceConnectionState}`);
    };

    // ICE gathering state monitoring
    peerConnection.onicegatheringstatechange = () => {
      addDebugInfo(`ICE gathering state: ${peerConnection.iceGatheringState}`);
    };

    // Add local stream tracks
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
      addDebugInfo(`Added ${track.kind} track to peer connection`);
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      addDebugInfo(`Received remote ${event.track.kind} track`);
      const remoteStream = event.streams[0];
      setRemoteStreams([{ userId: 'remote', stream: remoteStream }]);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        addDebugInfo('Sending ICE candidate');
        socketRef.current.emit('ice-candidate', {
          chatId: roomId,
          candidate: event.candidate
        });
      }
    };

    return peerConnection;
  }, [roomId, addDebugInfo]);

  // Handle incoming offer
  const handleOffer = useCallback(async (data: any) => {
    addDebugInfo('Received offer, creating answer');
    try {
      if (!peerConnectionRef.current || !socketRef.current) {
        addDebugInfo('Missing peer connection or socket for handling offer');
        return;
      }

      await peerConnectionRef.current.setRemoteDescription(data.offer);
      addDebugInfo('Remote description set from offer');

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      addDebugInfo('Local description set, sending answer');

      socketRef.current.emit('video-call-answer', {
        chatId: roomId,
        answer: answer
      });
      addDebugInfo('Answer sent via socket');
    } catch (error) {
      addDebugInfo(`Error handling offer: ${error}`);
      setError('Failed to process incoming call');
    }
  }, [roomId, addDebugInfo]);

  // Handle incoming answer
  const handleAnswer = useCallback(async (data: any) => {
    addDebugInfo('Received answer, setting remote description');
    try {
      if (!peerConnectionRef.current) {
        addDebugInfo('Missing peer connection for handling answer');
        return;
      }

      await peerConnectionRef.current.setRemoteDescription(data.answer);
      addDebugInfo('Remote description set from answer');
    } catch (error) {
      addDebugInfo(`Error handling answer: ${error}`);
      setError('Failed to process call response');
    }
  }, [addDebugInfo]);

  // Handle ICE candidates
  const handleIceCandidate = useCallback(async (data: any) => {
    addDebugInfo('Received ICE candidate');
    try {
      if (!peerConnectionRef.current) {
        addDebugInfo('Missing peer connection for ICE candidate');
        return;
      }

      await peerConnectionRef.current.addIceCandidate(data.candidate);
      addDebugInfo('ICE candidate added successfully');
    } catch (error) {
      addDebugInfo(`Error adding ICE candidate: ${error}`);
    }
  }, [addDebugInfo]);

  // Start the call (initiator)
  const startCall = useCallback(async () => {
    try {
      const stream = await getLocalStream();
      if (!stream || !socketRef.current) {
        addDebugInfo('Cannot start call - missing stream or socket');
        return;
      }

      const peerConnection = createPeerConnection(stream);
      addDebugInfo('Role: Initiator. Creating offer...');

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (connectionState !== 'connected') {
          addDebugInfo('Connection timeout after 30 seconds');
          setError('Connection timeout. Please try again.');
          setConnectionState('failed');
          toast.error('Connection timeout. Please check your internet connection.');
        }
      }, 30000);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      addDebugInfo('Local description set, sending offer');

      socketRef.current.emit('video-call-offer', {
        chatId: roomId,
        offer: offer
      });
      addDebugInfo('Offer sent via socket');

    } catch (error) {
      addDebugInfo(`Error starting call: ${error}`);
      setError('Failed to start video call');
      setIsLoading(false);
    }
  }, [getLocalStream, createPeerConnection, roomId, connectionState, addDebugInfo]);

  // Join call (receiver)
  const joinCall = useCallback(async () => {
    try {
      const stream = await getLocalStream();
      if (!stream) {
        addDebugInfo('Cannot join call - missing stream');
        return;
      }

      createPeerConnection(stream);
      addDebugInfo('Role: Receiver. Waiting for offer...');

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (connectionState !== 'connected') {
          addDebugInfo('Connection timeout after 30 seconds');
          setError('Connection timeout. Please try again.');
          setConnectionState('failed');
          toast.error('Connection timeout. Please check your internet connection.');
        }
      }, 30000);

      setIsLoading(false);
    } catch (error) {
      addDebugInfo(`Error joining call: ${error}`);
      setError('Failed to join video call');
      setIsLoading(false);
    }
  }, [getLocalStream, createPeerConnection, connectionState, addDebugInfo]);

  // Leave the call and clean up
  const leaveCall = useCallback(() => {
    addDebugInfo('Leaving call and cleaning up');
    
    // Clear timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    // Stop all tracks in the local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        addDebugInfo(`Stopped ${track.kind} track`);
      });
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      addDebugInfo('Peer connection closed');
    }
    
    // Reset state
    setLocalStream(null);
    setRemoteStreams([]);
    setIsCallActive(false);
    setIsLoading(true);
    setConnectionState('disconnected');
    setError(null);
    
    // Notify server we're leaving
    if (socketRef.current) {
      socketRef.current.emit('end-video-call', { chatId: roomId });
    }
  }, [localStream, roomId, addDebugInfo]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      leaveCall();
    };
  }, [leaveCall]);

  return {
    localStream,
    remoteStreams,
    isCallActive,
    isLoading,
    error,
    connectionState,
    userVideoRef,
    startCall,
    joinCall,
    leaveCall,
  };
};

export default useVideoCall;
