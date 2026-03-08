import React, { useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis } from '@studio-freight/react-lenis';
import { 
  MessageSquare, 
  FileText, 
  Zap, 
  Layout, 
  ArrowRight,
  Figma,
  Github,
  Slack
} from "lucide-react";

import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

// --- IMPORT YOUR ACTUAL SCREENSHOTS HERE ---
import tasksImg from "@/assets/2.webp";
import messagesImg from "@/assets/3.webp";
import calendarImg from "@/assets/4.webp";

gsap.registerPlugin(ScrollTrigger);

const SplitText = ({ children, className }) => {
  return (
    <span className="inline-block" style={{ perspective: "1000px" }}>
      {children.split("").map((char, index) => (
        <span
          key={index}
          className={`inline-block origin-bottom ${className}`}
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

const Asterisk = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 0v100M0 50h100M15 15l70 70M85 15L15 85" stroke="currentColor" strokeWidth="15" strokeLinecap="round"/>
  </svg>
);

const Product = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  
  // New Refs for the Sticky logic
  const scrollContainerRef = useRef(null);
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      // 1. Hero Text Reveal
      gsap.from(".hero-char", {
        y: 100, opacity: 0, rotateZ: 15, rotateX: -45, stagger: 0.02, duration: 1, ease: "back.out(1.5)", delay: 0.2,
      });

      // 2. Parallax Floating Shapes
      gsap.to(".shape-fast", {
        y: -150, rotation: 90, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 0.5 }
      });

      // 3. BULLETPROOF HORIZONTAL SCROLL (No pin: true!)
      // We target the track and move it -66.66% (2 screens to the left out of 3 total screens)
      gsap.to(trackRef.current, {
        xPercent: -66.6666,
        ease: "none",
        scrollTrigger: {
          trigger: scrollContainerRef.current, // The 300vh container
          start: "top top",
          end: "bottom bottom", // Scroll finishes exactly when the bottom of the 300vh hits the bottom of the viewport
          scrub: 1,
        }
      });

      // 4. Integration Cards Stagger
      gsap.from(".integration-card", {
        y: 50, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".integrations-grid", start: "top 80%" }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      {/* ⚠️ CRITICAL: Removed 'flex flex-col min-h-screen'. Do not add them back! They break scroll logic. */}
      <div ref={containerRef} className="bg-[#0e100f] text-white font-sans selection:bg-[#3b82f6] selection:text-white">
        <Navbar />

        {/* --- 1. HERO SECTION --- */}
        <section ref={heroRef} className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden flex flex-col items-center min-h-screen justify-center">
          <div className="absolute inset-0 pointer-events-none z-0">
            <Asterisk className="shape-fast absolute top-[20%] left-[5%] md:left-[10%] w-16 h-16 md:w-24 md:h-24 text-[#3b82f6]" />
            <div className="shape-fast absolute bottom-[20%] right-[5%] md:right-[15%] w-10 h-24 md:w-16 md:h-32 rounded-full bg-[#6366f1] rotate-45" />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center z-10 relative">
            <div className="inline-flex items-center gap-3 bg-[#1c1c1c] border border-white/10 rounded-full px-6 py-2 mb-8 shadow-2xl">
              <span className="text-xs font-bold text-[#3b82f6] uppercase tracking-widest">The Platform</span>
            </div>
            
            <h1 className="text-[3.5rem] leading-[0.9] sm:text-6xl md:text-[7rem] lg:text-[9rem] font-black tracking-tighter mb-6 uppercase">
              <SplitText className="hero-char text-white">One OS For</SplitText><br/>
              <SplitText className="hero-char text-[#3b82f6]">Every Flow.</SplitText>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
              Taskify isn't just a task manager. It's a complete operating system designed to replace your fragmented tool stack entirely.
            </p>
          </div>
        </section>

        {/* --- 2. NATIVE CSS STICKY HORIZONTAL SCROLL --- */}
        {/* The wrapper is 300vh tall to create physical scroll space. It has NO overflow hidden! */}
        <section ref={scrollContainerRef} className="relative h-[300vh] w-full bg-[#0e100f] border-y border-white/5">
          
          {/* This container naturally "sticks" to the screen while you scroll down the 300vh */}
          <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#3b82f6]/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* THE TRACK: 300vw wide. GSAP simply pushes this left as you scroll down. */}
            <div ref={trackRef} className="flex h-full w-[300vw] items-center relative z-10 will-change-transform">
              
              {/* Panel 1: Task Management */}
              <div className="w-screen h-full flex items-center justify-center px-4 md:px-24 flex-shrink-0">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 max-w-7xl w-full">
                  <div className="flex-1 space-y-6">
                    <div className="w-16 h-16 bg-[#3b82f6] rounded-2xl flex items-center justify-center mb-4">
                      <Layout className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-[#3b82f6] font-black tracking-widest uppercase text-sm">Phase 1</h3>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Plan with <br className="hidden md:block"/> Power.</h2>
                    <p className="text-lg md:text-xl text-slate-400 font-medium">Switch between Kanban, List, and Gantt views instantly. Track dependencies and blockers without the headache.</p>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="rounded-[2rem] overflow-hidden border-2 border-white/10 bg-[#1c1c1c] shadow-[0_0_50px_rgba(59,130,246,0.2)] group">
                      <img src={tasksImg} alt="Tasks" className="w-full h-auto object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 2: Collaboration */}
              <div className="w-screen h-full flex items-center justify-center px-4 md:px-24 flex-shrink-0">
                <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20 max-w-7xl w-full">
                  <div className="flex-1 space-y-6">
                    <div className="w-16 h-16 bg-[#6366f1] rounded-2xl flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-[#6366f1] font-black tracking-widest uppercase text-sm">Phase 2</h3>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Kill the <br className="hidden md:block"/> Email.</h2>
                    <p className="text-lg md:text-xl text-slate-400 font-medium">Contextual chat built right into your tasks. Tag teammates, share files, and resolve issues without leaving the window.</p>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="rounded-[2rem] overflow-hidden border-2 border-white/10 bg-[#1c1c1c] shadow-[0_0_50px_rgba(99,102,241,0.2)] group">
                      <img src={messagesImg} alt="Chat" className="w-full h-auto object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 3: Documents */}
              <div className="w-screen h-full flex items-center justify-center px-4 md:px-24 flex-shrink-0">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 max-w-7xl w-full">
                  <div className="flex-1 space-y-6">
                    <div className="w-16 h-16 bg-[#06b6d4] rounded-2xl flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-[#06b6d4] font-black tracking-widest uppercase text-sm">Phase 3</h3>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Knowledge <br className="hidden md:block"/> Hub.</h2>
                    <p className="text-lg md:text-xl text-slate-400 font-medium">Manage calendars, book meeting rooms, and track team availability effortlessly.</p>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="rounded-[2rem] overflow-hidden border-2 border-white/10 bg-[#1c1c1c] shadow-[0_0_50px_rgba(6,182,212,0.2)] group">
                      <img src={calendarImg} alt="Docs" className="w-full h-auto object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-700" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- 3. INTEGRATIONS --- */}
        <section className="py-24 md:py-32 bg-[#0e100f] relative z-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
             <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6">
               Plays nice <br className="hidden md:block" /> with others.
             </h2>
             <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-16">
                Connect Taskify with your favorite tools. We support 50+ native integrations.
             </p>
             
             <div className="integrations-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <IntegrationCard icon={<Slack size={32} />} name="Slack" desc="Sync messages & status" color="text-[#E01E5A]" hoverBorder="hover:border-[#E01E5A]" />
                <IntegrationCard icon={<Github size={32} />} name="GitHub" desc="Link PRs to tasks" color="text-white" hoverBorder="hover:border-white" />
                <IntegrationCard icon={<Zap size={32} />} name="Zapier" desc="Automate workflows" color="text-[#FF4A00]" hoverBorder="hover:border-[#FF4A00]" />
                <IntegrationCard icon={<Figma size={32} />} name="Figma" desc="Embed designs directly" color="text-[#F24E1E]" hoverBorder="hover:border-[#F24E1E]" />
             </div>
          </div>
        </section>

        {/* --- 4. CTA --- */}
        <section className="py-24 md:py-32 px-4 relative overflow-hidden bg-[#0e100f] border-t border-white/10 z-20">
          <div className="max-w-5xl mx-auto text-center relative z-10">
             <h2 className="text-[4rem] md:text-[8rem] font-black text-white mb-8 tracking-tighter leading-none uppercase">
                Build <span className="text-[#3b82f6]">Faster.</span>
             </h2>
             <Link to="/registration" className="inline-flex items-center justify-center px-10 py-5 text-xl md:text-2xl font-black text-white bg-[#2563eb] rounded-full hover:bg-[#3b82f6] shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all hover:scale-105 group">
                Start Building <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={28} />
             </Link>
          </div>
        </section>

        <Footer />
      </div>
    </ReactLenis>
  );
};

const IntegrationCard = ({ icon, name, desc, color, hoverBorder }) => (
  <div className={`integration-card p-8 rounded-3xl border-2 border-white/5 bg-[#1c1c1c] ${hoverBorder} hover:shadow-2xl transition-all duration-300 text-left group cursor-pointer`}>
     <div className={`mb-6 ${color} transition-colors transform group-hover:scale-110 origin-left duration-300`}>
        {icon}
     </div>
     <h4 className="text-xl font-black text-white mb-2 uppercase tracking-wide">{name}</h4>
     <p className="text-base text-slate-400 font-medium">{desc}</p>
  </div>
);

export default Product;