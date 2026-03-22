import React, { useEffect, useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// Helper to get random ID if user is missing
function randomID(len) {
  let result = '';
  if (result) return result;
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

const VideoCall = ({ roomId, user, onLeave, isVideo = true }) => {
  const containerRef = useRef(null);
  const zpRef = useRef(null); // Keep track of the Zego instance

  // Env variables
  const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID) || 1255435158;
  const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || "01873c864a039c9cad88a48c1b0295bb";

  useEffect(() => {
    const startMeeting = async () => {
      if (!containerRef.current) return;

      // Safe User Data
      const userId = user?._id || randomID(5);
      const userName = user?.username || user?.firstName || "Guest";

      // Generate Kit Token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        userId,
        userName
      );

      // Create instance
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp; // Store instance to destroy later

      // Join Room
      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: 'Copy Link',
            url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + roomId,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        turnOnCameraWhenJoining: isVideo,
        turnOnMicrophoneWhenJoining: true,
        showPreJoinView: false,
        onLeaveRoom: () => {
            // Cleanup and notify parent
            if (onLeave) onLeave();
        },
      });
    };

    startMeeting();

    // 🧹 CLEANUP FUNCTION: This runs when component unmounts
    return () => {
      if (zpRef.current) {
        zpRef.current.destroy(); // <--- THIS FIXES THE BLACK SCREEN ERROR
        zpRef.current = null;
      }
    };
  }, [roomId, user, isVideo, onLeave]);

  return (
    <div className="fixed inset-0 z-200 bg-black flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default VideoCall;