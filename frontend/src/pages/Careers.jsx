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

const Careers = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  // Enriched Job Data with hover colors per department
  const jobs = [
    { title: "Senior Frontend Engineer", team: "Engineering", location: "Remote", type: "Full-time", color: "text-[#3b82f6]", hoverBorder: "hover:border-[#3b82f6]" },
    { title: "Product Designer", team: "Design", location: "New York", type: "Full-time", color: "text-[#ff4a9e]", hoverBorder: "hover:border-[#ff4a9e]" },
    { title: "Marketing Manager", team: "Marketing", location: "London", type: "Full-time", color: "text-[#0ae448]", hoverBorder: "hover:border-[#0ae448]" },
    { title: "Customer Success Lead", team: "Support", location: "Remote", type: "Full-time", color: "text-[#ffcc00]", hoverBorder: "hover:border-[#ffcc00]" },
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

      // 3. Staggered Job Cards Reveal
      gsap.fromTo(".job-card", 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".jobs-container", start: "top 85%" } }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <div ref={containerRef} className="min-h-screen flex flex-col bg-[#0e100f] text-white font-sans selection:bg-[#ffcc00] selection:text-black overflow-x-hidden">
        <Navbar />

        {/* --- 1. HERO SECTION --- */}
        <section ref={heroRef} className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden flex flex-col items-center">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#ffcc00]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          {/* Floating Shapes */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <Asterisk className="shape-fast absolute top-[15%] left-[5%] md:left-[15%] w-16 h-16 md:w-24 md:h-24 text-[#ffcc00]" />
            <Sparkles className="shape-slow absolute bottom-[10%] right-[5%] md:right-[20%] w-10 h-10 md:w-16 md:h-16 text-[#3b82f6]" />
          </div>

          <div className="max-w-4xl mx-auto px-4 text-center z-10 relative">
            <div className="inline-flex items-center gap-3 bg-[#1c1c1c] border border-white/10 rounded-full px-6 py-2 mb-8 shadow-2xl">
              <span className="text-xs font-bold text-[#ffcc00] uppercase tracking-widest">Careers</span>
            </div>
            
            <h1 className="text-[3.5rem] leading-[0.9] sm:text-6xl md:text-[7rem] lg:text-[8rem] font-black tracking-tighter mb-6 uppercase">
              <SplitText className="hero-char text-white">Join The</SplitText><br/>
              <SplitText className="hero-char text-[#ffcc00]">Mission.</SplitText>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              We're looking for passionate, driven people to help us build the future operating system of modern work.
            </p>
          </div>
        </section>

        {/* --- 2. JOB OPENINGS GRID --- */}
        <section className="pb-32 px-4 sm:px-6 lg:px-8 relative z-20 jobs-container">
          <div className="max-w-4xl mx-auto space-y-6 w-full">
            {jobs.map((job, i) => (
              <div 
                key={i} 
                className={`job-card group flex flex-col md:flex-row items-start md:items-center justify-between p-8 md:p-10 bg-[#1c1c1c] rounded-[2rem] border-2 border-white/5 transition-all duration-300 shadow-xl cursor-pointer ${job.hoverBorder}`}
              >
                <div>
                   <h3 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase tracking-wide group-hover:text-white transition-colors">{job.title}</h3>
                   <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">
                      <span className={`${job.color}`}>{job.team}</span>
                      <span className="text-white/20">•</span>
                      <span>{job.location}</span>
                      <span className="text-white/20">•</span>
                      <span>{job.type}</span>
                   </div>
                </div>
                
                <div className={`mt-8 md:mt-0 w-14 h-14 rounded-full border-2 border-white/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/5 ${job.color}`}>
                   <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- 3. BOTTOM CTA SECTION --- */}
        <section className="py-24 md:py-32 px-4 relative overflow-hidden bg-[#0e100f] border-t border-white/10 z-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ffcc00]/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10 py-6 md:py-10">
             <h2 className="text-[4rem] md:text-[7rem] font-black text-white mb-8 tracking-tighter leading-none uppercase drop-shadow-lg">
                Don't See Your <br className="hidden md:block"/> <span className="text-[#ffcc00]">Role?</span>
             </h2>
             <p className="text-xl md:text-2xl text-slate-400 mb-12 font-medium max-w-2xl mx-auto">
                We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future openings.
             </p>
             <div className="flex justify-center mt-10 md:mt-16">
               <a href="mailto:careers@taskify.com" className="w-full sm:w-auto px-10 py-5 md:px-12 md:py-6 text-xl md:text-2xl font-black text-black bg-[#ffcc00] rounded-full hover:bg-white shadow-[0_0_40px_rgba(255,204,0,0.3)] transition-all hover:scale-105 flex items-center justify-center gap-3 group">
                  Email your resume <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} />
               </a>
             </div>
          </div>
        </section>

        <Footer />
      </div>
    </ReactLenis>
  );
};

export default Careers;