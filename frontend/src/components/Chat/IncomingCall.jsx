import React, { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";

const IncomingCall = ({ caller, type, onAccept, onDecline }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio("/sounds/ringtone.mp3");
    audio.loop = true;
    audio.volume = 0.5;

    audio.play().catch((error) => {
      console.warn("Audio play failed (browser autoplay policy requires user interaction):", error);
    });

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);
  return (
    <div className="fixed top-20 right-4 z-[100] w-full max-w-sm animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="bg-card p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>

        <div className="relative shrink-0">
          {caller.profileImage ? (
            <img
              src={caller.profileImage}
              alt={caller.firstName + " " + caller.lastName}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-sm">
              {caller.firstName?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-white bg-emerald-500 animate-pulse"></span>
        </div>

        {/* 4. Text Info (Compact layout) */}
        <div className="flex-1 min-w-0 z-10">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">
            Incoming {type === "video" ? "Video" : "Audio"} Call
          </p>
          <h3 className="text-lg font-bold text-foreground truncate">
            {caller.firstName} {caller.lastName}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {caller.jobTitle || "Teammate"}
          </p>
        </div>

        {/* 5. Action Buttons (Smaller, side-by-side) */}
        <div className="flex items-center gap-2 shrink-0 z-10">
          {/* Decline Button */}
          <button
            onClick={onDecline}
            className="p-3 rounded-full bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-all active:scale-95 group"
            title="Decline"
          >
            <PhoneOff
              size={20}
              className="group-hover:rotate-12 transition-transform"
            />
          </button>

          {/* Accept Button (With subtle bounce animation) */}
          <button
            onClick={onAccept}
            className="p-3 rounded-full bg-emerald-500 text-white border border-emerald-600 hover:bg-emerald-600 shadow-md shadow-emerald-200 transition-all active:scale-95 animate-pulse group"
            title="Accept"
          >
            {type === "video" ? (
              <Video
                size={20}
                className="group-hover:-rotate-12 transition-transform"
              />
            ) : (
              <Phone
                size={20}
                className="group-hover:-rotate-12 transition-transform"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;
