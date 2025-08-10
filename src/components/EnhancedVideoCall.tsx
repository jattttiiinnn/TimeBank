import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { Socket } from 'socket.io-client';

interface VideoCallProps {
  chatId: string;
  otherParticipant?: { _id: string; name: string };
  onClose: () => void;
}

export default function EnhancedVideoCall({ chatId, otherParticipant, onClose }: VideoCallProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'initializing' | 'connecting' | 'connected' | 'failed' | 'timeout'>('initializing');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isInitiator, setIsInitiator] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addDebugInfo = (info: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev.slice(-4), `${timestamp}: ${info}`]);
    console.log(`VideoCall Debug: ${info}`);
  };

  useEffect(() => {
    initializeCall();
    
    // Set a 30-second timeout
    timeoutRef.current = setTimeout(() => {
      if (!isConnected) {
        addDebugInfo('Connection timeout after 30 seconds');
        setConnectionState('timeout');
        toast.error('⏰ Connection timeout. The other user may not be available.', {
          duration: 5000,
        });
      }
    }, 30000);

    return () => {
      cleanup();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [chatId]);

  const initializeCall = async () => {
    try {
      addDebugInfo('Starting video call initialization');
      setConnectionState('connecting');
      
      // Initialize Socket.io
      const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      addDebugInfo(`Connecting to socket: ${socketUrl}`);
      
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });
      
      setSocket(newSocket);

      newSocket.on('connect', () => {
        addDebugInfo('Socket connected successfully');
        newSocket.emit('join-chat', chatId);
        addDebugInfo(`Joined chat room: ${chatId}`);
        initializeWebRTC();
      });

      newSocket.on('connect_error', (error) => {
        addDebugInfo(`Socket connection error: ${error.message}`);
        setConnectionState('failed');
      });

      newSocket.on('disconnect', () => {
        addDebugInfo('Socket disconnected');
      });

      // WebRTC signaling handlers
      newSocket.on('video-call-offer', handleOffer);
      newSocket.on('video-call-answer', handleAnswer);
      newSocket.on('ice-candidate', handleIceCandidate);

    } catch (error) {
      addDebugInfo(`Initialization error: ${error}`);
      setConnectionState('failed');
    }
  };

  const initializeWebRTC = async () => {
    try {
      addDebugInfo('Getting user media...');
      
      // Get user media with fallback options
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true
        });
      } catch (err) {
        addDebugInfo('High quality failed, trying lower quality');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: true
        });
      }
      
      addDebugInfo(`Got media stream with ${stream.getVideoTracks().length} video and ${stream.getAudioTracks().length} audio tracks`);
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection with multiple ICE servers
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
        ],
        iceCandidatePoolSize: 10,
      });

      peerConnectionRef.current = peerConnection;
      addDebugInfo('Created peer connection with ICE servers');

      // Add event listeners
      peerConnection.onconnectionstatechange = () => {
        addDebugInfo(`Peer connection state: ${peerConnection.connectionState}`);
        if (peerConnection.connectionState === 'connected') {
          setIsConnected(true);
          setConnectionState('connected');
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          toast.success(`🎉 Connected to ${otherParticipant?.name}!`);
        } else if (peerConnection.connectionState === 'failed') {
          setConnectionState('failed');
          addDebugInfo('Peer connection failed');
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        addDebugInfo(`ICE connection state: ${peerConnection.iceConnectionState}`);
      };

      peerConnection.onicegatheringstatechange = () => {
        addDebugInfo(`ICE gathering state: ${peerConnection.iceGatheringState}`);
      };

      peerConnection.ontrack = (event) => {
        addDebugInfo(`Received ${event.track.kind} track`);
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          addDebugInfo('Remote video stream set');
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          addDebugInfo('Sending ICE candidate');
          socket.emit('ice-candidate', {
            chatId,
            candidate: event.candidate
          });
        }
      };

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
        addDebugInfo(`Added ${track.kind} track to peer connection`);
      });

      // Start as initiator and create offer
      setIsInitiator(true);
      addDebugInfo('Set as initiator, creating offer in 2 seconds');
      setTimeout(createOffer, 2000);

    } catch (error) {
      addDebugInfo(`WebRTC initialization error: ${error}`);
      setConnectionState('failed');
      toast.error('❌ Could not access camera/microphone. Please check permissions.');
    }
  };

  const createOffer = async () => {
    try {
      if (!peerConnectionRef.current || !socket) {
        addDebugInfo('Cannot create offer - missing peer connection or socket');
        return;
      }

      addDebugInfo('Creating offer...');
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      addDebugInfo('Local description set, sending offer');

      socket.emit('video-call-offer', {
        chatId,
        offer
      });
      addDebugInfo('Offer sent via socket');

    } catch (error) {
      addDebugInfo(`Error creating offer: ${error}`);
    }
  };

  const handleOffer = async (data: any) => {
    try {
      addDebugInfo('Received offer, creating answer');
      if (!peerConnectionRef.current) return;

      await peerConnectionRef.current.setRemoteDescription(data.offer);
      addDebugInfo('Remote description set from offer');
      
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      addDebugInfo('Local description set, sending answer');

      if (socket) {
        socket.emit('video-call-answer', {
          chatId,
          answer
        });
        addDebugInfo('Answer sent via socket');
      }
    } catch (error) {
      addDebugInfo(`Error handling offer: ${error}`);
    }
  };

  const handleAnswer = async (data: any) => {
    try {
      addDebugInfo('Received answer, setting remote description');
      if (!peerConnectionRef.current) return;
      
      await peerConnectionRef.current.setRemoteDescription(data.answer);
      addDebugInfo('Remote description set from answer');
    } catch (error) {
      addDebugInfo(`Error handling answer: ${error}`);
    }
  };

  const handleIceCandidate = async (data: any) => {
    try {
      addDebugInfo('Received ICE candidate');
      if (!peerConnectionRef.current) return;
      
      await peerConnectionRef.current.addIceCandidate(data.candidate);
      addDebugInfo('ICE candidate added successfully');
    } catch (error) {
      addDebugInfo(`Error handling ICE candidate: ${error}`);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        toast.success(videoTrack.enabled ? '📹 Camera on' : '📹 Camera off');
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        toast.success(audioTrack.enabled ? '🎤 Mic on' : '🎤 Mic off');
      }
    }
  };

  const retry = () => {
    cleanup();
    setIsConnected(false);
    setConnectionState('initializing');
    setDebugInfo([]);
    initializeCall();
  };

  const endCall = () => {
    addDebugInfo('Ending call');
    cleanup();
    onClose();
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socket) {
      socket.disconnect();
    }
  };

  const getStatusMessage = () => {
    switch (connectionState) {
      case 'initializing':
        return 'Initializing...';
      case 'connecting':
        return `Connecting to ${otherParticipant?.name}...`;
      case 'connected':
        return 'Connected';
      case 'failed':
        return 'Connection failed';
      case 'timeout':
        return 'Connection timeout';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="h-full bg-gray-900 relative">
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Local Video */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          {connectionState === 'failed' || connectionState === 'timeout' ? (
            <div>
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="mb-4">{getStatusMessage()}</p>
              <button
                onClick={retry}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>{getStatusMessage()}</p>
              <p className="text-sm mt-2 opacity-75">
                {isInitiator ? 'Initiating call...' : 'Joining call...'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Debug Info */}
      <div className="absolute bottom-20 left-4 bg-black/70 text-white text-xs p-3 rounded-lg max-w-xs">
        <div className="font-semibold mb-2">Debug Info:</div>
        {debugInfo.map((info, index) => (
          <div key={index} className="opacity-80">{info}</div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${
            isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          } text-white transition-colors`}
        >
          {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </button>
        
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full ${
            isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          } text-white transition-colors`}
        >
          {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </button>
        
        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>

      {/* Participant Info */}
      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-semibold">{otherParticipant?.name}</h3>
        <p className="text-sm opacity-75">{getStatusMessage()}</p>
        <p className="text-xs opacity-50">
          Role: {isInitiator ? 'Caller' : 'Receiver'}
        </p>
      </div>
    </div>
  );
}
