import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  MessageSquare,
  Users,
  CheckSquare,
  LayoutDashboard,
  ArrowRight,
  Hexagon,
  Zap,
  Search,
  Bell,
  Menu,
} from "lucide-react";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import AnimatedContent from "@/components/ui/AnimatedContent";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-blue-100 overflow-x-hidden">
      <Navbar />

      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-visible">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none"></div>
        
        <div className="absolute inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center perspective-[2000px]">
          <AnimatedContent direction="vertical" distance={20}>
            
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-1.5 mb-8 shadow-sm ring-1 ring-slate-200/50">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-600 tracking-wide">
                Taskify 2.0 is here
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[0.95]">
              Ship projects <br />
              <span className="text-transparent bg-clip-text bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600">
                at lightspeed.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              The all-in-one workspace that replaces your scattered tools. 
              Linear workflows, smart roadmaps, and instant chat.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24 relative z-20">
              <Link
                to="/registration"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-slate-900 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95"
              >
                Start for free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all hover:border-slate-300"
              >
                Live Demo
              </Link>
            </div>
          </AnimatedContent>

          {/* --- THE 3D MOCKUP --- */}
          <AnimatedContent delay={0.2}>
            <div className="relative mx-auto w-full max-w-6xl transform-style-3d rotate-x-20 hover:rotate-x-0 transition-transform duration-1000 ease-out group">
              
              {/* Glow Behind */}
              <div className="absolute -inset-4 bg-linear-to-r from-blue-500 to-violet-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>

              {/* The Dashboard Frame */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden ring-1 ring-slate-900/5 aspect-video md:aspect-16/8 flex flex-col">
                
                {/* 1. Header Bar */}
                <div className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
                   <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="h-4 w-px bg-slate-200 mx-2"></div>
                      <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 w-64">
                        <Search size={14} />
                        <span className="text-xs font-medium">Search or jump to...</span>
                      </div>
                   </div>
                   <div className="flex gap-4 text-slate-400">
                      <Bell size={18} />
                      <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-indigo-500"></div>
                   </div>
                </div>

                {/* 2. Main Body */}
                <div className="flex-1 flex overflow-hidden bg-slate-50/50">
                   
                   {/* Sidebar Skeleton */}
                   <div className="w-64 bg-white border-r border-slate-100 p-4 hidden md:flex flex-col gap-4">
                      <div className="space-y-2">
                         <div className="h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center px-3 text-sm font-semibold gap-2">
                            <LayoutDashboard size={16} /> Dashboard
                         </div>
                         <div className="h-8 hover:bg-slate-50 text-slate-500 rounded-lg flex items-center px-3 text-sm font-medium gap-2">
                            <CheckSquare size={16} /> My Tasks
                         </div>
                         <div className="h-8 hover:bg-slate-50 text-slate-500 rounded-lg flex items-center px-3 text-sm font-medium gap-2">
                            <Users size={16} /> Team
                         </div>
                      </div>
                      <div className="mt-auto">
                        <div className="h-24 bg-linear-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white">
                          <div className="w-8 h-8 bg-white/10 rounded-lg mb-2"></div>
                          <div className="h-2 w-16 bg-white/20 rounded-full"></div>
                        </div>
                      </div>
                   </div>

                   {/* Main Content Area */}
                   <div className="flex-1 p-6 md:p-8 overflow-hidden flex flex-col gap-6">
                      
                      {/* Top Row: Stats Cards */}
                      <div className="grid grid-cols-3 gap-6">
                         {[1,2,3].map(i => (
                           <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                   <Zap size={16} />
                                 </div>
                                 <span className="text-xs text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded">+12%</span>
                              </div>
                              <div className="h-6 w-20 bg-slate-100 rounded mb-2"></div>
                              <div className="h-3 w-32 bg-slate-50 rounded"></div>
                           </div>
                         ))}
                      </div>

                      {/* Middle Row: The Graph (CSS Only) */}
                      <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
                         <div className="flex justify-between mb-6">
                            <div className="h-5 w-32 bg-slate-100 rounded"></div>
                            <div className="h-5 w-20 bg-slate-50 rounded"></div>
                         </div>
                         <div className="flex-1 flex items-end gap-3 px-2 pb-2">
                            {/* Fake Bars */}
                            {[40, 65, 45, 80, 55, 90, 60, 75, 50, 85, 95, 70].map((h, i) => (
                               <div key={i} className="flex-1 bg-blue-600/10 rounded-t-sm hover:bg-blue-600 transition-all duration-300 group/bar relative" style={{ height: `${h}%` }}>
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                    {h}%
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>

                   </div>
                </div>
              </div>
              
              {/* Floating Element 1 (Glass Card) */}
              <div className="absolute -right-8 top-20 w-64 bg-white/80 backdrop-blur-xl p-4 rounded-xl border border-white/20 shadow-2xl hidden lg:block transform translate-z-10 animate-float">
                 <div className="flex gap-3 items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><Users size={20}/></div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">New Team Member</div>
                      <div className="text-xs text-slate-500">Just joined Marketing</div>
                    </div>
                 </div>
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>)}
                 </div>
              </div>

            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* --- SOCIAL PROOF (Same as before) --- */}
      <section className="py-10 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
            Powering next-gen teams at
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {["Acme Corp", "Global Bank", "TechStart", "Nebula", "Logipsum"].map(
              (brand) => (
                <span
                  key={brand}
                  className="text-xl font-bold text-slate-700 flex items-center gap-2"
                >
                  <Hexagon className="w-6 h-6 text-blue-600" fill="currentColor" fillOpacity={0.2} /> {brand}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION (Keep existing) --- */}
      <section className="py-24 bg-slate-50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">
              Features
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Everything you need to <br />
              <span className="text-blue-600">ship faster.</span>
            </h3>
            <p className="text-lg text-slate-600">
              Stop juggling multiple apps. Taskify centralizes your workflow into
              one powerful operating system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<CheckSquare />}
              title="Task Management"
              desc="Kanban, List, and Gantt views. Track progress in real-time."
              className="md:col-span-2"
            />
            <FeatureCard
              icon={<Zap />}
              title="Automations"
              desc="Save time with custom workflows and triggers."
              className="md:col-span-1"
            />
            <FeatureCard
              icon={<Users />}
              title="Team Directory"
              desc="Manage roles, permissions and profiles securely."
              className="md:col-span-1"
            />
            <FeatureCard
              icon={<MessageSquare />}
              title="Real-time Chat"
              desc="Direct messaging and channel support built-in."
              className="md:col-span-2"
            />
            <FeatureCard
              icon={<BarChart3 />}
              title="Analytics"
              desc="Deep insights into team velocity and performance."
              className="md:col-span-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white ring-0"
              dark={true}
            />
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS (Keep existing) --- */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="absolute top-20 left-[-100px] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Loved by teams everywhere
          </h2>
        </div>
        <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-white to-transparent z-10"></div>
            <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
        </div>
      </section>

      {/* --- CTA SECTION (Keep existing) --- */}
      <section className="py-24 px-4 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
           <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight leading-tight">
            Ready to transform your <br/> organization?
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Join thousands of forward-thinking companies. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/registration" className="bg-white text-slate-900 hover:bg-blue-50 font-bold px-10 py-4 rounded-xl shadow-xl transition-all hover:scale-105">
              Get started for free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- COMPONENTS (FeatureCard, Hexagon, Testimonials) remain the same ---
const FeatureCard = ({ icon, title, desc, className, dark = false }) => {
  return (
    <AnimatedContent distance={50} direction="vertical" scale={1}>
      <div className={`group p-8 rounded-3xl border transition-all duration-300 h-full hover:shadow-lg relative overflow-hidden ${
          dark 
          ? "bg-blue-600 border-blue-500 text-white" 
          : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-blue-900/5"
      } ${className}`}>
        {!dark && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:scale-150"></div>}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative z-10 ${
            dark ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"
        }`}>
            {icon}
        </div>
        <h3 className={`text-xl font-bold mb-3 relative z-10 ${dark ? "text-white" : "text-slate-900"}`}>{title}</h3>
        <p className={`leading-relaxed relative z-10 ${dark ? "text-blue-100" : "text-slate-600"}`}>{desc}</p>
      </div>
    </AnimatedContent>
  );
};

const testimonials = [
  { quote: "Taskify has completely transformed how we manage our remote teams.", name: "Sarah Jenkins", title: "VP of Operations, TechFlow" },
  { quote: "The analytics feature alone is worth the price.", name: "David Chen", title: "Founder, StartUp Inc" },
  { quote: "Finally, a tool that balances power with simplicity.", name: "Elena Rodriguez", title: "Project Lead, DesignCo" },
];

export default LandingPage;