import { useEffect, useId, useMemo, useState, useRef, useLayoutEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { gsap } from "gsap";
import {
  CheckIcon,
  Crown,
  EyeIcon,
  EyeOffIcon,
  Briefcase,
  Building2,
  MapPin,
  UploadCloudIcon,
  UserIcon,
  ArrowRight,
  Layers,
  Loader,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import FloatingLines from "@/components/FloatingLines";

const Registration = () => {
  const [searchParams] = useSearchParams();
  const planValue = searchParams.get("plan");
  const paymentIdFromUrl = searchParams.get("payment_id");
  const billingFromUrl = searchParams.get("billing");

  const [isRegistering, setIsRegistering] = useState(false);
  const [isCountriesLoading, setIsCountriesLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [countries, setCountries] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formFields, setFormFields] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contactNo: "",
    companyName: "",
    gstin: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    plan: planValue || "",
    websiteUrl: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth();
  const id = useId();
  const containerRef = useRef(null);

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  // --- Logic remains the same ---
  const checkStrength = (pass) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    ];
    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(password);
  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthColor = (score) => {
    if (score === 0) return "bg-white/10";
    if (score <= 1) return "bg-[#ff4a9e]"; // Neon Pink
    if (score <= 2) return "bg-[#ff8a00]"; // Orange
    if (score === 3) return "bg-[#ffcc00]"; // Neon Yellow
    return "bg-[#0ae448]"; // Neon Green
  };

  // ✅ Check if all required fields are filled (Excluding websiteUrl)
  const isFormValid =
    Object.entries(formFields).every(([key, val]) => {
      // Skip validation for the optional field
      if (key === "websiteUrl") return true;

      // Check all other fields
      return val && val.trim() !== "";
    }) &&
    password.trim() !== "" &&
    logoUrl.trim() !== ""; // Ensure Logo URL is also present

  const handleChange = (e) => {
    setFormFields((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    const formData = new FormData();

    Object.keys(formFields).forEach((key) => {
      if (key === "contactNo") {
        formData.append(key, countryCode + formFields[key]);
      } else {
        formData.append(key, formFields[key]);
      }
    });

    formData.append("password", password);
    formData.append("logoUrl", logoUrl);

    if (paymentIdFromUrl) {
      formData.append("razorpayPaymentId", paymentIdFromUrl);
    }

    if (billingFromUrl) {
      formData.append("planType", billingFromUrl);
    } else {
      formData.append("planType", "monthly");
    }

    if (profileImage instanceof File) {
      formData.append("profileImage", profileImage);
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register-org`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      login(res.data.user);
      toast.success("Organization registered successfully! Welcome aboard.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error registering organization:", error);
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          "https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2"
        );

        const countryData = response.data
          .filter((country) => country.idd.root)
          .map((country) => {
            const root = country.idd.root;
            const suffix =
              country.idd.suffixes && country.idd.suffixes.length === 1
                ? country.idd.suffixes[0]
                : "";

            return {
              name: country.name.common,
              code: root + suffix,
              flag: country.flags.svg,
              emoji: country.flags.alt ? country.flag : "🏳️",
              cca2: country.cca2,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(countryData);

        const defaultCountry = countryData.find((c) => c.cca2 === "IN");
        if (defaultCountry) setCountryCode(defaultCountry.code);

        setIsCountriesLoading(false);
      } catch (error) {
        console.error("Failed to fetch countries", error);
        setIsCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Entrance Animations
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".reg-left",
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
      gsap.fromTo(".reg-right",
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-[#0e100f] text-white flex font-sans selection:bg-[#3b82f6] selection:text-white">
      
      {/* Left Panel - The "Empowering" Vision (Visible on LG screens) */}
      <div className="reg-left hidden lg:flex lg:w-5/12 bg-[#1c1c1c] border-r border-white/5 flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3b82f6]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none mix-blend-screen">
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <FloatingLines
              enabledWaves={["top", "middle", "bottom"]}
              lineCount={[10, 15, 20]}
              lineDistance={[8, 6, 4]}
              bendRadius={5.0}
              bendStrength={-0.5}
              interactive={true}
              parallax={true}
            />
          </div>
        </div>

        <div className="z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-12 w-12 bg-[#3b82f6] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <Layers className="text-black w-7 h-7 fill-black" strokeWidth={2} />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white">
              Task<span className="text-[#3b82f6]">ify</span>
            </span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-black leading-[0.9] tracking-tighter uppercase mb-6">
            Captain <br/><span className="text-[#3b82f6]">Your Ship.</span>
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
            Establish your organization's digital HQ. Manage teams, track workflows, and lead with clarity.
          </p>
        </div>

        <div className="z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-4">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&h=64",
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`User ${i + 1}`}
                  className="w-12 h-12 rounded-full border-2 border-[#1c1c1c] object-cover grayscale hover:grayscale-0 transition-all duration-300"
                />
              ))}
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Joined by 10,000+ Leaders</p>
          </div>
        </div>
      </div>

      {/* Right Panel - The "Professional" Form */}
      <div className="reg-right w-full lg:w-7/12 h-screen overflow-y-auto scrollbar-hide flex justify-center relative">
        <div className="max-w-3xl w-full mx-auto py-12 px-6 lg:px-12 relative z-10">
          
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex justify-center items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-[#3b82f6] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <Layers className="text-black w-6 h-6 fill-black" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">Taskify</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
              Create Account
            </h1>
            <p className="text-slate-400 mt-2 font-medium">
              Set up your organization in minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Section 1: Identity */}
            <section>
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                <Briefcase className="w-6 h-6 text-[#3b82f6]" />
                <h2 className="text-xl font-black uppercase tracking-widest text-white">
                  Leader Profile
                </h2>
              </div>

              {/* Profile Pic Center Stage */}
              <div className="flex flex-col items-center mb-10">
                <label className="relative group cursor-pointer">
                  {/* The Circle */}
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 bg-[#1c1c1c] flex items-center justify-center group-hover:border-[#3b82f6] transition-all duration-300 shadow-xl">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-slate-500 group-hover:text-[#3b82f6] transition-colors" />
                    )}
                  </div>

                  {/* The Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-white transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <UploadCloudIcon size={24} />
                    </div>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-4 group-hover:text-[#3b82f6] transition-colors">
                  Upload Avatar
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    First Name <span className="text-[#ff4a9e]">*</span>
                  </label>
                  <Input
                    name="firstName"
                    placeholder="John"
                    value={formFields.firstName}
                    onChange={handleChange}
                    className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Middle Name <span className="text-[#ff4a9e]">*</span>
                  </label>
                  <Input
                    name="middleName"
                    placeholder="William"
                    value={formFields.middleName}
                    onChange={handleChange}
                    className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Last Name <span className="text-[#ff4a9e]">*</span>
                  </label>
                  <Input
                    name="lastName"
                    placeholder="Doe"
                    value={formFields.lastName}
                    onChange={handleChange}
                    className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Email Address <span className="text-[#ff4a9e]">*</span>
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formFields.email}
                    onChange={handleChange}
                    className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Contact Number <span className="text-[#ff4a9e]">*</span>
                  </label>
                  <div className="flex gap-3">
                    <div className="relative w-36 shrink-0">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        disabled={isCountriesLoading}
                        className="w-full h-14 pl-4 pr-8 bg-black/50 border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] appearance-none cursor-pointer font-medium"
                      >
                        {isCountriesLoading ? (
                          <option>Wait...</option>
                        ) : (
                          countries.map((country) => (
                            <option key={country.cca2} value={country.code} className="bg-[#1c1c1c]">
                              {country.code} ({country.name})
                            </option>
                          ))
                        )}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                    <Input
                      name="contactNo"
                      type="number"
                      placeholder="98765 43210"
                      value={formFields.contactNo}
                      onChange={handleChange}
                      className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl w-full font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Block */}
              <div className="mt-8 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Secure Password <span className="text-[#ff4a9e]">*</span>
                </label>
                <div className="relative">
                  <Input
                    id={id}
                    className="h-14 pl-4 pr-12 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium transition-all"
                    placeholder="Create a strong password"
                    type={isVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={toggleVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 hover:text-white transition-colors"
                  >
                    {isVisible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div className="flex gap-2 h-1.5 mt-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-full w-full rounded-full transition-all duration-300 ${
                        i < strengthScore ? getStrengthColor(strengthScore) : "bg-white/10"
                      }`}
                    ></div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                  {strength.map((req, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-xs font-bold tracking-wider uppercase ${
                        req.met ? "text-[#0ae448]" : "text-slate-600"
                      }`}
                    >
                      {req.met ? (
                        <CheckIcon size={14} strokeWidth={3} />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-white/10"></div>
                      )}
                      {req.text}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 2: The Empowering Admin Card */}
            <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start gap-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/20 blur-[40px] pointer-events-none rounded-full"></div>
              <div className="bg-[#3b82f6]/20 p-4 rounded-xl shrink-0">
                <Crown className="w-8 h-8 text-[#3b82f6]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">
                  Admin Privileges
                </h3>
                <p className="text-slate-400 text-base font-medium leading-relaxed">
                  You are registering as the{" "}
                  <span className="font-black text-[#3b82f6] tracking-widest uppercase">
                    Boss
                  </span>
                  . You will have exclusive control over organization settings, team roles, and workflows.
                </p>
              </div>
            </div>

            {/* Section 3: Organization Details */}
            <section>
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                <Building2 className="w-6 h-6 text-[#ffcc00]" />
                <h2 className="text-xl font-black uppercase tracking-widest text-white">
                  Organization Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Company Name <span className="text-[#ff4a9e]">*</span>
                  </label>
                  <Input
                    name="companyName"
                    placeholder="Acme Corp"
                    value={formFields.companyName}
                    onChange={handleChange}
                    className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    GSTIN / Tax ID <span className="text-[#ff4a9e]">*</span>
                  </label>
                  <Input
                    name="gstin"
                    placeholder="GSTIN123456"
                    value={formFields.gstin}
                    onChange={handleChange}
                    className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MapPin size={16} className="text-[#3b82f6]" /> Registered Address{" "}
                  <span className="text-[#ff4a9e]">*</span>
                </label>
                <Input
                  name="address"
                  placeholder="Headquarters address"
                  value={formFields.address}
                  onChange={handleChange}
                  className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    City <span className="text-[#ff4a9e]">*</span>
                  </label>
                  <Input
                    name="city"
                    value={formFields.city}
                    onChange={handleChange}
                    className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    State <span className="text-[#ff4a9e]">*</span>
                  </label>
                  <Input
                    name="state"
                    value={formFields.state}
                    onChange={handleChange}
                    className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Pincode <span className="text-[#ff4a9e]">*</span>
                  </label>
                  <Input
                    name="pincode"
                    type="number"
                    value={formFields.pincode}
                    onChange={handleChange}
                    className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Country
                  </label>
                  <Input
                    name="country"
                    value={formFields.country}
                    onChange={handleChange}
                    className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Logo & Website */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Website URL
                  </label>
                  <Input
                    name="websiteUrl"
                    placeholder="https://..."
                    value={formFields.websiteUrl}
                    onChange={handleChange}
                    className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Company Logo (URL) <span className="text-[#ff4a9e]">*</span>
                  </label>
                  <div className="flex gap-4">
                    <Input
                      name="logoUrl"
                      placeholder="Image URL"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="h-14 bg-black/50 border-white/10 text-white placeholder-slate-600 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] rounded-xl flex-1 font-medium"
                    />
                    <div className="w-14 h-14 border border-white/10 rounded-xl bg-black flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                      <img
                        src={
                          logoUrl ||
                          "https://img.icons8.com/?size=100&id=114320&format=png&color=ffffff"
                        }
                        alt="Logo"
                        className={`w-full h-full object-contain ${!logoUrl && 'opacity-30'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Action */}
            <div className="pt-8 pb-24">
              <button
                type="submit"
                disabled={!isFormValid || isRegistering}
                className={`w-full flex items-center justify-center gap-3 py-5 rounded-xl font-black text-lg uppercase tracking-widest transition-all ${
                  isFormValid
                    ? "bg-[#3b82f6] text-white hover:bg-white hover:text-black shadow-[0_0_30px_rgba(59,130,246,0.3)] transform hover:-translate-y-1 group"
                    : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/10"
                }`}
              >
                {isRegistering ? (
                  <>
                    <Loader size={24} className="animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    Launch Workspace <ArrowRight size={24} className={isFormValid ? "group-hover:translate-x-1 transition-transform" : ""} />
                  </>
                )}
              </button>
              <p className="text-center text-sm font-medium text-slate-500 mt-6">
                By launching, you agree to our <a href="/terms" className="text-[#3b82f6] hover:text-white transition-colors">Terms of Service</a> and <a href="/privacy" className="text-[#3b82f6] hover:text-white transition-colors">Privacy Policy</a>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;