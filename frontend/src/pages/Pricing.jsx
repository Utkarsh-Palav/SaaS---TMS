import React, { useState, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis } from '@studio-freight/react-lenis';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Check,
  Minus,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

// Components
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";

// Data
import pricingData from "../utils/plans.json";

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

const Pricing = () => {
  const navigate = useNavigate();
  const { plans, features } = pricingData;
  const popularPlan = "premium";

  const containerRef = useRef(null);
  const heroRef = useRef(null);

  // State to manage the billing period
  const [isYearly, setIsYearly] = useState(false);
  const handleToggle = () => setIsYearly(!isYearly);

  // --- Payment Logic (Completely Untouched) ---
  const handlePayment = async (plan) => {
    const billingCycle = isYearly ? "yearly" : "monthly";

    if (plan.id === "free") {
      navigate(
        `/registration?payment_success=true&plan=${plan.id}&billing=monthly`
      );
      return;
    }

    const amount = isYearly
      ? parseInt(plan.yearlyPrice)
      : parseInt(plan.monthlyPrice);

    try {
      const {
        data: { orderId },
      } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/create-order`,
        { amount }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "Taskify",
        description: `${plan.name} Plan`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verificationResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/auth/verify-payment`,
              {
                razorpay_order_id: orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: plan.id,
                amount: amount,
              }
            );

            if (verificationResponse.data.success) {
              toast.success("Payment Successful! Redirecting...");
              const billingCycle = isYearly ? "yearly" : "monthly";
              navigate(
                `/registration?payment_success=true&plan=${plan.id}&payment_id=${response.razorpay_payment_id}&billing=${billingCycle}`
              );
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error("Payment verification failed due to a server error.");
          }
        },
        theme: { color: "#3b82f6" }, // Updated to Electric Blue
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Payment failed. Please try again.");
    }
  };

  // GSAP Animations
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

      // 3. Staggered Card & Table Reveals
      gsap.fromTo(".pricing-card", 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".pricing-grid", start: "top 80%" } }
      );

      gsap.fromTo(".compare-table", 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".compare-table", start: "top 85%" } }
      );

      gsap.fromTo(".faq-item", 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: ".faq-grid", start: "top 85%" } }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }}>
      <div ref={containerRef} className="bg-[#0e100f] text-white font-sans selection:bg-[#0ae448] selection:text-black">
        <Navbar />

        {/* --- 1. HERO SECTION --- */}
        <section ref={heroRef} className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden flex flex-col items-center">
          
          {/* Ambient Glow & Shapes */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#0ae448]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          <div className="absolute inset-0 pointer-events-none z-0">
            <Asterisk className="shape-fast absolute top-[20%] left-[5%] md:left-[10%] w-16 h-16 md:w-24 md:h-24 text-[#0ae448]" />
            <div className="shape-slow absolute bottom-[10%] right-[5%] md:right-[15%] w-10 h-24 md:w-16 md:h-32 rounded-full bg-[#ff4a9e] rotate-45" />
          </div>

          <div className="max-w-7xl mx-auto px-4 text-center z-10 relative">
            <div className="inline-flex items-center gap-3 bg-[#1c1c1c] border border-white/10 rounded-full px-6 py-2 mb-8 shadow-2xl">
              <span className="text-xs font-bold text-[#0ae448] uppercase tracking-widest">Pricing</span>
            </div>
            
            <h1 className="text-[3.5rem] leading-[0.9] sm:text-6xl md:text-[7rem] lg:text-[8rem] font-black tracking-tighter mb-6 uppercase">
              <SplitText className="hero-char text-white">Simple Plans.</SplitText><br/>
              <SplitText className="hero-char text-[#0ae448]">Zero B.S.</SplitText>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
              Start for free and scale as you grow. No credit card required for the trial.
            </p>

            {/* Custom Toggle (Dark Mode Styled) */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <span className={`text-base font-bold uppercase tracking-wider ${!isYearly ? "text-white" : "text-slate-500"}`}>
                Monthly
              </span>
              <button
                onClick={handleToggle}
                className="relative w-16 h-8 bg-white/10 border border-white/20 rounded-full p-1 transition-colors hover:bg-white/20 focus:outline-none"
              >
                <motion.div
                  className="w-6 h-6 bg-[#0ae448] rounded-full shadow-[0_0_15px_rgba(10,228,72,0.6)]"
                  animate={{ x: isYearly ? 30 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-base font-bold uppercase tracking-wider flex items-center gap-2 ${isYearly ? "text-white" : "text-slate-500"}`}>
                Yearly 
                <span className="text-[#0ae448] text-xs bg-[#0ae448]/10 border border-[#0ae448]/20 px-2 py-1 rounded-full">
                  -20%
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* --- 2. PRICING CARDS --- */}
        <section className="pb-24 relative z-20">
          <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {plans.map((plan) => {
              const isPopular = plan.id === popularPlan;
              return (
                <div
                  key={plan.id}
                  className={`pricing-card relative flex flex-col p-8 md:p-10 bg-[#1c1c1c] rounded-[2rem] border-2 transition-all duration-300 h-full ${
                    isPopular
                      ? "border-[#3b82f6] shadow-[0_0_60px_rgba(59,130,246,0.15)] md:scale-105 z-10"
                      : "border-white/5 hover:border-white/20"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#3b82f6] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-wide">
                      {plan.name}
                    </h3>
                    <p className="text-base text-slate-400 font-medium min-h-[48px]">
                      {getPlanDescription(plan.id)}
                    </p>
                  </div>

                  <div className="mb-10 flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter">
                      ₹{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">
                      /{isYearly ? "yr" : "mo"}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePayment(plan)}
                    className={`w-full py-5 rounded-full font-black uppercase tracking-wider transition-all text-sm ${
                      isPopular
                        ? "bg-[#3b82f6] text-white hover:bg-white hover:text-black shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                        : "bg-white/5 text-white hover:bg-white hover:text-black border border-white/10"
                    }`}
                  >
                    {plan.buttonText}
                  </button>

                  <div className="mt-10 space-y-4 text-left flex-1">
                    <p className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4 mb-6">
                      Includes:
                    </p>
                    <ul className="space-y-4">
                      {plan.features?.map((feature, i) => (
                        <li key={i} className="flex items-start gap-4">
                          {feature.included ? (
                            <CheckCircle2 className={`w-6 h-6 shrink-0 ${isPopular ? "text-[#3b82f6]" : "text-[#0ae448]"}`} />
                          ) : (
                            <XCircle className="w-6 h-6 text-white/20 shrink-0" />
                          )}
                          <span
                            className={`text-base font-medium ${
                              feature.included ? "text-slate-300" : "text-slate-500 line-through"
                            }`}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- 3. COMPARISON TABLE --- */}
        <section className="py-24 md:py-32 bg-[#0e100f] border-t border-white/5 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
                Compare <span className="text-[#8b5cf6]">Features.</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400 font-medium">
                Detailed breakdown of what's included in each plan.
              </p>
            </div>

            <div className="compare-table overflow-x-auto rounded-[2rem] border border-white/10 bg-[#1c1c1c]">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-white/10 bg-white/5">
                    <th className="p-6 text-left text-sm font-black text-white uppercase tracking-widest w-1/4">
                      Feature Overview
                    </th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="p-6 text-center w-1/4">
                        <span
                          className={`text-xl font-black uppercase tracking-wide ${
                            plan.id === popularPlan ? "text-[#3b82f6]" : "text-white"
                          }`}
                        >
                          {plan.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {features.map((feature, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-6 text-base font-medium text-slate-300 flex items-center gap-3">
                        {feature.name}
                        <HelpCircle size={16} className="text-slate-500 cursor-help" />
                      </td>
                      <TableCell included={feature.free} />
                      <TableCell included={feature.premium} isPopular />
                      <TableCell included={feature.enterprise} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- 4. FAQ SECTION --- */}
        <section className="py-24 md:py-32 bg-[#0e100f] border-t border-white/5">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-5xl md:text-7xl font-black text-white text-center uppercase tracking-tighter mb-16">
              Got <span className="text-[#ffcc00]">Questions?</span>
            </h2>
            <div className="faq-grid grid gap-6 md:grid-cols-2">
              <FaqItem
                question="Can I cancel anytime?"
                answer="Yes, you can cancel your subscription at any time. Your access will remain active until the end of your billing period."
              />
              <FaqItem
                question="What payment methods do you accept?"
                answer="We accept all major credit cards, UPI, and net banking via our secure Razorpay integration."
              />
              <FaqItem
                question="Can I change plans later?"
                answer="Absolutely. You can upgrade or downgrade your plan from your dashboard settings at any time."
              />
              <FaqItem
                question="Do you offer refunds?"
                answer="We offer a 14-day money-back guarantee if you are not satisfied with our service for any reason."
              />
            </div>
          </div>
        </section>

        {/* --- 5. CTA SECTION --- */}
        <section className="py-24 md:py-32 px-4 relative overflow-hidden bg-[#0e100f] border-t border-white/10 z-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0ae448]/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10 py-6 md:py-10">
             <h2 className="text-[4rem] md:text-[8rem] font-black text-white mb-8 tracking-tighter leading-none uppercase drop-shadow-lg">
                Ready To <br className="hidden md:block"/> <span className="text-[#0ae448]">Scale?</span>
             </h2>
             <p className="text-xl md:text-2xl text-slate-400 mb-12 font-medium">
                Join thousands of teams managing their work with Taskify.
             </p>
             <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10">
               <button onClick={() => handlePayment(plans[0])} className="w-full sm:w-auto px-10 py-5 md:px-12 md:py-6 text-xl md:text-2xl font-black text-black bg-[#0ae448] rounded-full hover:bg-white shadow-[0_0_40px_rgba(10,228,72,0.3)] transition-all hover:scale-105 flex items-center justify-center gap-3 group">
                  Start Free Trial <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} />
               </button>
               <button className="w-full sm:w-auto px-10 py-5 md:px-12 md:py-6 text-xl md:text-2xl font-bold text-white bg-transparent border-2 border-white/20 rounded-full hover:border-[#0ae448] hover:text-[#0ae448] transition-colors flex items-center justify-center">
                  Contact Sales
               </button>
             </div>
          </div>
        </section>

        <Footer />
      </div>
    </ReactLenis>
  );
};

// --- HELPER COMPONENTS ---

const getPlanDescription = (planId) => {
  switch (planId) {
    case "free": return "Perfect for individuals just starting out.";
    case "premium": return "For growing teams that need power.";
    case "enterprise": return "Custom solutions for large organizations.";
    default: return "Choose your plan.";
  }
};

const TableCell = ({ included, isPopular }) => (
  <td className="p-6 text-center">
    {included ? (
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${isPopular ? 'bg-[#3b82f6]/20 text-[#3b82f6]' : 'bg-[#0ae448]/20 text-[#0ae448]'}`}>
        <Check size={20} strokeWidth={3} />
      </div>
    ) : (
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-white/20">
        <Minus size={20} strokeWidth={3} />
      </div>
    )}
  </td>
);

const FaqItem = ({ question, answer }) => (
  <div className="bg-[#1c1c1c] p-8 rounded-[2rem] border-2 border-white/5 hover:border-white/20 transition-colors">
    <h3 className="text-xl font-black text-white mb-4 flex items-start gap-4 uppercase tracking-wide">
      <HelpCircle className="w-6 h-6 text-[#ffcc00] mt-0.5 shrink-0" />
      {question}
    </h3>
    <p className="text-slate-400 text-base font-medium leading-relaxed pl-10">{answer}</p>
  </div>
);

export default Pricing;