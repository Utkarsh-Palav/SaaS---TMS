import React, { useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis } from "@studio-freight/react-lenis";
import { 
  Code2, 
  PenTool, 
  Megaphone, 
  Briefcase, 
  Rocket, 
  Building, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";

import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

gsap.registerPlugin(ScrollTrigger);

// Helper to split text into individual letters for GSAP animations
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
          {/* Add the space back after each word */}
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

const Solutions = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Hero Text Reveal (fromTo to prevent Strict Mode bugs)
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

      // 3. Staggered reveals for Cards (fromTo applied)
      gsap.fromTo(".team-card", 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".teams-grid", start: "top 80%" } }
      );

      gsap.fromTo(".scale-card", 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".scale-grid", start: "top 80%" } }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <div ref={containerRef} className="bg-[#0e100f] text-white font-sans selection:bg-[#3b82f6] selection:text-white overflow-x-hidden">
        <Navbar />

        {/* --- 1. HERO SECTION --- */}
        <section ref={heroRef} className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden flex flex-col items-center min-h-[70vh] justify-center">
          
          <div className="absolute inset-0 pointer-events-none z-0">
            <Asterisk className="shape-fast absolute top-[15%] left-[5%] md:left-[10%] w-16 h-16 md:w-24 md:h-24 text-[#06b6d4]" />
            <div className="shape-slow absolute bottom-[20%] right-[5%] md:right-[15%] w-10 h-24 md:w-16 md:h-32 rounded-full bg-[#3b82f6] rotate-45" />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center z-10 relative">
            <div className="inline-flex items-center gap-3 bg-[#1c1c1c] border border-white/10 rounded-full px-6 py-2 mb-8 shadow-2xl">
              <span className="text-xs font-bold text-[#06b6d4] uppercase tracking-widest">Solutions</span>
            </div>
            
            <h1 className="text-[3.5rem] leading-[0.9] sm:text-6xl md:text-[7rem] lg:text-[9rem] font-black tracking-tighter mb-6 uppercase">
              <SplitText className="hero-char text-white">Built for the</SplitText><br/>
              <SplitText className="hero-char text-[#06b6d4]">Way You Work.</SplitText>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
              Whether you're shipping code, running campaigns, or scaling a startup, Taskify adapts to your unique workflow.
            </p>
          </div>
        </section>

        {/* --- 2. TEAMS GRID (BENTO STYLE) --- */}
        <section className="py-24 bg-[#0e100f] border-t border-white/5 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#06b6d4]/5 rounded-full blur-[120px] pointer-events-none"></div>
           
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             <div className="teams-grid grid md:grid-cols-3 gap-6">
                
                <TeamCard 
                  icon={<Code2 size={32} />} 
                  title="Engineering" 
                  desc="Ship faster with Sprint planning, bug tracking, and GitHub integration."
                  color="text-[#3b82f6]"
                  hoverBorder="hover:border-[#3b82f6]"
                  className="md:col-span-2"
                  features={['Agile Workflows', 'Git Integration', 'Backlog Management']}
                />
                
                <TeamCard 
                  icon={<PenTool size={32} />} 
                  title="Design" 
                  desc="Manage creative requests and versioning in one visual board."
                  color="text-[#ff4a9e]"
                  hoverBorder="hover:border-[#ff4a9e]"
                  className="md:col-span-1"
                />
                
                <TeamCard 
                  icon={<Megaphone size={32} />} 
                  title="Marketing" 
                  desc="Launch campaigns on time with calendars and asset management."
                  color="text-[#ffcc00]"
                  hoverBorder="hover:border-[#ffcc00]"
                  className="md:col-span-1"
                />

                <TeamCard 
                  icon={<Briefcase size={32} />} 
                  title="Product" 
                  desc="Roadmap planning and feature prioritization made simple."
                  color="text-[#8b5cf6]"
                  hoverBorder="hover:border-[#8b5cf6]"
                  className="md:col-span-2"
                  features={['Roadmaps', 'User Feedback', 'Spec Docs']}
                />
             </div>
          </div>
        </section>

        {/* --- 3. COMPANY SIZE SECTION --- */}
        <section className="py-24 md:py-32 bg-[#0e100f] border-t border-white/5">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16 md:mb-24 scale-grid">
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6">
                  Scale without <br className="hidden md:block"/> <span className="text-[#3b82f6]">Breaking.</span>
                </h2>
             </div>

             <div className="scale-grid grid md:grid-cols-2 gap-8">
                <ScaleCard 
                   icon={<Rocket className="w-10 h-10 text-[#0ae448]" />}
                   title="Startups"
                   desc="Move fast and stay organized. All the essential tools you need to find product-market fit without the enterprise bloat."
                   list={['Free for up to 10 users', 'Basic Analytics', 'Rapid Setup']}
                   hoverBorder="hover:border-[#0ae448]"
                />
                <ScaleCard 
                   icon={<Building className="w-10 h-10 text-[#8b5cf6]" />}
                   title="Enterprise"
                   desc="Bank-grade security, SSO, and dedicated support for organizations operating at global scale."
                   list={['SAML/SSO', 'Audit Logs', 'Dedicated Success Manager']}
                   hoverBorder="hover:border-[#8b5cf6]"
                />
             </div>
          </div>
        </section>

        {/* --- 4. CTA SECTION --- */}
        <section className="py-24 md:py-32 px-4 relative overflow-hidden bg-[#0e100f] border-t border-white/10 z-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#06b6d4]/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10 py-6 md:py-10">
             <h2 className="text-[4rem] md:text-[8rem] font-black text-white mb-12 tracking-tighter leading-none uppercase drop-shadow-lg">
                Find Your <br className="hidden md:block"/> <span className="text-[#06b6d4]">Flow.</span>
             </h2>
             <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10 md:mt-16">
               <Link to="/registration" className="w-full sm:w-auto px-10 py-5 md:px-12 md:py-6 text-xl md:text-2xl font-black text-black bg-[#06b6d4] rounded-full hover:bg-white shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all hover:scale-105 flex items-center justify-center gap-3 group">
                  Get Started <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} />
               </Link>
               <Link to="/contact" className="w-full sm:w-auto px-10 py-5 md:px-12 md:py-6 text-xl md:text-2xl font-bold text-white bg-transparent border-2 border-white/20 rounded-full hover:border-[#06b6d4] hover:text-[#06b6d4] transition-colors flex items-center justify-center">
                  Contact Sales
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

const TeamCard = ({ icon, title, desc, color, className, hoverBorder, features = [] }) => (
  <div className={`team-card group h-full p-8 md:p-10 rounded-[2rem] bg-[#1c1c1c] border-2 border-white/5 ${hoverBorder} transition-all duration-300 relative overflow-hidden ${className}`}>
     <div className={`mb-6 ${color} transition-transform transform group-hover:scale-110 origin-left duration-300`}>
        {icon}
     </div>
     <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-wide">{title}</h3>
     <p className="text-slate-400 mb-8 text-lg font-medium leading-relaxed">{desc}</p>
     
     {features.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-white/10">
           {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-base font-bold text-slate-300">
                 <CheckCircle2 size={20} className={color} /> {f}
              </div>
           ))}
        </div>
     )}
  </div>
);

const ScaleCard = ({ icon, title, desc, list, hoverBorder }) => (
  <div className={`scale-card flex flex-col sm:flex-row gap-8 p-8 md:p-10 rounded-[2rem] bg-[#1c1c1c] border-2 border-white/5 ${hoverBorder} transition-all duration-300 group`}>
     <div className="shrink-0">
        <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-300">
           {icon}
        </div>
     </div>
     <div>
        <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-wide">{title}</h3>
        <p className="text-slate-400 mb-8 text-lg font-medium leading-relaxed">{desc}</p>
        <ul className="space-y-4">
           {list.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300 font-bold text-lg">
                 <div className="w-2 h-2 bg-white rounded-full"></div> {item}
              </li>
           ))}
        </ul>
     </div>
  </div>
);

export default Solutions;