import React, { useRef, useLayoutEffect } from "react";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ReactLenis } from '@studio-freight/react-lenis';

import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

// Upgraded Helper: Prevents words from breaking in the middle of a letter
const SplitText = ({ children, className }) => {
  return (
    <span className="inline-block" style={{ perspective: "1000px" }}>
      {children.split(" ").map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className={`inline-block origin-bottom ${className}`}
            >
              {char}
            </span>
          ))}
          <span className="inline-block">&nbsp;</span>
        </span>
      ))}
    </span>
  );
};

// Vibrant SVG Shapes
const Asterisk = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 0v100M0 50h100M15 15l70 70M85 15L15 85" stroke="currentColor" strokeWidth="15" strokeLinecap="round"/>
  </svg>
);

const Contact = () => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Hero Text Reveal
      gsap.fromTo(".hero-char", 
        { y: 100, opacity: 0, rotateZ: 15, rotateX: -45 },
        { y: 0, opacity: 1, rotateZ: 0, rotateX: 0, stagger: 0.02, duration: 1, ease: "back.out(1.5)", delay: 0.2 }
      );

      // 2. Info Side Slide In
      gsap.fromTo(".contact-info",
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.6 }
      );

      // 3. Form Side Slide In
      gsap.fromTo(".contact-form",
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.8 }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <div ref={containerRef} className="min-h-screen flex flex-col bg-[#0e100f] text-white font-sans selection:bg-[#3b82f6] selection:text-white overflow-x-hidden">
        <Navbar />
        
        {/* Background Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#3b82f6]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
           
           <div className="text-center mb-20 relative">
             {/* Floating Shape */}
             <Asterisk className="absolute -top-10 left-[10%] w-16 h-16 text-[#06b6d4] opacity-50 animate-[spin_10s_linear_infinite]" />
             
             <div className="inline-flex items-center gap-3 bg-[#1c1c1c] border border-white/10 rounded-full px-6 py-2 mb-8 shadow-2xl">
               <span className="text-xs font-bold text-[#3b82f6] uppercase tracking-widest">Reach Out</span>
             </div>
             
             <h1 className="text-[3.5rem] leading-[0.9] sm:text-6xl md:text-[6rem] lg:text-[7.5rem] font-black tracking-tighter uppercase">
               <SplitText className="hero-char text-white">Let's Talk</SplitText><br/>
               <SplitText className="hero-char text-[#3b82f6]">Business.</SplitText>
             </h1>
           </div>

           <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
             
             {/* Left Info */}
             <div className="contact-info space-y-12">
                <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed">
                  Have questions about pricing, enterprise plans, or just want to say hi? We're here to help you build faster.
                </p>
                
                <div className="space-y-8">
                   <div className="flex items-start gap-6 group">
                      <div className="w-14 h-14 bg-[#1c1c1c] border border-white/10 rounded-2xl flex items-center justify-center text-[#3b82f6] shrink-0 group-hover:scale-110 group-hover:bg-[#3b82f6] group-hover:text-white transition-all duration-300 shadow-lg">
                        <Mail size={24} strokeWidth={2.5}/>
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white uppercase tracking-wide mb-1">Email</h3>
                         <a href="mailto:utkarshpalav17@gmail.com" className="text-slate-400 font-medium hover:text-[#3b82f6] transition-colors text-lg">
                           utkarshpalav17@gmail.com
                         </a>
                      </div>
                   </div>
                   
                   <div className="flex items-start gap-6 group">
                      <div className="w-14 h-14 bg-[#1c1c1c] border border-white/10 rounded-2xl flex items-center justify-center text-[#06b6d4] shrink-0 group-hover:scale-110 group-hover:bg-[#06b6d4] group-hover:text-white transition-all duration-300 shadow-lg">
                        <MapPin size={24} strokeWidth={2.5}/>
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white uppercase tracking-wide mb-1">Office</h3>
                         <p className="text-slate-400 font-medium text-lg">Mumbai, Maharashtra, India</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Form */}
             <div className="contact-form bg-[#1c1c1c] rounded-[2.5rem] p-8 md:p-10 border-2 border-white/5 shadow-2xl relative overflow-hidden">
                {/* Form Ambient Glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#3b82f6]/20 rounded-full blur-[80px] pointer-events-none"></div>

                <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                         <input 
                           className="w-full px-5 py-4 bg-black/50 rounded-xl border border-white/10 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none text-white placeholder-slate-600 transition-all font-medium" 
                           placeholder="John" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                         <input 
                           className="w-full px-5 py-4 bg-black/50 rounded-xl border border-white/10 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none text-white placeholder-slate-600 transition-all font-medium" 
                           placeholder="Doe" 
                         />
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</label>
                      <input 
                        type="email"
                        className="w-full px-5 py-4 bg-black/50 rounded-xl border border-white/10 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none text-white placeholder-slate-600 transition-all font-medium" 
                        placeholder="john@company.com" 
                      />
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message</label>
                      <textarea 
                        className="w-full px-5 py-4 bg-black/50 rounded-xl border border-white/10 focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none text-white placeholder-slate-600 transition-all font-medium h-32 resize-none" 
                        placeholder="How can we help you scale?" 
                      />
                   </div>
                   
                   <button className="w-full mt-4 py-5 bg-[#3b82f6] text-white font-black text-lg uppercase tracking-wider rounded-xl hover:bg-white hover:text-black transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 group">
                      Send Message <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                   </button>
                </form>
             </div>

           </div>
        </section>
        
        <Footer />
      </div>
    </ReactLenis>
  );
};

export default Contact;