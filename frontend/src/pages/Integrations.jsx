import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis } from "@studio-freight/react-lenis";
import { 
  Search, 
  Slack, 
  Github, 
  Figma, 
  Mail, 
  Calendar, 
  Database,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

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

const Integrations = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  // Enriched App Data with Brand Colors
  const apps = [
    { name: "Slack", cat: "Communication", icon: <Slack size={28} />, color: "text-[#E01E5A]", border: "hover:border-[#E01E5A]", shadow: "hover:shadow-[0_0_30px_rgba(224,30,90,0.15)]" },
    { name: "GitHub", cat: "Developer Tools", icon: <Github size={28} />, color: "text-white", border: "hover:border-white", shadow: "hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]" },
    { name: "Figma", cat: "Design", icon: <Figma size={28} />, color: "text-[#F24E1E]", border: "hover:border-[#F24E1E]", shadow: "hover:shadow-[0_0_30px_rgba(242,78,30,0.15)]" },
    { name: "Gmail", cat: "Communication", icon: <Mail size={28} />, color: "text-[#EA4335]", border: "hover:border-[#EA4335]", shadow: "hover:shadow-[0_0_30px_rgba(234,67,53,0.15)]" },
    { name: "Google Cal", cat: "Productivity", icon: <Calendar size={28} />, color: "text-[#4285F4]", border: "hover:border-[#4285F4]", shadow: "hover:shadow-[0_0_30px_rgba(66,133,244,0.15)]" },
    { name: "Notion", cat: "Documentation", icon: <Database size={28} />, color: "text-white", border: "hover:border-white", shadow: "hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]" },
  ];

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Hero Text Reveal (fromTo fix applied)
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

      // 3. Search Bar Reveal
      gsap.fromTo(".search-bar",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.6 }
      );

      // 4. Staggered Grid Reveal
      gsap.fromTo(".integration-card", 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".integrations-grid", start: "top 85%" } }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <div ref={containerRef} className="min-h-screen flex flex-col bg-[#0e100f] text-white font-sans selection:bg-[#8b5cf6] selection:text-white overflow-x-hidden">
        <Navbar />

        {/* --- 1. HERO SECTION --- */}
        <section ref={heroRef} className="relative pt-40 pb-20 lg:pt-52 lg:pb-24 overflow-hidden flex flex-col items-center">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#8b5cf6]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          {/* Floating Shapes */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <Asterisk className="shape-fast absolute top-[15%] left-[5%] md:left-[10%] w-16 h-16 md:w-24 md:h-24 text-[#8b5cf6]" />
            <div className="shape-slow absolute bottom-[20%] right-[5%] md:right-[15%] w-10 h-24 md:w-16 md:h-32 rounded-full bg-[#0ae448] rotate-45" />
          </div>

          <div className="max-w-7xl mx-auto px-4 text-center z-10 relative">
            <div className="inline-flex items-center gap-3 bg-[#1c1c1c] border border-white/10 rounded-full px-6 py-2 mb-8 shadow-2xl">
              <span className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest">Ecosystem</span>
            </div>
            
            <h1 className="text-[3.5rem] leading-[0.9] sm:text-6xl md:text-[7rem] lg:text-[8rem] font-black tracking-tighter mb-6 uppercase">
              <SplitText className="hero-char text-white">Connect</SplitText><br/>
              <SplitText className="hero-char text-[#8b5cf6]">Everything.</SplitText>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
              Supercharge your workflow by connecting Taskify to the tools your team already uses every single day.
            </p>

            {/* Neo-Brutalist Search Bar */}
            <div className="search-bar max-w-2xl mx-auto relative mb-10 w-full px-4">
               <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
               <input 
                 type="text" 
                 placeholder="Search over 50+ integrations..." 
                 className="w-full pl-16 pr-6 py-5 rounded-full bg-[#1c1c1c] border-2 border-white/10 focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/20 outline-none text-lg font-medium text-white placeholder-slate-500 transition-all shadow-2xl" 
               />
            </div>
          </div>
        </section>

        {/* --- 2. INTEGRATIONS GRID --- */}
        <section className="pb-24 md:pb-32 relative z-20">
          <div className="integrations-grid max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
             {apps.map((app, index) => (
                <div 
                  key={index} 
                  className={`integration-card group flex items-center gap-6 p-8 bg-[#1c1c1c] rounded-[2rem] border-2 border-white/5 transition-all duration-300 cursor-pointer ${app.border} ${app.shadow}`}
                >
                   <div className={`w-20 h-20 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${app.color}`}>
                      {app.icon}
                   </div>
                   <div className="text-left">
                      <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-wide">{app.name}</h3>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{app.cat}</p>
                   </div>
                </div>
             ))}
          </div>
        </section>

        {/* --- 3. CTA SECTION --- */}
        <section className="py-24 md:py-32 px-4 relative overflow-hidden bg-[#0e100f] border-t border-white/10 z-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8b5cf6]/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10 py-6 md:py-10">
             <h2 className="text-[4rem] md:text-[7rem] font-black text-white mb-8 tracking-tighter leading-none uppercase drop-shadow-lg">
                Missing a <br className="hidden md:block"/> <span className="text-[#8b5cf6]">Tool?</span>
             </h2>
             <p className="text-xl md:text-2xl text-slate-400 mb-12 font-medium max-w-2xl mx-auto">
                We add new integrations every week. Let us know what you need connected.
             </p>
             <div className="flex justify-center mt-10">
               <Link to="/contact" className="w-full sm:w-auto px-10 py-5 md:px-12 md:py-6 text-xl md:text-2xl font-black text-black bg-[#8b5cf6] rounded-full hover:bg-white shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all hover:scale-105 flex items-center justify-center gap-3 group">
                  Request Integration <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} />
               </Link>
             </div>
          </div>
        </section>

        <Footer />
      </div>
    </ReactLenis>
  );
};

export default Integrations;