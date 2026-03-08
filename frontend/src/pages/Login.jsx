import { Navigate, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useState, useRef, useLayoutEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { gsap } from "gsap";
import ResetPasswordDialog from "@/components/ResetPasswordDialog";
import { Input } from "@/components/ui/input";
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Prism from "@/components/Prism";
import PageLoader from "@/components/ui/PageLoader";

const Login = () => {
  const { user, loading, login } = useAuth();
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const containerRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Entrance Animations
  useLayoutEffect(() => {
    if (loading || user) return; // Wait until ready
    
    let ctx = gsap.context(() => {
      gsap.fromTo(".login-content",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, user]);

  if (loading) return <PageLoader />;
  if (user) return <Navigate to={"/dashboard"} replace />;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData,
        { withCredentials: true }
      );
      const { user, token } = response.data;
      localStorage.setItem("token", token);
      toast.success("Welcome back!");
      login(user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-[#0e100f] text-white flex font-sans selection:bg-[#3b82f6] selection:text-white">
      <ResetPasswordDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        onComplete={() => {}}
      />

      {/* LEFT PANEL - Branding (Visible on Desktop) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#1c1c1c] border-r border-white/5 flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3b82f6]/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Prism Animation */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-60">
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <Prism
              animationType="rotate"
              timeScale={0.4}
              height={3}
              baseWidth={3}
              scale={3}
              hueShift={0}
              colorFrequency={1}
              noise={0}
              glow={1}
            />
          </div>
        </div>

        {/* Logo Lockup */}
        <div className="z-10 flex items-center gap-3">
          <div className="h-12 w-12 bg-[#3b82f6] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Layers className="text-black w-7 h-7" strokeWidth={2.5} />
          </div>
          <span className="text-3xl font-black tracking-tighter text-white">
            Task<span className="text-[#3b82f6]">ify</span>
          </span>
        </div>

        {/* Middle Content */}
        <div className="z-10 relative login-content">
          <h2 className="text-5xl md:text-6xl font-black leading-[0.9] uppercase tracking-tighter mb-6">
            Welcome <br/><span className="text-[#3b82f6]">Back.</span>
          </h2>
          <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-sm">
            "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort."
          </p>
        </div>

        {/* Footer */}
        <div className="z-10 text-xs font-bold tracking-widest uppercase text-slate-500">
          © {new Date().getFullYear()} Taskify Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div className="w-full lg:w-7/12 min-h-screen flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto relative">
        <div className="w-full max-w-md space-y-8 login-content z-10">
          
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center items-center gap-2 mb-6">
              <div className="h-12 w-12 bg-[#3b82f6] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <Layers className="text-black w-7 h-7" strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-black tracking-tighter text-white">Taskify</span>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tight text-white">
              Sign In
            </h2>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block">
            <h2 className="text-4xl font-black uppercase tracking-tight text-white">Sign In</h2>
            <p className="text-slate-400 font-medium mt-2">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-widest text-slate-400"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="h-14 pl-12 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-widest text-slate-400"
                >
                  Password
                </label>
                <a
                  onClick={() => setDialogOpen(true)}
                  className="text-xs font-bold text-[#3b82f6] hover:text-white cursor-pointer transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={isVisible ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="h-14 pl-12 pr-12 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                />
                <button
                  type="button"
                  onClick={toggleVisibility}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 hover:text-white transition-colors"
                >
                  {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-black/50 text-[#3b82f6] focus:ring-[#3b82f6] focus:ring-offset-black cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-3 block text-sm font-medium text-slate-400 cursor-pointer select-none"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl text-base font-black uppercase tracking-wider text-white bg-[#3b82f6] hover:bg-white hover:text-black focus:outline-none transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loadingLogin ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mt-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
              <span className="px-4 bg-[#0e100f] text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button className="flex items-center justify-center gap-3 py-3 border-2 border-white/5 rounded-xl bg-[#1c1c1c] hover:bg-white/5 hover:border-white/10 transition-colors shadow-sm group">
              {/* Google SVG */}
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-bold text-white tracking-wide">
                Google
              </span>
            </button>
            <button className="flex items-center justify-center gap-3 py-3 border-2 border-white/5 rounded-xl bg-[#1c1c1c] hover:bg-white/5 hover:border-white/10 transition-colors shadow-sm group">
              {/* Microsoft SVG */}
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span className="text-sm font-bold text-white tracking-wide">
                Microsoft
              </span>
            </button>
          </div>

          {/* Footer Text */}
          <div className="text-center mt-8">
            <p className="text-sm font-medium text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/registration"
                className="font-bold text-[#3b82f6] hover:text-white transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;