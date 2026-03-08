import React, { useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis } from '@studio-freight/react-lenis';
import { ArrowRight, Sparkles } from "lucide-react";

import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

gsap.registerPlugin(ScrollTrigger);

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

const Changelog = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  // Enriched changes data with specific neon colors for the timeline dots/borders
  const changes = [
    { 
      version: "v2.1.0", date: "Nov 20, 2025", title: "The Dark Mode Update", 
      desc: "Finally here. Switch to dark mode from your profile settings. The entire OS has been redesigned for night owls.", 
      tags: ["New", "UI"], 
      dotColor: "bg-[#0ae448]", 
      textColor: "text-[#0ae448]",
      hoverBorder: "hover:border-[#0ae448]" 
    },
    { 
      version: "v2.0.5", date: "Nov 10, 2025", title: "Faster Search", 
      desc: "We rewrote our search engine from the ground up. It's now 10x faster and supports deep fuzzy matching across all documents.", 
      tags: ["Performance"], 
      dotColor: "bg-[#3b82f6]", 
      textColor: "text-[#3b82f6]",
      hoverBorder: "hover:border-[#3b82f6]" 
    },
    { 
      version: "v2.0.0", date: "Oct 25, 2025", title: "Taskify 2.0", 
      desc: "Complete redesign of the dashboard, new Kanban views, native real-time chat, and an entirely new architecture.", 
      tags: ["Major", "Release"], 
      dotColor: "bg-[#ff4a9e]", 
      textColor: "text-[#ff4a9e]",
      hoverBorder: "hover:border-[#ff4a9e]" 
    },
  ];

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Hero Text Reveal
      gsap.fromTo(".hero-char", 
        { y: 100, opacity: 0, rotateZ: 15, rotateX: -45 },
        { y: 0, opacity: 1, rotateZ: 0, rotateX: 0, stagger: 0.02, duration: 1, ease: "back.out(1.5)", delay: 0.2 }
      );

      // 2. Parallax Floating Shapes
      gsap.to(".shape-fast", {
        y: -150, rotation: 90, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 0.5 }
      });
      gsap.to(".shape-slow", {
        y: -80, rotation: -45, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 }
      });

      // 3. Staggered Timeline Cards
      gsap.fromTo(".timeline-card", 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.2, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".timeline-container", start: "top 80%" } }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <div ref={containerRef} className="min-h-screen flex flex-col bg-[#0e100f] text-white font-sans selection:bg-[#0ae448] selection:text-black overflow-x-hidden">
        <Navbar />

        {/* --- 1. HERO SECTION --- */}
        <section ref={heroRef} className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden flex flex-col items-center">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#0ae448]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          {/* Floating Shapes */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <Asterisk className="shape-fast absolute top-[15%] left-[5%] md:left-[15%] w-16 h-16 md:w-24 md:h-24 text-[#0ae448]" />
            <Sparkles className="shape-slow absolute bottom-[10%] right-[5%] md:right-[20%] w-10 h-10 md:w-16 md:h-16 text-[#ffcc00]" />
          </div>

          <div className="max-w-4xl mx-auto px-4 text-center z-10 relative">
            <div className="inline-flex items-center gap-3 bg-[#1c1c1c] border border-white/10 rounded-full px-6 py-2 mb-8 shadow-2xl">
              <span className="text-xs font-bold text-[#0ae448] uppercase tracking-widest">Ship Log</span>
            </div>
            
            <h1 className="text-[3.5rem] leading-[0.9] sm:text-6xl md:text-[7rem] lg:text-[8rem] font-black tracking-tighter mb-6 uppercase">
              <SplitText className="hero-char text-white">Always</SplitText><br/>
              <SplitText className="hero-char text-[#0ae448]">Shipping.</SplitText>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              We push code every single day. Here is a timeline of the major updates, improvements, and new features we've added to Taskify.
            </p>
          </div>
        </section>

        {/* --- 2. TIMELINE SECTION --- */}
        <section className="pb-32 px-4 sm:px-6 lg:px-8 relative z-20 timeline-container max-w-5xl mx-auto w-full">
          {/* The Vertical Line */}
          <div className="space-y-16 relative before:absolute before:inset-0 before:ml-[1.2rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-white/10">
            
            {changes.map((item, i) => (
              <div key={i} className="timeline-card relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                
                {/* Neon Icon Dot */}
                <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-[#0e100f] ${item.dotColor} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10 transition-transform duration-300 group-hover:scale-125`}></div>
                
                {/* Content Card */}
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-8 bg-[#1c1c1c] rounded-[2rem] border-2 border-white/5 shadow-xl transition-all duration-300 ${item.hoverBorder}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                     <span className={`text-2xl font-black uppercase tracking-wide ${item.textColor}`}>{item.version}</span>
                     <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{item.date}</span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-base font-medium leading-relaxed mb-6">{item.desc}</p>
                  
                  <div className="flex flex-wrap gap-2">
                     {item.tags.map(t => (
                       <span key={t} className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-300 text-xs rounded-lg font-bold uppercase tracking-wider">
                         {t}
                       </span>
                     ))}
                  </div>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* --- 3. CTA SECTION --- */}
        <section className="py-24 md:py-32 px-4 relative overflow-hidden bg-[#0e100f] border-t border-white/10 z-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0ae448]/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10 py-6 md:py-10">
             <h2 className="text-[4rem] md:text-[7rem] font-black text-white mb-8 tracking-tighter leading-none uppercase drop-shadow-lg">
                Experience The <br className="hidden md:block"/> <span className="text-[#0ae448]">Updates.</span>
             </h2>
             <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10 md:mt-16">
               <Link to="/registration" className="w-full sm:w-auto px-10 py-5 md:px-12 md:py-6 text-xl md:text-2xl font-black text-black bg-[#0ae448] rounded-full hover:bg-white shadow-[0_0_40px_rgba(10,228,72,0.3)] transition-all hover:scale-105 flex items-center justify-center gap-3 group">
                  Start for free <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} />
               </Link>
             </div>
          </div>
        </section>

        <Footer />
      </div>
    </ReactLenis>
  );
};

export default Changelog;