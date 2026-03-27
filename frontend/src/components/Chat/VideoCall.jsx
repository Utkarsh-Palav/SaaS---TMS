import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Mic, MicOff, PhoneOff, UserIcon, Loader2 } from 'lucide-react';

const VideoCall = ({ user, isVideo = true, onLeave, socket, isInitiator, recipientId, remoteUser }) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(!isVideo);
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  const attachLocalStream = useCallback((videoEl, mediaStream) => {
    if (!videoEl || !mediaStream) return;
    if (videoEl.srcObject !== mediaStream) {
      videoEl.srcObject = mediaStream;
    }
    const playPromise = videoEl.play?.();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }, []);

  useEffect(() => {
    // Keep UI state in sync when call mode changes or component gets reused.
    setIsVideoOff(!isVideo);
  }, [isVideo]);

  useEffect(() => {
    // Ensure local preview always receives the media stream after the video ref mounts.
    if (stream && myVideo.current) {
      attachLocalStream(myVideo.current, stream);
    }
  }, [stream, attachLocalStream]);

  useEffect(() => {
    let currentStream;
    let isMounted = true;
    let receiverReady = false;
    let mediaReady = false;

    const iceServers = { urls: "stun:stun.l.google.com:19302" };

    const setupInitiator = async (streamToUse) => {
       const peer = new RTCPeerConnection({ iceServers: [iceServers] });
       connectionRef.current = peer;

       streamToUse.getTracks().forEach(track => peer.addTrack(track, streamToUse));

       peer.onicecandidate = (event) => {
         if (event.candidate) {
           socket.emit('callUser', { userToCall: recipientId, signalData: { type: 'ice', candidate: event.candidate }, from: user._id });
         }
       };

       peer.ontrack = (event) => {
         if (userVideo.current) userVideo.current.srcObject = event.streams[0];
       };

       socket.on('callAccepted', async (signal) => {
         setCallAccepted(true);
         try {
           if (signal.type === 'sdp' || signal.sdp) {
             await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp || signal));
           } else if (signal.type === 'ice' && signal.candidate) {
             await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
           }
         } catch(e) { console.error("WebRTC Error (Init):", e); }
       });

       try {
         const offer = await peer.createOffer();
         await peer.setLocalDescription(offer);
         socket.emit('callUser', { userToCall: recipientId, signalData: { type: 'sdp', sdp: peer.localDescription }, from: user._id });
       } catch (err) { console.error("Error creating offer:", err); }
    };

    if (isInitiator) {
       socket.on("webrtc_ready", () => {
          receiverReady = true;
          if (mediaReady && currentStream) {
             setupInitiator(currentStream);
          }
       });
    }

    navigator.mediaDevices.getUserMedia({
      video: isVideo ? { facingMode: "user" } : false,
      audio: true
    })
      .then((s) => {
        if (!isMounted) return;
        currentStream = s;
        setStream(s);
        mediaReady = true;

        // --- 100% Native WebRTC Signaling ---
        if (isInitiator) {
           if (receiverReady) {
              setupInitiator(currentStream);
           }
        } else {
           const peer = new RTCPeerConnection({ iceServers: [iceServers] });
           connectionRef.current = peer;

           currentStream.getTracks().forEach(track => peer.addTrack(track, currentStream));

           peer.onicecandidate = (event) => {
             if (event.candidate) {
               socket.emit('answerCall', { signal: { type: 'ice', candidate: event.candidate }, to: recipientId });
             }
           };

           peer.ontrack = (event) => {
             if (userVideo.current) userVideo.current.srcObject = event.streams[0];
           };

           socket.on('callUser', async ({ signal, from }) => {
             setCallAccepted(true);
             try {
               if (signal.type === 'sdp' || signal.sdp) {
                 await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp || signal));
                 const answer = await peer.createAnswer();
                 await peer.setLocalDescription(answer);
                 socket.emit('answerCall', { signal: { type: 'sdp', sdp: peer.localDescription }, to: from });
               } else if (signal.type === 'ice' && signal.candidate) {
                 await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
               }
             } catch(e) { console.error("WebRTC Error (Rec):", e); }
           });

           // Tell caller we are mounted and ready
           socket.emit('webrtc_ready', { to: recipientId });
        }
      })
      .catch((err) => {
         console.error("Error accessing media devices.", err);
      });

    return () => {
      isMounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (connectionRef.current) {
        connectionRef.current.close();
      }
      socket.off("webrtc_ready");
      socket.off("callUser");
      socket.off("callAccepted");
    };
  }, [isInitiator, isVideo, recipientId, socket, user._id]);

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.close();
    }
    if (onLeave) onLeave();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
       <div className="w-full max-w-6xl h-full max-h-[85vh] flex flex-col items-center justify-center relative">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full relative">
             {/* Local Video Stream */}
             <div className="relative bg-muted/20 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center flex-1">
                {stream ? (
                   <video
                     key={stream?.id || "local-video"}
                     playsInline
                     muted
                     ref={(el) => {
                       myVideo.current = el;
                       if (el && stream) attachLocalStream(el, stream);
                     }}
                     autoPlay
                     className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
                   />
                ) : (
                   <div className="absolute inset-0 flex items-center justify-center flex-col animate-pulse">
                      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                      <p className="text-muted-foreground">Accessing Camera...</p>
                   </div>
                )}
                
                {isVideoOff && stream && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                     <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/30">
                       <UserIcon className="h-12 w-12 text-primary" />
                     </div>
                   </div>
                )}
                
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-medium border border-white/10">
                   You {isMuted && "(Muted)"}
                </div>
             </div>

             {/* Remote Video Stream */}
             <div className="relative bg-muted/20 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center flex-1">
                 {callAccepted && !callEnded ? (
                   <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                 ) : (
                   <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center backdrop-blur-sm border border-white/10 mb-4 animate-pulse overflow-hidden">
                         {remoteUser?.profileImage ? (
                           <img src={remoteUser.profileImage} alt={remoteUser.firstName} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground font-bold bg-muted/50">
                              {remoteUser?.firstName?.[0]?.toUpperCase() || <UserIcon className="h-12 w-12 text-muted-foreground" />}
                           </div>
                         )}
                      </div>
                      <p className="text-muted-foreground animate-pulse font-medium">
                         Waiting for {remoteUser?.firstName || 'other person'} to join...
                      </p>
                   </div>
                 )}
                 {callAccepted && (
                   <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-medium border border-white/10">
                     {remoteUser?.firstName ? `${remoteUser.firstName} ${remoteUser.lastName || ''}` : 'Remote User'}
                   </div>
                 )}
             </div>
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl">
             <button onClick={toggleMute} className={`p-4 rounded-xl transition-all ${isMuted ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
             </button>
             
             <button onClick={toggleVideo} className={`p-4 rounded-xl transition-all ${isVideoOff ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {isVideoOff ? <CameraOff size={24} /> : <Camera size={24} />}
             </button>
             
             <button onClick={leaveCall} className="p-4 rounded-xl bg-destructive hover:bg-destructive/90 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 px-8 flex items-center gap-2 font-bold tracking-wide">
                <PhoneOff size={24} /> End Call
             </button>
          </div>
       </div>
    </div>
  );
};

export default VideoCall;
