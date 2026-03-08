import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MenuIcon, XIcon, Layers, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Removed unused handleHomeClick function here to fix the ts(6133) warning

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-[#0e100f]/90 backdrop-blur-md border-b border-white/10 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 bg-[#3b82f6] rounded flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Layers className="text-black w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">
              Task<span className="text-[#3b82f6]">ify</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {["Product", "Solutions", "Plans", "About"].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-sm font-bold text-slate-300 hover:text-[#0ae448] uppercase tracking-wider transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <Link
                to="/dashboard"
                className="text-sm font-bold text-slate-300 hover:text-[#0ae448] uppercase tracking-wider"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-300 hover:text-white uppercase tracking-wider transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/registration"
                  className="bg-[#0ae448] text-black px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-wider hover:bg-white hover:scale-105 transition-all flex items-center gap-2 group"
                >
                  Get Started{" "}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-300 hover:text-[#0ae448] p-2 transition-colors"
            >
              {isMenuOpen ? <XIcon size={28} /> : <MenuIcon size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1c1c1c] border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-8 space-y-2">
              {["Product", "Solutions", "Pricing", "About"].map((item) => (
                <a
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="block px-4 py-3 text-lg font-bold text-slate-300 hover:text-[#0ae448] hover:bg-white/5 rounded-lg uppercase tracking-wider transition-colors"
                >
                  {item}
                </a>
              ))}
              <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-4 px-2">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="block text-center py-4 bg-[#0ae448] text-black rounded-full font-black uppercase tracking-wider hover:bg-white transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block text-center py-3 text-slate-300 font-bold uppercase tracking-wider hover:text-white"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/registration"
                      className="block text-center py-4 bg-[#0ae448] text-black rounded-full font-black uppercase tracking-wider hover:bg-white transition-colors"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;