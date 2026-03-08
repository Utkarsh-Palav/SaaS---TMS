import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollSection = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the section and animate the text appearing
      gsap.to(textRef.current.children, {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15)_0,rgba(0,0,0,0)_50%)]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-indigo-400 mb-8">
          The Workflow Engine
        </h2>
        <div ref={textRef} className="text-4xl md:text-6xl font-extrabold text-center leading-tight">
          <div className="translate-y-10 opacity-0">Plan with precision.</div>
          <div className="translate-y-10 opacity-0 text-slate-400">Execute with speed.</div>
          <div className="translate-y-10 opacity-0 text-indigo-500">Scale without limits.</div>
        </div>
      </div>
    </section>
  );
};

export default ScrollSection;