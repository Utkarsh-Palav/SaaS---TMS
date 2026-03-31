// src/components/ui/PageLoader.jsx
import React from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#0e100f] text-white">
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#3b82f6]/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-64 sm:w-72 flex flex-col items-center relative z-10">
        
        {/* Animated Brand Logo */}
        <motion.div 
          className="w-16 h-16 bg-[#3b82f6] rounded-2xl flex items-center justify-center mb-10 shadow-[0_0_30px_rgba(59,130,246,0.4)]"
          animate={{ 
            rotateZ: [0, 90, 180, 270, 360],
            scale: [1, 1.1, 1] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <Layers className="text-black w-8 h-8" strokeWidth={2.5} />
        </motion.div>

        <div className="w-full space-y-4">
          {/* Progress Bar Track */}
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
            <motion.div
              className="h-full bg-[#3b82f6] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>
          
          {/* Typography */}
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
            <motion.span 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-white"
            >
              Initializing...
            </motion.span>
            <span>Please wait</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PageLoader;