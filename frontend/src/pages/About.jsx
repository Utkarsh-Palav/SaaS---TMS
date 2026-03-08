import React, { useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis } from "@studio-freight/react-lenis";
import { 
  Users, 
  Target, 
  Zap, 
  Globe, 
  Heart, 
  ShieldCheck, 
  Linkedin, 
  Twitter, 
  ArrowRight 
} from "lucide-react";

import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

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

// Vibrant SVG Shapes
const Asterisk = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 0v100M0 50h100M15 15l70 70M85 15L15 85" stroke="currentColor" strokeWidth="15" strokeLinecap="round"/>
  </svg>
);

const About = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Hero Text Reveal (Updated to fromTo)
      gsap.fromTo(".hero-char", 
        { y: 100, opacity: 0, rotateZ: 15, rotateX: -45 },
        { y: 0, opacity: 1, rotateZ: 0, rotateX: 0, stagger: 0.02, duration: 1, ease: "back.out(1.5)", delay: 0.2 }
      );

      // 2. Parallax Floating Shapes (These use 'to', so they are fine)
      gsap.to(".shape-fast", {
        y: -150, rotation: 90, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 0.5 }
      });
      gsap.to(".shape-slow", {
        y: -80, rotation: -45, ease: "none", scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 }
      });

      // 3. THE FIX: Staggered reveals updated to fromTo to prevent getting stuck invisible
      gsap.fromTo(".stat-item", 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".stats-container", start: "top 85%" } }
      );

      gsap.fromTo(".value-card", 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".values-grid", start: "top 80%" } }
      );

      gsap.fromTo(".team-card", 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".team-grid", start: "top 80%" } }
      );

      gsap.fromTo(".hero-image", 
        { scale: 0.9, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.6 }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <div ref={containerRef} className="min-h-screen flex flex-col bg-[#0e100f] text-white font-sans selection:bg-[#3b82f6] selection:text-white overflow-x-hidden">
        <Navbar />

        {/* --- 1. HERO SECTION --- */}
        <section ref={heroRef} className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden">
          {/* Floating Shapes */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <Asterisk className="shape-fast absolute top-[10%] md:top-[15%] left-[2%] md:left-[10%] w-12 h-12 md:w-24 md:h-24 text-[#3b82f6]" />
            <div className="shape-slow absolute top-[30%] right-[5%] md:right-[15%] w-8 h-16 md:w-16 md:h-32 rounded-full bg-[#ff4a9e] rotate-45" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 relative">
            <div className="inline-flex items-center gap-3 bg-[#1c1c1c] border border-white/10 rounded-full px-6 py-2 mb-8 shadow-2xl">
              <span className="text-xs font-bold text-[#0ae448] uppercase tracking-widest">Our Mission</span>
            </div>
            
            <h1 className="text-[3.5rem] leading-[0.9] sm:text-6xl md:text-[7rem] lg:text-[8rem] font-black tracking-tighter mb-6 uppercase">
              <SplitText className="hero-char text-white">We build for the</SplitText><br/>
              <SplitText className="hero-char text-[#3b82f6]">Builders.</SplitText>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed hero-image">
              Taskify started with a simple idea: Work shouldn't be chaotic. We are on a mission to simplify collaboration for teams of all sizes.
            </p>

            {/* Hero Image Collage */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto h-[400px] md:h-[450px] hero-image">
               <div className="col-span-2 row-span-2 rounded-[2rem] overflow-hidden relative group border border-white/10">
                  <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" alt="Team collaborating" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 mix-blend-luminosity group-hover:mix-blend-normal" />
                  <div className="absolute inset-0 bg-[#3b82f6]/20 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
               </div>
               <div className="col-span-1 row-span-2 md:row-span-1 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative group border border-white/10">
                  <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop" alt="Office meeting" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 mix-blend-luminosity group-hover:mix-blend-normal" />
               </div>
               <div className="col-span-1 row-span-2 md:row-span-2 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative group border border-white/10">
                  <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop" alt="Strategic planning" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 mix-blend-luminosity group-hover:mix-blend-normal" />
               </div>
               <div className="hidden md:block col-span-1 row-span-1 rounded-[2rem] overflow-hidden relative group border border-white/10">
                  <img src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1974&auto=format&fit=crop" alt="Modern office" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 mix-blend-luminosity group-hover:mix-blend-normal" />
               </div>
            </div>
          </div>
        </section>

        {/* --- 2. MASSIVE STATS SECTION --- */}
        <section className="py-16 md:py-24 bg-[#0e100f] border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#3b82f6]/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 stats-container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center divide-x divide-white/10">
              <StatItem number="10k+" label="Active Users" color="text-[#0ae448]" />
              <StatItem number="500+" label="Companies" color="text-[#3b82f6]" />
              <StatItem number="99.9%" label="Uptime" color="text-[#ffcc00]" />
              <StatItem number="24/7" label="Support" color="text-[#ff4a9e]" />
            </div>
          </div>
        </section>

        {/* --- 3. OUR VALUES (BENTO GRID STYLE) --- */}
        <section className="py-24 md:py-32 bg-[#0e100f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6">
                Our Core <span className="text-[#0ae448]">Values.</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                We believe that great software is built by teams who care about the details. These principles guide every decision we make.
              </p>
            </div>

            <div className="values-grid grid md:grid-cols-3 gap-6">
              <ValueCard 
                icon={<Zap size={32} />} 
                title="Speed Matters" 
                desc="We optimize for speed. Fast software leads to fast workflows and happier users."
                color="text-[#ffcc00]"
                hoverBorder="hover:border-[#ffcc00]"
              />
              <ValueCard 
                icon={<Heart size={32} />} 
                title="User Obsessed" 
                desc="We don't just build features; we solve problems. Your feedback is our roadmap."
                color="text-[#ff4a9e]"
                hoverBorder="hover:border-[#ff4a9e]"
              />
              <ValueCard 
                icon={<ShieldCheck size={32} />} 
                title="Trust & Security" 
                desc="Your data is your business. We treat it with the highest level of security and privacy."
                color="text-[#0ae448]"
                hoverBorder="hover:border-[#0ae448]"
              />
              <ValueCard 
                icon={<Globe size={32} />} 
                title="Remote First" 
                desc="We hire the best talent, regardless of where they live. Diversity drives innovation."
                color="text-[#06b6d4]"
                hoverBorder="hover:border-[#06b6d4]"
              />
              <ValueCard 
                icon={<Users size={32} />} 
                title="Collaboration" 
                desc="Great things are never done by one person. We build tools that bring people together."
                color="text-[#8b5cf6]"
                hoverBorder="hover:border-[#8b5cf6]"
              />
              <ValueCard 
                icon={<Target size={32} />} 
                title="Real Impact" 
                desc="We focus on outcomes, not output. We measure success by the value we deliver."
                color="text-[#3b82f6]"
                hoverBorder="hover:border-[#3b82f6]"
              />
            </div>
          </div>
        </section>

        {/* --- 4. TEAM SECTION --- */}
        <section className="py-24 md:py-32 bg-[#0e100f] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6">
                Meet the <span className="text-[#8b5cf6]">Makers.</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                 The dreamers, designers, and developers building the future of work.
              </p>
            </div>

            <div className="team-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <TeamMember 
                 name="Alex Johnson" 
                 role="Founder & CEO" 
                 image="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop"
                 hoverBorder="hover:border-[#3b82f6]"
                 overlayColor="bg-[#3b82f6]/20"
               />
               <TeamMember 
                 name="Sarah Williams" 
                 role="Head of Product" 
                 image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                 hoverBorder="hover:border-[#ff4a9e]"
                 overlayColor="bg-[#ff4a9e]/20"
               />
               <TeamMember 
                 name="Michael Chen" 
                 role="Lead Engineer" 
                 image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop"
                 hoverBorder="hover:border-[#0ae448]"
                 overlayColor="bg-[#0ae448]/20"
               />
               <TeamMember 
                 name="Emily Davis" 
                 role="Head of Design" 
                 image="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop"
                 hoverBorder="hover:border-[#ffcc00]"
                 overlayColor="bg-[#ffcc00]/20"
               />
            </div>
          </div>
        </section>

        {/* --- 5. CTA SECTION --- */}
        <section className="py-24 md:py-32 px-4 relative overflow-hidden bg-[#0e100f] border-t border-white/10 z-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3b82f6]/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="max-w-5xl mx-auto text-center relative z-10 py-6 md:py-10">
             <h2 className="text-[4rem] md:text-[8rem] font-black text-white mb-8 tracking-tighter leading-none uppercase drop-shadow-lg">
                Join The <br className="hidden md:block"/> <span className="text-[#3b82f6]">Movement.</span>
             </h2>
             <p className="text-xl md:text-2xl text-slate-400 mb-12 font-medium">
                Ready to change how your team works?
             </p>
             <div className="flex justify-center mt-10 md:mt-16">
               <Link to="/registration" className="w-full sm:w-auto px-8 py-5 md:px-12 md:py-6 text-xl md:text-2xl font-black text-black bg-[#0ae448] rounded-full hover:bg-white shadow-[0_0_40px_rgba(10,228,72,0.3)] transition-all hover:scale-105 flex items-center justify-center gap-3 group">
                  Start your trial <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} />
               </Link>
             </div>
          </div>
        </section>

        <Footer />
      </div>
    </ReactLenis>
  );
};

// --- SUB-COMPONENTS ---

const StatItem = ({ number, label, color }) => (
  <div className="stat-item p-4 border-l border-white/10 first:border-0">
    <div className={`text-4xl md:text-6xl font-black ${color} mb-2 tracking-tighter`}>{number}</div>
    <div className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

const ValueCard = ({ icon, title, desc, color, hoverBorder }) => (
  <div className={`value-card p-8 rounded-[2rem] border-2 border-white/5 bg-[#1c1c1c] ${hoverBorder} hover:shadow-2xl transition-all duration-300 text-left group cursor-default`}>
     <div className={`mb-6 ${color} transition-transform transform group-hover:scale-110 origin-left duration-300`}>
        {icon}
     </div>
     <h4 className="text-2xl font-black text-white mb-3 uppercase tracking-wide">{title}</h4>
     <p className="text-base text-slate-400 font-medium leading-relaxed">{desc}</p>
  </div>
);

const TeamMember = ({ name, role, image, hoverBorder, overlayColor }) => (
  <div className={`team-card group relative bg-[#1c1c1c] p-4 rounded-[2rem] border-2 border-white/5 ${hoverBorder} transition-all text-center`}>
     <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden mb-6 relative">
        <img src={image} alt={name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
        {/* Social Hover Overlay */}
        <div className={`absolute inset-0 ${overlayColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4`}>
           <a href="#" className="p-3 bg-white rounded-full text-black hover:scale-110 transition-transform shadow-xl"><Linkedin size={20} fill="currentColor" /></a>
           <a href="#" className="p-3 bg-white rounded-full text-black hover:scale-110 transition-transform shadow-xl"><Twitter size={20} fill="currentColor" /></a>
        </div>
     </div>
     <h3 className="text-xl font-black text-white uppercase">{name}</h3>
     <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-2">{role}</p>
  </div>
);

export default About;