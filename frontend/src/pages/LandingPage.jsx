import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis } from "@studio-freight/react-lenis";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  MessageSquare,
  KanbanSquare,
  Zap,
} from "lucide-react";

import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

// --- IMPORT YOUR ACTUAL SCREENSHOTS HERE ---
import heroDashboardImg from "@/assets/1.webp";
import tasksImg from "@/assets/2.webp";
import messagesImg from "@/assets/3.webp";
import calendarImg from "@/assets/4.webp";
import analyticsImg from "@/assets/5.webp";

gsap.registerPlugin(ScrollTrigger);

// Helper to split text into individual letters for GSAP animations
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

// Vibrant SVG Shapes (GSAP Style)
const Asterisk = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path
      d="M50 0v100M0 50h100M15 15l70 70M85 15L15 85"
      stroke="currentColor"
      strokeWidth="15"
      strokeLinecap="round"
    />
  </svg>
);

const LandingPage = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const shapesRef = useRef(null);
  const marqueeRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Initial Hero Text Reveal (Bouncy, letter by letter)
      gsap.from(".hero-char", {
        y: 100,
        opacity: 0,
        rotateZ: 15,
        rotateX: -45,
        stagger: 0.02,
        duration: 1,
        ease: "back.out(1.5)",
        delay: 0.2,
      });

      // 2. Initial Shapes Pop-in
      gsap.from(".gsap-shape", {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "elastic.out(1, 0.5)",
        delay: 0.5,
      });

      // 3. Parallax Floating Shapes on Scroll
      gsap.to(".shape-fast", {
        y: -150,
        rotation: 90,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      gsap.to(".shape-slow", {
        y: -50,
        rotation: -45,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // 4. Massive Horizontal Scroll Section
      gsap.to(".marquee-content", {
        xPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: marqueeRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // 5. Mockup Scroll Animation
      gsap.fromTo(
        ".hero-mockup",
        { rotateX: 15, scale: 0.9, y: 50 },
        {
          rotateX: 0,
          scale: 1,
          y: 0,
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top center",
            end: "bottom center",
            scrub: 1,
          },
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    // ReactLenis provides that buttery smooth scroll you see on Awwwards/GSAP sites
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <div
        ref={containerRef}
        className="min-h-screen flex flex-col bg-[#0e100f] text-white font-sans selection:bg-[#0ae448] selection:text-black overflow-x-hidden"
      >
        <Navbar />

        {/* --- 1. THE BOLD GSAP-STYLE HERO --- */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-16 md:pt-40 md:pb-20 lg:pt-52 lg:pb-32 overflow-hidden flex flex-col items-center min-h-[90vh] md:min-h-screen"
        >
          {/* VIBRANT FLOATING SHAPES (Now properly scaled for Mobile) */}
          <div
            ref={shapesRef}
            className="absolute inset-0 pointer-events-none z-0"
          >
            {/* Neon Green Asterisk */}
            <Asterisk className="gsap-shape shape-fast absolute top-[10%] md:top-[15%] left-[2%] md:left-[10%] w-12 h-12 md:w-24 md:h-24 text-[#0ae448]" />

            {/* Hot Pink Pill */}
            <div className="gsap-shape shape-slow absolute top-[18%] md:top-[25%] right-[2%] md:right-[15%] w-8 h-16 md:w-16 md:h-32 rounded-full bg-[#ff4a9e] rotate-45" />

            {/* Bright Purple Circle */}
            <div className="gsap-shape shape-fast absolute bottom-[38%] md:bottom-[40%] left-[5%] md:left-[20%] w-6 h-6 md:w-12 md:h-12 rounded-full bg-[#8a4baf]" />

            {/* Yellow Asterisk */}
            <Asterisk className="gsap-shape shape-slow absolute bottom-[25%] md:bottom-[30%] right-[2%] md:right-[10%] w-16 h-16 md:w-32 md:h-32 text-[#ffcc00] opacity-40 md:opacity-80" />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center z-10 relative">
            <div className="inline-flex items-center gap-2 md:gap-3 bg-[#1c1c1c] border border-white/10 rounded-full px-4 py-2 md:px-6 md:py-2 mb-8 md:mb-10 shadow-2xl overflow-hidden mt-8 md:mt-0">
              <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#ffd501] animate-pulse"></span>
              <span className="text-xs md:text-sm font-bold tracking-wide text-white">
                Taskify 2.0 is live
              </span>
              <div className="h-3 w-px bg-white/20 mx-1"></div>
              <Link
                to="/changelog"
                className="text-xs md:text-sm font-semibold text-[#3b82f6] hover:underline flex items-center gap-1"
              >
                Read what's new <ArrowRight size={14} />
              </Link>
            </div>

            {/* MASSIVE TYPOGRAPHY - Adjusted for Mobile bounds */}
            <h1 className="text-[3.5rem] leading-[0.9] sm:text-6xl md:text-[8rem] lg:text-[10rem] font-black tracking-tighter mb-6 md:leading-[0.85] uppercase">
              <SplitText className="hero-char text-[#FFFCE1]">Ship Fast.</SplitText>
              <br />
              <SplitText className="hero-char text-[#3b82f6]">
                Scale Big.
              </SplitText>
            </h1>

            <p className="text-base sm:text-lg md:text-2xl text-white max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed md:leading-tight font-medium px-2">
              The multi-tenant workspace that replaces your scattered tools.
              Build, track, and execute effortlessly.
            </p>

            {/* CTA Buttons - Full width on mobile, inline on desktop */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mb-16 md:mb-24 relative z-20 px-4">
              <Link
                to="/registration"
                className="group w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 md:px-10 md:py-5 text-base md:text-lg font-black text-black bg-[#FFFCE1] rounded-full hover:bg-white transition-colors duration-300 hover:scale-105 active:scale-95"
              >
                Start building free
                <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 md:px-10 md:py-5 text-base md:text-lg font-bold text-white bg-transparent border-2 border-white/20 rounded-full hover:bg-white/10 transition-colors"
              >
                View Live Demo
              </Link>
            </div>

            {/* THE 3D MOCKUP */}
            <div className="relative mx-auto w-full max-w-6xl [perspective:2000px] z-20">
              <div className="hero-mockup relative rounded-[1.5rem] md:rounded-[2rem] border border-white/10 bg-[#1c1c1c] p-1.5 md:p-4 shadow-[0_0_60px_rgba(10,228,72,0.1)] md:shadow-[0_0_100px_rgba(10,228,72,0.15)] overflow-hidden transform-gpu">
                <div className="rounded-xl overflow-hidden bg-black relative border border-white/5">
                  <div className="h-8 md:h-10 bg-[#111] border-b border-white/10 flex items-center px-3 md:px-4 gap-1.5 md:gap-2">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#27C93F]"></div>
                  </div>
                  <img
                    src={heroDashboardImg}
                    alt="Taskify Dashboard"
                    className="w-full h-auto object-cover opacity-90"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. HUGE SCROLL MARQUEE --- */}
        <section
          ref={marqueeRef}
          className="py-16 md:py-24 bg-[#FFFCE1] overflow-hidden rotate-[-2deg] origin-center scale-[1.15] my-10"
        >
          <div className="marquee-content flex whitespace-nowrap gap-6 md:gap-10 items-center text-[#0e100f] w-[300vw] md:w-[200vw]">
            {[...Array(6)].map((_, i) => (
              <React.Fragment key={i}>
                <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter">
                  Plan.
                </h2>
                <Asterisk className="w-10 h-10 md:w-20 md:h-20 text-[#0e100f]" />
                <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter">
                  Execute.
                </h2>
                <Asterisk className="w-10 h-10 md:w-20 md:h-20 text-[#0e100f]" />
                <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter">
                  Scale.
                </h2>
                <Asterisk className="w-10 h-10 md:w-20 md:h-20 text-[#0e100f]" />
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* --- 3. THE BENTO GRID --- */}
        <section className="py-20 md:py-32 bg-[#0e100f]" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 md:mb-6 uppercase">
                Everything you need. <br />
                <span className="text-[#8a4baf]">Zero friction.</span>
              </h2>
            </div>

            {/* Changed from auto-rows-[450px] to accommodate mobile content stacking natively */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-[380px] md:auto-rows-[450px]">
              {/* Feature 1: Tasks */}
              <div className="lg:col-span-2 bg-[#1c1c1c] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group hover:border-[#0ae448] border-2 border-transparent transition-colors duration-300 flex flex-col md:flex-row relative">
                <div className="p-6 md:p-12 z-10 w-full lg:w-1/2 flex flex-col">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#0ae448] flex items-center justify-center text-black mb-4 md:mb-8 group-hover:rotate-12 transition-transform duration-300">
                    <KanbanSquare className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-4 uppercase">
                    Task Mastery
                  </h3>
                  <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed">
                    Organize workflows with intuitive Kanban boards, custom
                    tags, and automated priority levels.
                  </p>
                </div>
                <div className="relative w-full md:w-1/2 flex-1 bg-[#111] overflow-hidden mt-4 md:mt-0">
                  <img
                    src={tasksImg}
                    alt="Tasks"
                    className="absolute top-4 left-4 md:top-10 md:left-10 w-[120%] md:w-[140%] max-w-none rounded-tl-xl border-t-2 border-l-2 border-[#333] group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                </div>
              </div>

              {/* Feature 2: Analytics */}
              <div className="bg-[#1c1c1c] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group hover:border-[#ff4a9e] border-2 border-transparent transition-colors duration-300 flex flex-col relative">
                <div className="p-6 md:p-10 z-10 bg-[#1c1c1c]">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#ff4a9e] flex items-center justify-center text-black mb-4 md:mb-8 group-hover:-rotate-12 transition-transform duration-300">
                    <BarChart3 className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3 uppercase">
                    Deep Analytics
                  </h3>
                  <p className="text-slate-400 text-sm md:text-base font-medium">
                    Track velocity and department performance instantly.
                  </p>
                </div>
                <div className="relative flex-1 bg-[#111] overflow-hidden">
                  <img
                    src={analyticsImg}
                    alt="Analytics"
                    className="absolute top-4 left-4 md:top-6 md:left-6 w-[120%] max-w-none rounded-tl-xl border-t-2 border-l-2 border-[#333] opacity-80"
                  />
                </div>
              </div>

              {/* Feature 3: Messages */}
              <div className="bg-[#1c1c1c] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group hover:border-[#8a4baf] border-2 border-transparent transition-colors duration-300 flex flex-col relative">
                <div className="p-6 md:p-10 z-10 bg-[#1c1c1c]">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#8a4baf] flex items-center justify-center text-white mb-4 md:mb-8 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3 uppercase">
                    Real-time Chat
                  </h3>
                  <p className="text-slate-400 text-sm md:text-base font-medium">
                    Direct messages and team communication built right in.
                  </p>
                </div>
                <div className="relative flex-1 bg-[#111] overflow-hidden">
                  <img
                    src={messagesImg}
                    alt="Messages"
                    className="absolute top-4 left-4 md:top-6 md:left-6 w-[140%] max-w-none rounded-tl-xl border-t-2 border-l-2 border-[#333] opacity-80 object-cover object-left-top"
                  />
                </div>
              </div>

              {/* Feature 4: Meetings */}
              <div className="lg:col-span-2 bg-[#1c1c1c] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group hover:border-[#ffcc00] border-2 border-transparent transition-colors duration-300 flex flex-col md:flex-row relative">
                <div className="p-6 md:p-12 z-10 w-full md:w-5/12 flex flex-col justify-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#ffcc00] flex items-center justify-center text-black mb-4 md:mb-8 group-hover:rotate-12 transition-transform duration-300">
                    <CalendarDays className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-4 uppercase">
                    Sync Up
                  </h3>
                  <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed">
                    Manage calendars, book meeting rooms, and track team
                    availability effortlessly.
                  </p>
                </div>
                <div className="relative w-full md:w-7/12 flex-1 bg-[#111] overflow-hidden flex items-end justify-end">
                  <img
                    src={calendarImg}
                    alt="Calendar"
                    className="w-[90%] md:w-[90%] rounded-tl-xl border-t-2 border-l-2 border-[#333] opacity-80 relative top-4 left-4 md:top-8 md:left-8 group-hover:-translate-x-2 md:group-hover:-translate-x-4 group-hover:-translate-y-2 md:group-hover:-translate-y-4 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 4. BOTTOM CTA --- */}
        <section className="py-20 md:py-32 px-4 relative overflow-hidden bg-[#0e100f] border-t border-white/10">
          <div className="max-w-5xl mx-auto text-center relative z-10 py-6 md:py-10">
            <h2 className="text-5xl sm:text-6xl md:text-[8rem] font-black text-white mb-6 md:mb-8 tracking-tighter leading-[0.9] md:leading-none uppercase">
              Ready to <br className="hidden md:block" />{" "}
              <span className="text-[#3B82F6]">Scale?</span>
            </h2>
            <div className="flex justify-center mt-10 md:mt-16">
              <Link
                to="/registration"
                className="w-full sm:w-auto px-8 py-5 md:px-12 md:py-6 text-xl md:text-2xl font-black text-black bg-[#ffe602] rounded-full hover:bg-white transition-all hover:scale-105"
              >
                Start for free
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </ReactLenis>
  );
};

export default LandingPage;
