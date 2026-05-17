import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

const socket = io('http://localhost:5000');

export const VideoCallPage: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnectionRef.current = peerConnection;

        stream.getTracks().forEach((track: MediaStreamTrack) => {
          peerConnection.addTrack(track, stream);
        });

        peerConnection.ontrack = (event: RTCTrackEvent) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setIsConnected(true);
          }
        };

        peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
          if (event.candidate) {
            socket.emit('ice-candidate', event.candidate, roomId);
          }
        };

        socket.emit('join-room', roomId, socket.id);

        socket.on('user-connected', async () => {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          socket.emit('offer', offer, roomId);
        });

        socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
          await peerConnection.setRemoteDescription(offer);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit('answer', answer, roomId);
        });

        socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
          await peerConnection.setRemoteDescription(answer);
        });

        socket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
          await peerConnection.addIceCandidate(candidate);
        });

      } catch (err) {
        console.error('Error starting call:', err);
      }
    };

    startCall();

    return () => {
      localStreamRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      peerConnectionRef.current?.close();
      socket.emit('leave-room', roomId);
      socket.off('user-connected');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [roomId]);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
      socket.emit('toggle-audio', roomId, audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
      socket.emit('toggle-video', roomId, videoTrack.enabled);
    }
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    peerConnectionRef.current?.close();
    socket.emit('leave-room', roomId);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-white text-2xl font-bold mb-6">
        Room: {roomId}
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-6 w-full max-w-4xl">
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full rounded-lg bg-gray-800"
          />
          <span className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
            You
          </span>
        </div>

        <div className="relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-gray-800"
          />
          <span className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
            {isConnected ? 'Remote User' : 'Waiting for participant...'}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full ${audioEnabled ? 'bg-gray-700' : 'bg-red-500'} text-white`}
        >
          {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${videoEnabled ? 'bg-gray-700' : 'bg-red-500'} text-white`}
        >
          {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-500 text-white"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};